import { useState, useEffect } from "react";
import { FaEye, FaTrashAlt, FaEdit, FaEllipsisV } from 'react-icons/fa';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  RefreshCw
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import toast, { Toaster } from "react-hot-toast";

const Vouchers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [newVoucher, setNewVoucher] = useState({
    tenVoucher: '',
    giaTri: '',
    moTa: '',
    ngayBatDau: '',
    ngayKetThuc: '',
    dieuKien: '',
    soLuong: '',
    hinhAnh: '',
    trangThai: 0, // Mặc định là "Đang Dùng"
  });
  const [editVoucher, setEditVoucher] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const vouchersPerPage = 8;

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5261/api/Voucher`);
      if (!response.ok) throw new Error('Không thể lấy dữ liệu voucher');
      const data = await response.json();
      setVouchers(data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách voucher:', error);
      toast.error("Có lỗi khi tải danh sách voucher!");
    } finally {
      setLoading(false);
    }
  };

  const deleteVoucher = async () => {
    if (!voucherToDelete) return;

    try {
      const response = await fetch(`http://localhost:5261/api/Voucher/${voucherToDelete.maVoucher}`, {
        method: 'DELETE',
      });
      if (response.status === 204) {
        setVouchers(vouchers.filter(voucher => voucher.maVoucher !== voucherToDelete.maVoucher));
        setOpenDeleteModal(false);
        setVoucherToDelete(null);
        toast.success("Xóa voucher thành công!");
      } else if (response.status === 404) {
        throw new Error('Voucher không tồn tại');
      } else {
        throw new Error('Không thể xóa voucher');
      }
    } catch (error) {
      console.error('Lỗi khi xóa voucher:', error);
      toast.error(error.message || "Có lỗi xảy ra khi xóa voucher.");
    }
  };

  const createVoucher = async () => {
    const today = new Date().toISOString().split('T')[0];
    if (newVoucher.ngayBatDau < today) {
      toast.error("Ngày bắt đầu không được trước ngày hôm nay!");
      return;
    }
    if (newVoucher.ngayKetThuc < newVoucher.ngayBatDau) {
      toast.error("Ngày kết thúc không được trước ngày bắt đầu!");
      return;
    }

    if (!newVoucher.tenVoucher || !newVoucher.giaTri || !newVoucher.ngayBatDau || !newVoucher.ngayKetThuc || !newVoucher.dieuKien || !newVoucher.soLuong) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc!");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5261/api/Voucher`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenVoucher: newVoucher.tenVoucher,
          giaTri: parseInt(newVoucher.giaTri),
          moTa: newVoucher.moTa || null,
          ngayBatDau: new Date(newVoucher.ngayBatDau).toISOString(),
          ngayKetThuc: new Date(newVoucher.ngayKetThuc).toISOString(),
          dieuKien: parseFloat(newVoucher.dieuKien),
          soLuong: parseInt(newVoucher.soLuong),
          hinhAnh: newVoucher.hinhAnh || null,
          trangThai: newVoucher.trangThai,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể thêm voucher');
      }

      await fetchVouchers();
      setOpenCreateModal(false);
      setNewVoucher({
        tenVoucher: '',
        giaTri: '',
        moTa: '',
        ngayBatDau: '',
        ngayKetThuc: '',
        dieuKien: '',
        soLuong: '',
        hinhAnh: '',
        trangThai: 0,
      });
      toast.success("Thêm voucher thành công!");
    } catch (error) {
      console.error('Lỗi khi thêm voucher:', error);
      toast.error(error.message || "Có lỗi xảy ra khi thêm voucher.");
    }
  };

  const editVoucherSubmit = async () => {
    const today = new Date().toISOString().split('T')[0];
    if (editVoucher.ngayBatDau < today && new Date(editVoucher.ngayBatDau).toISOString().split('T')[0] !== today) {
      toast.error("Ngày bắt đầu không được trước ngày hôm nay!");
      return;
    }
    if (editVoucher.ngayKetThuc < editVoucher.ngayBatDau) {
      toast.error("Ngày kết thúc không được trước ngày bắt đầu!");
      return;
    }

    if (!editVoucher.tenVoucher || !editVoucher.giaTri || !editVoucher.ngayBatDau || !editVoucher.ngayKetThuc || !editVoucher.dieuKien || !editVoucher.soLuong) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc!");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5261/api/Voucher`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maVoucher: editVoucher.maVoucher,
          tenVoucher: editVoucher.tenVoucher,
          giaTri: parseInt(editVoucher.giaTri),
          moTa: editVoucher.moTa || null,
          ngayBatDau: new Date(editVoucher.ngayBatDau).toISOString(),
          ngayKetThuc: new Date(editVoucher.ngayKetThuc).toISOString(),
          dieuKien: parseFloat(editVoucher.dieuKien),
          soLuong: parseInt(editVoucher.soLuong),
          trangThai: editVoucher.trangThai,
          hinhAnh: editVoucher.hinhAnh || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể sửa voucher');
      }

      await fetchVouchers();
      setOpenEditModal(false);
      setEditVoucher(null);
      toast.success("Sửa voucher thành công!");
    } catch (error) {
      console.error('Lỗi khi sửa voucher:', error);
      toast.error(error.message || "Có lỗi xảy ra khi sửa voucher.");
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const filteredVouchers = vouchers.filter(item => {
    return (
      (item.tenVoucher?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (item.maVoucher?.toString().includes(searchTerm.toLowerCase()) || '') ||
      (item.ngayKetThuc?.toString().includes(searchTerm.toLowerCase()) || '') ||
      (item.trangThai?.toString().includes(searchTerm.toLowerCase()) || '')
    );
  });

  const indexOfLastVoucher = currentPage * vouchersPerPage;
  const indexOfFirstVoucher = indexOfLastVoucher - vouchersPerPage;
  const currentVouchers = filteredVouchers.slice(indexOfFirstVoucher, indexOfLastVoucher);
  const totalPages = Math.ceil(filteredVouchers.length / vouchersPerPage);

  const handleDeleteClick = (voucher) => {
    setVoucherToDelete(voucher);
    setOpenDeleteModal(true);
  };

  const handleDetailClick = (voucher) => {
    setSelectedVoucher(voucher);
    setOpenDetailModal(true);
  };

  const handleEditClick = (voucher) => {
    setEditVoucher({
      ...voucher,
      ngayBatDau: new Date(voucher.ngayBatDau).toISOString().split('T')[0],
      ngayKetThuc: new Date(voucher.ngayKetThuc).toISOString().split('T')[0],
    });
    setOpenEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVoucher({ ...newVoucher, [name]: value });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditVoucher({ ...editVoucher, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const base64String = reader.result.split(',')[1];
          setNewVoucher({ ...newVoucher, hinhAnh: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const base64String = reader.result.split(',')[1];
          setEditVoucher({ ...editVoucher, hinhAnh: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const half = Math.floor(maxPagesToShow / 2);
    let startPage = Math.max(1, currentPage - half);
    let endPage = Math.min(totalPages, currentPage + half);

    if (endPage - startPage + 1 < maxPagesToShow) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
      } else {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Voucher</h1>
        </div>
        <Button className="bg-purple hover:bg-purple-medium" variant="outline" size="sm" onClick={() => setOpenCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" /> Thêm Voucher
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Danh Sách Voucher</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm voucher..."
                className="pl-8 w-full sm:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 self-end">
              <Button variant="outline" size="sm" className="h-9" onClick={fetchVouchers}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Làm Mới
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-6 text-muted-foreground">Đang tải...</div>
          ) : currentVouchers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentVouchers.map((item) => (
                <Card key={item.maVoucher} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg truncate">{item.tenVoucher}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {item.hinhAnh && (
                      <img
                        src={`data:image/jpeg;base64,${item.hinhAnh}`}
                        alt={item.tenVoucher}
                        className="w-full h-48 object-cover rounded"
                      />
                    )}
                    <div><strong>ID:</strong> {item.maVoucher}</div>
                    <div><strong>Giá trị:</strong> {item.giaTri} %</div>
                    <div><strong>Hết hạn:</strong> {new Date(item.ngayKetThuc).toLocaleDateString()}</div>
                    <div>
                      <strong>Trạng thái:</strong>
                      <span
                        className={
                          item.trangThai === 1
                            ? "bg-red-100 text-red-800 px-2 py-1 rounded ml-2"
                            : "bg-green-100 text-green-800 px-2 py-1 rounded ml-2"
                        }
                      >
                        {item.trangThai === 0 ? "Đang Dùng" : "Tạm Ngưng"}
                      </span>
                    </div>
                    <div className="flex justify-end mt-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <FaEllipsisV />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleDetailClick(item)} 
                            className="flex items-center text-gray-700 hover:text-blue-600"
                          >
                            <FaEye className="mr-2 h-4 w-4" /> 
                            <span>Chi Tiết</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleEditClick(item)} 
                            className="flex items-center text-gray-700 hover:text-green-600"
                          >
                            <FaEdit className="mr-2 h-4 w-4 text-green-500" /> 
                            <span>Sửa</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(item)} 
                            className="flex items-center text-gray-700 hover:text-red-600"
                          >
                            <FaTrashAlt className="mr-2 h-4 w-4 text-red-500" /> 
                            <span>Xóa</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              Không tìm thấy voucher nào phù hợp với tìm kiếm của bạn.
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                Đầu
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>

              {getPageNumbers().map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Cuối
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal xác nhận xóa */}
      <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa voucher</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa voucher này không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDeleteModal(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={deleteVoucher}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal chi tiết voucher */}
      <Dialog open={openDetailModal} onOpenChange={setOpenDetailModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi Tiết Voucher</DialogTitle>
          </DialogHeader>
          {selectedVoucher && (
            <div className="space-y-4">
              {selectedVoucher.hinhAnh && (
                <img
                  src={`data:image/jpeg;base64,${selectedVoucher.hinhAnh}`}
                  alt={selectedVoucher.tenVoucher}
                  className="w-full h-64 object-cover rounded"
                />
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div><strong>ID:</strong> {selectedVoucher.maVoucher}</div>
                  <div><strong>Tên Voucher:</strong> {selectedVoucher.tenVoucher}</div>
                  <div><strong>Giá Trị:</strong> {selectedVoucher.giaTri} %</div>
                  <div><strong>Mô Tả:</strong> {selectedVoucher.moTa}</div>
                  <div><strong>Điều Kiện Trên:</strong> {selectedVoucher.dieuKien.toLocaleString('vi-VN')} VND</div>
                  <div><strong>Số Lượng:</strong> {selectedVoucher.soLuong}</div>
                  <div>
                    <strong>Trạng Thái:</strong>
                    <span
                      className={
                        selectedVoucher.trangThai === 1
                          ? "bg-red-100 text-red-800 px-2 py-1 rounded ml-2"
                          : "bg-green-100 text-green-800 px-2 py-1 rounded ml-2"
                      }
                    >
                      {selectedVoucher.trangThai === 0 ? "Đang Dùng" : "Tạm Ngưng"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div><strong>Ngày Bắt Đầu:</strong> {new Date(selectedVoucher.ngayBatDau).toLocaleDateString()}</div>
                  <div><strong>Ngày Kết Thúc:</strong> {new Date(selectedVoucher.ngayKetThuc).toLocaleDateString()}</div>
                  <div>
                    <strong>Mã Coupon:</strong>
                    {selectedVoucher.coupons && selectedVoucher.coupons.length > 0 ? (
                      <ul className="list-disc pl-5">
                        {selectedVoucher.coupons.map((coupon) => (
                          <li
                            key={coupon.id}
                            className={coupon.trangThai === 1 ? "line-through text-gray-500" : ""}
                          >
                            {coupon.maNhap}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-500">Không có mã</span>
                    )}
                  </div>
                </div>
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

      {/* Modal thêm voucher */}
      <Dialog open={openCreateModal} onOpenChange={setOpenCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm Voucher Mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input name="tenVoucher" placeholder="Tên Voucher" value={newVoucher.tenVoucher} onChange={handleInputChange} required />
            <Input name="giaTri" type="number" placeholder="Giá trị (%)" value={newVoucher.giaTri} onChange={handleInputChange} required />
            <Input name="moTa" placeholder="Mô tả" value={newVoucher.moTa} onChange={handleInputChange} />
            <Input name="ngayBatDau" type="date" placeholder="Ngày bắt đầu" value={newVoucher.ngayBatDau} onChange={handleInputChange} min={today} required />
            <Input name="ngayKetThuc" type="date" placeholder="Ngày kết thúc" value={newVoucher.ngayKetThuc} onChange={handleInputChange} min={newVoucher.ngayBatDau || today} required />
            <Input name="dieuKien" type="number" placeholder="Điều kiện (VND)" value={newVoucher.dieuKien} onChange={handleInputChange} required />
            <Input name="soLuong" type="number" placeholder="Số lượng" value={newVoucher.soLuong} onChange={handleInputChange} required />
            <div>
              <Label>Trạng Thái</Label>
              <RadioGroup
                value={newVoucher.trangThai.toString()}
                onValueChange={(value) => setNewVoucher({ ...newVoucher, trangThai: parseInt(value) })}
                className="flex space-x-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="dang-dung" />
                  <Label htmlFor="dang-dung">Đang Dùng</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="tam-ngung" />
                  <Label htmlFor="tam-ngung">Tạm Ngưng</Label>
                </div>
              </RadioGroup>
            </div>
            <Input name="hinhAnh" type="file" accept="image/*" onChange={handleImageChange} />
            {newVoucher.hinhAnh && (
              <img src={`data:image/jpeg;base64,${newVoucher.hinhAnh}`} alt="Preview" className="w-32 h-32 object-cover rounded" />
            )}
            
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreateModal(false)}>Hủy</Button>
            <Button onClick={createVoucher}>Thêm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal sửa voucher */}
      <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa Voucher</DialogTitle>
          </DialogHeader>
          {editVoucher && (
            <div className="space-y-4">
              <Input name="tenVoucher" placeholder="Tên Voucher" value={editVoucher.tenVoucher} onChange={handleEditInputChange} required />
              <Input name="giaTri" type="number" placeholder="Giá trị (%)" value={editVoucher.giaTri} onChange={handleEditInputChange} required />
              <Input name="moTa" placeholder="Mô tả" value={editVoucher.moTa || ''} onChange={handleEditInputChange} />
              <Input name="ngayBatDau" type="date" placeholder="Ngày bắt đầu" value={editVoucher.ngayBatDau} onChange={handleEditInputChange} min={today} required />
              <Input name="ngayKetThuc" type="date" placeholder="Ngày kết thúc" value={editVoucher.ngayKetThuc} onChange={handleEditInputChange} min={editVoucher.ngayBatDau || today} required />
              <Input name="dieuKien" type="number" placeholder="Điều kiện (VND)" value={editVoucher.dieuKien} onChange={handleEditInputChange} required />
              <Input name="soLuong" type="number" placeholder="Số lượng" value={editVoucher.soLuong} onChange={handleEditInputChange} required />
              <div>
                <Label>Trạng Thái</Label>
                <RadioGroup
                  value={editVoucher.trangThai.toString()}
                  onValueChange={(value) => setEditVoucher({ ...editVoucher, trangThai: parseInt(value) })}
                  className="flex space-x-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="dang-dung-edit" />
                    <Label htmlFor="dang-dung-edit">Đang Dùng</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="tam-ngung-edit" />
                    <Label htmlFor="tam-ngung-edit">Tạm Ngưng</Label>
                  </div>
                </RadioGroup>
              </div>
              <Input name="hinhAnh" type="file" accept="image/*" onChange={handleEditImageChange} />
              {editVoucher.hinhAnh && (
                <img src={`data:image/jpeg;base64,${editVoucher.hinhAnh}`} alt="Preview" className="w-32 h-32 object-cover rounded" />
              )}
              
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditModal(false)}>Hủy</Button>
            <Button onClick={editVoucherSubmit}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Vouchers;