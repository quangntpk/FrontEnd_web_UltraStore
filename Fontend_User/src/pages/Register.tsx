import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, User, UserPlus, Mail } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Kiểm tra mật khẩu
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Mật khẩu không khớp",
        description: "Vui lòng kiểm tra lại mật khẩu xác nhận."
      });
      setIsLoading(false);
      return;
    }

    // Kiểm tra đồng ý điều khoản
    if (!agreeToTerms) {
      toast({
        variant: "destructive",
        title: "Vui lòng đồng ý với điều khoản",
        description: "Bạn cần đồng ý với điều khoản dịch vụ và chính sách bảo mật."
      });
      setIsLoading(false);
      return;
    }

    // Giả lập quá trình đăng ký
    setTimeout(() => {
      // Đây chỉ là mẫu, sau này sẽ kết nối với hệ thống xác thực thực tế
      if (fullName && email && password) {
        toast({
          title: "Đăng ký thành công",
          description: "Chào mừng bạn đến với Minimalist!"
        });
        navigate("/login");
      } else {
        toast({
          variant: "destructive",
          title: "Đăng ký thất bại",
          description: "Vui lòng nhập đầy đủ thông tin."
        });
      }
      setIsLoading(false);
    }, 1500);
  };
  return <div className="min-h-screen flex flex-col bg-[#eaf2f5]/[0.31] rounded-3xl">
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-secondary/30">
        <div className="w-full max-w-md space-y-8 my-[50px]">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight gradient-text">Đăng ký</h1>
            <p className="mt-2 text-muted-foreground">
              Tạo tài khoản để trải nghiệm mua sắm tuyệt vời
            </p>
          </div>

          <div className="colorful-card p-6 rounded-lg shadow-lg">
            <form className="space-y-6" onSubmit={handleRegister}>
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input id="fullName" placeholder="Nguyễn Văn A" type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="pl-10" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input id="email" placeholder="your.email@example.com" type="email" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                  </Button>
                  <Input id="password" placeholder="••••••••" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                  </Button>
                  <Input id="confirmPassword" placeholder="••••••••" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                </div>
              </div>

              <div className="flex items-center">
                <input id="terms" type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" checked={agreeToTerms} onChange={e => setAgreeToTerms(e.target.checked)} required />
                <label htmlFor="terms" className="ml-2 block text-sm text-muted-foreground">
                  Tôi đồng ý với{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    Điều khoản dịch vụ
                  </Link>{" "}
                  và{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Chính sách bảo mật
                  </Link>
                </label>
              </div>

              <Button type="submit" className="w-full gradient-bg" disabled={isLoading}>
                {isLoading ? "Đang xử lý..." : <>
                    <UserPlus className="mr-2 h-4 w-4" /> Đăng ký
                  </>}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Hoặc đăng ký với
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button variant="outline" type="button" className="hover-effect">
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  Google
                </Button>
                <Button variant="outline" type="button" className="hover-effect">
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" fill="#1877F2" />
                    <path d="M15.893 14.89l.443-2.89h-2.773v-1.876c0-.791.387-1.562 1.63-1.562h1.26v-2.46s-1.144-.195-2.238-.195c-2.285 0-3.777 1.384-3.777 3.89V12h-2.54v2.89h2.54v6.988C11.331 21.965 11.664 22 12 22s.669-.035.997-.082v-6.988h2.896z" fill="white" />
                  </svg>
                  Facebook
                </Button>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>;
};
export default Register;