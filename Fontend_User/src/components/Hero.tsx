import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface GiaoDienView {
  maGiaoDien?: number;
  logo?: string;
  slider1?: string;
  slider2?: string;
  slider3?: string;
  slider4?: string;
  avt?: string;
  trangThai?: number;
}

interface LoaiSanPhamView {
  maLoaiSanPham?: number;
  tenLoaiSanPham?: string;
  kiHieu?: string;
  hinhAnh?: string;
}

const Hero: React.FC = () => {
  const [sliderData, setSliderData] = useState<GiaoDienView | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaiSanPhams, setLoaiSanPhams] = useState<LoaiSanPhamView[]>([]);
  const [loading, setLoading] = useState(true);
  const categorySliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSliderData = async () => {
      try {
        const response = await fetch("http://localhost:5261/api/GiaoDien");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: GiaoDienView[] = await response.json();
        const activeGiaoDien = data.find((item) => item.trangThai === 1);
        if (activeGiaoDien) {
          setSliderData(activeGiaoDien);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu slider:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSliderData();
  }, []);

  useEffect(() => {
    const fetchLoaiSanPhams = async () => {
      try {
        const response = await fetch("http://localhost:5261/api/LoaiSanPham");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: LoaiSanPhamView[] = await response.json();
        setLoaiSanPhams(data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu loại sản phẩm:", error);
      }
    };

    fetchLoaiSanPhams();
  }, []);

  useEffect(() => {
    if (!sliderData) return;

    const slides = [sliderData.slider1, sliderData.slider2, sliderData.slider3, sliderData.slider4]
      .filter((slide): slide is string => Boolean(slide));

    if (slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [sliderData]);

  const getImageSrc = (base64?: string): string => {
    if (!base64) return "/fallback-image.jpg";
    if (base64.startsWith("/9j/")) {
      return `data:image/jpeg;base64,${base64}`;
    }
    if (base64.startsWith("iVBORw0KGgo")) {
      return `data:image/png;base64,${base64}`;
    }
    return `data:image/png;base64,${base64}`;
  };

  const nextSlide = () => {
    const slides = [sliderData?.slider1, sliderData?.slider2, sliderData?.slider3, sliderData?.slider4]
      .filter((slide): slide is string => Boolean(slide));
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
  };

  const prevSlide = () => {
    const slides = [sliderData?.slider1, sliderData?.slider2, sliderData?.slider3, sliderData?.slider4]
      .filter((slide): slide is string => Boolean(slide));
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  const nextCategory = () => {
    if (categorySliderRef.current) {
      const width = categorySliderRef.current.offsetWidth;
      categorySliderRef.current.scrollBy({ left: width, behavior: "smooth" });
    }
  };

  const prevCategory = () => {
    if (categorySliderRef.current) {
      const width = categorySliderRef.current.offsetWidth;
      categorySliderRef.current.scrollBy({ left: -width, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-gray-500">
        Đang tải...
      </div>
    );
  }

  const slides = [sliderData?.slider1, sliderData?.slider2, sliderData?.slider3, sliderData?.slider4]
    .filter((slide): slide is string => Boolean(slide));

  if (!sliderData || slides.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-gray-500">
        Không có ảnh slider để hiển thị
      </div>
    );
  }

  return (
    <section className="w-full py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="h-12"></div>

        <div className="relative w-full max-w-[1800px] h-[400px] mx-auto rounded-lg overflow-hidden shadow-lg">
          <div className="w-full h-full overflow-hidden">
            <div
              className="flex transition-transform duration-1000 ease-in-out h-full"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div key={index} className="min-w-full h-full flex-shrink-0 relative">
                  <img
                    src={getImageSrc(slide)}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = "/fallback-image.jpg")}
                  />
                  <div className="absolute bottom-16 left-16 z-20">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <a
                        href="#products"
                        className="inline-flex items-center justify-center h-12 px-6 bg-white text-purple-500 border-2 border-purple-500 rounded-full hover:bg-purple-50 transition-opacity font-bold"
                      >
                        Xem Nhanh
                      </a>
                      <Link
                        to="/products"
                        className="inline-flex items-center justify-center h-12 px-6 bg-purple-500 text-white border-2 border-purple-500 rounded-full hover:bg-purple-600 transition-colors font-bold italic"
                      >
                        Cửa Hàng
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 text-white p-2 rounded-full hover:bg-white/30 transition-colors z-20"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 text-white p-2 rounded-full hover:bg-white/30 transition-colors z-20"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-3 h-3 rounded-full transition-all",
                  currentSlide === index ? "bg-purple-500 scale-125" : "bg-purple-300"
                )}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-purple-500 mt-8 mb-4">DANH MỤC</h2>

        <div className="relative w-full max-w-[1800px] mx-auto">
          {loaiSanPhams.length > 0 ? (
            <>
              <div
                ref={categorySliderRef}
                className="w-full overflow-x-auto h-[200px] flex space-x-4"
                style={{ scrollBehavior: "smooth" }}
              >
                {loaiSanPhams.map((loai, index) => (
                  <div key={index} className="flex-shrink-0 w-32 text-center">
                    <Link to={`/products?category=${loai.tenLoaiSanPham}`}>
                      <img
                        src={getImageSrc(loai.hinhAnh)}
                        alt={loai.tenLoaiSanPham}
                        className="w-24 h-24 rounded-full object-cover mx-auto"
                        onError={(e) => (e.currentTarget.src = "/fallback-image.jpg")}
                      />
                      <p className="mt-2 text-sm font-semibold">{loai.tenLoaiSanPham}</p>
                    </Link>
                  </div>
                ))}
              </div>

              <button
                onClick={prevCategory}
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/20 text-white p-2 rounded-full hover:bg-white/30 transition-colors z-20"
                aria-label="Previous category"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextCategory}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/20 text-white p-2 rounded-full hover:bg-white/30 transition-colors z-20"
                aria-label="Next category"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          ) : (
            <div className="mt-8 text-center text-gray-500">
              Không có loại sản phẩm để hiển thị
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;