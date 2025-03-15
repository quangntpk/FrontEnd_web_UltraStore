
import { useState } from "react";
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

// Define order statuses and their corresponding components
const orderStatuses = {
  "pending": { color: "bg-yellow-500", icon: ClipboardList, label: "Chờ xác nhận" },
  "processing": { color: "bg-blue-500", icon: Package, label: "Đang xử lý" },
  "shipping": { color: "bg-purple-500", icon: Truck, label: "Đang giao hàng" },
  "completed": { color: "bg-green-500", icon: CheckCircle, label: "Đã hoàn thành" },
};

// Mock data for the orders
const mockOrders = [
  {
    id: "ORD-12345",
    date: "2023-10-15",
    status: "completed",
    total: 2500000,
    items: [
      { id: 1, name: "Áo Polo Nam", quantity: 2, price: 450000, image: "/placeholder.svg" },
      { id: 2, name: "Quần Jeans", quantity: 1, price: 1600000, image: "/placeholder.svg" },
    ]
  },
  {
    id: "ORD-12346",
    date: "2023-11-20",
    status: "shipping",
    total: 3200000,
    items: [
      { id: 3, name: "Giày Thể Thao", quantity: 1, price: 2200000, image: "/placeholder.svg" },
      { id: 4, name: "Tất Nam", quantity: 2, price: 500000, image: "/placeholder.svg" },
    ]
  },
  {
    id: "ORD-12347",
    date: "2023-12-05",
    status: "processing",
    total: 1800000,
    items: [
      { id: 5, name: "Áo Khoác", quantity: 1, price: 1800000, image: "/placeholder.svg" },
    ]
  },
  {
    id: "ORD-12348",
    date: "2024-01-10",
    status: "pending",
    total: 4500000,
    items: [
      { id: 6, name: "Đồng Hồ Nam", quantity: 1, price: 3500000, image: "/placeholder.svg" },
      { id: 7, name: "Dây Nịt", quantity: 1, price: 1000000, image: "/placeholder.svg" },
    ]
  },
];

interface OrderItemProps {
  order: {
    id: string;
    date: string;
    status: keyof typeof orderStatuses;
    total: number;
    items: Array<{
      id: number;
      name: string;
      quantity: number;
      price: number;
      image: string;
    }>;
  };
}

const OrderItem = ({ order }: OrderItemProps) => {
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
  
  const filteredOrders = filterStatus === "all" 
    ? mockOrders 
    : mockOrders.filter(order => order.status === filterStatus);

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
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {filteredOrders.length > 0 ? (
                  <div className="space-y-4">
                    {filteredOrders.map(order => (
                      <OrderItem key={order.id} order={order} />
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
    </div>
  );
};

export default OrderHistory;
