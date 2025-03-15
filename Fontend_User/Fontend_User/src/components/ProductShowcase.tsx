import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Định nghĩa interface mới cho dữ liệu từ API
interface ApiProduct {
  id: string;
  name: string;
  thuongHieu: string;
  loaiSanPham: string;
  kichThuoc: string[];
  soLuong: number;
  donGia: number;
  moTa: string | null;
  chatLieu: string;
  mauSac: string[];
  hinh: string[]; // Giả sử dữ liệu binary được trả về dưới dạng base64 string
  ngayTao: string;
  trangThai: number;
}

// Interface cho ProductCard
interface Product {
  id: string;
  name: string;
  description: string;
  imageSrc: string;
  colorClass: string;
  price: number;
  chatlieu: string;
  thuonghieu: string;
}

const ProductCard = ({ product, index }: { product: Product; index: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const addToCart = () => {
    toast.success(`${product.name} added to cart!`);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref}
      className={cn(
        "rounded-2xl overflow-hidden border border-border colorful-card h-full flex flex-col",
        "transition-all duration-700 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      )}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className={`aspect-video overflow-hidden bg-gradient-to-r ${product.colorClass}`}>
        <img 
          src={
            product.imageSrc && product.imageSrc
              ? `data:image/jpeg;base64,${product.imageSrc}`
              : "/placeholder-image.jpg" 
          }
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 "
        />
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-medium">{product.name}</h3>
          <span className="font-medium text-primary">{product.price} VND</span>
        </div>
        <p className="text-muted-foreground flex-1"><strong>Chất Liệu: </strong>{product.chatlieu}</p>
        <p className="text-muted-foreground flex-1"><strong>Thương Hiệu: </strong>{product.thuonghieu}</p>
        <div className="mt-6 flex gap-2">
          <Link 
            to={`/product/${product.id}`}
            className="text-primary font-medium hover-effect hover:opacity-80"
          >
            Chi Tiết
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-auto"
            onClick={addToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-1" /> 
            Thêm Vào Giỏ Hàng
          </Button>
        </div>
      </div>
    </div>
  );
};

const ProductShowcase = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const transformApiData = (apiData: ApiProduct[]): Product[] => {
    const colorClasses = [
      "from-purple-500 to-indigo-500",
      "from-pink-500 to-rose-500",
      "from-violet-500 to-purple-500"
    ];

    return apiData.map((item, index) => ({
      id: item.id,
      name: item.name,
      description: item.moTa || `Thương hiệu: ${item.thuongHieu} <br/> Chất liệu: ${item.chatLieu}`,
      chatlieu: item.chatLieu,
      thuonghieu: item.thuongHieu,
      imageSrc: item.hinh[0] || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3C/svg%3E",
      colorClass: colorClasses[index % colorClasses.length],
      price: item.donGia 
    }));
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5261/api/SanPham/ListSanPham");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data: ApiProduct[] = await response.json();
        const transformedProducts = transformApiData(data);
        setProducts(transformedProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-24 px-6 bg-gradient-to-b from-white to-secondary/30">
        <div className="container mx-auto max-w-6xl text-center">
          <p>Loading products...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-24 px-6 bg-gradient-to-b from-white to-secondary/30">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="py-24 px-6 bg-gradient-to-b from-white to-secondary/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-medium mb-4 gradient-text">Danh Sách Sản phẩm</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tìm kiếm các sản phẩm thời trang may mặc của cửa hàng chúng tôi.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link to="/cart">
            <Button size="lg" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              View Cart
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;