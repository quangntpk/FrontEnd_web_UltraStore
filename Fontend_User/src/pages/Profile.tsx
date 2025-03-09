import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, Save, Camera } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
const Profile = () => {
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "Nguyễn Văn A",
    email: "example@email.com",
    phone: "0912345678",
    address: "123 Đường ABC, Quận XYZ, TP HCM"
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    toast
  } = useToast();
  const handleUpdateInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Thông tin đã được cập nhật",
        description: "Thông tin cá nhân của bạn đã được cập nhật thành công."
      });
      setIsLoading(false);
    }, 1000);
  };
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Mật khẩu không khớp",
        description: "Mật khẩu mới và xác nhận mật khẩu không khớp nhau."
      });
      setIsLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Mật khẩu đã được thay đổi",
        description: "Mật khẩu của bạn đã được thay đổi thành công."
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsLoading(false);
    }, 1000);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    setPersonalInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  return <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-secondary/30">
        <div className="max-w-4xl mx-auto my-[50px]">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight gradient-text">Tài khoản của tôi</h1>
            <p className="mt-2 text-muted-foreground">
              Quản lý thông tin và mật khẩu tài khoản của bạn
            </p>
          </div>

          <div className="colorful-card p-8 rounded-lg shadow-lg">
            <Tabs defaultValue="personal-info" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="personal-info">
                  <User className="mr-2 h-4 w-4" /> Thông tin cá nhân
                </TabsTrigger>
                <TabsTrigger value="change-password">
                  <Lock className="mr-2 h-4 w-4" /> Đổi mật khẩu
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal-info">
                <div className="flex flex-col sm:flex-row gap-8">
                  <div className="flex flex-col items-center space-y-4 mb-4 sm:mb-0">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden bg-secondary">
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        <User size={64} />
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Camera className="mr-2 h-4 w-4" /> Thay đổi ảnh
                    </Button>
                  </div>
                  
                  <div className="flex-1">
                    <form onSubmit={handleUpdateInfo} className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="fullName">Họ và tên</Label>
                          <Input id="fullName" name="fullName" value={personalInfo.fullName} onChange={handleInputChange} />
                        </div>
                        
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" name="email" type="email" value={personalInfo.email} onChange={handleInputChange} />
                        </div>
                        
                        <div>
                          <Label htmlFor="phone">Số điện thoại</Label>
                          <Input id="phone" name="phone" type="tel" value={personalInfo.phone} onChange={handleInputChange} />
                        </div>
                        
                        <div>
                          <Label htmlFor="address">Địa chỉ</Label>
                          <Input id="address" name="address" value={personalInfo.address} onChange={handleInputChange} />
                        </div>
                      </div>
                      
                      <Button type="submit" className="w-full sm:w-auto gradient-bg" disabled={isLoading}>
                        {isLoading ? "Đang cập nhật..." : <>
                            <Save className="mr-2 h-4 w-4" /> Lưu thay đổi
                          </>}
                      </Button>
                    </form>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="change-password">
                <form onSubmit={handleChangePassword} className="space-y-6 max-w-md mx-auto">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                      <Input id="current-password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <Label htmlFor="new-password">Mật khẩu mới</Label>
                      <Input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                    </div>
                    
                    <div>
                      <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                      <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full gradient-bg" disabled={isLoading}>
                    {isLoading ? "Đang xử lý..." : <>
                        <Lock className="mr-2 h-4 w-4" /> Đổi mật khẩu
                      </>}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>;
};
export default Profile;