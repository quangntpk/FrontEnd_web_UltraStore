import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Search, SlidersHorizontal } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

// Cập nhật interface Product
interface Product {
  id: string;
  name: string;
  description: string;
  imageSrc: string;
  colorClass: string;
  price: number;
  category: string;
  thuongHieu: string; // Thêm Thương Hiệu
  chatLieu: string;   // Thêm Chất Liệu
}

const ProductListing = () => {
  const [originalProducts, setOriginalProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("featured");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:5261/api/SanPham/ListSanPham");
        if (!response.ok) {
          throw new Error("Không thể tải danh sách sản phẩm");
        }
        const data = await response.json();

        const mappedProducts = data.map((product: any) => ({
          id: product.id,
          name: product.name,
          description: product.moTa || "Không có mô tả",
          imageSrc: `data:image/jpeg;base64,${product.hinh[0]}`,
          colorClass: "from-blue-500 to-cyan-500",
          price: product.donGia,
          category: product.loaiSanPham,
          thuongHieu: product.thuongHieu || "Không xác định",
          chatLieu: product.chatLieu || "Không xác định",
        }));

        setOriginalProducts(mappedProducts);
        setError(null);
      } catch (err) {
        console.error("Lỗi khi lấy sản phẩm:", err);
        setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
        toast.error("Không thể tải sản phẩm");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let result = [...originalProducts];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
    }
    if (selectedCategories.length > 0) {
      result = result.filter((product) => selectedCategories.includes(product.category));
    }
    if (priceRange) {
      result = result.filter(
        (product) => product.price >= priceRange.min && product.price <= priceRange.max
      );
    }
    switch (sortOrder) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }
    setFilteredProducts(result);
  }, [originalProducts, searchQuery, sortOrder, selectedCategories, priceRange]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info(`Tìm kiếm: ${searchQuery}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSortOrder("featured");
    setSelectedCategories([]);
    setPriceRange(null);
    toast.success("Đã xóa tất cả bộ lọc");
  };

  const addToCart = (product: Product) => {
    toast.success(`${product.name} đã được thêm vào giỏ hàng!`);
  };

  const categories = [...new Set(originalProducts.map((product) => product.category))];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 pt-24">
        <div className="container px-4 md:px-6 mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 my-[50px]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h1 className="text-3xl font-bold gradient-text">Tất Cả Sản Phẩm</h1>
              <form onSubmit={handleSearch} className="flex w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Tìm kiếm sản phẩm..."
                    className="pl-8 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" size="sm" className="ml-2">
                  Tìm kiếm
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="ml-2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </form>
            </div>

            {showFilters && (
              <div className="bg-white p-6 rounded-xl shadow-sm animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-lg font-medium mb-3 block">Danh Mục</Label>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category}`}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => handleCategoryChange(category)}
                          />
                          <label
                            htmlFor={`category-${category}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-lg font-medium mb-3 block">Khoảng Giá</Label>
                    <Select
                      onValueChange={(value) => {
                        switch (value) {
                          case "under-100000":
                            setPriceRange({ min: 0, max: 100000 });
                            break;
                          case "100000-200000":
                            setPriceRange({ min: 100000, max: 200000 });
                            break;
                          case "200000-500000":
                            setPriceRange({ min: 200000, max: 500000 });
                            break;
                          case "over-500000":
                            setPriceRange({ min: 500000, max: Infinity });
                            break;
                          default:
                            setPriceRange(null);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn khoảng giá" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả giá</SelectItem>
                        <SelectItem value="under-100000">Dưới 100,000 VND</SelectItem>
                        <SelectItem value="100000-200000">100,000 - 200,000 VND</SelectItem>
                        <SelectItem value="200000-500000">200,000 - 500,000 VND</SelectItem>
                        <SelectItem value="over-500000">Trên 500,000 VND</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-lg font-medium mb-3 block">Sắp Xếp Theo</Label>
                    <Select defaultValue={sortOrder} onValueChange={setSortOrder}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn cách sắp xếp" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="featured">Nổi bật</SelectItem>
                        <SelectItem value="price-asc">Giá: Thấp đến Cao</SelectItem>
                        <SelectItem value="price-desc">Giá: Cao đến Thấp</SelectItem>
                        <SelectItem value="name-asc">Tên: A đến Z</SelectItem>
                        <SelectItem value="name-desc">Tên: Z đến A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button variant="outline" onClick={clearFilters}>
                    Xóa Bộ Lọc
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {error ? (
                <div className="col-span-full py-12 text-center text-red-500">{error}</div>
              ) : isLoading ? (
                <div className="col-span-full py-12 text-center">
                  <p>Đang tải sản phẩm...</p>
                </div>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-2xl overflow-hidden border border-border colorful-card h-full flex flex-col"
                  >
                    <div
                      className={`aspect-video overflow-hidden bg-gradient-to-r ${product.colorClass}`}
                    >
                      <img
                        src={product.imageSrc}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 "
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-medium">{product.name}</h3>
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary mt-1">
                            {product.category}
                          </span>
                          <p className="text-sm text-muted-foreground mt-1">
                            Thương Hiệu: {product.thuongHieu}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Chất Liệu: {product.chatLieu}
                          </p>
                        </div>
                        <span className="font-medium text-primary">
                          {formatter.format(product.price)}
                        </span>
                      </div>
                      <p className="text-muted-foreground flex-1">{product.description}</p>
                      <div className="mt-6 flex gap-2">
                        <Link
                          to={`/product/${product.id}`}
                          className="text-primary font-medium hover-effect hover:opacity-80"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center">
                  <h3 className="text-xl font-medium mb-2">Không tìm thấy sản phẩm</h3>
                  <p className="text-muted-foreground">
                    Hãy thử điều chỉnh tiêu chí tìm kiếm hoặc bộ lọc
                  </p>
                  <Button variant="outline" className="mt-4" onClick={clearFilters}>
                    Xóa tất cả bộ lọc
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductListing;