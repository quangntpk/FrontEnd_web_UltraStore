
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, TrendingUp, Users, DollarSign, ShoppingCart, Package } from "lucide-react";

// Dashboard card component for reusability
const StatsCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  className 
}: { 
  title: string; 
  value: string; 
  description: string;
  icon: React.ElementType;
  trend: { 
    value: string; 
    isPositive: boolean;
  }; 
  className?: string;
}) => (
  <Card className={`hover-scale ${className || ''}`}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className={`p-2 rounded-full ${trend.isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
        <Icon className={`h-4 w-4 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`} />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
      <div className="mt-2 flex items-center text-xs">
        <TrendingUp className={`mr-1 h-3 w-3 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`} />
        <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
          {trend.value} {trend.isPositive ? 'increase' : 'decrease'}
        </span>
      </div>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground">
        Monitor your sales and business performance at a glance.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Revenue" 
          value="$23,823" 
          description="Total revenue this month" 
          icon={DollarSign} 
          trend={{ value: "12%", isPositive: true }} 
          className="border-l-4 border-l-purple"
        />
        <StatsCard 
          title="New Orders" 
          value="835" 
          description="Orders this month" 
          icon={ShoppingCart} 
          trend={{ value: "8%", isPositive: true }} 
          className="border-l-4 border-l-purple-medium"
        />
        <StatsCard 
          title="New Customers" 
          value="584" 
          description="Customers this month" 
          icon={Users} 
          trend={{ value: "5%", isPositive: true }} 
          className="border-l-4 border-l-purple-medium"
        />
        <StatsCard 
          title="Inventory" 
          value="125" 
          description="Low stock products" 
          icon={Package} 
          trend={{ value: "3%", isPositive: false }} 
          className="border-l-4 border-l-purple"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="lg:col-span-1 hover-scale">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>
              Your latest transactions from the past 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-9 w-9 rounded-full bg-purple-light flex items-center justify-center">
                      <span className="text-sm font-medium text-purple">#{i}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Order #10{i}45</p>
                      <p className="text-xs text-muted-foreground">John Doe</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${(Math.random() * 300).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-scale">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>
              Monthly revenue breakdown
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <div className="flex items-center justify-center">
              <BarChart className="h-16 w-16 text-muted-foreground" />
              <p className="ml-4 text-muted-foreground">Chart visualization will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <Card className="hover-scale col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Popular Products</CardTitle>
            <CardDescription>
              Your best-selling products this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center p-3 border rounded-md">
                  <div className="h-12 w-12 bg-purple-light rounded-md flex items-center justify-center">
                    <Package className="h-6 w-6 text-purple" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">Product {i}</p>
                    <p className="text-xs text-muted-foreground">${(Math.random() * 100).toFixed(2)} • {Math.floor(Math.random() * 100)} sold</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-scale">
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <CardDescription>
              Your most valuable customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-purple-light flex items-center justify-center">
                    <span className="text-sm font-medium text-purple">U{i}</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">Customer {i}</p>
                    <p className="text-xs text-muted-foreground">${(Math.random() * 1000).toFixed(2)} • {Math.floor(Math.random() * 10)} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
