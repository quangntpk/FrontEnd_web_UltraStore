import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface OrderDetail {
  maChiTietDh: number;
  tenSanPham: string;
  soLuong: number;
  gia: number; // Thêm trường gia
  thanhTien: number;
}

interface OrderDetailsResponse {
  sanPhams: OrderDetail[];
  thongTinNguoiDung: {
    tenNguoiNhan: string;
    diaChi: string;
    sdt: string;
    tenNguoiDat: string;
  };
  thongTinDonHang: {
    ngayDat: string;
    trangThai: number;
    thanhToan: number;
    hinhThucThanhToan: string;
  };
}

interface OrderDetailsModalProps {
  orderId: number;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ orderId, onClose }) => {
  const [orderDetails, setOrderDetails] = useState<OrderDetailsResponse | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5261/api/orders/${orderId}`);
        setOrderDetails(response.data);
      } catch (error) {
        console.error('Error fetching order details:', error);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  if (!orderDetails) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold">Chi tiết đơn hàng</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead>ID</TableHead>
                  <TableHead>Tên sản phẩm</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Giá</TableHead> {/* Thêm cột Giá */}
                  <TableHead>Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderDetails.sanPhams.map(item => (
                  <TableRow key={item.maChiTietDh}>
                    <TableCell>{item.maChiTietDh}</TableCell>
                    <TableCell>{item.tenSanPham}</TableCell>
                    <TableCell>{item.soLuong}</TableCell>
                    <TableCell>{item.gia?.toLocaleString('vi-VN')} VNĐ</TableCell> {/* Hiển thị giá */}
                    <TableCell>{item.thanhTien?.toLocaleString('vi-VN')} VNĐ</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Thông tin người dùng</h3>
              <p><span className="font-semibold">Tên người nhận:</span> {orderDetails.thongTinNguoiDung.tenNguoiNhan}</p>
              <p><span className="font-semibold">Địa chỉ:</span> {orderDetails.thongTinNguoiDung.diaChi}</p>
              <p><span className="font-semibold">Số điện thoại:</span> {orderDetails.thongTinNguoiDung.sdt}</p>
              <p><span className="font-semibold">Tên người đặt:</span> {orderDetails.thongTinNguoiDung.tenNguoiDat}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Thông tin đơn hàng</h3>
              <p><span className="font-semibold">Ngày đặt:</span> {orderDetails.thongTinDonHang.ngayDat}</p>
              <p><span className="font-semibold">Trạng thái:</span>
                {orderDetails.thongTinDonHang.trangThai === 0 && 'Chưa xác nhận'}
                {orderDetails.thongTinDonHang.trangThai === 1 && 'Đang xử lý'}
                {orderDetails.thongTinDonHang.trangThai === 2 && 'Đang giao hàng'}
                {orderDetails.thongTinDonHang.trangThai === 3 && 'Hoàn thành'}
                {orderDetails.thongTinDonHang.trangThai === 4 && 'Đã hủy'}
              </p>
              <p><span className="font-semibold">Thanh toán:</span> {orderDetails.thongTinDonHang.thanhToan === 1 ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
              <p><span className="font-semibold">Hình thức thanh toán:</span> {orderDetails.thongTinDonHang.hinhThucThanhToan}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;