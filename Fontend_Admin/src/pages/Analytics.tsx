import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreVertical, Eye, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Notification from "@/components/layout/Notification";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// Số lượng mục trên mỗi trang
const ITEMS_PER_PAGE = 10;

// Định nghĩa interface cho dữ liệu liên hệ
interface LienHe {
  maLienHe: number;
  hoTen: string;
  email: string;
  sdt: string;
  noiDung: string;
  trangThai: number;
  ngayTao: string;
}

const LienHeManagement = () => {
  // Khai báo các state cần thiết
  const [lienHeList, setLienHeList] = useState<LienHe[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [selectedContact, setSelectedContact] = useState<LienHe | null>(null);
  const [supportModalOpen, setSupportModalOpen] = useState<boolean>(false);
  const [supportMessage, setSupportMessage] = useState<string>("");
  const [deleteContact, setDeleteContact] = useState<LienHe | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>("");
  const [notification, setNotification] = useState<{
    message: string;
    type: "info" | "success" | "error";
    show: boolean;
  }>({
    message: "",
    type: "info",
    show: false,
  });
  const [selectedLienHeIds, setSelectedLienHeIds] = useState<number[]>([]);
  const [phanLoaiData, setPhanLoaiData] = useState<{ [key: string]: number }>({
    tích_cực: 0,
    tiêu_cực: 0,
    bình_thường: 0,
  });
  const [phanLoaiTheoNgay, setPhanLoaiTheoNgay] = useState<{
    [date: string]: { tích_cực: number; tiêu_cực: number; bình_thường: number };
  }>({});
  const [activeTab, setActiveTab] = useState<string>("danhSachLienHe");
  const [statusLoading, setStatusLoading] = useState<{ [key: number]: boolean }>({});

  // Fetch danh sách liên hệ khi component được mount
  useEffect(() => {
    fetchLienHe();
  }, []);

  // Fetch và phân loại góp ý từ API
  const fetchPhanLoaiGopY = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5261/api/LienHe");
      if (!response.ok) throw new Error("Lỗi khi tải danh sách liên hệ");
      const lienHeList = await response.json();

      const phanLoai = { tích_cực: 0, tiêu_cực: 0, bình_thường: 0 };
      const phanLoaiTheoNgayTemp: {
        [date: string]: { tích_cực: number; tiêu_cực: number; bình_thường: number };
      } = {};

      for (const lienHe of lienHeList) {
        const res = await fetch(
          `http://localhost:5261/api/Gemini/PhanLoaiGopY?noiDung=${encodeURIComponent(
            lienHe.noiDung
          )}`
        );
        const data = await res.json();
        if (data.responseCode === 201) {
          const type = data.result;
          const date = new Date(lienHe.ngayTao).toISOString().split("T")[0];

          if (!phanLoaiTheoNgayTemp[date]) {
            phanLoaiTheoNgayTemp[date] = { tích_cực: 0, tiêu_cực: 0, bình_thường: 0 };
          }

          if (type.includes("tích cực")) {
            phanLoai.tích_cực++;
            phanLoaiTheoNgayTemp[date].tích_cực++;
          } else if (type.includes("tiêu cực")) {
            phanLoai.tiêu_cực++;
            phanLoaiTheoNgayTemp[date].tiêu_cực++;
          } else {
            phanLoai.bình_thường++;
            phanLoaiTheoNgayTemp[date].bình_thường++;
          }
        }
      }
      setPhanLoaiData(phanLoai);
      setPhanLoaiTheoNgay(phanLoaiTheoNgayTemp);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhanLoaiGopY();
  }, []);

  // Lọc và sắp xếp danh sách liên hệ
  const sortedAndFilteredLienHe = useMemo(() => {
    let filtered = [...lienHeList]
      .sort((a, b) => b.maLienHe - a.maLienHe)
      .filter(
        (l) =>
          l.hoTen?.toLowerCase().includes(searchTerm) ||
          l.email?.toLowerCase().includes(searchTerm) ||
          l.sdt?.toLowerCase().includes(searchTerm)
      );
    if (statusFilter !== "all") {
      filtered = filtered.filter((l) => String(l.trangThai) === statusFilter);
    }
    return filtered;
  }, [lienHeList, searchTerm, statusFilter]);

  // Tính toán phân trang
  const totalPages = Math.ceil(sortedAndFilteredLienHe.length / ITEMS_PER_PAGE);
  const paginatedLienHe = sortedAndFilteredLienHe.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const isAllSelected = paginatedLienHe.every((lienHe) =>
    selectedLienHeIds.includes(lienHe.maLienHe)
  );

  // Hàm fetch danh sách liên hệ
  const fetchLienHe = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5261/api/LienHe");
      if (!response.ok) throw new Error("Lỗi khi tải danh sách liên hệ");
      const data = await response.json();
      setLienHeList(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý tìm kiếm
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
    setCurrentPage(1);
  };

  // Xử lý lọc theo trạng thái
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  // Thay đổi trạng thái liên hệ
  const handleStatusChange = async (contact: LienHe, newStatus: string) => {
    setStatusLoading((prev) => ({ ...prev, [contact.maLienHe]: true }));
    try {
      const response = await fetch(
        `http://localhost:5261/api/LienHe/${contact.maLienHe}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...contact, trangThai: Number(newStatus) }),
        }
      );
      if (!response.ok) throw new Error("Lỗi khi cập nhật trạng thái");

      await fetchLienHe();
      setNotification({
        message: `Cập nhật trạng thái thành công!`,
        type: "success",
        show: true,
      });
    } catch (err) {
      setError((err as Error).message);
      setNotification({
        message: "Lỗi khi cập nhật trạng thái: " + (err as Error).message,
        type: "error",
        show: true,
      });
    } finally {
      setStatusLoading((prev) => ({ ...prev, [contact.maLienHe]: false }));
    }
  };

  // Chọn một liên hệ
  const handleSelectLienHe = (id: number) => {
    setSelectedLienHeIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  // Chọn tất cả liên hệ trong trang hiện tại
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedLienHeIds((prev) =>
        prev.filter((id) => !paginatedLienHe.some((l) => l.maLienHe === id))
      );
    } else {
      const newSelectedIds = paginatedLienHe.map((l) => l.maLienHe);
      setSelectedLienHeIds((prev) => [...new Set([...prev, ...newSelectedIds])]);
    }
  };

  // Xác nhận xóa liên hệ
  const confirmDelete = async () => {
    if (selectedLienHeIds.length === 0) {
      setNotification({
        message: "Vui lòng chọn ít nhất một liên hệ để xóa.",
        type: "error",
        show: true,
      });
      setDeleteContact(null);
      return;
    }
    try {
      const response = await fetch("http://localhost:5261/api/LienHe/DeleteMultiple", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedLienHeIds),
      });
      if (!response.ok) throw new Error("Lỗi khi xóa liên hệ");
      fetchLienHe();
      setSelectedLienHeIds([]);
      setDeleteContact(null);
      setCurrentPage(1);
      setNotification({
        message: "Xóa liên hệ thành công!",
        type: "success",
        show: true,
      });
    } catch (err) {
      setError((err as Error).message);
      setNotification({
        message: "Lỗi khi xóa liên hệ",
        type: "error",
        show: true,
      });
    }
  };

  // Mở modal hỗ trợ
  const openSupportModal = (contact: LienHe) => {
    setSelectedContact(contact);
    setSupportModalOpen(true);
    setSupportMessage("");
  };

  // Đóng modal hỗ trợ
  const closeSupportModal = () => {
    setSupportModalOpen(false);
    setSelectedContact(null);
    setSupportMessage("");
    setError("");
    setAiError("");
  };

  // Gửi email hỗ trợ
  const handleSendSupport = async () => {
    if (!supportMessage.trim()) {
      setError("Nội dung hỗ trợ không được để trống.");
      return;
    }
    setIsSending(true);
    try {
      const payload = {
        toEmail: selectedContact?.email,
        message: supportMessage,
        hoTen: selectedContact?.hoTen,
        sdt: selectedContact?.sdt,
      };
      const response = await fetch("http://localhost:5261/api/LienHe/SupportEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Lỗi khi gửi email hỗ trợ");

      await handleStatusChange(selectedContact!, "1");

      setNotification({
        message: "Gửi hỗ trợ thành công!",
        type: "success",
        show: true,
      });
      closeSupportModal();
    } catch (err) {
      setError((err as Error).message);
      setNotification({
        message: "Lỗi khi gửi email hỗ trợ",
        type: "error",
        show: true,
      });
    } finally {
      setIsSending(false);
    }
  };

  // Lấy phản hồi từ AI
  const handleGetAIResponse = async () => {
    if (!selectedContact) return;
    setIsLoadingAI(true);
    setAiError("");
    try {
      const response = await fetch(
        `http://localhost:5261/api/Gemini/TraLoi?question=${encodeURIComponent(
          selectedContact.noiDung
        )}`
      );
      if (!response.ok) throw new Error("Lỗi khi gọi API Gemini AI");
      const data = await response.json();
      if (data.responseCode === 201) {
        setSupportMessage(data.result);
      } else {
        throw new Error(data.errorMessage || "Không thể nhận phản hồi từ AI");
      }
    } catch (err) {
      setAiError((err as Error).message);
      setNotification({
        message: "Lỗi khi nhận phản hồi từ AI",
        type: "error",
        show: true,
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Thay đổi trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Dữ liệu cho biểu đồ phân loại góp ý
  const phanLoaiChartData = {
    labels: ["Tích cực", "Tiêu cực", "Bình thường"],
    datasets: [
      {
        label: "Số lượng góp ý",
        data: [phanLoaiData.tích_cực, phanLoaiData.tiêu_cực, phanLoaiData.bình_thường],
        backgroundColor: ["#4CAF50", "#F44336", "#9E9E9E"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Phân loại góp ý" },
    },
  };

  // Dữ liệu cho biểu đồ tăng giảm góp ý theo thời gian
  const tangGiamChartData = {
    labels: Object.keys(phanLoaiTheoNgay).sort(),
    datasets: [
      {
        label: "Tích cực",
        data: Object.keys(phanLoaiTheoNgay)
          .sort()
          .map((date) => phanLoaiTheoNgay[date].tích_cực),
        borderColor: "#4CAF50",
        backgroundColor: "#4CAF50",
        fill: false,
      },
      {
        label: "Tiêu cực",
        data: Object.keys(phanLoaiTheoNgay)
          .sort()
          .map((date) => phanLoaiTheoNgay[date].tiêu_cực),
        borderColor: "#F44336",
        backgroundColor: "#F44336",
        fill: false,
      },
      {
        label: "Bình thường",
        data: Object.keys(phanLoaiTheoNgay)
          .sort()
          .map((date) => phanLoaiTheoNgay[date].bình_thường),
        borderColor: "#9E9E9E",
        backgroundColor: "#9E9E9E",
        fill: false,
      },
    ],
  };

  const tangGiamChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Tăng giảm góp ý theo thời gian" },
    },
    scales: {
      x: { title: { display: true, text: "Ngày" } },
      y: { title: { display: true, text: "Số lượng góp ý" }, beginAtZero: true },
    },
  };

  // Dữ liệu cho biểu đồ tổng số lượng liên hệ
  const totalLienHeChartData = {
    labels: ["Tổng số liên hệ"],
    datasets: [
      {
        label: "Số lượng",
        data: [lienHeList.length],
        backgroundColor: ["#2196F3"],
      },
    ],
  };

  const totalLienHeChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Tổng số lượng liên hệ" },
    },
  };

  // Dữ liệu cho biểu đồ tăng giảm tổng số lượng liên hệ theo thời gian
  const totalLienHeTangGiamData = useMemo(() => {
    const countsByDate: { [date: string]: number } = {};
    lienHeList.forEach((lienHe) => {
      const date = new Date(lienHe.ngayTao).toISOString().split("T")[0];
      countsByDate[date] = (countsByDate[date] || 0) + 1;
    });

    return {
      labels: Object.keys(countsByDate).sort(),
      datasets: [
        {
          label: "Tổng số liên hệ",
          data: Object.keys(countsByDate)
            .sort()
            .map((date) => countsByDate[date]),
          borderColor: "#2196F3",
          backgroundColor: "#2196F3",
          fill: false,
        },
      ],
    };
  }, [lienHeList]);

  const totalLienHeTangGiamOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Tăng giảm tổng số lượng liên hệ theo thời gian" },
    },
    scales: {
      x: { title: { display: true, text: "Ngày" } },
      y: { title: { display: true, text: "Số lượng liên hệ" }, beginAtZero: true },
    },
  };

  // JSX render giao diện
  return (
    <div className="space-y-6">
      {notification.show && (
        <Notification
          message={notification.message}
          onClose={() => setNotification({ ...notification, show: false })}
          duration={3000}
        />
      )}

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quản Lý Liên Hệ</h1>
      </div>

      {/* Tabs điều hướng */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("danhSachLienHe")}
          className={`pb-2 px-4 ${
            activeTab === "danhSachLienHe"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
        >
          Danh sách liên hệ
        </button>
        <button
          onClick={() => setActiveTab("danhSachThongKe")}
          className={`pb-2 px-4 ${
            activeTab === "danhSachThongKe"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
        >
          Danh sách thống kê
        </button>
      </div>

      {/* Tab danh sách liên hệ */}
      {activeTab === "danhSachLienHe" && (
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <Input
              type="search"
              placeholder="Tìm kiếm liên hệ..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-[820px]"
            />
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="w-[220px] rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="all">Tất cả</option>
              <option value="0">Chưa xử lý</option>
              <option value="1">Đã xử lý</option>
            </select>
            <Button
              variant="destructive"
              onClick={() => setDeleteContact({} as LienHe)}
              disabled={selectedLienHeIds.length === 0}
            >
              <Trash className="h-4 w-4" /> Xóa nhiều
            </Button>
          </div>

          {loading ? (
            <p>Đang tải...</p>
          ) : error && !supportModalOpen ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Danh sách liên hệ</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>STT</TableHead>
                        <TableHead>Họ Tên</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Số Điện Thoại</TableHead>
                        <TableHead>Nội Dung</TableHead>
                        <TableHead>Ngày Tạo</TableHead>
                        <TableHead>Trạng Thái</TableHead>
                        <TableHead>Hành Động</TableHead>
                        <TableHead>
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={handleSelectAll}
                          />
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedLienHe.map((lienHe, index) => (
                        <TableRow key={lienHe.maLienHe}>
                          <TableCell>
                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                          </TableCell>
                          <TableCell>{lienHe.hoTen}</TableCell>
                          <TableCell>{lienHe.email}</TableCell>
                          <TableCell>{lienHe.sdt}</TableCell>
                          <TableCell>{lienHe.noiDung}</TableCell>
                          <TableCell>
                            {new Date(lienHe.ngayTao).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 relative">
                              {statusLoading[lienHe.maLienHe] && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                              )}
                              <label className="relative inline-block w-[60px] h-[34px]">
                                <input
                                  type="checkbox"
                                  className="opacity-0 w-0 h-0"
                                  checked={lienHe.trangThai === 1}
                                  onChange={(e) =>
                                    handleStatusChange(
                                      lienHe,
                                      e.target.checked ? "1" : "0"
                                    )
                                  }
                                  disabled={statusLoading[lienHe.maLienHe]}
                                />
                                <span
                                  className={`absolute cursor-pointer inset-0 rounded-full transition-all duration-300 ease-in-out
                                    before:absolute before:h-[30px] before:w-[30px] before:left-[2px] before:bottom-[2px]
                                    before:bg-white before:rounded-full before:shadow-md before:transition-all before:duration-300 before:ease-in-out
                                    ${
                                      lienHe.trangThai === 1
                                        ? "bg-green-600 before:translate-x-[26px]"
                                        : "bg-gray-400"
                                    } hover:scale-110 shadow-sm hover:shadow-md`}
                                ></span>
                                <span className="sr-only">
                                  {lienHe.trangThai === 0 ? "Chưa xử lý" : "Đã xử lý"}
                                </span>
                              </label>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openSupportModal(lienHe)}>
                                  <Eye className="mr-2 h-4 w-4" /> Chi tiết
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setDeleteContact(lienHe)}>
                                  <Trash className="mr-2 h-4 w-4" /> Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedLienHeIds.includes(lienHe.maLienHe)}
                              onChange={() => handleSelectLienHe(lienHe.maLienHe)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      {currentPage > 1 ? (
                        <PaginationPrevious
                          onClick={() => handlePageChange(currentPage - 1)}
                        />
                      ) : (
                        <span className="pointer-events-none text-gray-400">
                          Previous
                        </span>
                      )}
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      {currentPage < totalPages ? (
                        <PaginationNext
                          onClick={() => handlePageChange(currentPage + 1)}
                        />
                      ) : (
                        <span className="pointer-events-none text-gray-400">
                          Trang sau
                        </span>
                      )}
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </>
      )}

      {/* Tab thống kê */}
      {activeTab === "danhSachThongKe" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê phân loại góp ý</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Đang tải dữ liệu thống kê...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <Bar data={phanLoaiChartData} options={chartOptions} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tăng giảm góp ý theo thời gian</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Đang tải dữ liệu thống kê...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <Line data={tangGiamChartData} options={tangGiamChartOptions} />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tổng số lượng liên hệ</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Đang tải dữ liệu thống kê...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <Bar data={totalLienHeChartData} options={totalLienHeChartOptions} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tăng giảm tổng số lượng liên hệ theo thời gian</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Đang tải dữ liệu thống kê...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <Line data={totalLienHeTangGiamData} options={totalLienHeTangGiamOptions} />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal chi tiết và gửi hỗ trợ */}
      {supportModalOpen && selectedContact && (
        <Dialog open={true} onOpenChange={closeSupportModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chi tiết liên hệ & Gửi hỗ trợ</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                <strong>Họ Tên:</strong> {selectedContact.hoTen}
              </p>
              <p>
                <strong>Email:</strong> {selectedContact.email}
              </p>
              <p>
                <strong>Số điện thoại:</strong> {selectedContact.sdt}
              </p>
              <p>
                <strong>Nội dung:</strong> {selectedContact.noiDung}
              </p>
              <p>
                <strong>Ngày tạo:</strong>{" "}
                {new Date(selectedContact.ngayTao).toLocaleString()}
              </p>
              <p>
                <strong>Trạng thái:</strong>{" "}
                {selectedContact.trangThai === 0 ? "Chưa xử lý" : "Đã xử lý"}
              </p>
              <textarea
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Nhập nội dung hỗ trợ..."
                className="w-full rounded-md border border-gray-300 p-2"
                rows={5}
              />
              {aiError && <p className="text-red-500">{aiError}</p>}
              {error && <p className="text-red-500">{error}</p>}
            </div>
            <DialogFooter className="flex justify-between items-center mt-4">
              <Button onClick={handleGetAIResponse} disabled={isLoadingAI}>
                {isLoadingAI ? "Đang tải..." : "Mô tả AI"}
              </Button>
              <div className="flex space-x-2">
                <Button onClick={handleSendSupport} disabled={isSending}>
                  {isSending ? "Đang gửi..." : "Gửi hỗ trợ"}
                </Button>
                <Button variant="ghost" onClick={closeSupportModal}>
                  Đóng
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal xác nhận xóa */}
      {deleteContact && (
        <Dialog open={true} onOpenChange={() => setDeleteContact(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedLienHeIds.length > 0 ? (
                <p>
                  Bạn có chắc chắn muốn xóa {selectedLienHeIds.length} liên hệ đã chọn không?
                </p>
              ) : (
                <p>
                  Bạn có chắc chắn muốn xóa liên hệ của <strong>{deleteContact.hoTen}</strong> không?
                </p>
              )}
            </div>
            <DialogFooter className="flex justify-end space-x-2 mt-4">
              <Button variant="ghost" onClick={() => setDeleteContact(null)}>
                Hủy
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                <Trash className="h-4 w-4" /> Xóa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default LienHeManagement;