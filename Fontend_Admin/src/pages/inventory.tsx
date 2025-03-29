import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  RefreshCw,
  MoreVertical,
  CheckCircle,
  XCircle,
  Eye,
  Trash2
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// Define the Comment type based on your API response
interface Comment {
  maBinhLuan: number;
  maSanPham?: number;
  tenSanPham?: string;
  maNguoiDung?: number;
  hoTen?: string;
  noiDungBinhLuan?: string;
  soTimBinhLuan?: number;
  danhGia?: number;
  trangThai: number; // 0: Chưa duyệt, 1: Đã duyệt
  ngayBinhLuan?: string;
}

// Hàm định dạng ngày giờ
const formatDateTime = (dateString?: string): string => {
  if (!dateString) return "Ngày không hợp lệ";
  const date = new Date(dateString);
  const datePart = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timePart = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  return `${datePart}, ${timePart}`;
};

const Comments = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);
  const [openDetailModal, setOpenDetailModal] = useState<boolean>(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const commentsPerPage: number = 10;

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5261/api/Comment/list");
      if (!response.ok) {
        throw new Error('Không thể lấy dữ liệu bình luận');
      }
      const data: Comment[] = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách bình luận:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async () => {
    if (!commentToDelete) return;

    try {
      const response = await fetch(`http://localhost:5261/api/comment/delete/${commentToDelete.maBinhLuan}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Không thể xóa bình luận');
      }
      setComments(comments.filter(comment => comment.maBinhLuan !== commentToDelete.maBinhLuan));
      setOpenDeleteModal(false);
      setCommentToDelete(null);
      toast.success("Xóa bình luận thành công!");
    } catch (error) {
      console.error('Lỗi khi xóa bình luận:', error);
      toast.error("Có lỗi xảy ra khi xóa bình luận.");
    }
  };

  const handleApproveComment = async (comment: Comment) => {
    try {
      const response = await fetch(`http://localhost:5261/api/comment/approve/${comment.maBinhLuan}`, {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error('Không thể duyệt bình luận');
      }
      setComments(comments.map(c =>
        c.maBinhLuan === comment.maBinhLuan ? { ...c, trangThai: 1 } : c
      ));
      toast.success("Duyệt bình luận thành công!");
    } catch (error) {
      console.error('Lỗi khi duyệt bình luận:', error);
      toast.error("Có lỗi xảy ra khi duyệt bình luận.");
    }
  };

  const handleUnapproveComment = async (comment: Comment) => {
    try {
      const response = await fetch(`http://localhost:5261/api/comment/unapprove/${comment.maBinhLuan}`, {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error('Không thể hủy duyệt bình luận');
      }
      setComments(comments.map(c =>
        c.maBinhLuan === comment.maBinhLuan ? { ...c, trangThai: 0 } : c
      ));
      toast.success("Hủy duyệt bình luận thành công!");
    } catch (error) {
      console.error('Lỗi khi hủy duyệt bình luận:', error);
      toast.error("Có lỗi xảy ra khi hủy duyệt bình luận.");
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const filteredComments = comments
    .filter(item => {
      const trangThaiText = item.trangThai === 0 ? "Chưa Duyệt" : item.trangThai === 1 ? "Đã Duyệt" : "";
      return (
        (item.noiDungBinhLuan?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (item.maBinhLuan.toString().includes(searchTerm.toLowerCase()) || '') ||
        (item.ngayBinhLuan?.toString().includes(searchTerm.toLowerCase()) || '') ||
        (trangThaiText.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (item.tenSanPham?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (item.hoTen?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
      );
    })
    .sort((a, b) => new Date(b.ngayBinhLuan || "").getTime() - new Date(a.ngayBinhLuan || "").getTime());

  const indexOfLastComment: number = currentPage * commentsPerPage;
  const indexOfFirstComment: number = indexOfLastComment - commentsPerPage;
  const currentComments: Comment[] = filteredComments.slice(indexOfFirstComment, indexOfLastComment);
  const totalPages: number = Math.ceil(filteredComments.length / commentsPerPage);

  const handleDeleteClick = (comment: Comment) => {
    setCommentToDelete(comment);
    setOpenDeleteModal(true);
  };

  const handleDetailClick = (comment: Comment) => {
    setSelectedComment(comment);
    setOpenDetailModal(true);
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bình Luận</h1>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Danh Sách Bình Luận</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm bình luận..."
                className="pl-8 w-full sm:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 self-end">
              <Button variant="outline" size="sm" className="h-9" onClick={fetchComments}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Làm Mới
              </Button>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên Sản Phẩm</TableHead>
                  <TableHead>Họ Tên</TableHead>
                  <TableHead>Nội Dung</TableHead>
                  <TableHead>Trạng Thái</TableHead>
                  <TableHead>Ngày Bình Luận</TableHead>
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
                ) : currentComments.length > 0 ? (
                  currentComments.map((item) => (
                    <TableRow key={item.maBinhLuan} className="hover:bg-muted/50">
                      <TableCell>{item.maBinhLuan}</TableCell>
                      <TableCell>{item.tenSanPham}</TableCell>
                      <TableCell>{item.hoTen}</TableCell>
                      <TableCell>{item.noiDungBinhLuan}</TableCell>
                      <TableCell>
                        <span
                          className={
                            item.trangThai === 1
                              ? 'bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-100'
                              : item.trangThai === 0
                                ? 'bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-100'
                                : ''
                          }
                        >
                          {item.trangThai === 0 ? "Chưa Duyệt" : item.trangThai === 1 ? "Đã Duyệt" : ""}
                        </span>
                      </TableCell>
                      <TableCell>
                        {item.ngayBinhLuan ? formatDateTime(item.ngayBinhLuan) : 'Ngày không hợp lệ'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {item.trangThai === 0 ? (
                              <DropdownMenuItem onClick={() => handleApproveComment(item)} className="flex items-center">
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                Duyệt
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleUnapproveComment(item)} className="flex items-center">
                                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                Hủy Duyệt
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDetailClick(item)} className="flex items-center">
                              <Eye className="mr-2 h-4 w-4 text-blue-500" />
                              Chi Tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(item)} className="flex items-center">
                              <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                      Không tìm thấy bình luận nào phù hợp với tìm kiếm của bạn.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Trang Sau
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal xác nhận xóa */}
      <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa bình luận</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDeleteModal(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={deleteComment}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal chi tiết bình luận */}
      <Dialog open={openDetailModal} onOpenChange={setOpenDetailModal}>
        <DialogContent className="p-6 max-w-3xl w-full">
          <DialogHeader>
            <DialogTitle>Chi Tiết Bình Luận</DialogTitle>
          </DialogHeader>
          {selectedComment && (
            <div className="grid grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium">ID Bình Luận</label>
                <Input value={selectedComment.maBinhLuan || "Chưa cập nhật"} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium">Mã Sản Phẩm</label>
                <Input value={selectedComment.maSanPham || "Chưa cập nhật"} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium">Tên Sản Phẩm</label>
                <Input value={selectedComment.tenSanPham || "Chưa cập nhật"} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium">Mã Người Dùng</label>
                <Input value={selectedComment.maNguoiDung || "Chưa cập nhật"} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium">Họ Tên</label>
                <Input value={selectedComment.hoTen || "Chưa cập nhật"} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium">Nội Dung</label>
                <Input value={selectedComment.noiDungBinhLuan || "Chưa cập nhật"} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium">Số Tim</label>
                <Input value={selectedComment.soTimBinhLuan ?? "0"} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium">Đánh Giá</label>
                <Input value={`${selectedComment.danhGia || 0} / 5`} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium">Trạng Thái</label>
                <Input
                  value={selectedComment.trangThai === 0 ? "Chưa Duyệt" : "Đã Duyệt"}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Ngày Bình Luận</label>
                <Input
                  value={selectedComment.ngayBinhLuan ? formatDateTime(selectedComment.ngayBinhLuan) : "Chưa cập nhật"}
                  disabled
                />
              </div>
            </div>
          )}
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setOpenDetailModal(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Comments;