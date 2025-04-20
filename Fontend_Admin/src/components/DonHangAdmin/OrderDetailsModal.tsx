import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

// Interfaces remain the same
interface ComboProduct {
  tenSanPham: string | null;
  soLuong: number;
  gia: number | null;
  thanhTien: number | null;
  loaiSanPham :string | null;
  thuongHieu: string | null;
}

interface Combo {
  tenCombo: string;
  giaCombo: number;
  sanPhamsTrongCombo: ComboProduct[];
}

interface OrderDetail {
  maChiTietDh: number;
  laCombo: boolean;
  tenSanPham: string | null;
  soLuong: number;
  gia: number | null;
  thanhTien: number | null;
  combo: Combo | null;
  loaiSanPham: string| null;
  thuongHieu: string|null;
  anh: string|null;
}

interface UserInfo {
  tenNguoiNhan: string;
  diaChi: string;
  sdt: string;
  tenNguoiDat: string;
}

interface OrderInfo {
  ngayDat: string;
  trangThai: number;
  thanhToan: number;
  hinhThucThanhToan: string;
}

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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:5261/api/orders/${orderId}`);
        console.log('API Response:', response.data); // Log the raw response

        // Since response.data is an array, take the first element
        const data = Array.isArray(response.data) && response.data.length > 0 ? response.data[0] : null;

        if (!data) {
          throw new Error('No order details found in response');
        }

        // Validate the structure of the data
        const orderData: OrderDetailsResponse = {
          sanPhams: data.sanPhams || [],
          thongTinNguoiDung: data.thongTinNguoiDung || {
            tenNguoiNhan: '',
            diaChi: '',
            sdt: '',
            tenNguoiDat: '',
          },
          thongTinDonHang: data.thongTinDonHang || {
            ngayDat: '',
            trangThai: 0,
            thanhToan: 0,
            hinhThucThanhToan: '',
          },
        };

        setOrderDetails(orderData);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Không thể tải chi tiết đơn hàng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-semibold">Chi tiết đơn hàng</DialogTitle>
          </DialogHeader>
          <div>Đang tải...</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-semibold">Chi tiết đơn hàng</DialogTitle>
          </DialogHeader>
          <div className="text-red-500">{error}</div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (!orderDetails) {
    return null; // This case should be rare now due to error handling
  }

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
                  <TableHead>Hình Ảnh</TableHead>
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
                    <TableCell><img
                      src={`data:image/jpeg;base64,${item.anh}`}
                      alt="Combo Preview"
                      className="mt-2 w-24 h-24 object-cover"
                    /></TableCell>
                    <TableCell>
                      {item.laCombo ? (
                        <div>
                          <strong>{item.combo?.tenCombo || "Không có tên combo"}</strong>
                          {item.combo?.sanPhamsTrongCombo?.length > 0 ? (
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                              {item.combo.sanPhamsTrongCombo.map((sp, index) => (
                                <li key={index}>
                                  <strong>{index + 1}.</strong> {sp.tenSanPham || "Không có tên sản phẩm"} <br/> Loại Sản Phẩm: {sp.loaiSanPham} <br/>Thương Hiệu {sp.thuongHieu} <br/>(Số lượng: {sp.soLuong})
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p style={{ margin: 0, paddingLeft: 20 }}>Không có sản phẩm trong combo</p>
                          )}
                        </div>
                      ) : (
                        <p><strong>{item.tenSanPham || "Không có tên sản phẩm"}</strong><br/><strong>Loại Sản Phẩm:</strong>{item.loaiSanPham}<br/><strong>Thương Hiệu: </strong>{item.thuongHieu}</p>
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
              <p><span className="font-semibold">Ngày đặt:</span> {orderDetails.thongTinDonHang.ngayDat}</p>
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