import { Bell, Search, User, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

type HeaderProps = {
  title: string;
};

const Header = ({ title }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    const userId = searchParams.get('userId');
    const user = searchParams.get('user');

    if (token && !localStorage.getItem('token')) {
      localStorage.setItem('token', token);
      if (userId) localStorage.setItem('userId', userId);
      if (user) localStorage.setItem('user', decodeURIComponent(user));
      setIsLoggedIn(true);
      console.log('Dữ liệu từ query string:', { token, userId, user: user ? decodeURIComponent(user) : null });
      window.history.replaceState({}, document.title, location.pathname);
    }

    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
      console.log('localStorage sau thay đổi:', {
        token,
        userId: localStorage.getItem('userId'),
        user: localStorage.getItem('user'),
      });
    };

    window.addEventListener('storageChange', handleStorageChange);
    return () => window.removeEventListener('storageChange', handleStorageChange);
  }, [location]);

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

      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('user');

      window.dispatchEvent(new Event('storageChange')); // Thông báo cho các component khác

      toast.success('Đăng xuất thành công 🎉\nBạn đã đăng xuất khỏi tài khoản.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'bg-green-500 text-white border border-green-700 shadow-lg p-4 rounded-md',
      });

      // Chuyển hướng theo redirectTo hoặc mặc định về login
      window.location.href = response.data.redirectTo || 'http://localhost:8081/login?logout=true';
    } catch (error) {
      console.error('Đăng xuất thất bại:', error);
      toast.error('Đăng xuất thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6 sticky top-0 bg-background/80 backdrop-blur-sm z-20">
      <h1 className="text-xl font-semibold">{}</h1> 
         {/* title */}
      <div className="flex items-center gap-4 my-[20px]">
        <div className="relative max-w-xs w-72 hidden md:block">
          {/* <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-ring"
          /> */}
        </div>
       Xin chào: {localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).hoTen : 'admin@example.com'} 

        {/* <DropdownMenu>
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
              {[1, 2, 3].map((i) => (
                <DropdownMenuItem key={i} className="cursor-pointer py-3">
                  <div className="flex gap-4">
                    <div className="h-9 w-9 rounded-full bg-purple/20 flex items-center justify-center shrink-0">
                      <Bell className="h-4 w-4 text-purple" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">New order #{1000 + i}</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        Customer placed a new order worth $199
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">10 min ago</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>

        </DropdownMenu> */}
        


        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-xs text-muted-foreground">
                  {localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : 'admin@example.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isLoggedIn && (
              <>
                <DropdownMenuItem asChild>
                  <Link to="/ProfileAdmin" className="flex items-center w-full">
                    <User className="mr-2 h-4 w-4" />
                    <span>Tài khoản của tôi</span>
                  </Link>
                </DropdownMenuItem>
                {/* <DropdownMenuItem>
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem> */}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;