import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Eye, EyeOff, Lock, LogIn, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { useAuth } from "@/hooks/useAuth";

const LoginAdmin = () => {
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({
    taiKhoan: "",
    matKhau: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          toast.error("Tài khoản hoặc mật khẩu không đúng");
        } else if (response.status === 403) {
          toast.error(errorData.message || "Bạn không có quyền truy cập");
        } else {
          toast.error(errorData.message || "Đăng nhập thất bại");
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      const { user, token } = data;

      if (user.vaiTro !== 1 && user.vaiTro !== 2) {
        toast.error("Bạn không có quyền truy cập", {
          description: "Chỉ tài khoản Admin hoặc Nhân Viên mới được phép đăng nhập vào khu vực này.",
        });
        setLoading(false);
        return;
      }

      const userData = {
        maNguoiDung: user.maNguoiDung || "",
        hoTen: user.hoTen || "",
        email: user.email || "",
        vaiTro: user.vaiTro,
      };

      localStorage.setItem("adminLoggedIn", "true");
      localStorage.setItem("adminTaiKhoan", credentials.taiKhoan);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      Cookies.set("adminSession", "active", { expires: 7 });
      Cookies.set("adminTaiKhoan", credentials.taiKhoan, { expires: 7 });

      setUser(userData);

      toast.success("Đăng nhập thành công", {
        description: "Chào mừng đến với AdminPro UltraStore",
      });

      setIsAuthenticated(true);
    } catch (error) {
      toast.error("Lỗi kết nối. Vui lòng thử lại sau");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

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