import { useState, useEffect } from "react";
import { X, Edit, Trash } from "lucide-react";

const ProductDetailAdminModal = ({ productId, isOpen, onClose }) => {
  const [products, setProducts] = useState([]); // Lưu danh sách tất cả biến thể sản phẩm
  const [selectedColorIndex, setSelectedColorIndex] = useState(0); // Chỉ số màu được chọn
  const [selectedImage, setSelectedImage] = useState(0); // Chỉ số ảnh được chọn để phóng to
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId || !isOpen) return;

      try {
        setLoading(true);
        const baseProductId = productId.split('_')[0] || productId;
        const response = await fetch(`http://localhost:5261/api/SanPham/SanPhamByIDSorted?id=${baseProductId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        const productArray = Array.isArray(data) ? data : [data];

        const formattedProducts = productArray.map(product => ({
          id: product.id,
          name: product.tenSanPham,
          description: product.moTa || "Không có mô tả",
          color: `#${product.mauSac}`,
          sizes: product.details.map(detail => ({
            size: detail.kichThuoc.trim(),
            quantity: detail.soLuong,
            price: detail.gia / 1000
          })),
          material: product.chatLieu,
          brand: product.maThuongHieu,
          productType: product.loaiSanPham,
          images: product.hinhAnhs?.map(base64 => 
            `data:image/jpeg;base64,${base64}`
          ) || []
        }));

        setProducts(formattedProducts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, isOpen]);

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      try {
        const response = await fetch(`http://localhost:5261/api/SanPham/${productId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete product");
        }
        alert("Xóa sản phẩm thành công!");
        onClose();
      } catch (err) {
        console.error("Error deleting product:", err);
        alert("Có lỗi xảy ra khi xóa sản phẩm!");
      }
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <p>Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error || !products.length) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <p>Error: {error || "Không tìm thấy sản phẩm"}</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">
            Đóng
          </button>
        </div>
      </div>
    );
  }

  const currentProduct = products[selectedColorIndex]; // Sản phẩm theo màu được chọn

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Chi Tiết Sản Phẩm</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <img 
                src={currentProduct.images[selectedImage]} 
                alt={currentProduct.name} 
                className="w-full aspect-[4/5] object-cover"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {currentProduct.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 object-cover rounded-lg border-2 transition-all ${
                    selectedImage === index ? "border-blue-500" : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${currentProduct.name} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium">{currentProduct.name}</h3>
              <p className="text-gray-600 mt-2">{currentProduct.description}</p>
            </div>

            {/* Colors */}
            <div>
              <h4 className="font-medium">Màu sắc:</h4>
              <div className="flex gap-3 mt-2">
                {products.map((product, index) => (
                  <button
                    key={product.id}
                    className={`w-8 h-8 rounded-full transition-all ${
                      selectedColorIndex === index 
                        ? "ring-2 ring-offset-2 ring-blue-500" 
                        : "ring-1 ring-gray-200 hover:ring-blue-300"
                    }`}
                    style={{ backgroundColor: product.color }}
                    onClick={() => setSelectedColorIndex(index)}
                    aria-label={`Select color ${product.color}`}
                  />
                ))}
              </div>
            </div>

            {/* Sizes & Prices */}
            <div>
              <h4 className="font-medium">Kích thước & Giá:</h4>
              <ul className="mt-2 space-y-2 text-gray-600">
                {currentProduct.sizes.map((size, index) => (
                  <li key={index}>
                    {size.size}: {size.quantity} (Giá: ${size.price.toFixed(2)})
                  </li>
                ))}
              </ul>
            </div>

            {/* Additional Info */}
            <div>
              <h4 className="font-medium">Thông tin bổ sung:</h4>
              <ul className="mt-2 space-y-2 text-gray-600">
                <li>Chất liệu: {currentProduct.material}</li>
                <li>Thương hiệu: {currentProduct.brand}</li>
                <li>Loại sản phẩm: {currentProduct.productType}</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6">
              <button 
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center"
                onClick={() => alert("Chức năng chỉnh sửa đang phát triển")}
              >
                <Edit className="mr-2 h-5 w-5" />
                Chỉnh sửa
              </button>
              <button 
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center"
                onClick={handleDelete}
              >
                <Trash className="mr-2 h-5 w-5" />
                Xóa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailAdminModal;