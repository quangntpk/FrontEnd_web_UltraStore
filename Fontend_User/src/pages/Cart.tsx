import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";
import GiohangComboSupport from "@/components/GioHangComboSupport";
import Swal from "sweetalert2";

interface CartItem {
  idSanPham: string;
  tenSanPham: string;
  mauSac: string;
  kickThuoc: string;
  soLuong: number;
  tienSanPham: number;
  hinhAnh: string;
}

interface ComboItem {
  idCombo: number;
  tenCombo: string;
  hinhAnh: string;
  soLuong: number;
  chiTietGioHangCombo: number;
  sanPhamList: {
    hinhAnh: string;
    maSanPham: string;
    soLuong: number;
    version: number;
    tenSanPham: string;
  }[];
  gia: number;
}

interface CheckoutForm {
  tenNguoiNhan: string;
  sdt: string;
  province: string;
  district: string;
  ward: string;
  specificAddress: string;
}

interface Province {
  code: number;
  name: string;
}

interface District {
  code: number;
  name: string;
}

interface Ward {
  code: number;
  name: string;
}

interface Address {
  maDiaChi: number;
  maNguoiDung: string;
  hoTen: string;
  sdt: string;
  moTa: string;
  diaChi: string;
  phuongXa: string;
  quanHuyen: string;
  tinh: string;
  trangThai: number;
}

const shippingData = {
  "Hà Nội": { fee: 40000, time: "3 - 5 ngày" },
  "TP. Hồ Chí Minh": { fee: 20000, time: "2 - 3 ngày" },
  "Hải Phòng": { fee: 45000, time: "3 - 5 ngày" },
  "Đà Nẵng": { fee: 30000, time: "2 - 3 ngày" },
  "Cần Thơ": { fee: 30000, time: "2 - 4 ngày" },
  "An Giang": { fee: 35000, time: "3 - 4 ngày" },
  "Bà Rịa - Vũng Tàu": { fee: 25000, time: "2 - 3 ngày" },
  "Bắc Giang": { fee: 45000, time: "3 - 5 ngày" },
  "Bắc Kạn": { fee: 50000, time: "4 - 6 ngày" },
  "Bạc Liêu": { fee: 35000, time: "3 - 4 ngày" },
  "Bắc Ninh": { fee: 40000, time: "3 - 5 ngày" },
  "Bến Tre": { fee: 30000, time: "2 - 4 ngày" },
  "Bình Định": { fee: 25000, time: "2 - 3 ngày" },
  "Bình Dương": { fee: 20000, time: "2 - 3 ngày" },
  "Bình Phước": { fee: 20000, time: "2 - 3 ngày" },
  "Bình Thuận": { fee: 25000, time: "2 - 3 ngày" },
  "Cà Mau": { fee: 35000, time: "3 - 5 ngày" },
  "Cao Bằng": { fee: 50000, time: "4 - 6 ngày" },
  "Đắk Lắk": { fee: 0, time: "Nội tỉnh" },
  "Đắk Nông": { fee: 15000, time: "1 - 2 ngày" },
  "Điện Biên": { fee: 50000, time: "4 - 6 ngày" },
  "Đồng Nai": { fee: 20000, time: "2 - 3 ngày" },
  "Đồng Tháp": { fee: 30000, time: "3 - 4 ngày" },
  "Gia Lai": { fee: 15000, time: "1 - 2 ngày" },
  "Hà Giang": { fee: 50000, time: "4 - 6 ngày" },
  "Hà Nam": { fee: 45000, time: "3 - 5 ngày" },
  "Hà Tĩnh": { fee: 35000, time: "3 - 4 ngày" },
  "Hải Dương": { fee: 45000, time: "3 - 5 ngày" },
  "Hậu Giang": { fee: 35000, time: "3 - 4 ngày" },
  "Hòa Bình": { fee: 45000, time: "3 - 5 ngày" },
  "Hưng Yên": { fee: 40000, time: "3 - 5 ngày" },
  "Khánh Hòa": { fee: 25000, time: "2 - 3 ngày" },
  "Kiên Giang": { fee: 35000, time: "3 - 4 ngày" },
  "Kon Tum": { fee: 15000, time: "1 - 2 ngày" },
  "Lai Châu": { fee: 50000, time: "4 - 6 ngày" },
  "Lâm Đồng": { fee: 20000, time: "1 - 2 ngày" },
  "Lạng Sơn": { fee: 50000, time: "4 - 6 ngày" },
  "Lào Cai": { fee: 50000, time: "4 - 6 ngày" },
  "Long An": { fee: 30000, time: "2 - 4 ngày" },
  "Nam Định": { fee: 45000, time: "3 - 5 ngày" },
  "Nghệ An": { fee: 35000, time: "3 - 4 ngày" },
  "Ninh Bình": { fee: 45000, time: "3 - 5 ngày" },
  "Ninh Thuận": { fee: 25000, time: "2 - 3 ngày" },
  "Phú Thọ": { fee: 45000, time: "3 - 5 ngày" },
  "Phú Yên": { fee: 25000, time: "2 - 3 ngày" },
  "Quảng Bình": { fee: 35000, time: "3 - 4 ngày" },
  "Quảng Nam": { fee: 25000, time: "2 - 3 ngày" },
  "Quảng Ngãi": { fee: 25000, time: "2 - 3 ngày" },
  "Quảng Ninh": { fee: 50000, time: "4 - 6 ngày" },
  "Quảng Trị": { fee: 30000, time: "3 - 4 ngày" },
  "Sóc Trăng": { fee: 35000, time: "3 - 4 ngày" },
  "Sơn La": { fee: 50000, time: "4 - 6 ngày" },
  "Tây Ninh": { fee: 25000, time: "2 - 3 ngày" },
  "Thái Bình": { fee: 45000, time: "3 - 5 ngày" },
  "Thái Nguyên": { fee: 45000, time: "3 - 5 ngày" },
  "Thanh Hóa": { fee: 40000, time: "3 - 4 ngày" },
  "Thừa Thiên Huế": { fee: 30000, time: "2 - 3 ngày" },
  "Tiền Giang": { fee: 30000, time: "2 - 3 ngày" },
  "Trà Vinh": { fee: 30000, time: "2 - 3 ngày" },
  "Tuyên Quang": { fee: 50000, time: "4 - 6 ngày" },
  "Vĩnh Long": { fee: 30000, time: "2 - 3 ngày" },
  "Vĩnh Phúc": { fee: 45000, time: "3 - 5 ngày" },
  "Yên Bái": { fee: 50000, time: "4 - 6 ngày" },
};

const provinceMapping: { [key: string]: string } = {
  "ha noi": "Hà Nội",
  "thanh pho ha noi": "Hà Nội",
  "tp ho chi minh": "TP. Hồ Chí Minh",
  "thanh pho ho chi minh": "TP. Hồ Chí Minh",
  "hai phong": "Hải Phòng",
  "thanh pho hai phong": "Hải Phòng",
  "da nang": "Đà Nẵng",
  "thanh pho da nang": "Đà Nẵng",
  "can tho": "Cần Thơ",
  "thanh pho can tho": "Cần Thơ",
  "an giang": "An Giang",
  "tinh an giang": "An Giang",
  "ba ria vung tau": "Bà Rịa - Vũng Tàu",
  "tinh ba ria vung tau": "Bà Rịa - Vũng Tàu",
  "bac giang": "Bắc Giang",
  "tinh bac giang": "Bắc Giang",
  "bac kan": "Bắc Kạn",
  "tinh bac kan": "Bắc Kạn",
  "bac lieu": "Bạc Liêu",
  "tinh bac lieu": "Bạc Liêu",
  "bac ninh": "Bắc Ninh",
  "tinh bac ninh": "Bắc Ninh",
  "ben tre": "Bến Tre",
  "tinh ben tre": "Bến Tre",
  "binh dinh": "Bình Định",
  "tinh binh dinh": "Bình Định",
  "binh duong": "Bình Dương",
  "tinh binh duong": "Bình Dương",
  "binh phuoc": "Bình Phước",
  "tinh binh phuoc": "Bình Phước",
  "binh thuan": "Bình Thuận",
  "tinh binh thuan": "Bình Thuận",
  "ca mau": "Cà Mau",
  "tinh ca mau": "Cà Mau",
  "cao bang": "Cao Bằng",
  "tinh cao bang": "Cao Bằng",
  "dak lak": "Đắk Lắk",
  "tinh dak lak": "Đắk Lắk",
  "dak nong": "Đắk Nông",
  "tinh dak nong": "Đắk Nông",
  "dien bien": "Điện Biên",
  "tinh dien bien": "Điện Biên",
  "dong nai": "Đồng Nai",
  "tinh dong nai": "Đồng Nai",
  "dong thap": "Đồng Tháp",
  "tinh dong thap": "Đồng Tháp",
  "gia lai": "Gia Lai",
  "tinh gia lai": "Gia Lai",
  "ha giang": "Hà Giang",
  "tinh ha giang": "Hà Giang",
  "ha nam": "Hà Nam",
  "tinh ha nam": "Hà Nam",
  "ha tinh": "Hà Tĩnh",
  "tinh ha tinh": "Hà Tĩnh",
  "hai duong": "Hải Dương",
  "tinh hai duong": "Hải Dương",
  "hau giang": "Hậu Giang",
  "tinh hau giang": "Hậu Giang",
  "hoa binh": "Hòa Bình",
  "tinh hoa binh": "Hòa Bình",
  "hung yen": "Hưng Yên",
  "tinh hung yen": "Hưng Yên",
  "khanh hoa": "Khánh Hòa",
  "tinh khanh hoa": "Khánh Hòa",
  "kien giang": "Kiên Giang",
  "tinh kien giang": "Kiên Giang",
  "kon tum": "Kon Tum",
  "tinh kon tum": "Kon Tum",
  "lai chau": "Lai Châu",
  "tinh lai chau": "Lai Châu",
  "lam dong": "Lâm Đồng",
  "tinh lam dong": "Lâm Đồng",
  "lang son": "Lạng Sơn",
  "tinh lang son": "Lạng Sơn",
  "lao cai": "Lào Cai",
  "tinh lao cai": "Lào Cai",
  "long an": "Long An",
  "tinh long an": "Long An",
  "nam dinh": "Nam Định",
  "tinh nam dinh": "Nam Định",
  "nghe an": "Nghệ An",
  "tinh nghe an": "Nghệ An",
  "ninh binh": "Ninh Bình",
  "tinh ninh binh": "Ninh Bình",
  "ninh thuan": "Ninh Thuận",
  "tinh ninh thuan": "Ninh Thuận",
  "phu tho": "Phú Thọ",
  "tinh phu tho": "Phú Thọ",
  "phu yen": "Phú Yên",
  "tinh phu yen": "Phú Yên",
  "quang binh": "Quảng Bình",
  "tinh quang binh": "Quảng Bình",
  "quang nam": "Quảng Nam",
  "tinh quang nam": "Quảng Nam",
  "quang ngai": "Quảng Ngãi",
  "tinh quang ngai": "Quảng Ngãi",
  "quang ninh": "Quảng Ninh",
  "tinh quang ninh": "Quảng Ninh",
  "quang tri": "Quảng Trị",
  "tinh quang tri": "Quảng Trị",
  "soc trang": "Sóc Trăng",
  "tinh soc trang": "Sóc Trăng",
  "son la": "Sơn La",
  "tinh son la": "Sơn La",
  "tay ninh": "Tây Ninh",
  "tinh tay ninh": "Tây Ninh",
  "thai binh": "Thái Bình",
  "tinh thai binh": "Thái Bình",
  "thai nguyen": "Thái Nguyên",
  "tinh thai nguyen": "Thái Nguyên",
  "thanh hoa": "Thanh Hóa",
  "tinh thanh hoa": "Thanh Hóa",
  "thua thien hue": "Thừa Thiên Huế",
  "tinh thua thien hue": "Thừa Thiên Huế",
  "tien giang": "Tiền Giang",
  "tinh tien giang": "Tiền Giang",
  "tra vinh": "Trà Vinh",
  "tinh tra vinh": "Trà Vinh",
  "tuyen quang": "Tuyên Quang",
  "tinh tuyen quang": "Tuyên Quang",
  "vinh long": "Vĩnh Long",
  "tinh vinh long": "Vĩnh Long",
  "vinh phuc": "Vĩnh Phúc",
  "tinh vinh phuc": "Vĩnh Phúc",
  "yen bai": "Yên Bái",
  "tinh yen bai": "Yên Bái",
};

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [comboItems, setComboItems] = useState<ComboItem[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [finalAmount, setFinalAmount] = useState<number>(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<ComboItem | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [cartId, setCartId] = useState<number | null>(null);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "vnpay">("cod");

  const [checkoutForm, setCheckoutForm] = useState<CheckoutForm>({
    tenNguoiNhan: "",
    sdt: "",
    province: "",
    district: "",
    ward: "",
    specificAddress: "",
  });

  const formatCurrency = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const normalizeName = (name: string) => {
    if (!name) return "";
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/^(thanh pho|tinh|quan|huyen|phuong|xa)\s+/i, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const normalizeShippingName = (name: string) => {
    if (!name) return "";
    const normalized = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/^(thanh pho|tinh)\s+/i, "")
      .replace(/\s+/g, " ")
      .trim();
    return provinceMapping[normalized] || name.trim();
  };

  useEffect(() => {
    const fetchCartData = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        Swal.fire({
          title: "Vui lòng đăng nhập!",
          text: "Bạn cần đăng nhập để xem giỏ hàng.",
          icon: "warning",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          navigate("/login");
        });
        return;
      }

      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
        `http://localhost:5261/api/Cart/CopyGioHang?id=${userId}`
      )}&size=200x200`;
      setQrCodeUrl(qrUrl);

      try {
        const response = await fetch(
          `http://localhost:5261/api/Cart/GioHangByKhachHang?id=${userId}`
        );
        const data = await response.json();
        setCartId(data.id);

        const processedCartItems = data.ctghSanPhamView.map((item: any) => ({
          ...item,
          hinhAnh: item.hinhAnh.startsWith("data:image")
            ? item.hinhAnh
            : `data:image/jpeg;base64,${item.hinhAnh}`,
        }));
        setCartItems(processedCartItems);

        const processedComboItems = data.ctghComboView.map((combo: any) => ({
          ...combo,
          chiTietGioHangCombo: combo.chiTietGioHangCombo,
          hinhAnh: combo.hinhAnh?.startsWith("data:image")
            ? combo.hinhAnh
            : combo.hinhAnh
            ? `data:image/jpeg;base64,${combo.hinhAnh}`
            : "/placeholder-image.jpg",
          sanPhamList: combo.sanPhamList.map((item: any) => ({
            ...item,
            hinhAnh: item.hinhAnh?.startsWith("data:image")
              ? item.hinhAnh
              : item.hinhAnh
              ? `data:image/jpeg;base64,${item.hinhAnh}`
              : "/placeholder-image.jpg",
          })),
        }));
        setComboItems(processedComboItems);

        // Cập nhật finalAmount ban đầu
        const subtotal = processedCartItems.reduce(
          (sum, item) => sum + item.tienSanPham * item.soLuong,
          0
        ) + processedComboItems.reduce(
          (sum, item) => sum + item.gia * item.soLuong,
          0
        );
        setFinalAmount(subtotal + shippingFee);
      } catch (error) {
        // toast.error("Không thể tải dữ liệu giỏ hàng");
        // console.error("Error fetching cart:", error);
      }
    };

    const fetchProvinces = async () => {
      try {
        const response = await fetch("https://provinces.open-api.vn/api/p/");
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        toast.error("Không thể tải danh sách tỉnh/thành phố");
        console.error("Error fetching provinces:", error);
      }
    };

    const fetchAddresses = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        const response = await fetch(
          `http://localhost:5261/api/DanhSachDiaChi/maNguoiDung/${userId}`
        );
        const data = await response.json();
        setAddresses(
          data.sort((a: Address, b: Address) => b.trangThai - a.trangThai)
        );
      } catch (error) {
        toast.error("Không thể tải danh sách địa chỉ");
        console.error("Error fetching addresses:", error);
      }
    };

    fetchCartData();
    fetchProvinces();
    fetchAddresses();
  }, [navigate]);

  const handleProvinceChange = async (provinceCode: string) => {
    setCheckoutForm((prev) => ({
      ...prev,
      province: provinceCode,
      district: "",
      ward: "",
    }));
    setDistricts([]);
    setWards([]);
  
    const selectedProvince = provinces.find(
      (p) => p.code.toString() === provinceCode
    );
    if (selectedProvince) {
      const shippingInfo = shippingData[selectedProvince.name.trim()] || {
        fee: 0,
        time: "Không xác định",
      };
      setShippingFee(shippingInfo.fee);
      console.log("Province changed:", {
        province: selectedProvince.name,
        shippingFee: shippingInfo.fee,
      });
    } else {
      console.log("No valid province selected, keeping current shippingFee");
    }
  
    const subtotal = calculateSubtotal();
    setFinalAmount(subtotal - discountAmount + shippingFee);
  
    if (provinceCode) {
      try {
        const response = await fetch(
          `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
        );
        const data = await response.json();
        setDistricts(data.districts || []);
      } catch (error) {
        toast.error("Không thể tải danh sách quận/huyện");
        console.error("Lỗi khi lấy danh sách huyện:", error);
      }
    }
  };

  const handleDistrictChange = async (districtCode: string) => {
    setCheckoutForm((prev) => ({
      ...prev,
      district: districtCode,
      ward: "",
    }));
    setWards([]);

    if (districtCode) {
      try {
        const response = await fetch(
          `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
        );
        const data = await response.json();
        setWards(data.wards || []);
      } catch (error) {
        toast.error("Không thể tải danh sách phường/xã");
        console.error("Lỗi khi lấy danh sách phường/xã:", error);
      }
    }
  };
  const handleSelectAddress = async (address: Address) => {
    try {
        const rawProvinceName = address.tinh;
        const normalizedProvinceName = normalizeName(rawProvinceName);

        const province = provinces.find(
            (p) => normalizeName(p.name) === normalizedProvinceName
        );
        if (!province) {
            toast.error("Không thể tìm thấy tỉnh/thành phố tương ứng");
            return;
        }
        console.log("Tỉnh được chọn:", province);

        const districtResponse = await fetch(
            `https://provinces.open-api.vn/api/p/${province.code}?depth=2`
        );
        const districtData = await districtResponse.json();
        const normalizedDistrictName = normalizeName(address.quanHuyen);
        const district = districtData.districts.find(
            (d: District) => normalizeName(d.name) === normalizedDistrictName
        );

        if (!district) {
            toast.error("Không thể tìm thấy quận/huyện tương ứng");
            return;
        }
        console.log("Quận/Huyện được chọn:", district);

        const wardResponse = await fetch(
            `https://provinces.open-api.vn/api/d/${district.code}?depth=2`
        );
        const wardData = await wardResponse.json();
        const normalizedWardName = normalizeName(address.phuongXa);
        const ward = wardData.wards.find(
            (w: Ward) => normalizeName(w.name) === normalizedWardName
        );

        if (!ward) {
            toast.error(
                "Không tìm thấy phường/xã tương ứng. Vui lòng kiểm tra lại dữ liệu địa chỉ."
            );
            console.error("Không tìm thấy phường/xã:", normalizedWardName);
            return;
        }

        const shippingProvinceName = normalizeShippingName(rawProvinceName);
        const shippingInfo = shippingData[shippingProvinceName] || {
            fee: 0,
            time: "Không xác định",
        };
        setShippingFee(shippingInfo.fee);
        console.log("Selected address:", {
          rawProvinceName,
          shippingProvinceName,
          shippingFee: shippingInfo.fee,
        });

        setDistricts(districtData.districts || []);
        setWards(wardData.wards || []);

        const fullAddress = `${address.diaChi}, ${ward.name}, ${district.name}, ${province.name}`;
        setCheckoutForm({
            tenNguoiNhan: address.hoTen,
            sdt: address.sdt,
            province: province.code.toString(),
            district: district.code.toString(),
            ward: ward.code.toString(),
            specificAddress: address.diaChi,
        });

        const subtotal = calculateSubtotal();
        setFinalAmount(subtotal - discountAmount + shippingInfo.fee);

        setShowAddressModal(false);
        toast.success("Đã chọn địa chỉ giao hàng");
    } catch (error) {
        toast.error("Không thể chọn địa chỉ, vui lòng thử lại");
    }
};

  const handleQuantityChange = async (idSanPham: string, change: number) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      Swal.fire({
        title: "Vui lòng đăng nhập!",
        text: "Bạn cần đăng nhập để thay đổi số lượng.",
        icon: "warning",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        navigate("/login");
      });
      return;
    }

    const info = {
      MaKhachHang: userId,
      IDSanPham: idSanPham,
      IDCombo: null,
    };

    try {
      if (change > 0) {
        await fetch("http://localhost:5261/api/Cart/TangSoLuongSanPham", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(info),
        });
      } else {
        await fetch("http://localhost:5261/api/Cart/GiamSoLuongSanPham", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(info),
        });
      }

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.idSanPham === idSanPham
            ? { ...item, soLuong: Math.max(1, item.soLuong + change) }
            : item
        )
      );

      // Cập nhật finalAmount khi số lượng thay đổi
      const subtotal = calculateSubtotal();
      setFinalAmount(subtotal - discountAmount + shippingFee);
    } catch (error) {
      toast.error("Không thể cập nhật số lượng");
      console.error("Error updating quantity:", error);
    }
  };

  const handleRemoveItem = async (idSanPham: string) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      Swal.fire({
        title: "Vui lòng đăng nhập!",
        text: "Bạn cần đăng nhập để xóa sản phẩm.",
        icon: "warning",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        navigate("/login");
      });
      return;
    }

    const result = await Swal.fire({
      title: "Bạn có chắc không?",
      text: "Bạn có muốn xóa sản phẩm này khỏi giỏ hàng?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Có, xóa nó!",
      cancelButtonText: "Không, giữ lại",
    });

    if (result.isConfirmed) {
      const info = {
        MaKhachHang: userId,
        IDSanPham: idSanPham,
        IDCombo: null,
      };
      try {
        await fetch("http://localhost:5261/api/Cart/XoaSanPham", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(info),
        });

        setCartItems((prevItems) =>
          prevItems.filter((item) => item.idSanPham !== idSanPham)
        );
        toast.success("Đã xóa sản phẩm khỏi giỏ hàng");

        // Cập nhật finalAmount khi xóa sản phẩm
        const subtotal = calculateSubtotal();
        setFinalAmount(subtotal - discountAmount + shippingFee);
      } catch (error) {
        toast.error("Xóa sản phẩm thất bại");
      }
    }
  };

  const handleRemoveCombo = async (idCombo: number) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      Swal.fire({
        title: "Vui lòng đăng nhập!",
        text: "Bạn cần đăng nhập để xóa combo.",
        icon: "warning",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        navigate("/login");
      });
      return;
    }

    const result = await Swal.fire({
      title: "Bạn có chắc không?",
      text: "Bạn có muốn xóa combo này khỏi giỏ hàng?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Có, xóa nó!",
      cancelButtonText: "Không, giữ lại",
    });

    if (result.isConfirmed) {
      const info = {
        MaKhachHang: userId,
        IDSanPham: null,
        IDCombo: idCombo,
      };

      try {
        await fetch("http://localhost:5261/api/Cart/XoaCombo", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(info),
        });

        setComboItems((prevItems) =>
          prevItems.filter((item) => item.idCombo !== idCombo)
        );
        toast.success("Đã xóa combo khỏi giỏ hàng");

        // Cập nhật finalAmount khi xóa combo
        const subtotal = calculateSubtotal();
        setFinalAmount(subtotal - discountAmount + shippingFee);
      } catch (error) {
        toast.error("Xóa combo thất bại");
        console.error("Error removing combo:", error);
      }
    }
  };

  const handleUpdateCombo = (updatedCombo: ComboItem) => {
    setComboItems((prevItems) =>
      prevItems.map((item) =>
        item.idCombo === updatedCombo.idCombo ? updatedCombo : item
      )
    );

    // Cập nhật finalAmount khi cập nhật combo
    const subtotal = calculateSubtotal();
    setFinalAmount(subtotal - discountAmount + shippingFee);
  };

  const calculateSubtotal = () => {
    const productTotal = cartItems.reduce(
      (sum, item) => sum + item.tienSanPham * item.soLuong,
      0
    );
    const comboTotal = comboItems.reduce(
      (sum, item) => sum + item.gia * item.soLuong,
      0
    );
    return productTotal + comboTotal;
  };

  const calculateDiscount = () => {
    return discountAmount;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal - discountAmount + shippingFee;
  };

  const handleCheckoutFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCheckoutForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyPromo = async () => {
    if (!promoCode) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }

    if (!cartId) {
      toast.error("Giỏ hàng không hợp lệ");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5261/api/Voucher/Validate?code=${encodeURIComponent(
          promoCode
        )}&cartId=${cartId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setDiscountApplied(true);
        setDiscountAmount(result.discountAmount);
        setFinalAmount(
          calculateSubtotal() - result.discountAmount + shippingFee
        );
        toast.success("Mã giảm giá đã được áp dụng!");
      } else {
        setDiscountApplied(false);
        setDiscountAmount(0);
        setFinalAmount(calculateSubtotal() + shippingFee);
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Lỗi khi áp dụng mã giảm giá");
      console.error("Error applying promo:", error);
    }
  };

const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    const userId = localStorage.getItem("userId");
    if (!userId) {
        Swal.fire({
            title: "Vui lòng đăng nhập!",
            text: "Bạn cần đăng nhập để thanh toán.",
            icon: "warning",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
        }).then(() => {
            navigate("/login");
        });
        return;
    }

    const requiredFields = [
        "tenNguoiNhan",
        "sdt",
        "province",
        "district",
        "ward",
        "specificAddress",
    ];
    const emptyFields = requiredFields.filter(
        (field) => !checkoutForm[field as keyof CheckoutForm]
    );
    if (emptyFields.length > 0) {
        toast.error("Vui lòng điền đầy đủ thông tin giao hàng");
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:5261/api/Cart/GioHangByKhachHang?id=${userId}`
        );
        const data = await response.json();
        setCartId(data.id);

        const processedCartItems = data.ctghSanPhamView.map((item: any) => ({
            ...item,
            hinhAnh: item.hinhAnh.startsWith("data:image")
                ? item.hinhAnh
                : `data:image/jpeg;base64,${item.hinhAnh}`,
        }));
        setCartItems(processedCartItems);

        const processedComboItems = data.ctghComboView.map((combo: any) => ({
            ...combo,
            chiTietGioHangCombo: combo.chiTietGioHangCombo,
            hinhAnh: combo.hinhAnh?.startsWith("data:image")
                ? combo.hinhAnh
                : combo.hinhAnh
                ? `data:image/jpeg;base64,${combo.hinhAnh}`
                : "/placeholder-image.jpg",
            sanPhamList: combo.sanPhamList.map((item: any) => ({
                ...item,
                hinhAnh: item.hinhAnh?.startsWith("data:image")
                    ? item.hinhAnh
                    : item.hinhAnh
                    ? `data:image/jpeg;base64,${item.hinhAnh}`
                    : "/placeholder-image.jpg",
            })),
        }));
        setComboItems(processedComboItems);

        if (promoCode) {
            const voucherResponse = await fetch(
                `http://localhost:5261/api/Voucher/Validate?code=${encodeURIComponent(
                    promoCode
                )}&cartId=${data.id}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const voucherResult = await voucherResponse.json();
            if (!voucherResult.success) {
                setDiscountApplied(false);
                setDiscountAmount(0);
                toast.error("Mã giảm giá không hợp lệ, đã xóa giảm giá");
                setFinalAmount(calculateSubtotal() + shippingFee);
                return;
            } else {
                setDiscountApplied(true);
                setDiscountAmount(voucherResult.discountAmount);
            }
        }

        const selectedProvince = provinces.find(
            (p) => p.code.toString() === checkoutForm.province
        );
        if (!selectedProvince) {
            toast.error("Vui lòng chọn tỉnh/thành phố hợp lệ");
            return;
        }
        // Chuẩn hóa tên tỉnh để khớp với shippingData
        const normalizedProvinceName = normalizeShippingName(selectedProvince.name);
        console.log("Province for shipping:", {
          rawName: selectedProvince.name,
          normalizedName: normalizedProvinceName,
      });
        const expectedShippingFee = shippingData[normalizedProvinceName]?.fee || 0;
        if (shippingFee !== expectedShippingFee) {
            console.warn("Shipping fee mismatch, correcting:", {
                current: shippingFee,
                expected: expectedShippingFee,
            });
            setShippingFee(expectedShippingFee);
        }

        const subtotal = calculateSubtotal();
        const newFinalAmount = subtotal - discountAmount + expectedShippingFee;
        setFinalAmount(newFinalAmount);

        const selectedDistrict =
            districts.find((d) => d.code.toString() === checkoutForm.district)?.name ||
            "";
        const selectedWard =
            wards.find((w) => w.code.toString() === checkoutForm.ward)?.name || "";
        const fullAddress = `${checkoutForm.specificAddress}, ${selectedWard}, ${selectedDistrict}, ${selectedProvince.name}`;
        if (typeof fullAddress !== 'string' || fullAddress.includes('[object Object]')) {
            toast.error("Lỗi định dạng địa chỉ, vui lòng kiểm tra lại");
            console.error("Invalid fullAddress:", fullAddress);
            return;
        }

        console.log("Before sending paymentRequest:", {
            shippingFee,
            expectedShippingFee,
            finalAmount: newFinalAmount,
        });

        const paymentRequest = {
            cartId: data.id,
            couponCode: promoCode || null,
            paymentMethod: paymentMethod,
            tenNguoiNhan: checkoutForm.tenNguoiNhan,
            sdt: checkoutForm.sdt,
            diaChi: fullAddress,
            discountAmount: discountAmount,
            shippingFee: expectedShippingFee,
            finalAmount: newFinalAmount,
        };

        console.log("Sending paymentRequest:", paymentRequest);

        const paymentResponse = await fetch(
            "http://localhost:5261/api/CheckOut/process-payment",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(paymentRequest),
            }
        );

        const result = await paymentResponse.json();

        if (result.success) {
            if (paymentMethod === "cod") {
                if (result.shippingFee !== expectedShippingFee || result.finalAmount !== newFinalAmount) {
                    toast.warning(
                        `Dữ liệu từ server không khớp: ShippingFee: ${result.shippingFee}, FinalAmount: ${result.finalAmount}, ExpectedShippingFee: ${expectedShippingFee}, ExpectedFinalAmount: ${newFinalAmount}`
                    );
                }
                toast.success(result.message, {
                    description: `Mã đơn hàng: ${result.orderId}`,
                    duration: 3000,
                    action: {
                        label: "Xem chi tiết",
                        onClick: () =>
                            navigate("/PaymentSuccess", { state: { orderId: result.orderId } }),
                    },
                });
                setCartItems([]);
                setComboItems([]);
                setPromoCode("");
                setDiscountApplied(false);
                setDiscountAmount(0);
                setFinalAmount(0);
                setShowCheckout(false);
                navigate("/", { state: { orderId: result.orderId } });
            } else if (paymentMethod === "vnpay") {
                if (result.finalAmount !== newFinalAmount) {
                    toast.error(
                        `Tổng tiền VNPay (${formatCurrency(result.finalAmount)} VND) không khớp với kỳ vọng (${formatCurrency(newFinalAmount)} VND). Vui lòng thử lại.`
                    );
                    return;
                }
                window.location.href = result.message;
            }
        } else {
            toast.error(result.message);
            return;
        }
    } catch (error) {
        toast.error("Đã xảy ra lỗi trong quá trình thanh toán");
        console.error("Error during checkout:", error);
    }
};

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 py-12 px-6">
        <div className="container mx-auto max-w-6xl my-[50px]">
          <h1 className="text-3xl font-bold mb-8 gradient-text">
            Giỏ Hàng của bạn
          </h1>

          {cartItems.length > 0 || comboItems.length > 0 ? (
            <>
              {!showCheckout ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    {cartItems.map((item) => (
                      <div
                        key={item.idSanPham}
                        className="flex flex-col sm:flex-row items-start sm:items-center p-4 mb-4 bg-white rounded-lg shadow-sm border border-border"
                      >
                        <div className="w-full sm:w-24 h-24 bg-muted rounded-md overflow-hidden mr-4 mb-4 sm:mb-0">
                          <img
                            src={item.hinhAnh}
                            alt={item.tenSanPham}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">
                            {item.tenSanPham}
                          </h3>
                          <p className="text-muted-foreground">
                            Size: {item.kickThuoc} | Color: {item.mauSac}
                          </p>
                          <p className="text-muted-foreground">
                            {formatCurrency(item.tienSanPham)} VND
                          </p>
                        </div>
                        <div className="flex items-center mt-4 sm:mt-0">
                          <button
                            onClick={() => handleQuantityChange(item.idSanPham, -1)}
                            className="p-1 rounded-md hover:bg-muted"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="mx-2 w-8 text-center">
                            {item.soLuong}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.idSanPham, 1)}
                            className="p-1 rounded-md hover:bg-muted"
                          >
                            <Plus size={16} />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.idSanPham)}
                            className="ml-4 p-1 text-red-500 hover:bg-red-50 rounded-md"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {comboItems.map((combo) => (
                      <div
                        key={combo.idCombo}
                        className="flex flex-col sm:flex-row items-start sm:items-center p-4 mb-4 bg-white rounded-lg shadow-sm border border-border"
                      >
                        <div className="w-full sm:w-24 h-24 bg-muted rounded-md overflow-hidden mr-4 mb-4 sm:mb-0">
                          <img
                            src={combo.hinhAnh}
                            alt={combo.tenCombo}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">
                            {combo.tenCombo}
                          </h3>
                          <p className="text-muted-foreground">
                            Gồm: {combo.sanPhamList.length} sản phẩm
                          </p>
                          <p className="text-muted-foreground">
                            {formatCurrency(combo.gia)} VND
                          </p>
                        </div>
                        <div className="flex items-center mt-4 sm:mt-0">
                          <span className="mx-2 w-8 text-center">
                            {combo.soLuong}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="ml-2"
                            onClick={() => setSelectedCombo(combo)}
                          >
                            Cập nhật
                          </Button>
                          <button
                            onClick={() => handleRemoveCombo(combo.idCombo)}
                            className="ml-4 p-1 text-red-500 hover:bg-red-50 rounded-md"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
                      <h2 className="text-xl font-semibold mb-4">Giỏ Hàng</h2>

                      <div className="space-y-3 mb-6">
                        {cartItems.map((item) => (
                          <div
                            key={item.idSanPham}
                            className="flex justify-between"
                          >
                            <span className="text-muted-foreground">
                              {item.tenSanPham}{" "}
                              <span className="text-xs">x{item.soLuong}</span>
                            </span>
                            <span>
                              {formatCurrency(item.tienSanPham * item.soLuong)}{" "}
                              VND
                            </span>
                          </div>
                        ))}
                        {comboItems.map((combo) => (
                          <div
                            key={combo.idCombo}
                            className="flex justify-between"
                          >
                            <span className="text-muted-foreground">
                              {combo.tenCombo}{" "}
                              <span className="text-xs">x{combo.soLuong}</span>
                            </span>
                            <span>
                              {formatCurrency(combo.gia * combo.soLuong)} VND
                            </span>
                          </div>
                        ))}

                        <div className="border-t my-3"></div>

                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Tổng tiền gốc
                          </span>
                          <span>{formatCurrency(calculateSubtotal())} VND</span>
                        </div>

                        {discountApplied && (
                          <div className="flex justify-between text-green-600">
                            <span>Giảm giá</span>
                            <span>
                              -{formatCurrency(calculateDiscount())} VND
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Phí giao hàng
                          </span>
                          <span>{formatCurrency(shippingFee)} VND</span>
                        </div>

                        <div className="border-t pt-3 flex justify-between font-medium">
                          <span>Tổng tiền</span>
                          <span className="text-lg">
                            {formatCurrency(calculateTotal())} VND
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center mb-4">
                        <Input
                          placeholder="Mã giảm giá (nếu có)"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="mr-2"
                        />
                        <Button size="sm" onClick={handleApplyPromo}>
                          Áp Dụng
                        </Button>
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => setShowCheckout(true)}
                      >
                        Chuyển đến trang Thanh Toán
                      </Button>
                      <Link
                        to="/"
                        className="block text-center text-primary hover:underline mt-4"
                      >
                        Quay về trang Sản Phẩm
                      </Link>

                      {qrCodeUrl && (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium mb-2 text-center">
                            Chia sẻ mã QR này để cho bạn bè Copy giỏ hàng của bạn
                          </h3>
                          <img
                            src={qrCodeUrl}
                            alt="QR Code"
                            className="w-48 h-48 mx-auto"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <form
                      onSubmit={handleSubmitCheckout}
                      className="bg-white p-6 rounded-lg shadow-sm border border-border"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold mb-6">
                          Thông tin giao hàng
                        </h2>
                        <div className="space-x-2">
                          <Button
                            type="button"
                            onClick={() => setShowAddressModal(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            Chọn địa chỉ có sẵn
                          </Button>
                          <Button
                            type="button"
                            onClick={() => navigate("/diachi")}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            Thêm địa chỉ mới
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-2">
                          <Label htmlFor="tenNguoiNhan">Tên người nhận</Label>
                          <Input readOnly
                            id="tenNguoiNhan"
                            name="tenNguoiNhan"
                            value={checkoutForm.tenNguoiNhan}
                            onChange={handleCheckoutFormChange}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="sdt">Số điện thoại</Label>
                          <Input readOnly
                            id="sdt"
                            name="sdt"
                            type="tel"
                            value={checkoutForm.sdt}
                            onChange={handleCheckoutFormChange}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="province">Tỉnh/Thành phố</Label>
                          <select
                            id="province"
                            name="province"
                            value={checkoutForm.province}
                            onChange={(e) => handleProvinceChange(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            required
                            disabled
                          >
                            <option value="">Chọn tỉnh/thành phố</option>
                            {provinces.map((province) => (
                              <option key={province.code} value={province.code}>
                                {province.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="district">Quận/Huyện</Label>
                          <select
                            id="district"
                            name="district"
                            value={checkoutForm.district}
                            onChange={(e) => handleDistrictChange(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            required
                            disabled
                            
                          >
                            <option value="">Chọn quận/huyện</option>
                            {districts.map((district) => (
                              <option key={district.code} value={district.code}>
                                {district.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ward">Phường/Xã</Label>
                          <select
                            id="ward"
                            name="ward"
                            value={checkoutForm.ward}
                            onChange={handleCheckoutFormChange}
                            className="w-full p-2 border rounded-md"
                            required
                            disabled
                          >
                            <option value="" aria-readonly>Chọn phường/xã</option>
                            {wards.map((ward) => (
                              <option key={ward.code} value={ward.code}>
                                {ward.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="specificAddress">
                            Địa chỉ cụ thể (số nhà, tên đường)
                          </Label>
                          <Input
                            id="specificAddress"
                            name="specificAddress"
                            value={checkoutForm.specificAddress}
                            onChange={handleCheckoutFormChange}
                            required
                            disabled
                          />
                        </div>
                      </div>

                      <div className="space-y-2 mb-6">
                        <Label>Phương thức thanh toán</Label>
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="cod"
                              checked={paymentMethod === "cod"}
                              onChange={() => setPaymentMethod("cod")}
                              className="mr-2"
                            />
                            Thanh toán khi nhận hàng (COD)
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="vnpay"
                              checked={paymentMethod === "vnpay"}
                              onChange={() => setPaymentMethod("vnpay")}
                              className="mr-2"
                            />
                            Thanh toán qua VNPay
                          </label>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 mt-6">
                        <Button
                          type="submit"
                          className="flex-1 sm:order-2"
                          disabled={!cartId}
                        >
                          {paymentMethod === "cod"
                            ? "Xác nhận thanh toán COD"
                            : "Thanh toán qua VNPay"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 sm:order-1"
                          onClick={() => setShowCheckout(false)}
                        >
                          Quay lại giỏ hàng
                        </Button>
                      </div>
                    </form>
                  </div>

                  <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-border sticky top-4">
                      <h2 className="text-xl font-semibold mb-4">
                        Tóm tắt đơn hàng
                      </h2>

                      <div className="space-y-3 mb-6">
                        {cartItems.map((item) => (
                          <div
                            key={item.idSanPham}
                            className="flex justify-between"
                          >
                            <span className="text-muted-foreground">
                              {item.tenSanPham}{" "}
                              <span className="text-xs">x{item.soLuong}</span>
                            </span>
                            <span>
                              {formatCurrency(item.tienSanPham * item.soLuong)}{" "}
                              VND
                            </span>
                          </div>
                        ))}
                        {comboItems.map((combo) => (
                          <div
                            key={combo.idCombo}
                            className="flex justify-between"
                          >
                            <span className="text-muted-foreground">
                              {combo.tenCombo}{" "}
                              <span className="text-xs">x{combo.soLuong}</span>
                            </span>
                            <span>
                              {formatCurrency(combo.gia * combo.soLuong)} VND
                            </span>
                          </div>
                        ))}

                        <div className="border-t my-3"></div>

                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Tổng tiền gốc
                          </span>
                          <span>{formatCurrency(calculateSubtotal())} VND</span>
                        </div>

                        {discountApplied && (
                          <div className="flex justify-between text-green-600">
                            <span>Giảm giá</span>
                            <span>
                              -{formatCurrency(calculateDiscount())} VND
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Phí giao hàng
                          </span>
                          <span>{formatCurrency(shippingFee)} VND</span>
                        </div>

                        <div className="border-t pt-3 flex justify-between font-medium">
                          <span>Tổng tiền</span>
                          <span className="text-lg">
                            {formatCurrency(calculateTotal())} VND
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground/60 mb-4" />
              <h2 className="text-2xl font-medium mb-2">
                Giỏ hàng của bạn đang trống
              </h2>
              <p className="text-muted-foreground mb-8">
                Có vẻ như bạn chưa thêm sản phẩm hoặc combo nào vào giỏ hàng.
              </p>
              <Link to="/">
                <Button>Tiếp tục mua sắm</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />

      <Dialog.Root
        open={!!selectedCombo}
        onOpenChange={(open) => !open && setSelectedCombo(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {selectedCombo && (
              <GiohangComboSupport
                combo={selectedCombo}
                onClose={() => setSelectedCombo(null)}
                onUpdateCombo={handleUpdateCombo}
              />
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root
        open={showAddressModal}
        onOpenChange={(open) => setShowAddressModal(open)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Chọn địa chỉ giao hàng</h2>
            {addresses.length === 0 ? (
              <p>Chưa có địa chỉ nào. Vui lòng thêm địa chỉ mới.</p>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div
                    key={address.maDiaChi}
                    className="border p-4 rounded-lg bg-white shadow-sm flex justify-between"
                  >
                    <div>
                      <p>
                        <strong>Họ tên:</strong> {address.hoTen}
                      </p>
                      <p>
                        <strong>SĐT:</strong> {address.sdt}
                      </p>
                      <p>
                        <strong>Địa chỉ:</strong> {address.diaChi},{" "}
                        {address.phuongXa}, {address.quanHuyen}, {address.tinh}
                      </p>
                      <p>
                        <strong>Trạng thái:</strong>{" "}
                        {address.trangThai === 1 ? "Hoạt động" : "Không hoạt động"}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleSelectAddress(address)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Chọn
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setShowAddressModal(false)}
            >
              Đóng
            </Button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default CartPage;