import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { Link, useNavigate } from "react-router-dom";
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
  tenNguoiNhan: string;
  hinhThucThanhToan: string; 
  lyDoHuy?: string; 
  sdt: string;
}

interface OrderItemProps {
  order: Order;
  onCancel: (orderId: string) => void;
}

const OrderItem = ({ order, onCancel }: OrderItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusInfo = orderStatuses[order.status] || orderStatuses.pending;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="border rounded-lg overflow-hidden mb-4 transition-all duration-200 hover:shadow-md">
      <div className="p-4 bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-medium">Mã đơn hàng: {order.id || "N/A"}</span>
          <span className="text-sm text-muted-foreground">
            Người nhận: {order.tenNguoiNhan || "N/A"}
          </span>
          <span className="text-sm text-muted-foreground">
            Ngày đặt: {order.date ? new Date(order.date).toLocaleDateString('vi-VN') : "N/A"}
          </span>   
          <span className="text-sm text-muted-foreground">
            SĐT: {order.sdt || "N/A"}
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
          <div className="font-semibold">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total || 0)}
          </div>
          <span className="text-sm text-muted-foreground">
            {order.items?.length || 0} sản phẩm
          </span>
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
            {(order.items || []).map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                  <img
                    src={item.image || "https://via.placeholder.com/150"}
                    alt={item.name || "Sản phẩm"}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.name || "N/A"}</div>
                  <div className="text-sm text-muted-foreground">
                    Số lượng: {item.quantity || 0} x {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price || 0)}
                  </div>
                </div>
                <div className="font-medium">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((item.quantity || 0) * (item.price || 0))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between">
              <span>Tổng thanh toán:</span>
              <span className="font-bold text-lg">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total || 0)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const OrderHistory = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const cancelReasonsSuggestions = [
    "Không muốn mua nữa",
    "Hết hàng",
    "Sai thông tin đơn hàng",
    "Khác"
  ];

  const mapStatus = (status: number): OrderStatus => {
    switch (status) {
      case 0:
        return "pending";
      case 1:
        return "processing";
      case 2:
        return "shipping";
      case 3:
        return "completed";
      case 4:
        return "canceled";
      default:
        return "pending";
    }
  };

  const fetchOrdersByUserId = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId || userId === "null" || userId === "undefined") {
        alert("Vui lòng đăng nhập để xem lịch sử đơn hàng!");
        navigate("/login");
        return;
      }

      const response = await axios.get(`http://localhost:5261/api/orders/${userId}`);
      const rawOrders = response.data;
      if (!Array.isArray(rawOrders)) {
        console.error("API did not return an array:", rawOrders);
        setOrders([]);
        return;
      }

      const mappedOrders = rawOrders.map((rawOrder: any) => {
        let formattedDate = "";
        if (rawOrder.ngayDat && typeof rawOrder.ngayDat === "string") {
          const [day, month, year] = rawOrder.ngayDat.split("/");
          formattedDate = `${year}-${month}-${day}`;
        }

        return {
          id: rawOrder.maDonHang.toString(),
          date: formattedDate,
          status: mapStatus(rawOrder.trangThaiDonHang),
          total: rawOrder.tongTien,
          items: rawOrder.sanPhams.map((item: any) => ({
            id: item.maChiTietDhPues,
            name: item.tenSanPham,
            quantity: item.soLuong,
            price: item.gia,
            image: item.hinhAnh || "https://via.placeholder.com/150",
          })),
          tenNguoiNhan: rawOrder.tenNguoiNhan,
          hinhThucThanhToan: rawOrder.hinhThucThanhToan,
          sdt: rawOrder.thongTinNguoiDung.sdt,
          lyDoHuy: rawOrder.lyDoHuy,
        };
      });

      setOrders(mappedOrders);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      alert(error.response?.data?.message || "Đã xảy ra lỗi khi tải lịch sử đơn hàng!");
      setOrders([]);
    }
  };

  const searchOrders = async (query: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Vui lòng đăng nhập để tra cứu đơn hàng!");
        navigate("/login");
        return;
      }

      const response = await axios.get('http://localhost:5261/api/user/orders/search', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          query: query || undefined,
        },
      });

      const rawOrders = response.data;
      if (!Array.isArray(rawOrders)) {
        console.error("API did not return an array:", rawOrders);
        setOrders([]);
        return;
      }

      const mappedOrders = rawOrders.map((rawOrder: any) => ({
        id: rawOrder.id,
        date: rawOrder.date,
        status: rawOrder.status,
        total: rawOrder.total,
        items: rawOrder.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
        })),
        tenNguoiNhan: rawOrder.tenNguoiNhan,
        hinhThucThanhToan: rawOrder.hinhThucThanhToan,
        sdt: rawOrder.sdt,
        lyDoHuy: rawOrder.lyDoHuy,
      }));

      setOrders(mappedOrders);
    } catch (error: any) {
      console.error("Error searching orders:", error);
      if (error.response?.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        alert(error.response?.data?.message || "Đã xảy ra lỗi khi tra cứu đơn hàng!");
        setOrders([]);
      }
    }
  };

  useEffect(() => {
    fetchOrdersByUserId();
  }, [navigate]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      alert("Vui lòng nhập mã đơn hàng để tìm kiếm!");
      return;
    }
    searchOrders(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

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
      const orderIdNumber = parseInt(cancelOrderId);
      await axios.put(
        `http://localhost:5261/api/orders/cancel/${orderIdNumber}`,
        cancelReason,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Hủy đơn hàng thành công!");
      setShowCancelModal(false);
      setCancelReason('');
      setCancelOrderId(null);
      fetchOrdersByUserId(); // Gọi lại API để cập nhật danh sách
    } catch (error: any) {
      console.error("Error canceling order:", error);
      if (error.response?.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        alert(error.response?.data?.message || "Có lỗi xảy ra khi hủy đơn hàng.");
      }
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
                    <Input
                      type="text"
                      placeholder="Nhập mã đơn hàng của bạn"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button onClick={handleSearch} className="gradient-bg">
                      <Eye className="mr-2 h-4 w-4" /> Kiểm tra
                    </Button>
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
                    <Truck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Không tìm thấy đơn hàng</h3>
                    <p className="text-muted-foreground">
                      Vui lòng nhập mã đơn hàng để kiểm tra
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />

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