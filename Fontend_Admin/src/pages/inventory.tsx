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
  Filter,
  RefreshCw,
  MoreVertical
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const Comments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 10;

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5261/api/comment/list`);
      if (!response.ok) {
        throw new Error('Không thể lấy dữ liệu bình luận');
      }
      const data = await response.json();
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

  // Hàm duyệt bình luận
  const handleApproveComment = async (comment) => {
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

  // Thêm hàm hủy duyệt bình luận
  const handleUnapproveComment = async (comment) => {
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

  const filteredComments = comments.filter(item => {
    const trangThaiText = item.trangThai === 0 ? "Chưa Duyệt" : item.trangThai === 1 ? "Đã Duyệt" : "";
    return (
      (item.noiDungBinhLuan?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (item.maBinhLuan?.toString().includes(searchTerm.toLowerCase()) || '') ||
      (item.ngayBinhLuan?.toString().includes(searchTerm.toLowerCase()) || '') ||
      (trangThaiText.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (item.maSanPham?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
      
    );
  });

  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = filteredComments.slice(indexOfFirstComment, indexOfLastComment);
  const totalPages = Math.ceil(filteredComments.length / commentsPerPage);

  const handleDeleteClick = (comment) => {
    setCommentToDelete(comment);
    setOpenDeleteModal(true);
  };

  const handleDetailClick = (comment) => {
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
        {/*} <Button className="bg-purple hover:bg-purple-medium">
          <Plus className="mr-2 h-4 w-4" /> Thêm Bình Luận
        </Button>
        */}
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
              {/* <Button variant="outline" size="sm" className="h-9">
                <Filter className="h-4 w-4 mr-2" />
                Lọc
              </Button> */}
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
                  <TableHead>Sản Phẩm</TableHead>
                  <TableHead>Người Dùng</TableHead>
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
                      <TableCell>{item.maSanPham}</TableCell>
                      <TableCell>{item.maNguoiDung}</TableCell>
                      <TableCell>{item.noiDungBinhLuan}</TableCell>
                      <TableCell>
                        <span
                          className={
                            item.trangThai === 1
                              ? 'bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-100'  // "Đã Duyệt" (green)
                              : item.trangThai === 0
                                ? 'bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-100'  // "Chưa Duyệt" (red)
                                : ''
                          }
                        >
                          {item.trangThai === 0
                            ? "Chưa Duyệt"
                            : item.trangThai === 1
                              ? "Đã Duyệt"
                              : ""
                          }
                        </span>
                      </TableCell>


                      <TableCell>
                        {item.ngayBinhLuan ? (() => {
                          const date = new Date(item.ngayBinhLuan);
                          const datePart = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                          const timePart = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                          return `${datePart}, ${timePart}`;
                        })() : 'Ngày không hợp lệ'}
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
                              <DropdownMenuItem onClick={() => handleApproveComment(item)}>
                                Duyệt
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleUnapproveComment(item)}>
                                Hủy Duyệt
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDetailClick(item)}>
                              Chi Tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(item)}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi Tiết Bình Luận</DialogTitle>
          </DialogHeader>
          {selectedComment && (
            <div className="space-y-4">
              <div>
                <strong>ID Bình Luận:</strong> {selectedComment.maBinhLuan}
              </div>
              <div>
                <strong>Sản Phẩm:</strong> {selectedComment.maSanPham || "Không có"}
              </div>
              <div>
                <strong>Người Dùng:</strong> {selectedComment.maNguoiDung || "Không có"}
              </div>
              <div>
                <strong>Nội Dung:</strong> {selectedComment.noiDungBinhLuan}
              </div>
              <div>
                <strong>Số Tim:</strong> {selectedComment.soTimBinhLuan}
              </div>
              <div>
                <strong>Đánh Giá:</strong> {selectedComment.danhGia} / 5
              </div>
              <div>
                <strong>Trạng Thái:</strong> {selectedComment.trangThai === 0 ? "Chưa Duyệt" : "Đã Duyệt"}
              </div>
              <div>
                <strong>Ngày Bình Luận:</strong>
                {selectedComment.ngayBinhLuan ? (() => {
                  const date = new Date(selectedComment.ngayBinhLuan);
                  const datePart = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                  const timePart = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                  return `${datePart}, ${timePart}`;
                })() : 'Ngày không hợp lệ'}
              </div>
            </div>
          )}
          <DialogFooter>
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