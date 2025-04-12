import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipboardList, Package, Truck, CheckCircle, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// Define order statuses and their corresponding components
const orderStatuses = {
  pending: { color: "bg-yellow-500", icon: ClipboardList, label: "Chờ xác nhận" },
  processing: { color: "bg-blue-500", icon: Package, label: "Đang xử lý" },
  shipping: { color: "bg-purple-500", icon: Truck, label: "Đang giao hàng" },
  completed: { color: "bg-green-500", icon: CheckCircle, label: "Đã hoàn thành" },
  canceled: { color: "bg-red-500", icon: CheckCircle, label: "Đã hủy" },
} as const;

// Define type for status based on orderStatuses keys
type OrderStatus = keyof typeof orderStatuses;

// Define order interface
interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
}

interface OrderItemProps {
  order: Order;
  onCancel: (orderId: string) => void;
}

const OrderItem = ({ order, onCancel }: OrderItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusInfo = orderStatuses[order.status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="border rounded-lg overflow-hidden mb-4 transition-all duration-200 hover:shadow-md">
      <div className="p-4 bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-medium">Mã đơn: {order.id}</span>
          <span className="text-sm text-muted-foreground">
            Ngày đặt: {new Date(order.date).toLocaleDateString('vi-VN')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={cn("w-3 h-3 rounded-full", statusInfo.color)}></span>
          <span className="text-sm font-medium flex items-center gap-1">
            <StatusIcon className="h-4 w-4" />
            {statusInfo.label}
          </span>
        </div>

        <div className="text-right">
          <div className="font-semibold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}</div>
          <span className="text-sm text-muted-foreground">{order.items.length} sản phẩm</span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" /> Thu gọn
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" /> Chi tiết
              </>
            )}
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-1" /> Theo dõi
          </Button>
          {(order.status === "pending" || order.status === "processing") && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onCancel(order.id)}
            >
              Hủy đơn
            </Button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t">
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Số lượng: {item.quantity} x {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                  </div>
                </div>
                <div className="font-medium">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.quantity * item.price)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between">
              <span>Tổng thanh toán:</span>
              <span className="font-bold text-lg">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const OrderHistory = () => {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const cancelReasonsSuggestions = [
    "Không muốn mua nữa",
    "Hết hàng",
    "Sai thông tin đơn hàng",
    "Khác"
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:5261/api/user/orders');
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = filterStatus === "all"
    ? orders
    : orders.filter(order => order.status === filterStatus);

  const handleCancelClick = (orderId: string) => {
    setCancelOrderId(orderId);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      alert("Vui lòng nhập lý do hủy!");
      return;
    }
    if (cancelOrderId === null) return;

    try {
      const orderIdNumber = parseInt(cancelOrderId.replace('ORD-', '')); // Chuyển đổi từ "ORD-00016" thành số 16
      await axios.put(
        `http://localhost:5261/api/user/orders/cancel/${orderIdNumber}`,
        cancelReason,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      alert("Hủy đơn hàng thành công!");
      setShowCancelModal(false);
      setCancelReason('');
      setCancelOrderId(null);
      const response = await axios.get('http://localhost:5261/api/user/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error canceling order:', error);
      alert(error.response?.data?.message || "Có lỗi xảy ra khi hủy đơn hàng.");
    }
  };

  const handleReasonSuggestionClick = (reason: string) => {
    setCancelReason(reason);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-secondary/30">
        <div className="max-w-4xl mx-auto my-[50px]">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight gradient-text">Lịch sử đơn hàng</h1>
            <p className="mt-2 text-muted-foreground">
              Xem và quản lý các đơn hàng của bạn
            </p>
          </div>

          <div className="colorful-card p-6 rounded-lg shadow-lg">
            <Tabs defaultValue="all-orders" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="all-orders">
                  <ClipboardList className="mr-2 h-4 w-4" /> Tất cả đơn hàng
                </TabsTrigger>
                <TabsTrigger value="tracking">
                  <Truck className="mr-2 h-4 w-4" /> Theo dõi đơn hàng
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all-orders">
                <div className="mb-6 flex justify-between items-center">
                  <h2 className="text-lg font-medium">Đơn hàng của bạn</h2>
                  <div className="w-48">
                    <Select
                      value={filterStatus}
                      onValueChange={setFilterStatus}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="pending">Chờ xác nhận</SelectItem>
                        <SelectItem value="processing">Đang xử lý</SelectItem>
                        <SelectItem value="shipping">Đang giao hàng</SelectItem>
                        <SelectItem value="completed">Đã hoàn thành</SelectItem>
                        <SelectItem value="canceled">Đã hủy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {filteredOrders.length > 0 ? (
                  <div className="space-y-4">
                    {filteredOrders.map(order => (
                      <OrderItem
                        key={order.id}
                        order={order}
                        onCancel={handleCancelClick}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg">
                    <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Không có đơn hàng nào</h3>
                    <p className="text-muted-foreground">
                      Bạn chưa có đơn hàng nào trong trạng thái này
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="tracking">
                <div className="mb-6">
                  <h2 className="text-lg font-medium mb-4">Tra cứu đơn hàng</h2>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Nhập mã đơn hàng của bạn"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <Button className="gradient-bg">
                      <Eye className="mr-2 h-4 w-4" /> Kiểm tra
                    </Button>
                  </div>
                </div>

                <div className="text-center py-12 border rounded-lg">
                  <Truck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Nhập mã đơn hàng để kiểm tra</h3>
                  <p className="text-muted-foreground">
                    Bạn có thể tra cứu tình trạng đơn hàng bằng mã đơn hàng
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />

      {/* Modal hủy đơn hàng */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nhập lý do hủy đơn hàng</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Input
              type="text"
              placeholder="Lý do hủy"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full"
            />
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

export default OrderHistory;