import React, { useState, useEffect, useCallback, useRef } from "react";
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

// Register Chart.js components
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

// Interfaces
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
  gioiTinh?: number;
}

interface DiaChi {
  maDiaChi: string;
  maNguoiDung: string;
  hoTen?: string;
  sdt?: string;
  diaChi?: string;
  moTa?: string;
  tinh?: string;
  quanHuyen?: string;
  phuongXa?: string;
  trangThai: boolean;
  ngayTao: string;
}

interface GiaoDien {
  maGiaoDien?: number;
  tenGiaoDien?: string;
  logo?: string;
  slider1?: string;
  slider2?: string;
  slider3?: string;
  slider4?: string;
  avt?: string;
  ngayTao?: string;
  trangThai?: number;
}

const AccountManagement = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [activeTab, setActiveTab] = useState<"danhSachTaiKhoan" | "danhSachThongKe">("danhSachTaiKhoan");
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
  const [trangThai, setTrangThai] = useState(1);
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
  const [chiTietTrangThai, setChiTietTrangThai] = useState(1);
  const [chiTietHinhAnh, setChiTietHinhAnh] = useState<string | null>(null);
  const [chiTietMoTa, setChiTietMoTa] = useState("");
  const [chiTietGioiTinh, setChiTietGioiTinh] = useState(0);
  const [chiTietLockoutEndDate, setChiTietLockoutEndDate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmStatusModalOpen, setConfirmStatusModalOpen] = useState(false);
  const [accountToChangeStatus, setAccountToChangeStatus] = useState<Account | null>(null);
  const [newStatus, setNewStatus] = useState<number | null>(null);
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
  const [roleData, setRoleData] = useState({ admin: 0, nhanvien: 0, nguoidung: 0 });
  const [statusData, setStatusData] = useState({ active: 0, locked: 0 });
  const [monthlyData, setMonthlyData] = useState<number[]>(Array(12).fill(0));
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

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

  const fetchDefaultAvatar = async () => {
    try {
      const response = await fetch("http://localhost:5261/api/GiaoDien");
      if (!response.ok) throw new Error("Lỗi khi tải avatar mặc định");
      const data: GiaoDien[] = await response.json();
      const activeGiaoDien = data.find((item) => item.trangThai === 1);
      if (activeGiaoDien && activeGiaoDien.avt) {
        setDefaultAvatar(`data:image/png;base64,${activeGiaoDien.avt}`);
      } else {
        setDefaultAvatar(null);
      }
    } catch (err) {
      console.error("Lỗi khi lấy avatar mặc định:", (err as Error).message);
      setDefaultAvatar(null);
    }
  };

  const fetchDiaChiList = async (maNguoiDung: string) => {
    try {
      const response = await fetch(
        `http://localhost:5261/api/DanhSachDiaChi/maNguoiDung/${maNguoiDung}`
      );
      if (!response.ok) throw new Error("Lỗi khi tải danh sách địa chỉ");
      const data: DiaChi[] = await response.json();
      const sortedData = data.sort(
        (a, b) => new Date(b.ngayTao).getTime() - new Date(a.ngayTao).getTime()
      );
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
      if (account.trangThai === 1) activeUsers++;
      else if (account.trangThai === 0) lockedUsers++;

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
      if (account.trangThai === 1) statusCounts.active++;
      else if (account.trangThai === 0) statusCounts.locked++;
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

  const getRoleString = (vaiTro: number) => {
    if (vaiTro === 1) return "admin";
    if (vaiTro === 2) return "nhanvien";
    return "nguoidung";
  };

  const getGioiTinhString = (gioiTinh: number) => {
    if (gioiTinh === 1) return "Nam";
    if (gioiTinh === 2) return "Nữ";
    return "Khác";
  };

  const filteredAccounts = accounts.filter((account) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      account.hoTen?.toLowerCase().includes(searchLower) ||
      account.email?.toLowerCase().includes(searchLower) ||
      account.taiKhoan?.toLowerCase().includes(searchLower);
    const matchesRole =
      roleFilter === "all" || getRoleString(account.vaiTro) === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && account.trangThai === 1) ||
      (statusFilter === "locked" && account.trangThai === 0);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const sortedAccounts = filteredAccounts.sort(
    (a, b) => new Date(b.ngayTao).getTime() - new Date(a.ngayTao).getTime()
  );

  const totalPages = Math.ceil(sortedAccounts.length / pageSize);
  const paginatedAccounts = sortedAccounts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Validation functions
  const validateHoTen = (hoTen: string) => {
    if (hoTen.length <= 5) return "Họ tên phải dài hơn 5 ký tự";
    return "";
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Email không hợp lệ";
    return "";
  };

  const validateMatKhau = (matKhau: string) => {
    if (matKhau.length <= 5) return "Mật khẩu phải dài hơn 5 ký tự";
    return "";
  };

  const validateTaiKhoan = (taiKhoan: string) => {
    if (!taiKhoan) return "Tài khoản không được để trống";
    if (taiKhoan.length <= 5) return "Tài khoản phải dài hơn 5 ký tự";
    return "";
  };

  const validateSdt = (sdt: string) => {
    if (sdt && !/^\d{10}$/.test(sdt)) return "Số điện thoại phải có đúng 10 chữ số";
    return "";
  };

  const validateCccd = (cccd: string) => {
    if (cccd && !/^\d{12}$/.test(cccd)) return "CCCD phải có đúng 12 chữ số";
    return "";
  };

  const validateNgaySinh = (ngaySinh: string) => {
    if (ngaySinh) {
      const birthDate = new Date(ngaySinh);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 15) return "Người dùng phải ít nhất 15 tuổi";
    }
    return "";
  };

  const validateLockoutEndDate = (lockoutEndDate: string | null, trangThai: number) => {
    if (trangThai === 0 && lockoutEndDate) {
      const selectedDate = new Date(lockoutEndDate);
      const today = new Date();
      if (selectedDate < today) return "Ngày kết thúc khóa không được là ngày trong quá khứ";
    }
    return "";
  };

  // Input restriction handlers
  const handleSdtInput = (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    if (/^\d{0,10}$/.test(value)) setChiTietSdt(value);
  };

  const handleCccdInput = (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    if (/^\d{0,12}$/.test(value)) setChiTietCccd(value);
  };

  // Modal handlers
  const openAddModal = () => {
    setFormMode("add");
    setSelectedAccount(null);
    setHoTen("");
    setEmail("");
    setTaiKhoan("");
    setMatKhau("");
    setVaiTro(0);
    setTrangThai(1);
    setLockoutEndDate(null);
    setErrors({});
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
    setErrors({});
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
    setChiTietGioiTinh(account.gioiTinh || 0);
    setChiTietLockoutEndDate(
      account.trangThai === 1 ? null : account.lockoutEndDate ? new Date(account.lockoutEndDate).toISOString().split("T")[0] : null
    );
    setErrors({});
    setUpdateChiTietModalOpen(true);
  };

  const openConfirmStatusModal = (account: Account, newStatus: number) => {
    setAccountToChangeStatus(account);
    setNewStatus(newStatus);
    setConfirmStatusModalOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!accountToChangeStatus || newStatus === null) {
      setNotification({
        message: "Lỗi: Không thể xác định tài khoản hoặc trạng thái",
        type: "error",
        show: true,
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedAccount: Partial<Account> = {
        maNguoiDung: accountToChangeStatus.maNguoiDung,
        hoTen: accountToChangeStatus.hoTen,
        email: accountToChangeStatus.email,
        taiKhoan: accountToChangeStatus.taiKhoan,
        sdt: accountToChangeStatus.sdt,
        cccd: accountToChangeStatus.cccd,
        diaChi: accountToChangeStatus.diaChi,
        vaiTro: accountToChangeStatus.vaiTro,
        trangThai: newStatus,
        ...(newStatus === 0
          ? {
              cancelCount: 4,
              lockoutEndDate: new Date(
                Date.now() + 3 * 24 * 60 * 60 * 1000
              ).toISOString(),
            }
          : { cancelCount: 0, lockoutEndDate: null }),
      };

      const response = await fetch(
        `http://localhost:5261/api/NguoiDung/${accountToChangeStatus.maNguoiDung}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedAccount),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Lỗi khi cập nhật trạng thái");
      }

      fetchAccounts();
      setNotification({
        message: "Cập nhật trạng thái thành công",
        type: "success",
        show: true,
        duration: 3000,
      });
    } catch (err) {
      setNotification({
        message: (err as Error).message || "Lỗi khi cập nhật trạng thái",
        type: "error",
        show: true,
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
      setConfirmStatusModalOpen(false);
      setAccountToChangeStatus(null);
      setNewStatus(null);
    }
  };

  // Form submission with validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};
    newErrors.hoTen = validateHoTen(hoTen);
    newErrors.email = validateEmail(email);
    newErrors.taiKhoan = validateTaiKhoan(taiKhoan);
    if (formMode === "add") {
      newErrors.matKhau = validateMatKhau(matKhau);
    }
    if (trangThai === 0 && lockoutEndDate) {
      newErrors.lockoutEndDate = validateLockoutEndDate(lockoutEndDate, trangThai);
    }

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error !== "")) return;

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
            lockoutEndDate: trangThai === 1 ? null : lockoutEndDate,
            vaiTro,
            trangThai,
            ...(trangThai === 0 && !lockoutEndDate
              ? {
                  lockoutEndDate: new Date(
                    Date.now() + 3 * 24 * 60 * 60 * 1000
                  ).toISOString(),
                  cancelCount: 4,
                }
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

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      setChiTietHinhAnh(imageUrl);
    } else {
      setNotification({
        message: "Vui lòng chọn file hình ảnh",
        type: "error",
        show: true,
        duration: 3000,
      });
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setChiTietHinhAnh(imageUrl);
    }
  };

  const handleUpdateChiTietSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};
    newErrors.chiTietHoTen = validateHoTen(chiTietHoTen);
    newErrors.chiTietEmail = validateEmail(chiTietEmail);
    newErrors.chiTietSdt = validateSdt(chiTietSdt);
    newErrors.chiTietCccd = validateCccd(chiTietCccd);
    newErrors.chiTietNgaySinh = validateNgaySinh(chiTietNgaySinh);
    if (chiTietTrangThai === 0 && chiTietLockoutEndDate) {
      newErrors.chiTietLockoutEndDate = validateLockoutEndDate(chiTietLockoutEndDate, chiTietTrangThai);
    }

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error !== "")) return;

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
    formData.append("GioiTinh", chiTietGioiTinh.toString());

    // Xử lý LockoutEndDate dựa trên trạng thái
    if (chiTietTrangThai === 0 && chiTietLockoutEndDate) {
      formData.append("LockoutEndDate", chiTietLockoutEndDate);
    } else if (chiTietTrangThai === 1) {
      formData.append("LockoutEndDate", "null");
    }

    if (chiTietHinhAnh && chiTietHinhAnh.startsWith("blob:")) {
      const response = await fetch(chiTietHinhAnh);
      const blob = await response.blob();
      formData.append("HinhAnhFile", blob, "avatar.jpg");
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

      <div className="flex space-x-4 border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab("danhSachTaiKhoan")}
          className={`pb-2 px-4 ${
            activeTab === "danhSachTaiKhoan"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
        >
          Danh sách tài khoản
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

      {activeTab === "danhSachTaiKhoan" && (
        <>
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Tìm kiếm tài khoản..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <select
                className="border rounded p-2 mr-2"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">Tất cả vai trò</option>
                <option value="admin">Admin</option>
                <option value="nhanvien">Nhân viên</option>
                <option value="nguoidung">Người dùng</option>
              </select>
              <select
                className="border rounded p-2"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="locked">Khóa</option>
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
                        <label className="relative inline-block w-[60px] h-[34px]">
                          <input
                            type="checkbox"
                            className="opacity-0 w-0 h-0"
                            checked={account.trangThai === 1}
                            onChange={(e) => openConfirmStatusModal(account, e.target.checked ? 1 : 0)}
                            disabled={isSubmitting}
                          />
                          <span
                            className={`absolute cursor-pointer inset-0 rounded-full transition-all duration-300 ease-in-out
                              before:absolute before:h-[30px] before:w-[30px] before:left-[2px] before:bottom-[2px]
                              before:bg-white before:rounded-full before:shadow-md before:transition-all before:duration-300 before:ease-in-out
                              ${
                                account.trangThai === 1
                                  ? "bg-green-600 before:translate-x-[26px]"
                                  : "bg-gray-400"
                              } hover:scale-110 shadow-sm hover:shadow-md`}
                          ></span>
                          <span className="sr-only">
                            {account.trangThai === 1 ? "Hoạt động" : "Khóa"}
                          </span>
                        </label>
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
        </>
      )}

      {activeTab === "danhSachThongKe" && (
        <>
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
        </>
      )}

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
              {errors.hoTen && <p className="text-red-500 text-sm mt-1">{errors.hoTen}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Tài Khoản</label>
              <Input
                value={taiKhoan}
                onChange={(e) => setTaiKhoan(e.target.value)}
                disabled={formMode === "edit"}
                required
              />
              {errors.taiKhoan && <p className="text-red-500 text-sm mt-1">{errors.taiKhoan}</p>}
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
                {errors.matKhau && <p className="text-red-500 text-sm mt-1">{errors.matKhau}</p>}
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
                <option value={1}>Hoạt động</option>
                <option value={0}>Khóa</option>
              </select>
            </div>
            {trangThai === 0 && (
              <div>
                <label className="block text-sm font-medium">Ngày Kết Thúc Khóa</label>
                <Input
                  type="date"
                  value={lockoutEndDate || ""}
                  onChange={(e) => setLockoutEndDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
                {errors.lockoutEndDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.lockoutEndDate}</p>
                )}
              </div>
            )}
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

      <Dialog open={confirmStatusModalOpen} onOpenChange={setConfirmStatusModalOpen}>
        <DialogContent className="p-6">
          <DialogTitle>Xác nhận thay đổi trạng thái</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn {newStatus === 1 ? "mở khóa" : "khóa"} tài khoản{" "}
            <strong>{accountToChangeStatus?.taiKhoan}</strong> không?
          </DialogDescription>
          <div className="flex justify-end space-x-2 mt-4">
            <Button type="button" onClick={() => setConfirmStatusModalOpen(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="button" onClick={confirmStatusChange} disabled={isSubmitting}>
              {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                  className="mt-2 w-64 h-64 object-cover rounded-full border-2 border-purple-500"
                />
              </div>

                <div>
                  <label className="block text-sm font-medium">Mô Tả</label>
                  <textarea
                    value={viewAccount.moTa || "Chưa cập nhật"}
                    readOnly
                    className="w-full p-2 border rounded cursor-not-allowed"
                    rows={4}
                  />
                </div>
              </div>
              <div className="col-span-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium">Tài Khoản</label>
                  <Input value={viewAccount.taiKhoan || "Chưa cập nhật"} disabled className="text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Họ Tên</label>
                  <Input value={viewAccount.hoTen || "Chưa cập nhật"} disabled className="text-black" />
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
                    className="text-black"
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
                    className="text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Giới Tính</label>
                  <Input value={getGioiTinhString(viewAccount.gioiTinh || 0)} disabled className="text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Trạng Thái</label>
                  <Input value={viewAccount.trangThai === 1 ? "Hoạt động" : "Khóa"} disabled className="text-black" />
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
                    className="text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Số Điện Thoại</label>
                  <Input value={viewAccount.sdt || "Chưa cập nhật"} disabled className="text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <Input value={viewAccount.email || "Chưa cập nhật"} disabled className="text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium">CCCD</label>
                  <Input value={viewAccount.cccd || "Chưa cập nhật"} disabled className="text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Địa Chỉ</label>
                  <Input value={viewAccount.diaChi || "Chưa cập nhật"} disabled className="text-black" />
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
                    className="text-black"
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
              <div
                className={`mt-2 w-32 h-32 border-2 border-dashed rounded-lg relative flex items-center justify-center cursor-pointer ${
                  isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleImageClick}
              >
                {chiTietHinhAnh ? (
                  <>
                    <img
                      src={chiTietHinhAnh}
                      alt="Avatar"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      className="absolute top-3 right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        setChiTietHinhAnh(null);
                      }}
                    >
                      X
                    </button>
                  </>
                ) : (
                  <span className="text-gray-500 text-sm text-center">
                    Nhấp để chọn hình ảnh
                  </span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

              <div>
                <label className="block text-sm font-medium">Mô Tả</label>
                <textarea
                  value={chiTietMoTa}
                  onChange={(e) => setChiTietMoTa(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={3}
                  placeholder="Nhập mô tả..."
                />
              </div>
              {chiTietTrangThai === 0 && (
                <div>
                  <label className="block text-sm font-medium">Ngày Kết Thúc Khóa</label>
                  <Input
                    type="date"
                    value={chiTietLockoutEndDate || ""}
                    onChange={(e) => setChiTietLockoutEndDate(e.target.value)}
                    min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0]}
                  />
                  {errors.chiTietLockoutEndDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.chiTietLockoutEndDate}</p>
                  )}
                </div>
              )}
            </div>
            <div className="col-span-1 space-y-4">
              <div>
                <label className="block text-sm font-medium">Tài Khoản</label>
                <Input
                  value={chiTietTaiKhoan}
                  onChange={(e) => setChiTietTaiKhoan(e.target.value)}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Họ Tên</label>
                <Input
                  value={chiTietHoTen}
                  onChange={(e) => setChiTietHoTen(e.target.value)}
                  required
                />
                {errors.chiTietHoTen && (
                  <p className="text-red-500 text-sm mt-1">{errors.chiTietHoTen}</p>
                )}
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
                  onChange={(e) => {
                    const newStatus = parseInt(e.target.value);
                    setChiTietTrangThai(newStatus);
                    if (newStatus === 1) setChiTietLockoutEndDate(null);
                  }}
                  className="border rounded p-2 w-full"
                >
                  <option value={1}>Hoạt động</option>
                  <option value={0}>Khóa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Giới Tính</label>
                <select
                  value={chiTietGioiTinh}
                  onChange={(e) => setChiTietGioiTinh(parseInt(e.target.value))}
                  className="border rounded p-2 w-full"
                >
                  <option value={1}>Nam</option>
                  <option value={2}>Nữ</option>
                  <option value={0}>Khác</option>
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
                {errors.chiTietNgaySinh && (
                  <p className="text-red-500 text-sm mt-1">{errors.chiTietNgaySinh}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium">Số Điện Thoại</label>
                <Input
                  value={chiTietSdt}
                  onChange={(e) => setChiTietSdt(e.target.value)}
                  onInput={handleSdtInput}
                  maxLength={10}
                />
                {errors.chiTietSdt && <p className="text-red-500 text-sm mt-1">{errors.chiTietSdt}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <Input
                  value={chiTietEmail}
                  onChange={(e) => setChiTietEmail(e.target.value)}
                  required
                />
                {errors.chiTietEmail && (
                  <p className="text-red-500 text-sm mt-1">{errors.chiTietEmail}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium">CCCD</label>
                <Input
                  value={chiTietCccd}
                  onChange={(e) => setChiTietCccd(e.target.value)}
                  onInput={handleCccdInput}
                  maxLength={12}
                />
                {errors.chiTietCccd && <p className="text-red-500 text-sm mt-1">{errors.chiTietCccd}</p>}
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

      <Dialog open={diaChiModalOpen} onOpenChange={setDiaChiModalOpen}>
        <DialogContent className="p-6 max-w-5xl w-full">
          <DialogTitle>Danh Sách Địa Chỉ</DialogTitle>
          <DialogDescription>Xem toàn bộ danh sách địa chỉ của người dùng.</DialogDescription>
          {diaChiList.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>STT</TableHead>
                  <TableHead>Họ Tên</TableHead>
                  <TableHead>Số Điện Thoại</TableHead>
                  <TableHead>Mô Tả</TableHead>
                  <TableHead>Tỉnh</TableHead>
                  <TableHead>Huyện</TableHead>
                  <TableHead>Xã</TableHead>
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
                    <TableCell>{diaChi.tinh || "Chưa cập nhật"}</TableCell>
                    <TableCell>{diaChi.quanHuyen || "Chưa cập nhật"}</TableCell>
                    <TableCell>{diaChi.phuongXa || "Chưa cập nhật"}</TableCell>
                    <TableCell>{diaChi.diaChi || "Chưa cập nhật"}</TableCell>
                    <TableCell>{diaChi.trangThai ? "Hoạt động" : "Không hoạt động"}</TableCell>
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