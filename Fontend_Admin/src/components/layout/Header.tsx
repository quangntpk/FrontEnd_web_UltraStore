import { Bell, Search, User, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useEffect } from 'react';
type HeaderProps = {
  title: string;
};
const Header = ({
  title
}: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation(); 

  // Xử lý token từ query string khi component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');

    if (token && !localStorage.getItem('token')) {
      // Lưu token vào localStorage nếu chưa có
      localStorage.setItem('token', token);
      console.log('Token đã được lưu vào localStorage:', token);

      // Xóa token khỏi query string để URL sạch hơn
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location]); // Chạy lại khi location thay đổi
  
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
      }

      const response = await axios.post(
        'http://localhost:5261/api/XacThuc/DangXuat',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Xóa dữ liệu trong localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('user');

      // Chuyển hướng theo redirectTo từ API hoặc mặc định về login
      window.location.href = response.data.redirectTo || 'http://localhost:8080/login?logout=true';
    } catch (error) {
      console.error('Đăng xuất thất bại:', error);
      alert('Đăng xuất thất bại. Vui lòng thử lại.');
    }
  };
  return (
   <header className="h-16 border-b border-border flex items-center justify-between px-6 sticky top-0 bg-background/80 backdrop-blur-sm z-20">
      <h1 className="text-xl font-semibold">{title}</h1>
      
      <div className="flex items-center gap-4 my-[20px]">
        <div className="relative max-w-xs w-72 hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search..." className="pl-8 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-ring" />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-purple text-[10px] text-white">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              {[1, 2, 3].map(i => <DropdownMenuItem key={i} className="cursor-pointer py-3">
                  <div className="flex gap-4">
                    <div className="h-9 w-9 rounded-full bg-purple/20 flex items-center justify-center shrink-0">
                      <Bell className="h-4 w-4 text-purple" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">New order #{1000 + i}</p>
                      <p className="text-muted-foreground text-xs mt-1">Customer placed a new order worth $199</p>
                      <p className="text-xs text-muted-foreground mt-1">10 min ago</p>
                    </div>
                  </div>
                </DropdownMenuItem>)}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-base font-medium">My Account</p>
                <p className="text-xs text-muted-foreground">admin@example.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <SettingsIcon className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
export default Header;