import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

// Định nghĩa interface cho dữ liệu GiaoDien
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

const HeroWithSlider: React.FC = () => {
  const [sliderData, setSliderData] = useState<GiaoDienView | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch dữ liệu giao diện từ API
  useEffect(() => {
    const fetchSliderData = async () => {
      try {
        const response = await fetch("http://localhost:5261/api/GiaoDien");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: GiaoDienView[] = await response.json();
        console.log("Dữ liệu API:", data);
        const activeGiaoDien = data.find((item) => item.trangThai === 1);
        if (activeGiaoDien) {
          setSliderData(activeGiaoDien);
        } else {
          console.warn("Không tìm thấy giao diện đang hoạt động.");
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu slider:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSliderData();
  }, []);

  // Chuyển slide tự động mỗi 8 giây
  useEffect(() => {
    if (!sliderData) return;

    const slides = [sliderData.slider1, sliderData.slider2, sliderData.slider3, sliderData.slider4]
      .filter((slide): slide is string => Boolean(slide));

    if (slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const nextSlide = (prev + 1) % slides.length;
        // Đảm bảo khi chuyển từ slider 4 về slider 3, thời gian vẫn là 8 giây
        if (prev === 3 && nextSlide === 2) {
          return nextSlide;
        }
        return nextSlide;
      });
    }, 8000); // Chuyển slide mỗi 8 giây

    return () => clearInterval(interval);
  }, [sliderData]);

  // Hàm chuyển base64 thành URL hình ảnh
  const getImageSrc = (base64?: string): string => {
    if (!base64) return "/fallback-image.jpg"; // Trả về ảnh mặc định nếu không có dữ liệu
    if (base64.startsWith("/9j/")) {
      return `data:image/jpeg;base64,${base64}`;
    }
    if (base64.startsWith("iVBORw0KGgo")) {
      return `data:image/png;base64,${base64}`;
    }
    return `data:image/png;base64,${base64}`; // Mặc định PNG
  };

  // Hàm chuyển slide thủ công
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

  // Xử lý trạng thái loading
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-gray-500">
        Đang tải...
      </div>
    );
  }

  const slides = [sliderData?.slider1, sliderData?.slider2, sliderData?.slider3, sliderData?.slider4]
    .filter((slide): slide is string => Boolean(slide));

  // Xử lý khi không có dữ liệu slider
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

        {/* Slider container với kích thước cố định */}
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
                  {/* Nút "Xem Nhanh" và "Cửa Hàng" ở góc trái dưới */}
                  <div className="absolute bottom-16 left-16 z-20">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <a
                        href="#products"
                        className="inline-flex items-center justify-center h-12 px-6 bg-white text-purple-500 border border-purple-500 rounded-full hover:bg-purple-50 transition-opacity"
                      >
                        Xem Nhanh
                      </a>
                      <Link
                        to="/products"
                        className="inline-flex items-center justify-center h-12 px-6 border border-purple-500 text-purple-500 rounded-full hover:bg-purple-50 transition-colors"
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

          {/* Nút điều hướng */}
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

          {/* Chỉ mục slider */}
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
      </div>
    </section>
  );
};

export default HeroWithSlider;