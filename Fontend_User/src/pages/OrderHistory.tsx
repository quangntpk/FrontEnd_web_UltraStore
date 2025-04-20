import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import Comment from "./Comment";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipboardList, Package, Truck, CheckCircle, Eye, ChevronDown, ChevronUp, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Component Notification
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={cn(
        "fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 font-roboto",
        type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
      )}
    >
      <p>{message}</p>
      <button
        onClick={onClose}
        className="absolute top-1 right-1 text-white hover:text-gray-200"
      >
        ×
      </button>
    </div>
  );
};

const orderStatuses = {
  pending: { color: "bg-yellow-500", icon: ClipboardList, label: "Chờ xác nhận" },
  processing: { color: "bg-blue-500", icon: Package, label: "Đang xử lý" },
  shipping: { color: "bg-purple-500", icon: Truck, label: "Đang giao hàng" },
  completed: { color: "bg-green-500", icon: CheckCircle, label: "Đã hoàn thành" },
  canceled: { color: "bg-red-500", icon: CheckCircle, label: "Đã hủy" },
} as const;

type OrderStatus = keyof typeof orderStatuses;

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
    combo: boolean;
  }>;
  tenNguoiNhan: string;
  hinhThucThanhToan: string;
  lyDoHuy?: string;
  sdt: string;
}

interface CommentState {
  productId: number;
  content: string;
  rating: number;
}

interface Comment {
  maBinhLuan: number;
  maSanPham: string;
  maNguoiDung: number;
  noiDungBinhLuan: string;
  soTimBinhLuan: number;
  danhGia: number;
  trangThai: number;
  ngayBinhLuan: string;
}

interface OrderItemProps {
  order: Order;
  onCancel: (orderId: string) => void;
  onAddComment: (orderId: string, productId: number, content: string, rating: number) => Promise<boolean>;
  commentedProducts: Set<number>;
}

const OrderItem = ({ order, onCancel, onAddComment, commentedProducts }: OrderItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentStates, setCommentStates] = useState<{ [key: number]: CommentState }>({});
  const [isCommenting, setIsCommenting] = useState<{ [key: number]: boolean }>({});
  const statusInfo = orderStatuses[order.status] || orderStatuses.pending;
  const StatusIcon = statusInfo.icon;

  const handleCommentChange = (productId: number, field: keyof CommentState, value: string | number) => {
    setCommentStates((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  const handleAddComment = async (productId: number) => {
    const comment = commentStates[productId];
    if (!comment || !comment.content || comment.rating < 1 || comment.rating > 5) {
      alert("Vui lòng nhập nội dung bình luận và chọn đánh giá từ 1 đến 5 sao!");
      return;
    }

    setIsCommenting((prev) => ({ ...prev, [productId]: true }));
    const success = await onAddComment(order.id, productId, comment.content, comment.rating);
    if (success) {
      setCommentStates((prev) => ({
        ...prev,
        [productId]: { productId, content: "", rating: 0 },
      }));
    }
    setIsCommenting((prev) => ({ ...prev, [productId]: false }));
  };

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
              <div key={item.id} className="flex flex-col gap-4">
                <a
                  href={`http://localhost:8080/${item.combo ? 'combo' : 'product'}/${item.id}`}
                  className="flex items-center gap-4"
                >
                  <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                    <img
                      src={`data:image/jpeg;base64,${item.image}`}
                      alt={item.combo ? 'Combo Preview' : 'Product Preview'}
                      className="mt-2 w-24 h-24 object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.name || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">
                      Số lượng: {item.quantity || 0} x{' '}
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price || 0)}
                    </div>
                  </div>
                  <div className="font-medium">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                      (item.quantity || 0) * (item.price || 0)
                    )}
                  </div>
                </a>
                {order.status === "completed" && !commentedProducts.has(item.id) && (
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-medium mb-4">Viết bình luận cho {item.name}</h3>
                    <div className="flex items-center mb-4">
                      <span className="mr-2">Đánh giá:</span>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={cn(
                            "w-6 h-6 cursor-pointer",
                            index < (commentStates[item.id]?.rating || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          )}
                          onClick={() => handleCommentChange(item.id, "rating", index + 1)}
                        />
                      ))}
                    </div>
                    <Textarea
                      value={commentStates[item.id]?.content || ""}
                      onChange={(e) => handleCommentChange(item.id, "content", e.target.value)}
                      placeholder="Nhập bình luận của bạn..."
                      className="w-full p-3 border rounded-md mb-4"
                      rows={4}
                      disabled={isCommenting[item.id]}
                    />
                    <Button
                      onClick={() => handleAddComment(item.id)}
                      className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
                      disabled={isCommenting[item.id]}
                    >
                      {isCommenting[item.id] ? "Đang gửi..." : "Gửi Bình Luận"}
                    </Button>
                  </div>
                )}
                {order.status === "completed" && commentedProducts.has(item.id) && (
                  <p className="text-muted-foreground">Bạn đã bình luận cho sản phẩm này.</p>
                )}
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
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [commentedProducts, setCommentedProducts] = useState<Set<number>>(new Set());

  const cancelReasonsSuggestions = [
    "Không muốn mua nữa",
    "Hết hàng",
    "Sai thông tin đơn hàng",
    "Khác"
  ];

  const mapStatus = (status: number): OrderStatus => {
    switch (status) {
      case 0: return "pending";
      case 1: return "processing";
      case 2: return "shipping";
      case 3: return "completed";
      case 4: return "canceled";
      default: return "pending";
    }
  };

  const fetchOrdersByUserId = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const maNguoiDung = userData?.maNguoiDung;
      if (!maNguoiDung) {
        setNotification({ message: "Vui lòng đăng nhập để xem lịch sử đơn hàng!", type: "error" });
        navigate("/login");
        return;
      }

      const response = await axios.get(`http://localhost:5261/api/user/orders/${maNguoiDung}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
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
            id: item.maSanPham,
            name: item.tenSanPham,
            quantity: item.soLuong,
            price: item.gia,
            image: item.anh || "https://via.placeholder.com/150",
            combo: item.laCombo
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
      setNotification({ message: error.response?.data?.message || "Đã xảy ra lỗi khi tải lịch sử đơn hàng!", type: "error" });
      setOrders([]);
    }
  };

  const fetchCommentedProducts = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const maNguoiDung = userData?.maNguoiDung;
      if (!maNguoiDung) {
        setNotification({ message: "Vui lòng đăng nhập để kiểm tra bình luận!", type: "error" });
        navigate("/login");
        return;
      }

      const likedCommentsKey = `likedComments_${maNguoiDung}`;
      const storedCommentedProducts = JSON.parse(localStorage.getItem(likedCommentsKey)) || [];
      setCommentedProducts(new Set(storedCommentedProducts));

      const response = await axios.get("http://localhost:5261/api/Comment/list", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const comments: Comment[] = response.data;
      const userComments = comments.filter((comment) => comment.maNguoiDung === parseInt(maNguoiDung));
      const apiCommentedProductIds = new Set(userComments.map((comment) => parseInt(comment.maSanPham)));

      const mergedCommentedProductIds = new Set([...apiCommentedProductIds, ...storedCommentedProducts]);
      setCommentedProducts(mergedCommentedProductIds);
      localStorage.setItem(likedCommentsKey, JSON.stringify([...mergedCommentedProductIds]));
    } catch (error) {
      console.error("Error fetching commented products:", error);
      setNotification({ message: "Đã xảy ra lỗi khi kiểm tra bình luận!", type: "error" });
    }
  };

  const handleAddComment = async (orderId: string, productId: number, content: string, rating: number) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const maNguoiDung = userData?.maNguoiDung;
      const token = localStorage.getItem("token");

      if (!maNguoiDung) {
        setNotification({ message: "Vui lòng đăng nhập để thêm bình luận!", type: "error" });
        navigate("/login");
        return false;
      }

      if (!token) {
        setNotification({ message: "Token xác thực không tồn tại. Vui lòng đăng nhập lại!", type: "error" });
        navigate("/login");
        return false;
      }

      if (!content.trim() || rating < 1 || rating > 5) {
        setNotification({ message: "Vui lòng nhập nội dung bình luận và chọn đánh giá từ 1 đến 5 sao!", type: "error" });
        return false;
      }

      const maDonHang = orderId.replace("ORD-", "");
      const commentData = {
        maSanPham: productId.toString(),
        maNguoiDung: maNguoiDung, // Không sử dụng parseInt để đồng bộ với Comments
        noiDungBinhLuan: content,
        danhGia: rating,
        ngayBinhLuan: new Date().toISOString(),
        trangThai: 0,
        soTimBinhLuan: 0,
        maDonHang: maDonHang
      };

      console.log("Sending comment data:", commentData);

      const response = await axios.post("http://localhost:5261/api/Comment/add", commentData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("API response:", response.data);

      if (response.status === 201) {
        setCommentedProducts((prev) => {
          const newSet = new Set(prev);
          newSet.add(productId);
          const likedCommentsKey = `likedComments_${maNguoiDung}`;
          localStorage.setItem(likedCommentsKey, JSON.stringify([...newSet]));
          return newSet;
        });
        setNotification({ message: "Bình luận của bạn đã được ghi lại và đang chờ duyệt!", type: "success" });
        await fetchCommentedProducts(); // Cập nhật danh sách sản phẩm đã bình luận
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error adding comment:", error);
      let errorMessage = "Có lỗi xảy ra khi thêm bình luận!";
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!";
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = `Lỗi server: ${error.response.status} - ${error.response.statusText}`;
        }
      } else if (error.request) {
        errorMessage = "Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng!";
      } else {
        errorMessage = `Lỗi: ${error.message}`;
      }
      setNotification({ message: errorMessage, type: "error" });
      return false;
    }
  };

  const searchOrders = async (query: string) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const maNguoiDung = userData?.maNguoiDung;
      if (!maNguoiDung) {
        setNotification({ message: "Vui lòng đăng nhập để tra cứu đơn hàng!", type: "error" });
        navigate("/login");
        return;
      }

      const response = await axios.get('http://localhost:5261/api/user/orders/search', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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
        id: rawOrder.maDonHang.toString(),
        date: rawOrder.ngayDat,
        status: mapStatus(rawOrder.trangThaiDonHang),
        total: rawOrder.tongTien,
        items: rawOrder.sanPhams.map((item: any) => ({
          id: item.maSanPham,
          name: item.tenSanPham,
          quantity: item.soLuong,
          price: item.gia,
          image: item.anh,
          combo: item.laCombo,
        })),
        tenNguoiNhan: rawOrder.tenNguoiNhan,
        hinhThucThanhToan: rawOrder.hinhThucThanhToan,
        sdt: rawOrder.thongTinNguoiDung.sdt,
        lyDoHuy: rawOrder.lyDoHuy,
      }));

      setOrders(mappedOrders);
    } catch (error: any) {
      console.error("Error searching orders:", error);
      const userData = JSON.parse(localStorage.getItem("user"));
      const maNguoiDung = userData?.maNguoiDung;
      if (error.response?.status === 401) {
        setNotification({ message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!", type: "error" });
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (maNguoiDung) {
          localStorage.removeItem(`likedComments_${maNguoiDung}`);
        }
        navigate("/login");
      } else {
        setNotification({ message: error.response?.data?.message || "Đã xảy ra lỗi khi tra cứu đơn hàng!", type: "error" });
        setOrders([]);
      }
    }
  };

  useEffect(() => {
    fetchOrdersByUserId();
    fetchCommentedProducts();
  }, [navigate]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setNotification({ message: "Vui lòng nhập mã đơn hàng để tìm kiếm!", type: "error" });
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
      setNotification({ message: "Vui lòng nhập lý do hủy!", type: "error" });
      return;
    }
    if (cancelOrderId === null) return;

    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const maNguoiDung = userData?.maNguoiDung;
      const orderIdNumber = parseInt(cancelOrderId.replace("ORD-", ""));
      if (isNaN(orderIdNumber)) {
        throw new Error("Mã đơn hàng không hợp lệ");
      }

      const response = await axios.put(
        `http://localhost:5261/api/user/orders/cancel/${orderIdNumber}`,
        cancelReason,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.isAccountLocked) {
        setNotification({ message: response.data.lockoutMessage || "Tài khoản của bạn đã bị khóa do hủy đơn hàng quá 3 lần.", type: "error" });
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (maNguoiDung) {
          localStorage.removeItem(`likedComments_${maNguoiDung}`);
        }
        navigate("/login");
      } else {
        setNotification({ message: response.data.message || "Hủy đơn hàng thành công!", type: "success" });
      }

      setShowCancelModal(false);
      setCancelReason('');
      setCancelOrderId(null);
      fetchOrdersByUserId();
    } catch (error: any) {
      console.error("Error canceling order:", error);
      const userData = JSON.parse(localStorage.getItem("user"));
      const maNguoiDung = userData?.maNguoiDung;
      if (error.response?.status === 401) {
        setNotification({ message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!", type: "error" });
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (maNguoiDung) {
          localStorage.removeItem(`likedComments_${maNguoiDung}`);
        }
        navigate("/login");
      } else {
        setNotification({ message: error.response?.data?.message || "Có lỗi xảy ra khi hủy đơn hàng.", type: "error" });
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
            {notification && (
              <Notification
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification(null)}
              />
            )}
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
                        onAddComment={handleAddComment}
                        commentedProducts={commentedProducts}
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
                        onAddComment={handleAddComment}
                        commentedProducts={commentedProducts}
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