import { useState } from "react";
import { Link, redirect, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, LogIn, Mail } from "lucide-react";
import axios from "axios";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Login = () => {
  const [taiKhoan, setTaiKhoan] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast, dismiss } = useToast();
  const navigate = useNavigate();;

  // Xử lý đăng nhập với API
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:5261/api/XacThuc/DangNhap", {
        taiKhoan,
        matKhau: password,
      });

    const { message, user, token, redirectUrl } = response.data;

    if (user && user.maNguoiDung) {
      localStorage.setItem("userId", user.maNguoiDung);
      localStorage.setItem("token", token);
      localStorage.setItem("user",JSON.stringify(user));
    }
      const toastId = toast({
        title: "Đăng nhập thành công 🎉",
        description: message || "Chào mừng bạn quay trở lại!",
        duration: 3000,
        className: "bg-green-500 text-white border border-green-700 shadow-lg",
        action: (
          <Button
            variant="outline"
            className="bg-white text-green-500 hover:bg-green-100 border-green-500"
          >
            Đóng
          </Button>
        ),
      });
      if (redirectUrl && redirectUrl !== window.location.origin) {
        // Chuyển hướng sang admin app với token trong query string
        window.location.href = `${redirectUrl}?token=${token}`;
      } else {
        // Ở lại ứng dụng user và điều hướng nội bộ
        navigate("/");
      }
    } catch (error) {
      const toastId = toast({
        variant: "destructive",
        title: "Đăng nhập thất bại ⚠️",
        description: error.response?.data?.message || "Vui lòng kiểm tra lại thông tin.",
        duration: 3000,
        className: "bg-red-500 text-white border border-red-700 shadow-lg",
        action: (
          <Button
            variant="outline"
            className="bg-white text-red-500 hover:bg-red-100 border-red-500"
          >
            Đóng
          </Button>
        ),
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-secondary/30">
        <div className="w-full max-w-md space-y-8 my-[50px]">
          <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight gradient-text" style={{ paddingBottom: '0.9rem' }}>Đăng nhập</h1>

            <p className="mt-2 text-muted-foreground">
              Đăng nhập để khám phá các sản phẩm thời trang đặc biệt
            </p>
          </div>

          <div className="colorful-card p-6 rounded-lg shadow-lg">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-2">
                <Label htmlFor="taiKhoan">Tài khoản</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="taiKhoan"
                    placeholder="Nhập tài khoản"
                    type="text"
                    value={taiKhoan}
                    onChange={(e) => setTaiKhoan(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Link to="/forgotpassword" className="text-sm text-primary hover:underline">
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                  <Input
                    id="password"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full gradient-bg" disabled={isLoading}>
                {isLoading ? (
                  "Đang đăng nhập..."
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" /> Đăng nhập
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Hoặc tiếp tục với
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button variant="outline" type="button" className="hover-effect">
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  Google
                </Button>
                <Button variant="outline" type="button" className="hover-effect">
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      fill="#1877F2"
                    />
                    <path
                      d="M15.893 14.89l.443-2.89h-2.773v-1.876c0-.791.387-1.562 1.63-1.562h1.26v-2.46s-1.144-.195-2.238-.195c-2.285 0-3.777 1.384-3.777 3.89V12h-2.54v2.89h2.54v6.988C11.331 21.965 11.664 22 12 22s.669-.035.997-.082v-6.988h2.896z"
                      fill="white"
                    />
                  </svg>
                  Facebook
                </Button>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;