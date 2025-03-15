import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Plus, MoreVertical, Edit, Trash, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Notification from "@/components/layout/Notification";

const AccountManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [hoTen, setHoTen] = useState("");
  const [email, setEmail] = useState("");
  const [sdt, setSdt] = useState("");
  const [cccd, setCCCD] = useState("");
  const [diaChi, setDiaChi] = useState("");
  const [cancelCount, setCancelCount] = useState(0);
  const [lockoutEndDate, setLockoutEndDate] = useState(null);
  const [taiKhoan, setTaiKhoan] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [vaiTro, setVaiTro] = useState(0);
  const [trangThai, setTrangThai] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewAccount, setViewAccount] = useState(null);
  const [diaChiModalOpen, setDiaChiModalOpen] = useState(false);
  const [diaChiList, setDiaChiList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [notification, setNotification] = useState({
    message: "",
    type: "info",
    show: false,
    duration: 3000,
  });

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  const fetchAccounts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:5261/api/NguoiDung");
      if (!response.ok) throw new Error("Lỗi khi tải danh sách tài khoản");
      const data = await response.json();
      setAccounts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiaChiList = async (maNguoiDung) => {
    try {
      const response = await fetch(`http://localhost:5261/api/DanhSachDiaChi/maNguoiDung/${maNguoiDung}`);
      if (!response.ok) throw new Error("Lỗi khi tải danh sách địa chỉ");
      const data = await response.json();
      const sortedData = data.sort((a, b) => new Date(b.ngayTao).getTime() - new Date(a.ngayTao).getTime()).slice(0, 5);
      setDiaChiList(sortedData);
    } catch (err) {
      setError(err.message);
    }
  };

  const openDiaChiModal = async (account) => {
    setSelectedUserId(account.maNguoiDung);
    setDiaChiModalOpen(true);
    await fetchDiaChiList(account.maNguoiDung);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const getRoleString = (vaiTro) => {
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

  const openEditModal = (account) => {
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

  const openViewModal = (account) => {
    setViewAccount(account);
    setViewModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let payload;
    if (formMode === "add") {
      payload = {
        hoTen,
        email,
        taiKhoan,
        matKhau,
        vaiTro,
        trangThai,
        ngayTao: new Date().toISOString(),
      };
    } else if (formMode === "edit" && selectedAccount) {
      payload = {
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
      };
      if (selectedAccount.trangThai === 0 && trangThai === 1) {
        payload.cancelCount = 4;
        payload.lockoutEndDate = new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000
        ).toISOString();
      } else if (selectedAccount.trangThai === 1 && trangThai === 0) {
        payload.cancelCount = 0;
        payload.lockoutEndDate = null;
      }
    } else {
      alert("Lỗi: Không thể xác định chế độ form hoặc tài khoản được chọn.");
      return;
    }
    try {
      const url =
        formMode === "add"
          ? "http://localhost:5261/api/NguoiDung"
          : `http://localhost:5261/api/NguoiDung/${selectedAccount.maNguoiDung}`;
      const method = formMode === "add" ? "POST" : "PUT";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
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
      alert(err.message);
    }
  };

  const openDeleteModal = (account) => {
    setAccountToDelete(account);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:5261/api/NguoiDung/${accountToDelete.maNguoiDung}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Lỗi khi xóa tài khoản");
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
      alert(err.message);
    }
  };

  const formatDateTime = (dateString) => {
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
        <Button onClick={openAddModal}>
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
                <TableCell
                  colSpan={7}
                  className="text-center py-6 text-muted-foreground"
                >
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : paginatedAccounts.length > 0 ? (
              paginatedAccounts.map((account, index) => (
                <TableRow
                  key={account.maNguoiDung}
                  className="hover:bg-muted/50"
                >
                  <TableCell>
                    {(currentPage - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell>{account.hoTen}</TableCell>
                  <TableCell>{account.email}</TableCell>
                  <TableCell>{account.taiKhoan || ""}</TableCell>
                  <TableCell>
                    {account.vaiTro === 1
                      ? "Admin"
                      : account.vaiTro === 2
                      ? "Nhân viên"
                      : "Người dùng"}
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
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
                <TableCell
                  colSpan={7}
                  className="text-center py-6 text-muted-foreground"
                >
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
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
          >
            Trang Sau
          </Button>
        </div>
      )}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="p-6">
          <h2 className="text-xl font-bold">
            {formMode === "add" ? "Thêm Tài Khoản" : "Sửa Tài Khoản"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium">Họ Tên</label>
              <Input
                value={hoTen}
                onChange={(e) => setHoTen(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
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
                  value={
                    vaiTro === 1 ? "Admin" : vaiTro === 2 ? "Nhân viên" : "Người dùng"
                  }
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
              <Button type="button" onClick={() => setModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">
                {formMode === "add" ? "Thêm" : "Cập nhật"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="p-6">
          <h2 className="text-xl font-bold">Xác nhận xóa</h2>
          <p className="mt-2">
            Bạn có chắc chắn muốn xóa tài khoản{" "}
            <strong>{accountToDelete?.taiKhoan}</strong> không?
          </p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button type="button" onClick={() => setDeleteModalOpen(false)}>
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
            >
              Xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="p-6 max-w-3xl w-full">
          <h2 className="text-xl font-bold">Chi tiết Tài Khoản</h2>
          {viewAccount && (
            <div className="grid grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium">Mã tài khoản</label>
                <Input
                  value={viewAccount.maNguoiDung || "Chưa cập nhật"}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Họ Tên</label>
                <Input value={viewAccount.hoTen || "Chưa cập nhật"} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium">Ngày Sinh</label>
                <Input
                  value={
                    viewAccount.ngaySinh
                      ? formatDateTime(viewAccount.ngaySinh)
                      : "Chưa cập nhật"
                  }
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Số Điện Thoại
                </label>
                <Input value={viewAccount.sdt || "Chưa cập nhật"} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium">CCCD</label>
                <Input value={viewAccount.cccd || "Chưa cập nhật"} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <Input value={viewAccount.email || "Chưa cập nhật"} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium">Tài Khoản</label>
                <Input
                  value={viewAccount.taiKhoan || "Chưa cập nhật"}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Địa Chỉ</label>
                <Input value={viewAccount.diaChi || "Chưa cập nhật"} disabled />
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
                <label className="block text-sm font-medium">Trạng Thái</label>
                <Input
                  value={viewAccount.trangThai === 0 ? "Hoạt động" : "Khóa"}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Ngày Tạo</label>
                <Input value={formatDateTime(viewAccount.ngayTao)} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Ngày Kết Thúc Khóa
                </label>
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
          )}
          <div className="flex justify-end mt-6">
            <Button type="button" onClick={() => setViewModalOpen(false)}>
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={diaChiModalOpen} onOpenChange={setDiaChiModalOpen}>
        <DialogContent className="p-6 max-w-3xl w-full">
          <h2 className="text-xl font-bold">Danh Sách Địa Chỉ Mới Nhất</h2>
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