
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  Store,
  CreditCard,
  Mail,
  MessageSquare,
  Calendar,
  HelpCircle,
  Heart,
  Globe,
  TrendingUp,
  Zap,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type NavItemProps = {
  to: string;
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
};

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
          <span className={cn('transition-opacity duration-300', 
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

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const mainNavItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/orders', icon: ShoppingCart, label: 'Orders' },
    { to: '/products', icon: Package, label: 'Sản Phẩm' },
    { to: '/customers', icon: Users, label: 'Customers' },
    { to: '/analytics', icon: BarChart, label: 'Analytics' },
    { to: '/invoices', icon: FileText, label: 'Invoices' },
    { to: '/inventory', icon: Store, label: 'Inventory' },
    { to: '/combos', icon: Zap, label: 'Combo Sản Phẩm'}
  ];

  const additionalNavItems = [
    { to: '/payments', icon: CreditCard, label: 'Payments' },
    { to: '/marketing', icon: Zap, label: 'Marketing' },
    { to: '/messages', icon: Mail, label: 'Messages' },
    { to: '/chat', icon: MessageSquare, label: 'Chat' },
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
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="h-8 w-8 rounded-md bg-purple flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="font-semibold text-lg gradient-text">AdminPro</span>
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

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        <div className="space-y-1 mb-6">
          {!isCollapsed && <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase">Main</div>}
          {mainNavItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
        
        <div className="space-y-1 mb-6">
          {!isCollapsed && <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase">Management</div>}
          {additionalNavItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
        
        <div className="space-y-1">
          {!isCollapsed && <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase">Support</div>}
          {supportNavItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      </nav>

      <div className={cn(
        'px-3 py-4 border-t border-border',
        isCollapsed ? 'text-center' : ''
      )}>
        <div className={cn(
          'flex items-center gap-3 text-sm text-muted-foreground',
          isCollapsed ? 'justify-center' : ''
        )}>
          <div className="h-8 w-8 rounded-full bg-purple/20 flex items-center justify-center">
            <span className="text-purple font-medium">U</span>
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in">
              <p className="font-medium">User Admin</p>
              <p className="text-xs">admin@example.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
