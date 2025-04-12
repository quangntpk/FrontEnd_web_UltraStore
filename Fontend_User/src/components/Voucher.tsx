import { useState, useEffect, useRef } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { openDB, DBSchema, IDBPDatabase } from "idb";

// Định nghĩa kiểu dữ liệu cho Voucher
interface Voucher {
  maVoucher: number;
  tenVoucher: string;
  giaTri: number;
  ngayBatDau: string;
  ngayKetThuc: string;
  hinhAnh?: string;
  moTa?: string;
  dieuKien?: number;
  soLuong?: number;
  trangThai?: number;
  coupons?: { id: number; maNhap: string; trangThai: number }[];
}

// Định nghĩa cấu trúc cơ sở dữ liệu IndexedDB
interface MyDB extends DBSchema {
  userData: {
    key: string;
    value: {
      lastSpinTime?: number;
      selectedVoucher?: Voucher;
    };
  };
}

const Voucher = () => {
  // Khai báo các state
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [lastSpinTime, setLastSpinTime] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [db, setDb] = useState<IDBPDatabase<MyDB> | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null); // Sử dụng useRef để lưu interval
  const SPIN_COOLDOWN = 24 * 60 * 60 * 1000; // 24 tiếng (mili giây)

  // Khởi tạo IndexedDB khi component được mount
  useEffect(() => {
    const initDB = async () => {
      try {
        const database = await openDB<MyDB>("VoucherDB", 1, {
          upgrade(db) {
            db.createObjectStore("userData");
          },
        });
        setDb(database);
      } catch (err) {
        console.error("Không thể khởi tạo IndexedDB:", err);
      }
    };
    initDB();
  }, []);

  // Tải dữ liệu người dùng và danh sách voucher từ API
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "null");
    setIsLoggedIn(!!userData);
    const currentUserId = userData?.maNguoiDung || null;
    setUserId(currentUserId);

    // Tải dữ liệu từ IndexedDB
    const loadDataFromDB = async () => {
      if (!db || !currentUserId) return;

      try {
        const tx = db.transaction("userData", "readonly");
        const store = tx.objectStore("userData");
        const storedData = await store.get(currentUserId);
        if (storedData) {
          if (storedData.lastSpinTime) {
            setLastSpinTime(storedData.lastSpinTime);
            setTimeLeft(getTimeUntilNextSpin(storedData.lastSpinTime));
          }
          if (storedData.selectedVoucher) {
            setSelectedVoucher(storedData.selectedVoucher);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu từ IndexedDB:", err);
      }
    };

    // Lấy danh sách voucher từ API
    const fetchVouchers = async () => {
      try {
        const response = await fetch("http://localhost:5261/api/Voucher", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Không thể lấy danh sách voucher");
        }

        const data: Voucher[] = await response.json();
        const currentDate = new Date();

        // Lọc các voucher còn hiệu lực
        const validVouchers = data.filter((voucher) => {
          const startDate = new Date(voucher.ngayBatDau);
          const endDate = new Date(voucher.ngayKetThuc);
          return (
            voucher.trangThai === 0 &&
            startDate <= currentDate &&
            endDate >= currentDate
          );
        });

        setVouchers(validVouchers);
      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Lỗi",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (db) {
      loadDataFromDB();
      fetchVouchers();
    }

    // Xử lý khi localStorage thay đổi (đăng xuất hoặc đổi người dùng)
    const handleStorageChange = () => {
      const updatedUserData = JSON.parse(localStorage.getItem("user") || "null");
      if (!updatedUserData) {
        setIsLoggedIn(false);
        setSelectedVoucher(null);
        setLastSpinTime(null);
        setUserId(null);
      } else if (updatedUserData.maNguoiDung !== userId) {
        setUserId(updatedUserData.maNguoiDung);
        loadDataFromDB();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [db, userId]);

  // Cập nhật thời gian thực cho đếm ngược
  useEffect(() => {
    if (!lastSpinTime) {
      setTimeLeft(0);
      return;
    }

    const updateTimeLeft = () => {
      const currentTime = Date.now();
      const timeSinceLastSpin = currentTime - lastSpinTime;
      const remainingTime = Math.max(0, SPIN_COOLDOWN - timeSinceLastSpin);
      setTimeLeft(remainingTime);

      if (remainingTime === 0 && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    updateTimeLeft(); // Cập nhật ngay lập tức
    intervalRef.current = setInterval(updateTimeLeft, 1000); // Cập nhật mỗi giây

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [lastSpinTime]);

  // Kiểm tra xem người dùng có thể quay hay không
  const canSpin = () => {
    if (!isLoggedIn) return false;
    if (!lastSpinTime) return true;
    const currentTime = Date.now();
    return currentTime - lastSpinTime >= SPIN_COOLDOWN;
  };

  // Tính thời gian còn lại để quay lần tiếp theo
  const getTimeUntilNextSpin = (spinTime: number = lastSpinTime || 0) => {
    const currentTime = Date.now();
    const timeSinceLastSpin = currentTime - spinTime;
    return Math.max(0, SPIN_COOLDOWN - timeSinceLastSpin);
  };

  // Định dạng thời gian còn lại thành chuỗi
  const formatTimeLeft = (timeLeft: number) => {
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    return `${hours} giờ ${minutes} phút ${seconds} giây`;
  };

  // Xử lý sự kiện quay vòng quay
  const handleSpin = async () => {
    if (isSpinning || vouchers.length === 0 || !userId || !db) return;

    if (!isLoggedIn) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để quay vòng quay may mắn!",
        variant: "destructive",
      });
      return;
    }

    if (!canSpin()) {
      const timeLeft = getTimeUntilNextSpin();
      toast({
        title: "Chưa thể quay",
        description: `Bạn cần đợi thêm ${formatTimeLeft(timeLeft)} để quay lần tiếp theo!`,
        variant: "destructive",
      });
      return;
    }

    setIsSpinning(true);
    setSelectedVoucher(null);

    const spinAngle = 360 * 5 + Math.floor(Math.random() * 360);
    setRotation(rotation + spinAngle);

    const segmentAngle = 360 / vouchers.length;
    const finalAngle = spinAngle % 360;
    const selectedIndex = Math.floor(finalAngle / segmentAngle);
    const selected = vouchers[vouchers.length - 1 - selectedIndex];

    setTimeout(async () => {
      setSelectedVoucher(selected);
      const currentTime = Date.now();
      setLastSpinTime(currentTime);

      try {
        const tx = db.transaction("userData", "readwrite");
        const store = tx.objectStore("userData");
        await store.put(
          {
            lastSpinTime: currentTime,
            selectedVoucher: selected,
          },
          userId
        );
        await tx.done;
      } catch (err) {
        console.error("Lỗi khi lưu vào IndexedDB:", err);
      }

      setIsSpinning(false);
      toast({
        title: "Chúc mừng!",
        description: `Bạn đã trúng: ${selected.tenVoucher}`,
      });
    }, 2000);
  };

  // Xử lý khi người dùng chọn sử dụng voucher
  const handleUseVoucher = () => {
    if (selectedVoucher) {
      toast({
        title: "Sử dụng voucher",
        description: `Bạn đã chọn sử dụng 1 Voucher: ${selectedVoucher.tenVoucher}`,
      });
    }
  };

  // Hiển thị giao diện khi đang tải
  if (loading) {
    return (
      <div className="py-20 px-6 flex items-center justify-center min-h-screen">
        <p>Đang tải...</p>
      </div>
    );
  }

  // Hiển thị khi có lỗi hoặc không có voucher hợp lệ
  if (error || vouchers.length === 0) {
    return (
      <div className="py-20 px-6 flex items-center justify-center min-h-screen">
        <p>{error || "Chưa có voucher nào dành cho bạn."}</p>
      </div>
    );
  }

  // Giao diện chính của component
  return (
    <section id="voucher" className="py-20 px-6" style={{ marginTop: "40px" }}>
      <Navigation />
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4" style={{ color: "#9B59B6" }}>
            Vòng Quay May Mắn
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Quay để nhận ngay mã giảm giá hấp dẫn dành cho bạn!
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="relative w-[400px] h-[400px] flex-shrink-0">
            {/* Vòng quay */}
            <div
              className="w-full h-full rounded-full overflow-hidden shadow-lg"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: "transform 2s ease-out",
                border: "8px solid #9B59B6",
              }}
            >
              {vouchers.map((voucher, index) => {
                const angle = (360 / vouchers.length) * index;
                return (
                  <div
                    key={voucher.maVoucher}
                    className="absolute w-full h-full"
                    style={{
                      backgroundColor: "#E8DAEF",
                      clipPath: "polygon(50% 50%, 100% 0%, 100% 100%)",
                      transform: `rotate(${angle}deg)`,
                      transformOrigin: "50% 50%",
                    }}
                  >
                    <span
                      className="absolute text-gray-800 font-semibold text-sm whitespace-nowrap"
                      style={{
                        top: "50%",
                        left: "75%",
                        transform: "translate(-50%, -50%)",
                        textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      {voucher.tenVoucher.length > 15
                        ? `${voucher.tenVoucher.slice(0, 15)}...`
                        : voucher.tenVoucher}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Kim chỉ (mũi tên) */}
            <div
              className="absolute w-0 h-0"
              style={{
                top: "-20px",
                left: "50%",
                transform: "translateX(-50%)",
                borderLeft: "10px solid transparent",
                borderRight: "10px solid transparent",
                borderTop: "30px solid #FF0000",
                zIndex: 10,
              }}
            />
          </div>

          <div className="w-full lg:w-1/2 flex flex-col items-center">
            <Button
              onClick={handleSpin}
              disabled={isSpinning || !canSpin()}
              className="mb-6 px-8 py-3 text-lg"
              style={{
                backgroundColor: "#9B59B6",
                color: "white",
                border: "none",
              }}
            >
              {isSpinning
                ? "Đang quay..."
                : canSpin()
                ? "Quay ngay"
                : `Chờ ${formatTimeLeft(timeLeft)}`}
            </Button>

            {selectedVoucher ? (
              <div
                className="bg-white border rounded-xl p-6 shadow-md w-full max-w-md"
                style={{
                  borderColor: "#9B59B6",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ color: "#9B59B6" }}
                >
                  Chúc mừng bạn!
                </h3>
                {selectedVoucher.hinhAnh && (
                  <div className="mb-4">
                    <img
                      src={`data:image/jpeg;base64,${selectedVoucher.hinhAnh}`}
                      alt={selectedVoucher.tenVoucher}
                      className="w-full h-48 object-cover rounded"
                    />
                  </div>
                )}
                <p className="text-muted-foreground mb-2">
                  Tên:{" "}
                  <span className="font-medium">
                    {selectedVoucher.tenVoucher}
                  </span>
                </p>
                <p className="text-muted-foreground mb-2">
                  <span style={{ color: "#9B59B6", fontWeight: "500" }}>
                    Giảm {selectedVoucher.giaTri} % tổng giá trị đơn hàng!
                  </span>
                </p>
                {selectedVoucher.moTa && (
                  <p className="text-muted-foreground mb-2">
                    Mô tả:{" "}
                    <span className="font-medium">{selectedVoucher.moTa}</span>
                  </p>
                )}
                <p className="text-muted-foreground mb-2">
                  Hiệu lực từ:{" "}
                  {new Date(selectedVoucher.ngayBatDau).toLocaleDateString()} -{" "}
                  {new Date(selectedVoucher.ngayKetThuc).toLocaleDateString()}
                </p>
                {selectedVoucher.dieuKien && (
                  <p className="text-muted-foreground mb-2">
                    Điều kiện mua trên:{" "}
                    <span className="font-medium">
                      {selectedVoucher.dieuKien.toLocaleString("vi-VN")} VND
                    </span>
                  </p>
                )}
                {selectedVoucher.coupons &&
                  selectedVoucher.coupons.length > 0 && (
                    <div className="mb-4">
                      <p className="text-muted-foreground font-medium">
                        Mã nhập cho bạn:
                      </p>
                      <ul className="list-disc pl-5">
                        {selectedVoucher.coupons.slice(0, 2).map((coupon) => (
                          <li
                            key={coupon.id}
                            className="text-gray-800"
                            style={{
                              textDecoration:
                                coupon.trangThai === 1
                                  ? "line-through"
                                  : "none",
                              color: coupon.trangThai === 1 ? "#999" : "#333",
                            }}
                          >
                            {coupon.maNhap}
                            {coupon.trangThai === 1 && (
                              <span
                                style={{
                                  color: "#999",
                                  marginLeft: "5px",
                                  fontSize: "12px",
                                }}
                              >
                                (Hết mã)
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                <Button
                  onClick={handleUseVoucher}
                  className="w-full mt-4"
                  style={{
                    backgroundColor: "#9B59B6",
                    color: "white",
                    border: "none",
                  }}
                >
                  Sử dụng ngay
                </Button>
              </div>
            ) : (
              <div
                className="bg-white border rounded-xl p-6 shadow-md w-full max-w-md text-center"
                style={{
                  borderColor: "#9B59B6",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                <p className="text-muted-foreground">
                  {isLoggedIn
                    ? "Quay để nhận voucher nhé!"
                    : "Vui lòng đăng nhập để quay!"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ marginTop: "40px", marginBottom: "-100px" }}>
        <Footer />
      </div>
    </section>
  );
};

export default Voucher;