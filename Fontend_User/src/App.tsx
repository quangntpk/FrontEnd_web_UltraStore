import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import ProductListing from "./pages/ProductListing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import Contact from "./components/Contact";
import Voucher from "./components/Voucher";
import YeuThich from "./components/YeuThich";
import OrderHistory from "./pages/OrderHistory";
import NotFound from "./pages/NotFound";
import Message from "./pages/Message";
import Inpaint from "./pages/Inpaint";
import ComboDetail from "./pages/ComboDetail";
import SupportChat from "./components/SupportChat"; // Import component SupportChat
import ComboListing from "./pages/ComboListing";
import DiaChi from "./pages/DiaChi";
import Comment from "./pages/Comment"; 
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFail from "./pages/PaymentFail";

// Scroll restoration component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Component xử lý Google callback
const GoogleCallbackHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log("GoogleCallbackHandler useEffect triggered. Location:", location);
    console.log("location.search:", location.search);

    const searchParams = new URLSearchParams(location.search);
    console.log("searchParams:", searchParams.toString());

    const token = searchParams.get("token");
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");
    const name = searchParams.get("name");
    const role = parseInt(searchParams.get("role"), 10);

    console.log("Google Callback in App:", { token, userId, email, name, role });

    if (token && userId) {
      // Lưu vào localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("user", JSON.stringify({
        maNguoiDung: userId,
        email,
        hoTen: name,
        vaiTro: role,
      }));

      console.log("Data saved to localStorage:", {
        token: localStorage.getItem("token"),
        userId: localStorage.getItem("userId"),
        user: localStorage.getItem("user"),
      });

      // Phát sự kiện tùy chỉnh để thông báo rằng localStorage đã thay đổi
      window.dispatchEvent(new Event("storageChange"));

      toast({
        title: "Đăng nhập Google thành công 🎉",
        description: "Chào mừng bạn quay trở lại!",
        duration: 3000,
        className: "bg-green-500 text-white border border-green-700 shadow-lg",
      });

      navigate(location.pathname, { replace: true });
      navigate(role === 1 ? "/admin" : "/");
    // } else if (location.search) {
    //   console.log("Missing token or userId in query string");
    //   toast({
    //     variant: "destructive",
    //     title: "Lỗi đăng nhập Google ⚠️",
    //     description: "Không thể lấy thông tin đăng nhập từ Google.",
    //     duration: 3000,
    //     className: "bg-red-500 text-white border border-red-700 shadow-lg",
    //   });
    } else {
      console.log("No query string present");
    }
  }, [location.search, navigate, toast]);

  return null;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <GoogleCallbackHandler />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/google-callback" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="/Voucher" element={<Voucher />} />
          <Route path="/YeuThich" element={<YeuThich />} />
          <Route path="/message" element={<Message />} />
          <Route path="/inpaint" element={<Inpaint />} />
          <Route path="/message" element={<Message />} />
          <Route path="/inpaint" element={<Inpaint />} />
          <Route path="/combo" element={<ComboListing />} />
          <Route path="/DiaChi" element={<DiaChi />} />
          <Route path="/Comment" element={<Comment />} />
          <Route path="/PaymentSuccess" element={<PaymentSuccess />} />
          <Route path="/PaymentFail" element={<PaymentFail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="/combo/:id" element={<ComboDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <SupportChat /> {/* Hộp thoại hỗ trợ luôn hiển thị */}
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;