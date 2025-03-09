import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, Filter, Grid2X2, List, MoreVertical, Tag } from "lucide-react";
import EditProductModal from "@/components/EditProductModal";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productEdit, setProductEdit] = useState(null);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://192.168.1.8:5261/api/SanPham/ListSanPham", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.log("Lỗi khi lấy dữ liệu:", response.status);
        setProducts([]);
      }
    } catch (error) {
      console.error("Lỗi kết nối API:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductLoadInfo = async (id) => {
    try {
      const response = await fetch(`http://192.168.1.8:5261/api/SanPham/SanPhamByIDSorted?id=${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setProductEdit(data);
      } else {
        console.log("Lỗi khi lấy dữ liệu:", response.status);
        setProductEdit(null);
      }
    } catch (error) {
      console.error("Lỗi kết nối API:", error);
      setProductEdit(null);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.loaiSanPham.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
    fetchProductLoadInfo(product.id);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Đang tải sản phẩm...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your product inventory and listings.</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple hover:bg-purple-medium">
              <Plus className="mr-2 h-4 w-4" /> Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p>Form thêm sản phẩm sẽ được thêm tại đây</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8 w-full sm:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 self-end">
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="h-4 w-4 mr-2" /> Filter
              </Button>
              <div className="flex border rounded-md">
                <Button
                  variant={view === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-9 rounded-r-none"
                  onClick={() => setView('grid')}
                >
                  <Grid2X2 className="h-4 w-4" />
                </Button>
                <Button
                  variant={view === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-9 rounded-l-none"
                  onClick={() => setView('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="hover-scale overflow-hidden group">
                  <div className="h-40 bg-purple-light flex items-center justify-center">
                    <img src={product.hinh[0]} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          Thương hiệu: {product.thuongHieu}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditProduct(product)}>Edit product</DropdownMenuItem>
                          <DropdownMenuItem>View details</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="outline" className="bg-secondary text-muted-foreground border-0">
                        <Tag className="h-3 w-3 mr-1" /> {product.loaiSanPham}
                      </Badge>
                      <Badge variant={product.soLuong > 0 ? 'default' : 'destructive'} className="bg-opacity-15">
                        {product.trangThai == 0 ? 'Tạm Ngưng Bán' : 'Đang Bán'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="font-bold text-purple">{(product.donGia / 1000).toFixed(1)}K VND</span>
                      <span className="text-xs text-muted-foreground">Còn lại: {product.soLuong} sản phẩm</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border rounded-md divide-y">
              {filteredProducts.map((product) => (
                <div key={product.id} className="p-4 flex items-center gap-4 hover:bg-muted/50">
                  <div className="h-12 w-12 bg-purple-light rounded-md flex items-center justify-center">
                    <img src={product.hinh[0]} alt={product.name} className="w-full h-full object-cover rounded-md" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      Thương hiệu: {product.thuongHieu}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-secondary text-muted-foreground border-0">
                      {product.loaiSanPham}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple">{(product.donGia / 1000).toFixed(1)}K VND</div>
                    <div className="text-xs text-muted-foreground">{product.soLuong} in stock</div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditProduct(product)}>Edit product</DropdownMenuItem>
                      <DropdownMenuItem>View details</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
          {filteredProducts.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Không tìm thấy sản phẩm nào</p>
            </div>
          )}
        </CardContent>
      </Card>

      <EditProductModal
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        selectedProduct={selectedProduct}
        productData={productEdit}
      />
    </div>
  );
};

export default Products;