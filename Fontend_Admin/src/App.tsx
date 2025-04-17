
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Analytics from "./pages/Analytics";
import Inventory from "./pages/inventory";
import Invoices from "./pages/Invoices";
import Settings from "./pages/Settings";
import Combos from "./pages/Combos.tsx";
import ThuongHieu from "./pages/ThuongHieu.tsx";
import LoaiSanPham from "./pages/LoaiSanPham.tsx";
import ProfileAdmin from "./pages/ProfileAdmin.tsx";
import Login from "./pages/Login";
import Giaodien from "./pages/Giaodien";
import KichThuoc from "./pages/KichThuoc.tsx";
import ProtectedRoute from "@/pages/ProtectedRoute.tsx";
// Create placeholder pages for the new routes
const Payments = () => <div className="p-4"><h1 className="text-2xl font-bold mb-4">Payments</h1><p>Payments management page coming soon.</p></div>;
const Marketing = () => <div className="p-4"><h1 className="text-2xl font-bold mb-4">Marketing</h1><p>Marketing management page coming soon.</p></div>;
const Messages = () => <div className="p-4"><h1 className="text-2xl font-bold mb-4">Messages</h1><p>Messages page coming soon.</p></div>;
const Chat = () => <div className="p-4"><h1 className="text-2xl font-bold mb-4">Chat</h1><p>Chat page coming soon.</p></div>;
const Calendar = () => <div className="p-4"><h1 className="text-2xl font-bold mb-4">Calendar</h1><p>Calendar page coming soon.</p></div>;
const Reports = () => <div className="p-4"><h1 className="text-2xl font-bold mb-4">Reports</h1><p>Reports page coming soon.</p></div>;
const HelpCenter = () => <div className="p-4"><h1 className="text-2xl font-bold mb-4">Help Center</h1><p>Help Center page coming soon.</p></div>;
const Favorites = () => <div className="p-4"><h1 className="text-2xl font-bold mb-4">Favorites</h1><p>Favorites page coming soon.</p></div>;
const Website = () => <div className="p-4"><h1 className="text-2xl font-bold mb-4">Website</h1><p>Website management page coming soon.</p></div>;
const Security = () => <div className="p-4"><h1 className="text-2xl font-bold mb-4">Security</h1><p>Security settings page coming soon.</p></div>;

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute allowedRoles={[1,2]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/products" element={<Products />} />
            <Route path="/ProfileAdmin" element={<ProfileAdmin/>} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/combos" element={<Combos/>} />
            <Route path="/loaisanpham" element={<LoaiSanPham/>} />
            <Route path="/thuonghieu" element={<ThuongHieu/>} />
            <Route path="/giaodien" element={<Giaodien/>} />
            {/* New routes */}
            <Route path="/payments" element={<Payments />} />
            <Route path="/marketing" element={<Marketing />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/website" element={<Website />} />
            <Route path="/security" element={<Security />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/invoices" element={<Invoices />} />
          </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
