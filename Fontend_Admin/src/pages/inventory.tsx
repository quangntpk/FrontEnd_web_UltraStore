
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Package, 
  Plus, 
  Filter, 
  RefreshCw, 
  MoreVertical, 
  AlertTriangle 
} from "lucide-react";

// Sample inventory data
const inventory = Array.from({ length: 10 }).map((_, i) => {
  const stock = Math.floor(Math.random() * 150);
  const threshold = Math.floor(Math.random() * 30) + 10;
  return {
    id: i + 1,
    name: `Product ${i + 1}`,
    sku: `SKU-${1000 + i}`,
    category: ['Electronics', 'Clothing', 'Home', 'Office'][Math.floor(Math.random() * 4)],
    stock,
    threshold,
    status: stock <= threshold ? 'Low Stock' : stock === 0 ? 'Out of Stock' : 'In Stock',
    stockPercentage: Math.min(100, Math.round((stock / 100) * 100)),
  };
});

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = inventory.filter(item => item.status === 'Low Stock').length;
  const outOfStockCount = inventory.filter(item => item.status === 'Out of Stock').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product stock and inventory levels.
          </p>
        </div>
        <Button className="bg-purple hover:bg-purple-medium">
          <Plus className="mr-2 h-4 w-4" /> Add Inventory
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All products in inventory</p>
          </CardContent>
        </Card>
        
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Products below threshold</p>
          </CardContent>
        </Card>
        
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Products with zero stock</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <CardTitle>Inventory Status</CardTitle>
            <CardDescription>
              {lowStockCount > 0 && (
                <div className="flex items-center text-amber-600">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {lowStockCount} {lowStockCount === 1 ? 'product' : 'products'} below threshold
                </div>
              )}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search inventory..."
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
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-md bg-purple-light flex items-center justify-center">
                            <Package className="h-4 w-4 text-purple" />
                          </div>
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        <div className="w-32">
                          <div className="flex justify-between mb-1 text-xs">
                            <span>{item.stock} units</span>
                            <span>Threshold: {item.threshold}</span>
                          </div>
                          <Progress 
                            value={item.stockPercentage} 
                            className={
                              item.status === 'Low Stock' 
                                ? 'bg-amber-100' 
                                : item.status === 'Out of Stock' 
                                  ? 'bg-red-100' 
                                  : 'bg-purple-light'
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            item.status === 'In Stock' 
                              ? 'bg-green-100 text-green-800 border-0' 
                              : item.status === 'Low Stock' 
                                ? 'bg-amber-100 text-amber-800 border-0' 
                                : 'bg-red-100 text-red-800 border-0'
                          }
                        >
                          {item.status}
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
                            <DropdownMenuItem>View details</DropdownMenuItem>
                            <DropdownMenuItem>Update stock</DropdownMenuItem>
                            <DropdownMenuItem>Reorder</DropdownMenuItem>
                            <DropdownMenuItem>Set alerts</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No inventory items found matching your search.
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

export default Inventory;
