
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { BarChart, TrendingUp, ArrowUpRight, ArrowDownRight, CreditCard, Users, ShoppingCart } from "lucide-react";

const MetricCard = ({ 
  title, 
  value, 
  change, 
  isPositive, 
  icon: Icon 
}: { 
  title: string; 
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ElementType;
}) => (
  <Card className="hover-scale">
    <CardContent className="pt-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-2 rounded-full ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
          <Icon className={`h-5 w-5 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
        </div>
      </div>
      <div className="flex items-center mt-4">
        {isPositive ? (
          <ArrowUpRight className="h-4 w-4 mr-1 text-green-600" />
        ) : (
          <ArrowDownRight className="h-4 w-4 mr-1 text-red-600" />
        )}
        <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
          {change}
        </span>
        <span className="text-muted-foreground text-sm ml-1">vs last month</span>
      </div>
    </CardContent>
  </Card>
);

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your business performance and metrics.
          </p>
        </div>
        <Select defaultValue="month">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
            <SelectItem value="quarter">Last 90 days</SelectItem>
            <SelectItem value="year">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Revenue" 
          value="$45,231" 
          change="+12.5%" 
          isPositive={true} 
          icon={CreditCard} 
        />
        <MetricCard 
          title="New Customers" 
          value="1,245" 
          change="+18.2%" 
          isPositive={true} 
          icon={Users} 
        />
        <MetricCard 
          title="Total Orders" 
          value="2,845" 
          change="+8.4%" 
          isPositive={true} 
          icon={ShoppingCart} 
        />
        <MetricCard 
          title="Refund Rate" 
          value="5.2%" 
          change="-2.1%" 
          isPositive={true} 
          icon={TrendingUp} 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover-scale">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>
              Monthly revenue breakdown for the current year
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            <div className="flex items-center justify-center">
              <BarChart className="h-16 w-16 text-muted-foreground" />
              <p className="ml-4 text-muted-foreground">Chart visualization will appear here</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-scale">
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>
              Distribution of sales across product categories
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            <div className="flex items-center justify-center">
              <BarChart className="h-16 w-16 text-muted-foreground" />
              <p className="ml-4 text-muted-foreground">Chart visualization will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card className="hover-scale">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Key performance indicators over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Conversion Rate', value: '3.2%', prevValue: '2.8%' },
                { label: 'Avg. Order Value', value: '$65.40', prevValue: '$58.20' },
                { label: 'Customer Retention', value: '68%', prevValue: '65%' },
                { label: 'Customer Satisfaction', value: '4.8/5', prevValue: '4.6/5' },
              ].map((metric) => (
                <div key={metric.label} className="flex flex-col justify-center items-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground text-center">{metric.label}</p>
                  <p className="text-2xl font-bold mt-2">{metric.value}</p>
                  <div className="flex items-center mt-2 text-xs">
                    <span className="text-green-600 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      vs {metric.prevValue}
                    </span>
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

export default Analytics;
