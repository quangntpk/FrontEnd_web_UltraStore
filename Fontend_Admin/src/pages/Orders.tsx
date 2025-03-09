
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Search, Filter, RefreshCw } from "lucide-react";

// Sample order data
const orders = Array.from({ length: 10 }).map((_, i) => ({
  id: `ORD-${1000 + i}`,
  customer: `Customer ${i + 1}`,
  date: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString(),
  status: ['Completed', 'Processing', 'Shipped', 'Pending'][Math.floor(Math.random() * 4)],
  total: `$${(Math.random() * 500 + 50).toFixed(2)}`,
  items: Math.floor(Math.random() * 5) + 1,
}));

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  let color;
  switch (status) {
    case 'Completed':
      color = 'bg-green-100 text-green-800';
      break;
    case 'Processing':
      color = 'bg-blue-100 text-blue-800';
      break;
    case 'Shipped':
      color = 'bg-purple-light text-purple-dark';
      break;
    case 'Pending':
      color = 'bg-yellow-100 text-yellow-800';
      break;
    default:
      color = 'bg-gray-100 text-gray-800';
  }
  return <Badge variant="outline" className={`${color} border-0`}>{status}</Badge>;
};

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    order.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your customer orders.
          </p>
        </div>
        <Button className="bg-purple hover:bg-purple-medium">
          Create New Order
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search orders..."
                className="pl-8 w-full sm:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 self-end">
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="h-9">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell>{order.items}</TableCell>
                      <TableCell>{order.total}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View details</DropdownMenuItem>
                            <DropdownMenuItem>Edit order</DropdownMenuItem>
                            <DropdownMenuItem>Track shipment</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Cancel order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      No orders found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;
