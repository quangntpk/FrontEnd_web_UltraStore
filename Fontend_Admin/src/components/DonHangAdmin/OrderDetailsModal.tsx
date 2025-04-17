import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

// Định nghĩa interface cho sản phẩm trong combo
interface ComboProduct {
  tenSanPham: string | null;
  soLuong: number;
  gia: number | null;
  thanhTien: number | null;
}

// Định nghĩa interface cho combo
interface Combo {
  tenCombo: string;
  giaCombo: number;
  sanPhamsTrongCombo: ComboProduct[];
}

// Định nghĩa interface cho chi tiết đơn hàng (sản phẩm hoặc combo)
interface OrderDetail {
  maChiTietDh: number;
  laCombo: boolean;
  tenSanPham: string | null;
  soLuong: number;
  gia: number | null;
  thanhTien: number | null;
  combo: Combo | null;
}

// Định nghĩa interface cho thông tin người dùng
interface UserInfo {
  tenNguoiNhan: string;
  diaChi: string;
  sdt: string;
  tenNguoiDat: string;
}

// Định nghĩa interface cho thông tin đơn hàng
interface OrderInfo {
  ngayDat: string;
  trangThai: number;
  thanhToan: number;
  hinhThucThanhToan: string;
}

// Định nghĩa interface cho phản hồi từ API
interface OrderDetailsResponse {
  sanPhams: OrderDetail[];
  thongTinNguoiDung: UserInfo;
  thongTinDonHang: OrderInfo;
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
        console.log('Order Details:', response.data); // Log để kiểm tra dữ liệu
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
                  <TableHead>Giá</TableHead>
                  <TableHead>Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderDetails.sanPhams.map(item => (
                  <TableRow key={item.maChiTietDh}>
                    <TableCell>{item.maChiTietDh}</TableCell>
                    <TableCell>
                      {item.laCombo ? (
                        <div>
                          <strong>{item.combo?.tenCombo || "Không có tên combo"}</strong>
                          {item.combo?.sanPhamsTrongCombo?.length > 0 ? (
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                              {item.combo.sanPhamsTrongCombo.map((sp, index) => (
                                <li key={index}>
                                  Sản phẩm {index + 1}: {sp.tenSanPham || "Không có tên sản phẩm"} (Số lượng: {sp.soLuong})
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p style={{ margin: 0, paddingLeft: 20 }}>Không có sản phẩm trong combo</p>
                          )}
                        </div>
                      ) : (
                        item.tenSanPham || "Không có tên sản phẩm"
                      )}
                    </TableCell>
                    <TableCell>{item.soLuong}</TableCell>
                    <TableCell>
                      {item.gia != null ? `${item.gia.toLocaleString('vi-VN')} VNĐ` : "Không xác định"}
                    </TableCell>
                    <TableCell>
                      {item.thanhTien != null ? `${item.thanhTien.toLocaleString('vi-VN')} VNĐ` : "Không xác định"}
                    </TableCell>
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
              <p><span className="font-semibold">Ngày đặt:</span> {new Date(orderDetails.thongTinDonHang.ngayDat).toLocaleDateString('vi-VN')}</p>
              <p><span className="font-semibold">Trạng thái:</span> {
                orderDetails.thongTinDonHang.trangThai === 0 ? 'Chưa xác nhận' :
                orderDetails.thongTinDonHang.trangThai === 1 ? 'Đang xử lý' :
                orderDetails.thongTinDonHang.trangThai === 2 ? 'Đang giao hàng' :
                orderDetails.thongTinDonHang.trangThai === 3 ? 'Hoàn thành' :
                orderDetails.thongTinDonHang.trangThai === 4 ? 'Đã hủy' : 'Không xác định'
              }</p>
              <p><span className="font-semibold">Thanh toán:</span> {orderDetails.thongTinDonHang.thanhToan === 1 ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
              <p><span className="font-semibold">Hình thức thanh toán:</span> {orderDetails.thongTinDonHang.hinhThucThanhToan || 'Không xác định'}</p>
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