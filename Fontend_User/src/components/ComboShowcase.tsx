import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Định nghĩa interface cho dữ liệu từ API
interface ApiComboSanPham {
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

interface ApiCombo {
  maCombo: number;
  name: string;
  hinhAnh: string;
  ngayTao: string;
  trangThai: number;
  sanPhams: ApiComboSanPham[];
  moTa: string;
  gia: number;
  soLuong: number;
}

interface Combo {
  id: number;
  name: string;
  description: string;
  imageSrc: string;
  colorClass: string;
  price: number;
  products: string[];
}

const ComboCard = ({ combo, index }: { combo: Combo; index: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const addToCart = () => {
    toast.success(`${combo.name} added to cart!`);
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
      <div className={`aspect-video overflow-hidden bg-gradient-to-r ${combo.colorClass}`}>
        <img
          src={
            combo.imageSrc
              ? `data:image/jpeg;base64,${combo.imageSrc}`
              : "/placeholder-image.jpg"
          }
          alt={combo.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-medium">{combo.name}</h3>
          <span className="font-medium text-primary">{combo.price} VND</span>
        </div>
        <p className="text-muted-foreground flex-1"><strong>Mô tả: </strong>{combo.description}</p>
        <p className="text-muted-foreground flex-1">
          <strong>Sản phẩm trong combo: </strong>
          {combo.products.join(", ") || "Không có sản phẩm"}
        </p>
        <div className="mt-6 flex gap-2">
          <Link
            to={`/combo/${combo.id}`}
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

const ComboShowcase = () => {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const transformApiData = (apiData: ApiCombo[]): Combo[] => {
    const colorClasses = [
      "from-purple-500 to-indigo-500",
      "from-pink-500 to-rose-500",
      "from-violet-500 to-purple-500",
    ];

    return apiData.map((item, index) => ({
      id: item.maCombo,
      name: item.name || "Không có tên",
      description: item.moTa || "Không có mô tả",
      imageSrc: item.hinhAnh || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3C/svg%3E",
      colorClass: colorClasses[index % colorClasses.length],
      price: item.gia || 0,
      products: Array.isArray(item.sanPhams) ? item.sanPhams.map((p) => p.name || "Không có tên") : [],
    }));
  };

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5261/api/Combo/ComboSanPhamView");
        if (!response.ok) {
          throw new Error("Failed to fetch combos");
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("API response is not an array");
        }
        const transformedCombos = transformApiData(data);
        setCombos(transformedCombos);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCombos();
  }, []);

  if (loading) {
    return (
      <section className="py-24 px-6 bg-gradient-to-b from-white to-secondary/30">
        <div className="container mx-auto max-w-6xl text-center">
          <p>Loading combos...</p>
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
    <section id="combos" className="py-24 px-6 bg-gradient-to-b from-white to-secondary/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-medium mb-4 gradient-text">Danh Sách Combo</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Khám phá các combo thời trang đặc biệt của chúng tôi với mức giá ưu đãi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.isArray(combos) && combos.length > 0 ? (
            combos.map((combo, index) => (
              <ComboCard key={combo.id} combo={combo} index={index} />
            ))
          ) : (
            <p className="text-center col-span-full">Không có combo nào để hiển thị.</p>
          )}
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

export default ComboShowcase;