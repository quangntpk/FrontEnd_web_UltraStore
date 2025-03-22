import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, LogIn, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Cookies from "js-cookie";

const LoginAdmin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    taiKhoan: "",
    matKhau: "",
  });

  // Xử lý thay đổi giá trị input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý đăng nhập bằng tài khoản và mật khẩu
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!credentials.taiKhoan) {
      toast.error("Tài khoản không được để trống");
      return;
    }

    if (!credentials.matKhau) {
      toast.error("Mật khẩu không được để trống");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5261/api/XacThuc/DangNhapAdmin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taiKhoan: credentials.taiKhoan,
          matKhau: credentials.matKhau,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Đăng nhập thành công", {
          description: "Chào mừng đến với AdminPro UltraStore",
        });

        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("adminTaiKhoan", credentials.taiKhoan);
        localStorage.setItem("token", data.token);

        Cookies.set("adminSession", "active", { expires: 7 });
        Cookies.set("adminTaiKhoan", credentials.taiKhoan, { expires: 7 });

        navigate("/");
      } else {
        const errorData = await response.json();
        if (response.status === 401) {
          toast.error("Tài khoản hoặc mật khẩu không đúng");
        } else if (response.status === 403) {
          toast.error("Tài khoản của bạn đã bị khóa");
        } else {
          toast.error(errorData.message || "Đăng nhập thất bại");
        }
      }
    } catch (error) {
      toast.error("Lỗi kết nối. Vui lòng thử lại sau");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đăng nhập bằng Google
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5261/api/XacThuc/google-login";
  };

  // Xử lý callback từ Google
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const user = urlParams.get("user");
    const error = urlParams.get("error");

    if (error) {
      if (error === "auth_failed") {
        toast.error("Đăng nhập Google thất bại");
      } else if (error === "unauthorized") {
        toast.error("Bạn không có quyền admin");
      }
    } else if (token && user) {
      localStorage.setItem("adminLoggedIn", "true");
      localStorage.setItem("adminTaiKhoan", user);
      localStorage.setItem("token", token);

      Cookies.set("adminSession", "active", { expires: 7 });
      Cookies.set("adminTaiKhoan", user, { expires: 7 });

      toast.success("Đăng nhập Google thành công", {
        description: "Chào mừng đến với AdminPro UltraStore",
      });

      navigate("/");
    }
  }, [navigate]);

  // Xử lý đăng nhập bằng Hotmail (mô phỏng)
  const handleHotmailLogin = () => {
    setLoading(true);
    setTimeout(() => {
      toast.success("Đăng nhập Hotmail thành công", {
        description: "Chào mừng đến với AdminPro UltraStore",
      });

      localStorage.setItem("adminLoggedIn", "true");
      localStorage.setItem("adminTaiKhoan", "hotmail-user");

      Cookies.set("adminSession", "active", { expires: 7 });
      Cookies.set("adminTaiKhoan", "hotmail-user", { expires: 7 });

      navigate("/");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-light/30 to-background p-4">
      <Card className="w-full max-w-md border-purple/20 shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <div className="w-16 h-16 bg-purple/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <LogIn className="w-8 h-8 text-purple" />
          </div>
          <CardTitle className="text-2xl font-bold">Đăng nhập Admin</CardTitle>
          <CardDescription>Nhập thông tin để truy cập UltraStore</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  name="taiKhoan"
                  placeholder="Tài khoản"
                  className="pl-10"
                  value={credentials.taiKhoan}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="matKhau"
                  placeholder="Mật khẩu"
                  className="pl-10 pr-10"
                  value={credentials.matKhau}
                  onChange={handleChange}
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-purple hover:bg-purple/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-r-transparent animate-spin mr-2" />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập vào UltraStore"
              )}
            </Button>
          </form>

          {/* Phân cách */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Hoặc tiếp tục với</span>
            </div>
          </div>

          {/* Nút đăng nhập Google và Hotmail */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex items-center justify-center gap-2"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" className="text-red-500">
                <path
                  fill="currentColor"
                  d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"
                />
              </svg>
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex items-center justify-center gap-2"
              onClick={handleHotmailLogin}
              disabled={loading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" className="text-blue-500">
                <path
                  fill="currentColor"
                  d="M22.5 12.5c0-1.58-.88-2.95-2.16-3.7l.55-4.4C20.89 4.4 18.18 4 16 4c-2.18 0-4.89.4-4.89.4l.55 4.4A4.48 4.48 0 0 0 10 12.5c0 1.58.88 2.95 2.16 3.7l-.55 4.4c0 .05 2.71.45 4.89.45s4.89-.4 4.89-.4l-.55-4.4c1.28-.75 2.16-2.12 2.16-3.7zm-10 2V10h5v4.5h-5z"
                />
              </svg>
              Hotmail
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            <span>Chưa có tài khoản? </span>
            <Link to="#" className="text-purple hover:underline">
              Liên hệ quản trị viên
            </Link>
          </div>
          <div className="text-xs text-center text-muted-foreground mt-2">
            Để thử nghiệm, dùng tài khoản bất kỳ
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginAdmin;