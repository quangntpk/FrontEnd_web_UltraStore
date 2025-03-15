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

const ITEMS_PER_PAGE = 10;

const LienHeManagement = () => {
  const [lienHeList, setLienHeList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [deleteContact, setDeleteContact] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState("");
  const [notification, setNotification] = useState({
    message: "",
    type: "info",
    show: false,
  });

  useEffect(() => {
    fetchLienHe();
  }, []);

  const sortedAndFilteredLienHe = useMemo(() => {
    let filtered = [...lienHeList]
      .sort((a, b) => b.maLienHe - a.maLienHe)
      .filter((l) =>
        (l.hoTen?.toLowerCase().includes(searchTerm) ||
         l.email?.toLowerCase().includes(searchTerm) ||
         l.sdt?.toLowerCase().includes(searchTerm))
      );
    if (statusFilter !== "all") {
      filtered = filtered.filter((l) => String(l.trangThai) === statusFilter);
    }
    return filtered;
  }, [lienHeList, searchTerm, statusFilter]);

  const totalPages = Math.ceil(sortedAndFilteredLienHe.length / ITEMS_PER_PAGE);
  const paginatedLienHe = sortedAndFilteredLienHe.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const fetchLienHe = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5261/api/LienHe");
      if (!response.ok) throw new Error("Lỗi khi tải danh sách liên hệ");
      const data = await response.json();
      setLienHeList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = async (contact, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:5261/api/LienHe/${contact.maLienHe}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            maLienHe: contact.maLienHe,
            hoTen: contact.hoTen,
            email: contact.email,
            sdt: contact.sdt,
            noiDung: contact.noiDung,
            trangThai: Number(newStatus),
          }),
        }
      );
      if (!response.ok) throw new Error("Lỗi khi cập nhật trạng thái");
      fetchLienHe();
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:5261/api/LienHe/${deleteContact.maLienHe}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Lỗi khi xóa liên hệ");
      fetchLienHe();
      setDeleteContact(null);
      setCurrentPage(1);
      setNotification({
        message: "Xóa liên hệ thành công!",
        type: "success",
        show: true,
      });
    } catch (err) {
      setError(err.message);
      setNotification({
        message: "Lỗi khi xóa liên hệ",
        type: "error",
        show: true,
      });
    }
  };

  const openSupportModal = (contact) => {
    setSelectedContact(contact);
    setSupportModalOpen(true);
    setSupportMessage("");
  };

  const closeSupportModal = () => {
    setSupportModalOpen(false);
    setSelectedContact(null);
    setSupportMessage("");
    setError("");
    setAiError("");
  };

  const handleSendSupport = async () => {
    if (!supportMessage.trim()) {
      setError("Nội dung hỗ trợ không được để trống.");
      return;
    }
    setIsSending(true);
    try {
      const payload = {
        toEmail: selectedContact.email,
        message: supportMessage,
        hoTen: selectedContact.hoTen, // Thêm họ tên
        sdt: selectedContact.sdt,     // Thêm số điện thoại
      };
      const response = await fetch("http://localhost:5261/api/LienHe/SupportEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Lỗi khi gửi email hỗ trợ");

      await handleStatusChange(selectedContact, 1);

      setNotification({
        message: "Gửi hỗ trợ thành công!",
        type: "success",
        show: true,
      });
      closeSupportModal();
    } catch (err) {
      setError(err.message);
      setNotification({
        message: "Lỗi khi gửi email hỗ trợ",
        type: "error",
        show: true,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleGetAIResponse = async () => {
    if (!selectedContact) return;
    setIsLoadingAI(true);
    setAiError("");
    try {
      const response = await fetch(
        `http://localhost:5261/api/Gemini/TraLoi?question=${encodeURIComponent(selectedContact.noiDung)}`
      );
      if (!response.ok) throw new Error("Lỗi khi gọi API Gemini AI");
      const data = await response.json();
      if (data.responseCode === 201) {
        setSupportMessage(data.result);
      } else {
        throw new Error(data.errorMessage || "Không thể nhận phản hồi từ AI");
      }
    } catch (err) {
      setAiError(err.message);
      setNotification({
        message: "Lỗi khi nhận phản hồi từ AI",
        type: "error",
        show: true,
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <Input
          type="search"
          placeholder="Tìm kiếm liên hệ..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-[600px]"
        />
        <select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className="w-[180px] rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="all">Tất cả</option>
          <option value="0">Chưa xử lý</option>
          <option value="1">Đã xử lý</option>
        </select>
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
                    <TableHead>Trạng Thái</TableHead>
                    <TableHead>Hành Động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLienHe.map((lienHe, index) => (
                    <TableRow key={lienHe.maLienHe}>
                      <TableCell>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                      <TableCell>{lienHe.hoTen}</TableCell>
                      <TableCell>{lienHe.email}</TableCell>
                      <TableCell>{lienHe.sdt}</TableCell>
                      <TableCell>{lienHe.noiDung}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="1"
                            value={lienHe.trangThai}
                            onChange={(e) => handleStatusChange(lienHe, e.target.value)}
                            className="w-20"
                          />
                          <span
                            className={
                              lienHe.trangThai === 0
                                ? "text-yellow-500 font-semibold"
                                : "text-blue-500 font-semibold"
                            }
                          >
                            {lienHe.trangThai === 0 ? "Chưa xử lý" : "Đã xử lý"}
                          </span>
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
                    <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
                  ) : (
                    <span className="pointer-events-none text-gray-400">Previous</span>
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
                    <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                  ) : (
                    <span className="pointer-events-none text-gray-400">Next</span>
                  )}
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {supportModalOpen && selectedContact && (
        <Dialog open={true} onOpenChange={closeSupportModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chi tiết liên hệ & Gửi hỗ trợ</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p><strong>Họ Tên:</strong> {selectedContact.hoTen}</p>
              <p><strong>Email:</strong> {selectedContact.email}</p>
              <p><strong>Số điện thoại:</strong> {selectedContact.sdt}</p>
              <p><strong>Nội dung:</strong> {selectedContact.noiDung}</p>
              <p><strong>Trạng thái:</strong> {selectedContact.trangThai === 0 ? "Chưa xử lý" : "Đã xử lý"}</p>
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
                <Button variant="ghost" onClick={closeSupportModal}>Đóng</Button>
                <Button onClick={handleSendSupport} disabled={isSending}>
                  {isSending ? "Đang gửi..." : "Gửi hỗ trợ"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {deleteContact && (
        <Dialog open={true} onOpenChange={() => setDeleteContact(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                Bạn có chắc chắn muốn xóa liên hệ của{" "}
                <strong>{deleteContact.hoTen}</strong> không?
              </p>
            </div>
            <DialogFooter className="flex justify-end space-x-2 mt-4">
              <Button variant="ghost" onClick={() => setDeleteContact(null)}>Hủy</Button>
              <Button variant="destructive" onClick={confirmDelete}>Xóa</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default LienHeManagement;