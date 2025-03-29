import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Search, SlidersHorizontal, Tag } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

// Định nghĩa interface cho Combo
interface ComboProduct {
  idSanPham: string;
  name: string;
  thuongHieu: string;
  loaiSanPham: string;
  kichThuoc: string[];
  soLuong: number;
  donGia: number;
  moTa: string | null;
  chatLieu: string;
  mauSac: string[];
  hinh: string[];
  ngayTao: string;
  trangThai: number;
}

interface Combo {
  maCombo: number;
  name: string;
  hinhAnh: string;
  ngayTao: string;
  trangThai: number;
  sanPhams: ComboProduct[];
  moTa: string;
  gia: number;
  soLuong: number;
}

const ComboListing = () => {
  const [originalCombos, setOriginalCombos] = useState<Combo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("featured");
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredCombos, setFilteredCombos] = useState<Combo[]>([]);

  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:5261/api/Combo/ComboSanPhamView");
        if (!response.ok) {
          throw new Error("Không thể tải danh sách combo");
        }
        const data = await response.json();

        const mappedCombos = data.map((combo: any) => ({
          maCombo: combo.maCombo,
          name: combo.name,
          hinhAnh: `data:image/jpeg;base64,${combo.hinhAnh}`,
          ngayTao: combo.ngayTao,
          trangThai: combo.trangThai,
          sanPhams: combo.sanPhams.map((product: any) => ({
            idSanPham: product.idSanPham,
            name: product.name,
            thuongHieu: product.thuongHieu,
            loaiSanPham: product.loaiSanPham,
            kichThuoc: product.kichThuoc,
            soLuong: product.soLuong,
            donGia: product.donGia,
            moTa: product.moTa || "Không có mô tả",
            chatLieu: product.chatLieu,
            mauSac: product.mauSac,
            hinh: product.hinh.map((img: string) => `data:image/jpeg;base64,${img}`),
            ngayTao: product.ngayTao,
            trangThai: product.trangThai,
          })),
          moTa: combo.moTa || "Không có mô tả",
          gia: combo.gia,
          soLuong: combo.soLuong,
        }));

        setOriginalCombos(mappedCombos);
        setError(null);
      } catch (err) {
        console.error("Lỗi khi lấy combo:", err);
        setError("Không thể tải combo. Vui lòng thử lại sau.");
        toast.error("Không thể tải combo");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCombos();
  }, []);

  useEffect(() => {
    let result = [...originalCombos];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (combo) =>
          combo.name.toLowerCase().includes(query) ||
          combo.moTa.toLowerCase().includes(query)
      );
    }
    if (priceRange) {
      result = result.filter(
        (combo) => combo.gia >= priceRange.min && combo.gia <= priceRange.max
      );
    }
    switch (sortOrder) {
      case "price-asc":
        result.sort((a, b) => a.gia - b.gia);
        break;
      case "price-desc":
        result.sort((a, b) => b.gia - a.gia);
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
    setFilteredCombos(result);
  }, [originalCombos, searchQuery, sortOrder, priceRange]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info(`Tìm kiếm: ${searchQuery}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSortOrder("featured");
    setPriceRange(null);
    toast.success("Đã xóa tất cả bộ lọc");
  };

  const addToCart = (combo: Combo) => {
    toast.success(`${combo.name} đã được thêm vào giỏ hàng!`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 pt-24">
        <div className="container px-4 md:px-6 mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 my-[50px]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h1 className="text-3xl font-bold gradient-text">Tất Cả Combo</h1>
              <form onSubmit={handleSearch} className="flex w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Tìm kiếm combo..."
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <p>Đang tải combo...</p>
                </div>
              ) : filteredCombos.length > 0 ? (
                filteredCombos.map((combo) => (
                    <Link
                          to={`/combo/${combo.maCombo}`}>
                        <div
                            key={combo.maCombo}
                            className="rounded-2xl overflow-hidden border border-border colorful-card h-full flex flex-col"
                        >
                            <div
                            className="aspect-video overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-500"
                            >
                            <img
                                src={combo.hinhAnh}
                                alt={combo.name}
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                <h3 className="text-xl font-medium">{combo.name}</h3>
                                <div className="flex gap-2 mt-1 flex-wrap">
                                    {combo.sanPhams.map((product) => (
                                    <Badge
                                        key={product.idSanPham}
                                        variant="outline"
                                        className="bg-secondary text-muted-foreground border-0"
                                    >
                                        <Tag className="h-3 w-3 mr-1" /> {product.name}
                                    </Badge>
                                    ))}
                                </div>
                                </div>
                                <span className="font-medium text-primary">
                                {formatter.format(combo.gia)}
                                </span>
                            </div>
                            <p className="text-muted-foreground flex-1">{combo.moTa}</p>
                            <div className="mt-6 flex gap-2">
                                <Link
                                to={`/combo/${combo.maCombo}`}
                                className="text-primary font-medium hover-effect hover:opacity-80"
                                >
                                Xem chi tiết
                                </Link>
                            </div>
                            </div>
                        </div>
                    </Link>
                  
                ))
              ) : (
                <div className="col-span-full py-12 text-center">
                  <h3 className="text-xl font-medium mb-2">Không tìm thấy combo</h3>
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

export default ComboListing;