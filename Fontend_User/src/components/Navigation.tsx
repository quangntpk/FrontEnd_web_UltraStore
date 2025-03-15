
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Menu, X, LogIn, UserPlus, User, ShoppingCart, ClipboardList, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast, ToastContent, ToastOptions } from "react-toastify";
import axios from "axios";

  const navItems = [
    {
      name: "Products",
      path: "/products"
    }, 
    {
      name: "Features",
      path: "#features"
    }, 
    {
      name: "Pricing",
      path: "#pricing"
    }, 
    {
      name: "About",
      path: "#about"
    }, 
    {
      name: "Contact",
      path: "#contact"
    }
  ];

  const Navigation = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
    const navigate = useNavigate();
    useEffect(() => {
      const handleScroll = () => {
        setScrolled(window.scrollY > 10);
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);
  

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5261/api/XacThuc/DangXuat",
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
    } catch (error) {
      console.error("Logout error:", error.response?.data?.message || error.message);
    }

    window.parent.postMessage({ type: "LOGOUT" }, "http://localhost:8080");

    localStorage.removeItem("token");
    localStorage.removeItem("userId")
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    toast.success("Đăng xuất thành công 🎉\nBạn đã đăng xuất khỏi tài khoản.", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      className: "bg-green-500 text-white border border-green-700 shadow-lg p-4 rounded-md",
    });
    console.log("Toast should be displayed");
    navigate("/login");
    setIsOpen(false);
  };

  return ( 
  <header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300", scrolled ? "glass py-3" : "py-5")}>
      <div className="container px-6 mx-auto flex items-center justify-between bg-slate-50 rounded-xl">
        <Link to="/" className="relative z-10">
          <span className="text-xl font-medium tracking-tight gradient-text">Minimalist</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 rounded-none">
          {navItems.map(item => <Link key={item.name} to={item.path} className="text-sm hover-effect opacity-80 hover:opacity-100 relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full">
              {item.name}
            </Link>)}
        </nav>
        
        {/* Auth Buttons - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/cart">
            <Button variant="outline" size="sm" className="hover-effect">
              <ShoppingCart className="mr-2 h-4 w-4" /> Giỏ hàng
            </Button>
          </Link>
          <Link to="/order-history">
            <Button variant="outline" size="sm" className="hover-effect">
              <ClipboardList className="mr-2 h-4 w-4" /> Đơn hàng
            </Button>
          </Link>
          {isLoggedIn ? (
            <Button
              variant="ghost"
              size="sm"
              className="hover-effect"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
            </Button>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="sm" className="hover-effect">
                <LogIn className="mr-2 h-4 w-4" /> Đăng nhập
              </Button>
            </Link>
          )}
          <Link to="/register">
            <Button size="sm" className="gradient-bg hover-effect">
              <UserPlus className="mr-2 h-4 w-4" /> Đăng ký
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="outline" size="sm" className="hover-effect">
              <User className="mr-2 h-4 w-4" /> Tài khoản
            </Button>
          </Link>
        </div>
        
        {/* Mobile Menu Button */}
        <button className="md:hidden relative z-10 p-2 rounded-full hover:bg-primary/5 transition-colors" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        
        {/* Mobile Menu */}
        <div className={cn("fixed inset-0 bg-background bg-gradient-to-br from-white to-secondary/50", "flex flex-col items-center justify-center gap-8", "transition-all duration-500 ease-out", isOpen ? "opacity-100 visible" : "opacity-0 invisible")}>
          {navItems.map((item, index) => <Link key={item.name} to={item.path} className={cn("text-2xl font-medium", "hover-effect opacity-80 hover:opacity-100", "transition-all duration-300 ease-out", isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")} style={{
          transitionDelay: `${index * 50}ms`
        }} onClick={() => setIsOpen(false)}>
              {item.name}
            </Link>)}
          
          {/* Auth Buttons - Mobile */}
          <div className="flex flex-col gap-4 mt-4 w-full max-w-xs">
            <Link to="/cart" className={cn("w-full", "transition-all duration-300 ease-out", isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")} style={{
            transitionDelay: `${navItems.length * 50}ms`
          }} onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full hover-effect">
                <ShoppingCart className="mr-2 h-4 w-4" /> Giỏ hàng
              </Button>
            </Link>
            <Link to="/order-history" className={cn("w-full", "transition-all duration-300 ease-out", isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")} style={{
            transitionDelay: `${navItems.length * 50 + 50}ms`
          }} onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full hover-effect">
                <ClipboardList className="mr-2 h-4 w-4" /> Đơn hàng
              </Button>
            </Link>
            <Link to="/login" className={cn("w-full", "transition-all duration-300 ease-out", isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")} style={{
            transitionDelay: `${navItems.length * 50 + 100}ms`
          }} onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full hover-effect">
                <LogIn className="mr-2 h-4 w-4" /> Đăng nhập
              </Button>
            </Link>
            <Link to="/register" className={cn("w-full", "transition-all duration-300 ease-out", isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")} style={{
            transitionDelay: `${(navItems.length + 1) * 50 + 100}ms`
          }} onClick={() => setIsOpen(false)}>
              <Button className="w-full gradient-bg hover-effect">
                <UserPlus className="mr-2 h-4 w-4" /> Đăng ký
              </Button>
            </Link>
            <Link to="/profile" className={cn("w-full", "transition-all duration-300 ease-out", isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")} style={{
            transitionDelay: `${(navItems.length + 2) * 50 + 100}ms`
          }} onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full hover-effect">
                <User className="mr-2 h-4 w-4" /> Tài khoản
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;