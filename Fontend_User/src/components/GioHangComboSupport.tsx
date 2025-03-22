import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Swal from "sweetalert2";

interface ComboItem {
  idCombo: number;
  tenCombo: string;
  hinhAnh: string;
  soLuong: number;
  chiTietGioHangCombo: number;
  sanPhamList: {
    maSanPham: string;
    soLuong: number;
    version: number;
    hinhAnh: string;
    tenSanPham: string;
  }[];
}

interface GiohangComboSupportProps {
  combo: ComboItem;
  onClose: () => void;
  onUpdateCombo: (updatedCombo: ComboItem) => void;
}

const GiohangComboSupport = ({ combo, onClose, onUpdateCombo }: GiohangComboSupportProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Các hàm xử lý logic (giữ nguyên)
  const handleRemoveVersion = async (version: number) => {
    onClose();
    const result = await Swal.fire({
      title: "Hãy xác nhận lại?",
      text: "Bạn có chắc chắn muốn xóa Combo này ra khỏi giỏ hàng không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xóa!",
      cancelButtonText: "Không!",
    });

    if (result.isConfirmed) {
      try {
        const requestData = {
          ChiTietGioHang: combo.chiTietGioHangCombo,
          Version: version,
        };

        const response = await fetch("http://localhost:5261/api/Cart/XoaComboVersion", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          throw new Error("Failed to remove combo version");
        }

        const updatedSanPhamList = combo.sanPhamList.filter((item) => item.version !== version);
        const updatedCombo = { ...combo, sanPhamList: updatedSanPhamList };
        onUpdateCombo(updatedCombo);

        toast.success("Combo version removed successfully");
        await Swal.fire({
          title: "Deleted!",
          text: "The combo version has been removed.",
          icon: "success",
        });
      } catch (error) {
        console.error("Error removing combo version:", error);
        toast.error("Failed to remove combo version");
        await Swal.fire({
          title: "Error!",
          text: "There was a problem removing the combo version.",
          icon: "error",
        });
      }
    }
  };

  const groupByVersion = (sanPhamList: ComboItem["sanPhamList"]) => {
    const grouped = sanPhamList.reduce((acc, item) => {
      if (!acc[item.version]) {
        acc[item.version] = [];
      }
      acc[item.version].push(item);
      return acc;
    }, {} as Record<number, ComboItem["sanPhamList"]>);
    return Object.entries(grouped);
  };

  const parseProductCode = (maSanPham: string) => {
    const parts = maSanPham.split("_");
    const color = parts[1]?.slice(0, 6) || "000000";
    const size = parts[2] || "N/A";
    return { color, size };
  };

  const chunkArray = (array: any[], size: number) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };

  const groupedItems = groupByVersion(combo.sanPhamList);
  const itemsPerSlide = 2;
  const chunkedItems = chunkArray(groupedItems, itemsPerSlide);
  const totalSlides = chunkedItems.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg w-full max-w-[1200px]"> {/* Thay p-6 và max-w-7xl */}
      <h2 className="text-xl font-semibold mb-4">Edit {combo.tenCombo}</h2>

      <div className="relative">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
              width: `${totalSlides * 100}%`,
            }}
          >
            {chunkedItems.map((slideItems, slideIndex) => (
              <div key={slideIndex} className="w-full flex flex-shrink-0">
                {slideItems.map(([version, items], index) => (
                  <div
                    key={version}
                    className="w-1/2 flex-shrink-0 p-3 bg-gray-100 rounded-md relative mx-1" /* Thay mx-2 */
                    style={{ maxWidth: "450px" }} 
                  >
                    <button
                      onClick={() => handleRemoveVersion(parseInt(version))}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 z-10"
                    >
                      <X size={16} />
                    </button>
                    <h4 className="font-medium mb-2">Combo {(slideIndex * itemsPerSlide) + index + 1}</h4>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {items.map((item, itemIndex) => {
                        const { color, size } = parseProductCode(item.maSanPham);
                        return (
                          <div key={itemIndex} className="flex flex-col space-y-2">
                            <div className="w-full h-[150px] bg-muted rounded-md overflow-hidden">
                              <img
                                src={
                                  item.hinhAnh.startsWith("data:image")
                                    ? item.hinhAnh
                                    : `data:image/jpeg;base64,${item.hinhAnh}`
                                }
                                alt={item.maSanPham}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold truncate">{item.tenSanPham}</p>
                              <div className="flex items-center space-x-2">
                                <span className="text-muted-foreground text-xs">Màu Sắc:</span>
                                <div
                                  className="w-6 h-4 rounded-sm border border-gray-300"
                                  style={{ backgroundColor: `#${color}` }}
                                />
                              </div>
                              <p className="text-muted-foreground text-xs">Kích Thước: {size}</p>
                              <p className="text-muted-foreground text-xs">
                                Số Lượng: {item.soLuong}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {slideItems.length < itemsPerSlide && (
                  <div className="w-1/2 flex-shrink-0 p-3 mx-1"></div> /* Thay mx-2 */
                )}
              </div>
            ))}
          </div>
        </div>

        {totalSlides > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {totalSlides > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentSlide ? "bg-primary" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <Button className="mt-6 w-full" variant="outline" onClick={onClose}>
        Close
      </Button>
    </div>
  );
};

export default GiohangComboSupport;