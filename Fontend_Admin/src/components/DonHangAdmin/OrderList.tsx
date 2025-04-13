import React, { useEffect, useState } from 'react';
import axios from 'axios';
import OrderDetailsModal from './OrderDetailsModal';
import Notification from '../layout/Notification';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Ellipsis } from 'lucide-react';

interface Order {
  maDonHang: number;
  tenNguoiNhan: string;
  ngayDat: string;
  trangThaiDonHang: number;
  trangThaiThanhToan: number;
  hinhThucThanhToan: string;
  lyDoHuy?: string;
  tenSanPhamHoacCombo?: string;
}

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
}

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelOrderId, setCancelOrderId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>('completed');
  const [notification, setNotification] = useState<NotificationState>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  // Danh sách các lý do hủy gợi ý
  const cancelReasonsSuggestions = [
    "Khách hàng không muốn mua nữa",
    "Hết hàng",
    "Sai thông tin đơn hàng",
    "Khác"
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:5261/api/orders');
        setOrders(response.data);
        setFilteredOrders(response.data.filter((order: Order) => order.trangThaiDonHang === 3));
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };
    fetchOrders();
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'unconfirmed') {
      setFilteredOrders(orders.filter(order => order.trangThaiDonHang === 0));
    } else if (value === 'processing') {
      setFilteredOrders(orders.filter(order => order.trangThaiDonHang === 1));
    } else if (value === 'delivering') {
      setFilteredOrders(orders.filter(order => order.trangThaiDonHang === 2));
    } else if (value === 'completed') {
      setFilteredOrders(orders.filter(order => order.trangThaiDonHang === 3));
    } else if (value === 'canceled') {
      setFilteredOrders(orders.filter(order => order.trangThaiDonHang === 4));
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type, isVisible: true });
    setTimeout(() => {
      setNotification({ message: '', type: 'info', isVisible: false });
    }, 3000);
  };

  const handleApprove = async (id: number) => {
    try {
      const response = await axios.put(`http://localhost:5261/api/orders/approve/${id}`);
      showNotification("Duyệt đơn hàng thành công!", "success");
      const updatedOrders = await axios.get('http://localhost:5261/api/orders');
      setOrders(updatedOrders.data);
      handleTabChange(activeTab);
    } catch (error) {
      console.error('Error approving order:', error);
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi duyệt đơn hàng.";
      showNotification(errorMessage, "error");
    }
  };

  const openCancelModal = (id: number) => {
    setCancelOrderId(id);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      showNotification("Vui lòng nhập lý do hủy!", "error");
      return;
    }
    if (cancelOrderId === null) return;

    try {
      const response = await axios.put(
        `http://localhost:5261/api/orders/cancel/${cancelOrderId}`,
        cancelReason,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      showNotification("Hủy đơn hàng thành công!", "success");
      setShowCancelModal(false);
      setCancelReason('');
      setCancelOrderId(null);
      const updatedOrders = await axios.get('http://localhost:5261/api/orders');
      setOrders(updatedOrders.data);
      handleTabChange(activeTab);
    } catch (error) {
      console.error('Error canceling order:', error);
      showNotification(error.response?.data?.message || "Có lỗi xảy ra khi hủy đơn hàng.", "error");
    }
  };

  const openDetailsModal = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  // Hàm chọn lý do gợi ý
  const handleReasonSuggestionClick = (reason: string) => {
    setCancelReason(reason);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {notification.isVisible && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: 'info', isVisible: false })}
        />
      )}

      <h1 className="text-2xl font-semibold mb-4">Đơn hàng</h1>
      <Tabs defaultValue="completed" onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="unconfirmed">Chưa xác nhận</TabsTrigger>
          <TabsTrigger value="processing">Đang xử lý</TabsTrigger>
          <TabsTrigger value="delivering">Đang giao</TabsTrigger>
          <TabsTrigger value="completed">Hoàn thành</TabsTrigger>
          <TabsTrigger value="canceled">Đã hủy</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Tên khách hàng</TableHead>
              <TableHead>Tên sản phẩm/Combo</TableHead>
              <TableHead>Ngày đặt</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thanh toán</TableHead>
              <TableHead>Hình thức thanh toán</TableHead>
              {activeTab === 'canceled' && <TableHead>Lý do hủy</TableHead>}
              <TableHead className="text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map(order => (
              <TableRow key={order.maDonHang} className="hover:bg-gray-50">
                <TableCell>{order.maDonHang}</TableCell>
                <TableCell>{order.tenNguoiNhan}</TableCell>
                <TableCell>{order.tenSanPhamHoacCombo}</TableCell>
                <TableCell>
                  {order.ngayDat
                    ? new Date(order.ngayDat.split('/').reverse().join('-')).toLocaleDateString('vi-VN')
                    : 'Không có ngày'}
                </TableCell>
                <TableCell>
                  {order.trangThaiDonHang === 0 && 'Chưa xác nhận'}
                  {order.trangThaiDonHang === 1 && 'Đang xử lý'}
                  {order.trangThaiDonHang === 2 && 'Đang giao hàng'}
                  {order.trangThaiDonHang === 3 && 'Hoàn thành'}
                  {order.trangThaiDonHang === 4 && 'Đã hủy'}
                </TableCell>
                <TableCell>
                  {order.trangThaiThanhToan === 1 && order.trangThaiDonHang === 3 ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </TableCell>
                <TableCell>{order.hinhThucThanhToan || 'COD'}</TableCell>
                {activeTab === 'canceled' && <TableCell>{order.lyDoHuy || 'Không có lý do'}</TableCell>}
                <TableCell className="text-center">
                  <div className="flex justify-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openDetailsModal(order)}>
                      <Ellipsis className="h-4 w-4" />
                    </Button>
                    {(order.trangThaiDonHang === 0 || order.trangThaiDonHang === 1 || order.trangThaiDonHang === 2) && (
                      <Button variant="default" size="sm" onClick={() => handleApprove(order.maDonHang)}>
                        Duyệt đơn
                      </Button>
                    )}
                    {(order.trangThaiDonHang === 0 || order.trangThaiDonHang === 1) && (
                      <Button variant="destructive" size="sm" onClick={() => openCancelModal(order.maDonHang)}>
                        Hủy đơn
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {showDetailsModal && selectedOrder && (
        <OrderDetailsModal
          orderId={selectedOrder.maDonHang}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nhập lý do hủy đơn hàng</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* Ô nhập lý do */}
            <Input
              type="text"
              placeholder="Lý do hủy"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full"
            />
            {/* Danh sách gợi ý lý do hủy */}
            <div className="space-y-2">
              <p className="text-sm font-semibold">Chọn lý do gợi ý:</p>
              <div className="flex flex-wrap gap-2">
                {cancelReasonsSuggestions.map((reason, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleReasonSuggestionClick(reason)}
                    className={`text-sm ${cancelReason === reason ? 'bg-gray-200' : ''}`}
                  >
                    {reason}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>
              Đóng
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              Xác nhận hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderList;