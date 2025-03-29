import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Plus, MoreVertical, Edit, Trash, Eye } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Notification from "@/components/layout/Notification";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";

// Đăng ký các thành phần của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Định nghĩa giao diện dữ liệu
interface Account {
  maNguoiDung: string;
  hoTen: string;
  email: string;
  taiKhoan: string;
  matKhau?: string;
  sdt?: string;
  cccd?: string;
  diaChi?: string;
  vaiTro: number;
  trangThai: number;
  ngayTao: string;
  ngaySinh?: string;
  lockoutEndDate?: string | null;
  cancelCount?: number;
  hinhAnh?: string;
  moTa?: string;
}

interface DiaChi {
  maDiaChi: string;
  maNguoiDung: string;
  hoTen?: string;
  sdt?: string;
  diaChi?: string;
  moTa?: string;
  trangThai: boolean;
  ngayTao: string;
}

const AccountManagement = () => {
  // State quản lý dữ liệu và UI
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [defaultAvatar, setDefaultAvatar] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [hoTen, setHoTen] = useState("");
  const [email, setEmail] = useState("");
  const [sdt, setSdt] = useState("");
  const [cccd, setCCCD] = useState("");
  const [diaChi, setDiaChi] = useState("");
  const [cancelCount, setCancelCount] = useState(0);
  const [lockoutEndDate, setLockoutEndDate] = useState<string | null>(null);
  const [taiKhoan, setTaiKhoan] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [vaiTro, setVaiTro] = useState(0);
  const [trangThai, setTrangThai] = useState(0);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewAccount, setViewAccount] = useState<Account | null>(null);

  const [diaChiModalOpen, setDiaChiModalOpen] = useState(false);
  const [diaChiList, setDiaChiList] = useState<DiaChi[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [updateChiTietModalOpen, setUpdateChiTietModalOpen] = useState(false);
  const [chiTietHoTen, setChiTietHoTen] = useState("");
  const [chiTietNgaySinh, setChiTietNgaySinh] = useState("");
  const [chiTietSdt, setChiTietSdt] = useState("");
  const [chiTietCccd, setChiTietCccd] = useState("");
  const [chiTietEmail, setChiTietEmail] = useState("");
  const [chiTietTaiKhoan, setChiTietTaiKhoan] = useState("");
  const [chiTietDiaChi, setChiTietDiaChi] = useState("");
  const [chiTietVaiTro, setChiTietVaiTro] = useState(0);
  const [chiTietTrangThai, setChiTietTrangThai] = useState(0);
  const [chiTietHinhAnh, setChiTietHinhAnh] = useState<string | null>(null);
  const [chiTietMoTa, setChiTietMoTa] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [notification, setNotification] = useState({
    message: "",
    type: "info" as "info" | "success" | "error",
    show: false,
    duration: 3000,
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    lockedUsers: 0,
    usersToday: 0,
    usersThisMonth: 0,
    usersThisYear: 0,
  });

  const [roleData, setRoleData] = useState({
    admin: 0,
    nhanvien: 0,
    nguoidung: 0,
  });
  const [statusData, setStatusData] = useState({ active: 0, locked: 0 });
  const [monthlyData, setMonthlyData] = useState<number[]>(Array(12).fill(0));

  // Dữ liệu biểu đồ
  const roleChartData = {
    labels: ["Admin", "Nhân viên", "Người dùng"],
    datasets: [
      {
        label: "Số lượng",
        data: [roleData.admin, roleData.nhanvien, roleData.nguoidung],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  const statusChartData = {
    labels: ["Hoạt động", "Bị khóa"],
    datasets: [
      {
        data: [statusData.active, statusData.locked],
        backgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  const monthlyChartData = {
    labels: [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ],
    datasets: [
      {
        label: "Người dùng mới",
        data: monthlyData,
        fill: false,
        borderColor: "#42A5F5",
        tension: 0.1,
      },
    ],
  };

  // Hàm đóng thông báo
  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  // Lấy danh sách tài khoản từ API
  const fetchAccounts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:5261/api/NguoiDung");
      if (!response.ok) throw new Error("Lỗi khi tải danh sách tài khoản");
      const data: Account[] = await response.json();
      setAccounts(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Lấy avatar mặc định từ API
  const fetchDefaultAvatar = async () => {
    try {
      const response = await fetch("http://localhost:5261/api/GiaoDien");
      if (!response.ok) throw new Error("Lỗi khi tải avatar mặc định");
      const data = await response.json();
      if (data.length > 0 && data[0].avt) {
        setDefaultAvatar(`data:image/png;base64,${data[0].avt}`);
      }
    } catch (err) {
      console.error("Lỗi khi lấy avatar mặc định:", (err as Error).message);
      setDefaultAvatar(null);
    }
  };

  // Lấy danh sách địa chỉ từ API
  const fetchDiaChiList = async (maNguoiDung: string) => {
    try {
      const response = await fetch(
        `http://localhost:5261/api/DanhSachDiaChi/maNguoiDung/${maNguoiDung}`
      );
      if (!response.ok) throw new Error("Lỗi khi tải danh sách địa chỉ");
      const data: DiaChi[] = await response.json();
      const sortedData = data
        .sort((a, b) => new Date(b.ngayTao).getTime() - new Date(a.ngayTao).getTime())
        .slice(0, 5);
      setDiaChiList(sortedData);
    } catch (err) {
      setError((err as Error).message);
      setDiaChiList([]);
    }
  };

  const openDiaChiModal = async (account: Account) => {
    setSelectedUserId(account.maNguoiDung);
    setDiaChiModalOpen(true);
    await fetchDiaChiList(account.maNguoiDung);
  };

  // Tính toán thống kê
  const calculateStats = useCallback(() => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    let activeUsers = 0;
    let lockedUsers = 0;
    let usersToday = 0;
    let usersThisMonth = 0;
    let usersThisYear = 0;

    accounts.forEach((account) => {
      if (account.trangThai === 0) activeUsers++;
      else if (account.trangThai === 1) lockedUsers++;

      const creationDate = new Date(account.ngayTao);
      if (creationDate >= startOfDay) usersToday++;
      if (creationDate >= startOfMonth) usersThisMonth++;
      if (creationDate >= startOfYear) usersThisYear++;
    });

    setStats({
      totalUsers: accounts.length,
      activeUsers,
      lockedUsers,
      usersToday,
      usersThisMonth,
      usersThisYear,
    });
  }, [accounts]);

  const calculateRoleData = useCallback(() => {
    const roleCounts = { admin: 0, nhanvien: 0, nguoidung: 0 };
    accounts.forEach((account) => {
      if (account.vaiTro === 1) roleCounts.admin++;
      else if (account.vaiTro === 2) roleCounts.nhanvien++;
      else roleCounts.nguoidung++;
    });
    setRoleData(roleCounts);
  }, [accounts]);

  const calculateStatusData = useCallback(() => {
    const statusCounts = { active: 0, locked: 0 };
    accounts.forEach((account) => {
      if (account.trangThai === 0) statusCounts.active++;
      else if (account.trangThai === 1) statusCounts.locked++;
    });
    setStatusData(statusCounts);
  }, [accounts]);

  const calculateMonthlyData = useCallback(() => {
    const monthlyCounts = Array(12).fill(0);
    const currentYear = new Date().getFullYear();
    accounts.forEach((account) => {
      const creationDate = new Date(account.ngayTao);
      if (creationDate.getFullYear() === currentYear) {
        const month = creationDate.getMonth();
        monthlyCounts[month]++;
      }
    });
    setMonthlyData(monthlyCounts);
  }, [accounts]);

  // Effect để tải dữ liệu ban đầu
  useEffect(() => {
    fetchAccounts();
    fetchDefaultAvatar();
  }, []);

  useEffect(() => {
    calculateStats();
    calculateRoleData();
    calculateStatusData();
    calculateMonthlyData();
  }, [accounts, calculateStats, calculateRoleData, calculateStatusData, calculateMonthlyData]);

  // Hàm hỗ trợ
  const getRoleString = (vaiTro: number) => {
    if (vaiTro === 1) return "admin";
    if (vaiTro === 2) return "nhanvien";
    return "nguoidung";
  };

  const filteredAccounts = accounts.filter((account) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      account.hoTen?.toLowerCase().includes(searchLower) ||
      account.email?.toLowerCase().includes(searchLower) ||
      account.taiKhoan?.toLowerCase().includes(searchLower);
    const matchesRole =
      roleFilter === "all" || getRoleString(account.vaiTro) === roleFilter;
    return matchesSearch && matchesRole;
  });

  const sortedAccounts = filteredAccounts.sort(
    (a, b) => new Date(b.ngayTao).getTime() - new Date(a.ngayTao).getTime()
  );

  const totalPages = Math.ceil(sortedAccounts.length / pageSize);
  const paginatedAccounts = sortedAccounts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Các hàm mở modal
  const openAddModal = () => {
    setFormMode("add");
    setSelectedAccount(null);
    setHoTen("");
    setEmail("");
    setTaiKhoan("");
    setMatKhau("");
    setVaiTro(0);
    setTrangThai(0);
    setModalOpen(true);
  };

  const openEditModal = (account: Account) => {
    setFormMode("edit");
    setSelectedAccount(account);
    setHoTen(account.hoTen);
    setEmail(account.email);
    setSdt(account.sdt || "");
    setCCCD(account.cccd || "");
    setDiaChi(account.diaChi || "");
    setCancelCount(account.cancelCount || 0);
    setLockoutEndDate(account.lockoutEndDate || null);
    setTaiKhoan(account.taiKhoan);
    setMatKhau("");
    setVaiTro(account.vaiTro);
    setTrangThai(account.trangThai);
    setModalOpen(true);
  };

  const openViewModal = (account: Account) => {
    setViewAccount(account);
    setViewModalOpen(true);
  };

  const openUpdateChiTietModal = (account: Account) => {
    if (!account || !account.maNguoiDung) {
      setNotification({
        message: "Lỗi: Không tìm thấy mã người dùng",
        type: "error",
        show: true,
        duration: 3000,
      });
      return;
    }
    setSelectedAccount(account);
    setChiTietHoTen(account.hoTen || "");
    setChiTietNgaySinh(
      account.ngaySinh ? new Date(account.ngaySinh).toISOString().split("T")[0] : ""
    );
    setChiTietSdt(account.sdt || "");
    setChiTietCccd(account.cccd || "");
    setChiTietEmail(account.email || "");
    setChiTietTaiKhoan(account.taiKhoan || "");
    setChiTietDiaChi(account.diaChi || "");
    setChiTietVaiTro(account.vaiTro || 0);
    setChiTietTrangThai(account.trangThai || 0);
    setChiTietHinhAnh(
      account.hinhAnh
        ? account.hinhAnh.startsWith("data:image")
          ? account.hinhAnh
          : `data:image/png;base64,${account.hinhAnh}`
        : null
    );
    setChiTietMoTa(account.moTa || "");
    setUpdateChiTietModalOpen(true);
  };

  // Xử lý thêm/sửa tài khoản
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hoTen || !email || (formMode === "add" && (!taiKhoan || !matKhau))) {
      setNotification({
        message: "Vui lòng điền đầy đủ các trường bắt buộc",
        type: "error",
        show: true,
        duration: 3000,
      });
      return;
    }

    if (!email.includes("@")) {
      setNotification({
        message: "Email không hợp lệ",
        type: "error",
        show: true,
        duration: 3000,
      });
      return;
    }

    const payload: Partial<Account> =
      formMode === "add"
        ? {
            hoTen,
            email,
            taiKhoan,
            matKhau,
            vaiTro,
            trangThai,
            ngayTao: new Date().toISOString(),
          }
        : selectedAccount
        ? {
            maNguoiDung: selectedAccount.maNguoiDung,
            hoTen,
            email,
            taiKhoan,
            sdt,
            cccd,
            diaChi,
            cancelCount: cancelCount || 0,
            lockoutEndDate: lockoutEndDate || null,
            vaiTro,
            trangThai,
            ...(selectedAccount.trangThai === 0 && trangThai === 1
              ? {
                  cancelCount: 4,
                  lockoutEndDate: new Date(
                    Date.now() + 3 * 24 * 60 * 60 * 1000
                  ).toISOString(),
                }
              : selectedAccount.trangThai === 1 && trangThai === 0
              ? { cancelCount: 0, lockoutEndDate: null }
              : {}),
          }
        : {};

    if (!payload.maNguoiDung && formMode === "edit") {
      setNotification({
        message: "Lỗi: Không thể xác định tài khoản được chọn",
        type: "error",
        show: true,
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const url =
        formMode === "add"
          ? "http://localhost:5261/api/NguoiDung"
          : `http://localhost:5261/api/NguoiDung/${selectedAccount?.maNguoiDung}`;
      const method = formMode === "add" ? "POST" : "PUT";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (err) {
        throw new Error("Lỗi khi phân tích dữ liệu từ server");
      }

      if (!response.ok) {
        throw new Error(
          responseData.message ||
            `Lỗi khi ${formMode === "add" ? "thêm" : "cập nhật"} tài khoản`
        );
      }

      setModalOpen(false);
      fetchAccounts();
      setNotification({
        message:
          formMode === "add"
            ? "Thêm tài khoản thành công"
            : "Cập nhật tài khoản thành công",
        type: "success",
        show: true,
        duration: 3000,
      });
    } catch (err) {
      setNotification({
        message: (err as Error).message || "Lỗi khi xử lý tài khoản",
        type: "error",
        show: true,
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý cập nhật chi tiết người dùng
  const handleUpdateChiTietSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!chiTietHoTen || !chiTietEmail) {
      setNotification({
        message: "Vui lòng điền đầy đủ họ tên và email",
        type: "error",
        show: true,
        duration: 3000,
      });
      return;
    }

    if (!chiTietEmail.includes("@")) {
      setNotification({
        message: "Email không hợp lệ",
        type: "error",
        show: true,
        duration: 3000,
      });
      return;
    }

    if (chiTietSdt && !/^\d{10,11}$/.test(chiTietSdt)) {
      setNotification({
        message: "Số điện thoại không hợp lệ (phải có 10-11 chữ số)",
        type: "error",
        show: true,
        duration: 3000,
      });
      return;
    }

    if (chiTietCccd && !/^\d{12}$/.test(chiTietCccd)) {
      setNotification({
        message: "CCCD không hợp lệ (phải có 12 chữ số)",
        type: "error",
        show: true,
        duration: 3000,
      });
      return;
    }

    if (!selectedAccount || !selectedAccount.maNguoiDung) {
      setNotification({
        message: "Lỗi: Không tìm thấy mã người dùng để cập nhật",
        type: "error",
        show: true,
        duration: 3000,
      });
      return;
    }

    const formData = new FormData();
    formData.append("MaNguoiDung", selectedAccount.maNguoiDung);
    formData.append("HoTen", chiTietHoTen);
    formData.append("NgaySinh", chiTietNgaySinh || "");
    formData.append("Sdt", chiTietSdt || "");
    formData.append("Cccd", chiTietCccd || "");
    formData.append("Email", chiTietEmail);
    formData.append("TaiKhoan", chiTietTaiKhoan);
    formData.append("DiaChi", chiTietDiaChi || "");
    formData.append("VaiTro", chiTietVaiTro.toString());
    formData.append("TrangThai", chiTietTrangThai.toString());
    formData.append("MoTa", chiTietMoTa || "");

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (file) {
      formData.append("HinhAnhFile", file);
    } else if (chiTietHinhAnh && !chiTietHinhAnh.startsWith("http")) {
      const base64Data = chiTietHinhAnh.startsWith("data:image")
        ? chiTietHinhAnh.split(",")[1]
        : chiTietHinhAnh;
      formData.append("HinhAnh", base64Data || "");
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `http://localhost:5261/api/NguoiDung/chitiet/${selectedAccount.maNguoiDung}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || "Lỗi khi cập nhật chi tiết người dùng");
      }

      setNotification({
        message: "Cập nhật chi tiết người dùng thành công",
        type: "success",
        show: true,
        duration: 3000,
      });
      setUpdateChiTietModalOpen(false);
      fetchAccounts();
    } catch (err) {
      setNotification({
        message: (err as Error).message || "Lỗi khi cập nhật chi tiết người dùng",
        type: "error",
        show: true,
        duration: 3000,
      });
      console.error("Lỗi chi tiết:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý xóa tài khoản
  const openDeleteModal = (account: Account) => {
    setAccountToDelete(account);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!accountToDelete) {
      setNotification({
        message: "Lỗi: Không tìm thấy tài khoản để xóa",
        type: "error",
        show: true,
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `http://localhost:5261/api/NguoiDung/${accountToDelete.maNguoiDung}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Lỗi khi xóa tài khoản");
      }

      setDeleteModalOpen(false);
      setAccountToDelete(null);
      fetchAccounts();
      setNotification({
        message: "Xóa tài khoản thành công",
        type: "success",
        show: true,
        duration: 3000,
      });
    } catch (err) {
      setNotification({
        message: (err as Error).message || "Lỗi khi xóa tài khoản",
        type: "error",
        show: true,
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Định dạng ngày giờ
  const formatDateTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })}, ${date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  // Giao diện người dùng
  return (
    <div className="p-4">
      {notification.show && (
        <Notification
          message={notification.message}
          onClose={closeNotification}
          duration={notification.duration}
        />
      )}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản Lý Tài Khoản</h1>
        <Button onClick={openAddModal} disabled={isSubmitting}>
          <Plus className="mr-2 h-4 w-4" /> Thêm Tài Khoản
        </Button>
      </div>
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <select
            className="border rounded p-2"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="admin">Admin</option>
            <option value="nhanvien">Nhân viên</option>
            <option value="nguoidung">Người dùng</option>
          </select>
        </div>
      </div>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Hình Ảnh</TableHead>
              <TableHead>Họ Tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Tài Khoản</TableHead>
              <TableHead>Vai Trò</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : paginatedAccounts.length > 0 ? (
              paginatedAccounts.map((account, index) => (
                <TableRow key={account.maNguoiDung} className="hover:bg-muted/50">
                  <TableCell>{(currentPage - 1) * pageSize + index + 1}</TableCell>
                  <TableCell>
                    <img
                      src={
                        account.hinhAnh
                          ? account.hinhAnh.startsWith("data:image")
                            ? account.hinhAnh
                            : `data:image/png;base64,${account.hinhAnh}`
                          : defaultAvatar || "https://www.pinterest.com/pin/872009546602893250"
                      }
                      alt="Avatar"
                      className="w-16 h-16 rounded-full mx-auto mt-4 object-cover"
                    />
                  </TableCell>
                  <TableCell>{account.hoTen}</TableCell>
                  <TableCell>{account.email}</TableCell>
                  <TableCell>{account.taiKhoan || ""}</TableCell>
                  <TableCell>
                    {account.vaiTro === 1 ? "Admin" : account.vaiTro === 2 ? "Nhân viên" : "Người dùng"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        account.trangThai === 0
                          ? "bg-green-100 text-green-800 px-2 py-1 rounded"
                          : "bg-red-100 text-red-800 px-2 py-1 rounded"
                      }
                    >
                      {account.trangThai === 0 ? "Hoạt động" : "Khóa"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDiaChiModal(account)}>
                          <MapPin className="mr-2 h-4 w-4" /> Địa chỉ
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openViewModal(account)}>
                          <Eye className="mr-2 h-4 w-4" /> Chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openUpdateChiTietModal(account)}>
                          <Edit className="mr-2 h-4 w-4" /> UpdateUser
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditModal(account)}>
                          <Edit className="mr-2 h-4 w-4" /> Sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteModal(account)}>
                          <Trash className="mr-2 h-4 w-4" /> Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                  Không tìm thấy tài khoản nào phù hợp với tìm kiếm của bạn.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Trang Trước
          </Button>
          <span>
            Trang {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Trang Sau
          </Button>
        </div>
      )}

      {/* Thống kê người dùng */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Thống kê người dùng</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold">Người dùng mới hôm nay</h3>
            <p className="text-2xl font-bold">{stats.usersToday}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold">Tổng số người dùng</h3>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold">Người dùng hoạt động</h3>
            <p className="text-2xl font-bold">{stats.activeUsers}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold">Người dùng bị khóa</h3>
            <p className="text-2xl font-bold">{stats.lockedUsers}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold">Người dùng mới tháng này</h3>
            <p className="text-2xl font-bold">{stats.usersThisMonth}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold">Người dùng mới năm nay</h3>
            <p className="text-2xl font-bold">{stats.usersThisYear}</p>
          </div>
        </div>
      </div>

      {/* Biểu đồ thống kê */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Biểu đồ thống kê</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Số lượng người dùng theo vai trò</h3>
            <Bar data={roleChartData} options={{ responsive: true }} />
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Tỷ lệ người dùng hoạt động và bị khóa</h3>
            <Pie data={statusChartData} options={{ responsive: true }} />
          </div>
          <div className="col-span-2 p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">
              Người dùng mới theo tháng trong năm {new Date().getFullYear()}
            </h3>
            <Line data={monthlyChartData} options={{ responsive: true }} />
          </div>
        </div>
      </div>

      {/* Modal thêm/sửa tài khoản */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="p-6">
          <DialogTitle>{formMode === "add" ? "Thêm Tài Khoản" : "Sửa Tài Khoản"}</DialogTitle>
          <DialogDescription>
            {formMode === "add"
              ? "Điền thông tin để thêm tài khoản mới."
              : "Chỉnh sửa thông tin tài khoản hiện tại."}
          </DialogDescription>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium">Họ Tên</label>
              <Input value={hoTen} onChange={(e) => setHoTen(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium">Tài Khoản</label>
              <Input
                value={taiKhoan}
                onChange={(e) => setTaiKhoan(e.target.value)}
                disabled={formMode === "edit"}
                required={formMode === "add"}
              />
            </div>
            {formMode === "add" && (
              <div>
                <label className="block text-sm font-medium">Mật Khẩu</label>
                <Input
                  type="password"
                  value={matKhau}
                  onChange={(e) => setMatKhau(e.target.value)}
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium">Vai Trò</label>
              {formMode === "add" ? (
                <select
                  value={vaiTro}
                  onChange={(e) => setVaiTro(parseInt(e.target.value))}
                  className="border rounded p-2 w-full"
                >
                  <option value={1}>Admin</option>
                  <option value={2}>Nhân viên</option>
                  <option value={0}>Người dùng</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={vaiTro === 1 ? "Admin" : vaiTro === 2 ? "Nhân viên" : "Người dùng"}
                  readOnly
                  className="border rounded p-2 w-full bg-gray-100 cursor-not-allowed"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Trạng Thái</label>
              <select
                value={trangThai}
                onChange={(e) => setTrangThai(parseInt(e.target.value))}
                className="border rounded p-2 w-full"
              >
                <option value={0}>Hoạt động</option>
                <option value={1}>Khóa</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" onClick={() => setModalOpen(false)} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang xử lý..." : formMode === "add" ? "Thêm" : "Cập nhật"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal xóa tài khoản */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="p-6">
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa tài khoản này không?
          </DialogDescription>
          <p className="mt-2">
            Bạn có chắc chắn muốn xóa tài khoản <strong>{accountToDelete?.taiKhoan}</strong> không?
          </p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button type="button" onClick={() => setDeleteModalOpen(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xóa..." : "Xóa"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal xem chi tiết */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="p-6 max-w-4xl w-full">
          <DialogTitle>Chi Tiết Người Dùng</DialogTitle>
          <DialogDescription>Xem thông tin chi tiết của người dùng.</DialogDescription>
          {viewAccount && (
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-1 space-y-4">
              <div>
                <label className="block text-sm font-medium">Hình Ảnh</label>
                  <img
                    src={
                      viewAccount.hinhAnh
                        ? viewAccount.hinhAnh.startsWith("data:image")
                          ? viewAccount.hinhAnh
                          : `data:image/png;base64,${viewAccount.hinhAnh}`
                        : defaultAvatar || "https://www.pinterest.com/pin/872009546602893250"
                    }
                    alt="Avatar"
                    className="mt-2 w-32 h-32 object-cover rounded-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Mô Tả</label>
                  <textarea
                    value={viewAccount.moTa || "Chưa cập nhật"}
                    readOnly
                    className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
                    rows={9}
                  />
                </div>
              </div>
              <div className="col-span-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium">Mã Người Dùng</label>
                  <Input value={viewAccount.maNguoiDung || "Chưa cập nhật"} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium">Họ Tên</label>
                  <Input value={viewAccount.hoTen || "Chưa cập nhật"} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium">Tài Khoản</label>
                  <Input value={viewAccount.taiKhoan || "Chưa cập nhật"} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium">Vai Trò</label>
                  <Input
                    value={
                      viewAccount.vaiTro === 1
                        ? "Admin"
                        : viewAccount.vaiTro === 2
                        ? "Nhân viên"
                        : "Người dùng"
                    }
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Ngày Tạo</label>
                  <Input
                    value={
                      viewAccount.ngayTao
                        ? formatDateTime(viewAccount.ngayTao)
                        : "Chưa cập nhật"
                    }
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Trạng Thái</label>
                  <Input value={viewAccount.trangThai === 0 ? "Hoạt động" : "Khóa"} disabled />
                </div>
              </div>
              <div className="col-span-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium">Ngày Sinh</label>
                  <Input
                    value={
                      viewAccount.ngaySinh
                        ? new Date(viewAccount.ngaySinh).toLocaleDateString("vi-VN")
                        : "Chưa cập nhật"
                    }
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Số Điện Thoại</label>
                  <Input value={viewAccount.sdt || "Chưa cập nhật"} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <Input value={viewAccount.email || "Chưa cập nhật"} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium">CCCD</label>
                  <Input value={viewAccount.cccd || "Chưa cập nhật"} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium">Địa Chỉ</label>
                  <Input value={viewAccount.diaChi || "Chưa cập nhật"} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium">Ngày Kết Thúc Khóa</label>
                  <Input
                    value={
                      viewAccount.lockoutEndDate
                        ? formatDateTime(viewAccount.lockoutEndDate)
                        : "Chưa cập nhật"
                    }
                    disabled
                  />
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end mt-6">
            <Button type="button" onClick={() => setViewModalOpen(false)}>
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal cập nhật chi tiết */}
      <Dialog open={updateChiTietModalOpen} onOpenChange={setUpdateChiTietModalOpen}>
        <DialogContent className="p-6 max-w-4xl w-full">
          <DialogTitle>Cập Nhật Chi Tiết Người Dùng</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin chi tiết của người dùng, bao gồm hình ảnh, mô tả và các thông tin cá nhân.
          </DialogDescription>
          <form onSubmit={handleUpdateChiTietSubmit} className="grid grid-cols-3 gap-6">
            <div className="col-span-1 space-y-4">
              <div>
                <label className="block text-sm font-medium">Hình Ảnh</label>
                <img
                  src={
                    chiTietHinhAnh
                      ? chiTietHinhAnh
                      : defaultAvatar || "https://www.pinterest.com/pin/872009546602893250"
                  }
                  alt="Avatar"
                  className="mt-2 w-32 h-32 object-cover rounded-full"
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const imageUrl = URL.createObjectURL(file);
                      setChiTietHinhAnh(imageUrl);
                    }
                  }}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Mô Tả</label>
                <textarea
                  value={chiTietMoTa}
                  onChange={(e) => setChiTietMoTa(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={5}
                  placeholder="Nhập mô tả..."
                />
              </div>
            </div>
            <div className="col-span-1 space-y-4">
              <div>
                <label className="block text-sm font-medium">Mã Người Dùng</label>
                <Input value={selectedAccount?.maNguoiDung} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium">Họ Tên</label>
                <Input
                  value={chiTietHoTen}
                  onChange={(e) => setChiTietHoTen(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Tài Khoản</label>
                <Input
                  value={chiTietTaiKhoan}
                  onChange={(e) => setChiTietTaiKhoan(e.target.value)}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Vai Trò</label>
                <input
                  type="text"
                  value={
                    chiTietVaiTro === 1 ? "Admin" : chiTietVaiTro === 2 ? "Nhân viên" : "Người dùng"
                  }
                  readOnly
                  className="border rounded p-2 w-full bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Trạng Thái</label>
                <select
                  value={chiTietTrangThai}
                  onChange={(e) => setChiTietTrangThai(parseInt(e.target.value))}
                  className="border rounded p-2 w-full"
                >
                  <option value={0}>Hoạt động</option>
                  <option value={1}>Khóa</option>
                </select>
              </div>
            </div>
            <div className="col-span-1 space-y-4">
              <div>
                <label className="block text-sm font-medium">Ngày Sinh</label>
                <Input
                  type="date"
                  value={chiTietNgaySinh}
                  onChange={(e) => setChiTietNgaySinh(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Số Điện Thoại</label>
                <Input value={chiTietSdt} onChange={(e) => setChiTietSdt(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <Input
                  value={chiTietEmail}
                  onChange={(e) => setChiTietEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">CCCD</label>
                <Input value={chiTietCccd} onChange={(e) => setChiTietCccd(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium">Địa Chỉ</label>
                <Input value={chiTietDiaChi} onChange={(e) => setChiTietDiaChi(e.target.value)} />
              </div>
            </div>
            <div className="col-span-3 flex justify-end space-x-2 mt-6">
              <Button
                type="button"
                onClick={() => setUpdateChiTietModalOpen(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal danh sách địa chỉ */}
      <Dialog open={diaChiModalOpen} onOpenChange={setDiaChiModalOpen}>
        <DialogContent className="p-6 max-w-3xl w-full">
          <DialogTitle>Danh Sách Địa Chỉ Mới Nhất</DialogTitle>
          <DialogDescription>Xem danh sách địa chỉ mới nhất của người dùng.</DialogDescription>
          {diaChiList.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>STT</TableHead>
                  <TableHead>Họ Tên</TableHead>
                  <TableHead>Số Điện Thoại</TableHead>
                  <TableHead>Mô Tả</TableHead>
                  <TableHead>Địa Chỉ</TableHead>
                  <TableHead>Trạng Thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diaChiList.map((diaChi, index) => (
                  <TableRow key={diaChi.maDiaChi}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{diaChi.hoTen || "Chưa cập nhật"}</TableCell>
                    <TableCell>{diaChi.sdt || "Chưa cập nhật"}</TableCell>
                    <TableCell>{diaChi.moTa || "Chưa cập nhật"}</TableCell>
                    <TableCell>{diaChi.diaChi || "Chưa cập nhật"}</TableCell>
                    <TableCell>{diaChi.trangThai ? "Mặc định" : "Không mặc định"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>Không có địa chỉ nào cho người dùng này.</p>
          )}
          <div className="flex justify-end mt-6">
            <Button type="button" onClick={() => setDiaChiModalOpen(false)}>
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountManagement;