import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
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
import DiaChi from "./pages/DiaChi";

// Scroll restoration component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
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
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
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
          <Route path="/DiaChi" element={<DiaChi />} />
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