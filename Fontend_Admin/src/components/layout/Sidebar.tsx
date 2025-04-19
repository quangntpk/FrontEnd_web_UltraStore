import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart,              
  ShoppingCart,          
  Package,              
  Users,               
  Mail,               
  Ticket,            
  MessageSquare,    
  Zap,             
  Layers,         
  Award,         
  CreditCard,   
  Megaphone,   
  Inbox,      
  MessageCircle, 
  Calendar,    
  TrendingUp, 
  Settings,  
  HelpCircle, 
  Heart,     
  Globe,    
  Shield,  
  Tags,   
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
}

const NavItem = ({ to, icon: Icon, label, isCollapsed }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-300 group',
          isActive 
            ? 'bg-purple text-white' 
            : 'text-muted-foreground hover:bg-purple-light hover:text-purple'
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={20} className={cn(isActive ? 'text-white' : 'text-purple')} />
          <span className={cn(
            'transition-opacity duration-300', 
            isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
          )}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
};

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const { isEmployee } = useAuth();

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch("http://localhost:5261/api/GiaoDien");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const activeGiaoDien = data.find((item) => item.trangThai === 1);
        if (activeGiaoDien && activeGiaoDien.logo) {
          setLogo(activeGiaoDien.logo);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu logo:", error);
      }
    };

    fetchLogo();
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleCategory = () => {
    setIsCategoryOpen(!isCategoryOpen);
  };

  const mainNavItems = [
    { to: '/', icon: BarChart, label: 'Thống kê' },           
    { to: '/orders', icon: ShoppingCart, label: 'Đơn Hàng' }, 
    { to: '/products', icon: Package, label: 'Sản Phẩm' },    
    ...(isEmployee ? [] : [{ to: '/customers', icon: Users, label: 'Tài Khoản' }]),  
    { to: '/analytics', icon: Mail, label: 'Liên Hệ' },       
    ...(isEmployee ? [] : [{ to: '/invoices', icon: Ticket, label: 'Voucher' }]),      
    { to: '/inventory', icon: MessageSquare, label: 'Bình luận' }, 
    { to: '/combos', icon: Zap, label: 'Combo' },
    { to: '/Giaodien', icon: Calendar, label: 'Giao diện'}             
  ];

  const categoryItems = [
    { to: '/loaisanpham', icon: Layers, label: 'Loại Sản Phẩm' }, 
    { to: '/thuonghieu', icon: Award, label: 'Thương Hiệu' },     
  ];

  const additionalNavItems = [
    { to: '/payments', icon: CreditCard, label: 'Payments' },     
    { to: '/marketing', icon: Megaphone, label: 'Marketing' },    
    { to: '/messages', icon: Inbox, label: 'Messages' },          
    { to: '/chat', icon: MessageCircle, label: 'Chat' },          
    { to: '/calendar', icon: Calendar, label: 'Calendar' },       
    { to: '/reports', icon: TrendingUp, label: 'Reports' },       
  ];

  const supportNavItems = [
    { to: '/settings', icon: Settings, label: 'Settings' },       
    { to: '/help', icon: HelpCircle, label: 'Help Center' },      
    { to: '/favorites', icon: Heart, label: 'Favorites' },        
    { to: '/website', icon: Globe, label: 'Website' },            
    { to: '/security', icon: Shield, label: 'Security' },         
  ];

  return (
    <aside 
      className={cn(
        'h-screen bg-sidebar sticky top-0 left-0 z-30 flex flex-col border-r border-border transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-[70px]' : 'w-[240px]'
      )}
    >
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-border transition-all duration-300',
        isCollapsed ? 'justify-center' : 'justify-between'
      )}>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            {logo ? (
              <img
                src={`data:image/png;base64,${logo}`}
                alt="Logo"
                className="h-8 w-8 rounded-md object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-md bg-purple flex items-center justify-center">
                <span className="text-white font-bold">U</span>
              </div>
            )}
            <span className="font-semibold text-lg gradient-text">UltraStore</span>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleCollapse}
          className="text-muted-foreground hover:text-purple hover:bg-purple-light"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
              Main
            </div>
          )}
          {mainNavItems.map((item, index) => (
            <div key={item.to}>
              <NavItem
                to={item.to}
                icon={item.icon}
                label={item.label}
                isCollapsed={isCollapsed}
              />
              {index === 2 && (
                <div className={cn('rounded-md transition-all duration-300')}>
                  <button
                    onClick={toggleCategory}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 w-full text-muted-foreground hover:bg-purple-light hover:text-purple rounded-md',
                      isCategoryOpen && 'bg-purple-light text-purple'
                    )}
                  >
                    <Tags size={20} className="text-purple" />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">Danh Mục</span>
                        {isCategoryOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </>
                    )}
                  </button>
                  
                  {!isCollapsed && isCategoryOpen && (
                    <div className="ml-6 space-y-1 mt-1">
                      {categoryItems.map((category) => (
                        <NavItem
                          key={category.to}
                          to={category.to}
                          icon={category.icon}
                          label={category.label}
                          isCollapsed={false}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;