
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Search, User, MoreVertical, Plus, Filter } from "lucide-react";

// Sample customer data
const customers = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 1,
  name: `Customer ${i + 1}`,
  email: `customer${i + 1}@example.com`,
  joinDate: new Date(Date.now() - Math.random() * 31536000000).toLocaleDateString(),
  orders: Math.floor(Math.random() * 20),
  spent: `$${(Math.random() * 2000 + 100).toFixed(2)}`,
  status: Math.random() > 0.2 ? 'Active' : 'Inactive',
}));

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-1">
            Manage your customer base and relationships.
          </p>
        </div>
        <Button className="bg-purple hover:bg-purple-medium">
          <Plus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search customers..."
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
            </div>
          </div>
          
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Spent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-purple-light flex items-center justify-center">
                            <User className="h-4 w-4 text-purple" />
                          </div>
                          <span className="font-medium">{customer.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.joinDate}</TableCell>
                      <TableCell>{customer.orders}</TableCell>
                      <TableCell>{customer.spent}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={customer.status === 'Active' ? 'default' : 'secondary'} 
                          className={customer.status === 'Active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-gray-100 text-gray-800 hover:bg-gray-100'}
                        >
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View profile</DropdownMenuItem>
                            <DropdownMenuItem>Edit details</DropdownMenuItem>
                            <DropdownMenuItem>View orders</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Delete account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      No customers found matching your search.
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

export default Customers;
