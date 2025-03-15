import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Heart, ShoppingBag, Star } from "lucide-react";
const ComboDetail = () => {
  const { id } = useParams();
  const [combo, setCombo] = useState(null);
  const [selections, setSelections] = useState({});
  const [comboQuantity, setComboQuantity] = useState(1);
  const [selectedImages, setSelectedImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCombo = async () => {
      if (!id) {
        setError("Combo ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5261/api/Combo/ComboSanPhamView?id=${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch combo");
        }
        const data = await response.json();
        const comboData = Array.isArray(data) ? data[0] : data;

        const formattedCombo = {
          id: comboData.maCombo,
          name: comboData.name,
          description: comboData.moTa || "Không có mô tả",
          price: comboData.gia ,
          image: `data:image/jpeg;base64,${comboData.hinhAnh}`,
          quantity: comboData.soLuong,
          products: comboData.sanPhams.map(product => ({
            id: product.idSanPham,
            name: product.name,
            brand: product.thuongHieu,
            productType: product.loaiSanPham,
            sizes: product.kichThuoc.map(size => ({
              size: size.trim(),
              quantity: product.soLuong,
              price: product.donGia ,
            })),
            colors: product.mauSac.map(color => `#${color}`),
            images: product.hinh.map(base64 => `data:image/jpeg;base64,${base64}`),
            material: product.chatLieu,
            description: product.moTa || "Không có mô tả",
            rating: 4.5,
          })),
        };
        console.log(formattedCombo);
        setCombo(formattedCombo);

        const initialSelections = {};
        const initialImages = {};
        formattedCombo.products.forEach(product => {
          initialSelections[product.id] = { colorIndex: 0, sizeIndex: null };
          initialImages[product.id] = 0;
        });
        setSelections(initialSelections);
        setSelectedImages(initialImages);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCombo();
  }, [id]);

  const handleSelectionChange = (productId, field, value) => {
    setSelections(prev => ({
      ...prev,
      [productId]: { ...prev[productId], [field]: value },
    }));
  };

  const handleImageChange = (productId, index) => {
    setSelectedImages(prev => ({ ...prev, [productId]: index }));
  };

  const handleAddToCart = async () => {
    const invalidProducts = combo.products.filter(
      product => selections[product.id].sizeIndex === null
    );
    if (invalidProducts.length > 0) {
      alert("Vui lòng chọn kích thước cho tất cả sản phẩm trong combo!");
      return;
    }

    const cartData = {
      IDKhachHang: "KH001", // Customer ID as string
      IDCombo: Number(combo.id), // Ensure combo ID is a number
      SoLuong: Number(comboQuantity), // Ensure quantity is a number
      Detail: combo.products.map(product => ({
        MaSanPham: String(product.id), // Product ID as string
        MauSac: product.colors[selections[product.id].colorIndex].replace("#", ""),
        KichThuoc: product.sizes[selections[product.id].sizeIndex].size, // Selected size
      })),
    };
    console.log(cartData)
    try {
      console.log("Sending cart data:", cartData); // For debugging
      
      const response = await fetch("http://localhost:5261/api/Cart/ThemComboVaoGioHang", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cartData),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add combo to cart: ${errorText}`);
      }
  
      alert("Đã thêm combo vào giỏ hàng thành công!");
    } catch (err) {
      console.error("Error adding combo to cart:", err);
      alert(`Có lỗi xảy ra khi thêm vào giỏ hàng: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16 px-6 min-h-screen flex items-center justify-center">
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error || !combo) {
    return (
      <div className="pt-24 pb-16 px-6 min-h-screen flex items-center justify-center">
        <p>Lỗi: {error || "Combo not found"}</p>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="pt-24 pb-16 px-6 min-h-screen bg-gradient-to-b from-white to-secondary/20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Cột trái: Ảnh combo, Số lượng, Nút thêm vào giỏ hàng và yêu thích */}
            <div className="space-y-6">
              <div className="rounded-xl overflow-hidden border border-border bg-white shadow-sm">
                <img
                  src={combo.image}
                  alt={combo.name}
                  className="w-full aspect-[4/5] object-cover"
                />
              </div>

              {/* Combo Quantity */}
              <div>
                <h4 className="text-sm font-medium mb-2">Số Lượng Combo</h4>
                <div className="flex items-center border border-border rounded-md w-32">
                  <button
                    className="w-10 h-10 flex items-center justify-center text-lg"
                    onClick={() => setComboQuantity(Math.max(1, comboQuantity - 1))}
                    disabled={comboQuantity <= 1}
                  >
                    -
                  </button>
                  <div className="flex-1 text-center">{comboQuantity}</div>
                  <button
                    className="w-10 h-10 flex items-center justify-center text-lg"
                    onClick={() => setComboQuantity(Math.min(combo.quantity, comboQuantity + 1))}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart and Favorite */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  className="flex-1 h-12 px-6 gradient-bg text-white rounded-full hover:opacity-90 transition-opacity flex items-center justify-center"
                  onClick={handleAddToCart}
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Thêm Vào Giỏ Hàng
                </button>
                <button className="h-12 w-12 border border-primary/30 rounded-full hover:bg-primary/5 transition-colors flex items-center justify-center">
                  <Heart className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Cột phải: Chi tiết combo và danh sách sản phẩm */}
            <div className="flex flex-col space-y-6">
              <h1 className="text-3xl md:text-4xl font-medium mb-6 gradient-text">{combo.name}</h1>
              <div>
                <p className="text-2xl font-medium text-primary mb-4">{combo.price.toFixed} VND</p>
                <p className="text-muted-foreground">{combo.description}</p>
              </div>

              {/* Product Selections */}
              {combo.products.map(product => (
                <div key={product.id} className="border p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">{product.name}</h3>

                  {/* Product Slider */}
                  <div className="space-y-4">
                    <div className="rounded-xl overflow-hidden border border-border bg-white shadow-sm">
                      <img
                        src={product.images[selectedImages[product.id]]}
                        alt={product.name}
                        className="w-full object-cover"
                        style={{ maxHeight: "200px" }}
                      />
                    </div>
                    <div className="flex gap-3 overflow-auto pb-2">
                      {product.images.map((image, index) => (
                        <button
                          key={index}
                          className={cn(
                            "rounded-lg overflow-hidden border-2 min-w-[80px] w-20 aspect-square transition-all",
                            selectedImages[product.id] === index
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-border/50 hover:border-primary/50"
                          )}
                          onClick={() => handleImageChange(product.id, index)}
                        >
                          <img
                            src={image}
                            alt={`${product.name} thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Màu Sắc</h4>
                    <div className="flex gap-3">
                      {product.colors.map((color, index) => (
                        <button
                          key={index}
                          className={cn(
                            "w-8 h-8 rounded-full transition-all",
                            selections[product.id].colorIndex === index
                              ? "ring-2 ring-offset-2 ring-primary"
                              : "ring-1 ring-border hover:ring-primary"
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() =>
                            handleSelectionChange(product.id, "colorIndex", index)
                          }
                          aria-label={`Select color ${color}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Sizes */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Kích Thước</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((sizeObj, index) => (
                        <button
                          key={index}
                          className={cn(
                            "h-10 min-w-[40px] px-3 rounded border text-sm font-medium transition-all",
                            selections[product.id].sizeIndex === index
                              ? "border-primary bg-primary/10 shadow-lg"
                              : "border-border hover:border-primary/50"
                          )}
                          onClick={() =>
                            handleSelectionChange(product.id, "sizeIndex", index)
                          }
                        >
                          {sizeObj.size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ComboDetail;