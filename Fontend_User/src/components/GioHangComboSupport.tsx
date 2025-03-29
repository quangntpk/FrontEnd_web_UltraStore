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
    
    // Chuyển đổi object thành mảng các entries [version, items]
    return Object.entries(grouped).map(([version, items]) => ({
      version: parseInt(version),
      items
    }));
  };

  const parseProductCode = (maSanPham: string) => {
    const parts = maSanPham.split("_");
    const color = parts[1]?.slice(0, 6) || "000000";
    const size = parts[2] || "N/A";
    return { color, size };
  };

  // Lấy tất cả các phiên bản và sản phẩm của chúng
  const groupedVersions = groupByVersion(combo.sanPhamList);
  
  // Số phiên bản hiển thị trên mỗi slide
  const itemsPerSlide = 2;
  
  // Tính tổng số slide cần thiết
  const totalSlides = Math.ceil(groupedVersions.length / itemsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Lấy ra các phiên bản cần hiển thị trên slide hiện tại
  const getVisibleVersions = () => {
    const startIndex = currentSlide * itemsPerSlide;
    return groupedVersions.slice(startIndex, startIndex + itemsPerSlide);
  };

  // Debug để kiểm tra
  console.log("Total versions:", groupedVersions.length);
  console.log("Total slides:", totalSlides);
  console.log("Current slide:", currentSlide);
  console.log("Visible versions:", getVisibleVersions());

  const currentVersions = getVisibleVersions();

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg w-full max-w-7xl mx-auto" style={{width: "1200px"}}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Edit {combo.tenCombo}</h2>
        <Button variant="outline" size="sm" onClick={onClose}>
          <X size={16} className="mr-2" /> Đóng
        </Button>
      </div>

      <div className="relative">
        {/* Carousel container */}
        <div className="overflow-hidden">
          <div className="grid grid-cols-2 gap-4">
            {currentVersions.map((versionGroup, index) => (
              <div
                key={versionGroup.version}
                className="bg-gray-100 rounded-md p-4 relative"
              >
                <button
                  onClick={() => handleRemoveVersion(versionGroup.version)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 z-10"
                >
                  <X size={16} />
                </button>
                <h4 className="font-medium mb-2">
                  Combo {currentSlide * itemsPerSlide + index + 1} (Version: {versionGroup.version})
                </h4>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {versionGroup.items.map((item, itemIndex) => {
                    const { color, size } = parseProductCode(item.maSanPham);
                    return (
                      <div key={itemIndex} className="bg-white p-2 rounded-md shadow-sm">
                        <div className="flex space-x-3">
                          <div className="w-20 h-20 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                            <img
                              src={
                                item.hinhAnh.startsWith("data:image")
                                  ? item.hinhAnh
                                  : `data:image/jpeg;base64,${item.hinhAnh}`
                              }
                              alt={item.tenSanPham}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{item.tenSanPham}</p>
                            <div className="flex items-center mt-1">
                              <span className="text-xs text-gray-500 mr-1">Màu:</span>
                              <div
                                className="w-4 h-4 rounded-sm border border-gray-300"
                                style={{ backgroundColor: `#${color}` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Kích Thước: {size}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Số Lượng: {item.soLuong}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {/* Nếu slide hiện tại chỉ có 1 phiên bản, thêm ô trống để giữ layout */}
            {currentVersions.length === 1 && <div className="bg-transparent rounded-md"></div>}
          </div>
        </div>

        {/* Nút điều hướng - chỉ hiển thị khi có nhiều hơn 1 slide */}
        {totalSlides > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
              disabled={currentSlide === 0}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
              disabled={currentSlide === totalSlides - 1}
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Dots indicator - chỉ hiển thị khi có nhiều hơn 1 slide */}
        {totalSlides > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? "bg-blue-500" : "bg-gray-300"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="text-center mt-6">
        <Button variant="outline" onClick={onClose} className="px-8">
          Đóng
        </Button>
      </div>
    </div>
  );
};

export default GiohangComboSupport;