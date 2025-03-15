import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Heart, ShoppingBag, Star, Trash2 } from "lucide-react";

const ProductDetail = () => {
  const { productId } = useParams();
  const [products, setProducts] = useState([]);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho bình luận và đánh giá
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(0);
  const [likedComments, setLikedComments] = useState(new Set()); // Theo dõi bình luận được thích

  useEffect(() => {
    const fetchProductAndComments = async () => {
      if (!productId) {
        setError("Product ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Lấy thông tin sản phẩm
        const baseProductId = productId.split('_')[0] || productId;
        const productResponse = await fetch(`http://localhost:5261/api/SanPham/SanPhamByIDSorted?id=${baseProductId}`);
        if (!productResponse.ok) throw new Error('Failed to fetch product');
        const productData = await productResponse.json();
        const productArray = Array.isArray(productData) ? productData : [productData];

        const formattedProducts = productArray.map(product => ({
          id: product.id,
          baseId: product.id.split('_')[0],
          colorCode: product.id.split('_')[1] || product.mauSac,
          name: product.tenSanPham,
          description: product.moTa || "Không có mô tả",
          price: product.details[0]?.gia / 1000 || 0,
          rating: 4.5,
          color: `#${product.mauSac || product.id.split('_')[1]}`,
          sizes: product.details.map(detail => ({
            size: detail.kichThuoc.trim(),
            quantity: detail.soLuong,
            price: detail.gia / 1000
          })),
          material: product.chatLieu,
          brand: product.maThuongHieu,
          productType: product.loaiSanPham,
          images: product.hinhAnhs?.map(base64 => `data:image/jpeg;base64,${base64}`) || []
        }));
        setProducts(formattedProducts);

        // Lấy danh sách bình luận
        const commentResponse = await fetch("http://localhost:5261/api/Comment/list");
        if (!commentResponse.ok) throw new Error("Failed to fetch comments");
        const commentData = await commentResponse.json();
        const productComments = commentData.filter(comment => comment.maSanPham === baseProductId);
        setComments(productComments);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndComments();
  }, [productId]);

  const getUniqueColorList = () => {
    const colorMap = new Map();
    products.forEach(product => colorMap.set(product.color, product.id));
    return Array.from(colorMap.entries()).map(([color, id]) => ({ id, color }));
  };

  const getSizesForColor = () => products[selectedColorIndex].sizes;

  const handleAddToCart = async () => {
    if (selectedSizeIndex === null) {
      alert("Vui lòng chọn kích thước trước khi thêm vào giỏ hàng!");
      return;
    }

    const selectedProduct = products[selectedColorIndex];
    const selectedSize = selectedProduct.sizes[selectedSizeIndex];
    const cartData = {
      IDNguoiDung: "KH0001",
      IDSanPham: productId.split('_')[0] || productId,
      MauSac: selectedProduct.colorCode,
      KichThuoc: selectedSize.size,
      SoLuong: quantity
    };

    try {
      const response = await fetch("http://localhost:5261/api/Cart/ThemSanPhamVaoGioHang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cartData),
      });
      if (!response.ok) throw new Error("Failed to add to cart");
      alert("Đã thêm vào giỏ hàng thành công!");
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Có lỗi xảy ra khi thêm vào giỏ hàng!");
    }
  };

  const handleAddComment = async () => {
    if (!newComment || rating < 1 || rating > 5) {
      alert("Vui lòng nhập nội dung bình luận và chọn đánh giá từ 1 đến 5 sao!");
      return;
    }

    const commentData = {
      maSanPham: productId.split('_')[0] || productId,
      maNguoiDung: "KH0001",
      noiDungBinhLuan: newComment,
      danhGia: rating,
      ngayBinhLuan: new Date().toISOString(),
    };

    try {
      const response = await fetch("http://localhost:5261/api/Comment/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commentData),
      });
      if (!response.ok) throw new Error("Failed to add comment");
      const addedComment = await response.json();
      setComments([...comments, addedComment]);
      setNewComment("");
      setRating(0);
      alert("Đã thêm bình luận thành công!");
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("Có lỗi xảy ra khi thêm bình luận!");
    }
  };

  const handleDeleteComment = async (maBinhLuan) => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;

    try {
      const response = await fetch(`http://localhost:5261/api/Comment/delete/${maBinhLuan}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete comment");
      setComments(comments.filter(comment => comment.maBinhLuan !== maBinhLuan));
      setLikedComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(maBinhLuan);
        return newSet;
      });
      alert("Đã xóa bình luận thành công!");
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("Có lỗi xảy ra khi xóa bình luận!");
    }
  };

  // Xử lý thích/hủy thích bình luận
  const handleLikeComment = async (maBinhLuan, currentLikes) => {
    const isLiked = likedComments.has(maBinhLuan);
    const newLikes = isLiked ? currentLikes - 1 : currentLikes + 1;

    const updatedCommentData = {
      soTimBinhLuan: newLikes,
    };

    try {
      const response = await fetch(`http://localhost:5261/api/Comment/update/${maBinhLuan}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCommentData),
      });
      if (!response.ok) throw new Error("Failed to update like count");

      const updatedComment = await response.json();
      setComments(comments.map(comment =>
        comment.maBinhLuan === maBinhLuan ? updatedComment : comment
      ));

      setLikedComments(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.delete(maBinhLuan);
        } else {
          newSet.add(maBinhLuan);
        }
        return newSet;
      });
    } catch (err) {
      console.error("Error updating like count:", err);
      alert("Có lỗi xảy ra khi cập nhật số tim!");
    }
  };

  if (loading) {
    return <div className="pt-24 pb-16 px-6 min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }

  if (error || !products.length) {
    return <div className="pt-24 pb-16 px-6 min-h-screen flex items-center justify-center"><p>Error: {error || "Product not found"}</p></div>;
  }

  const baseProduct = products[0];
  const currentProduct = products[selectedColorIndex];
  const availableSizes = getSizesForColor();
  const selectedPrice = selectedSizeIndex !== null ? currentProduct.sizes[selectedSizeIndex].price : currentProduct.price;

  return (
    <>
      <Navigation />
      <div className="pt-24 pb-16 px-6 min-h-screen bg-gradient-to-b from-white to-secondary/20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden border border-border bg-white shadow-sm">
                <img src={baseProduct.images[selectedImage]} alt={baseProduct.name} className="w-full aspect-[4/5] object-cover" />
              </div>
              <div className="flex gap-3 overflow-auto pb-2">
                {baseProduct.images.map((image, index) => (
                  <button
                    key={index}
                    className={cn(
                      "rounded-lg overflow-hidden border-2 min-w-[80px] w-20 aspect-square transition-all",
                      selectedImage === index ? "border-primary ring-2 ring-primary/20" : "border-border/50 hover:border-primary/50"
                    )}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={image} alt={`${baseProduct.name} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="flex flex-col space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-medium mb-2 gradient-text">{baseProduct.name}</h1>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={cn("w-4 h-4", index < Math.floor(baseProduct.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{baseProduct.rating}</span>
                </div>
                <p className="text-2xl font-medium text-primary mb-4">${selectedPrice.toFixed(2)}</p>
                <p className="text-muted-foreground">{baseProduct.description}</p>
              </div>

              {/* Colors */}
              <div>
                <h3 className="text-sm font-medium mb-3">Màu Sắc</h3>
                <div className="flex gap-3">
                  {getUniqueColorList().map((item, index) => (
                    <button
                      key={item.id}
                      className={cn(
                        "w-8 h-8 rounded-full transition-all",
                        selectedColorIndex === index ? "ring-2 ring-offset-2 ring-primary" : "ring-1 ring-border hover:ring-primary"
                      )}
                      style={{ backgroundColor: item.color }}
                      onClick={() => {
                        setSelectedColorIndex(index);
                        setSelectedSizeIndex(null);
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Sizes */}
              {currentProduct && (
                <div>
                  <h3 className="text-sm font-medium mb-3">Kích Thước</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((sizeObj, index) => (
                      <button
                        key={index}
                        className={cn(
                          "h-10 min-w-[40px] px-3 rounded border text-sm font-medium transition-all",
                          selectedSizeIndex === index ? "border-primary bg-primary/10 shadow-lg" : "border-border hover:border-primary/50"
                        )}
                        onClick={() => setSelectedSizeIndex(index)}
                      >
                        {sizeObj.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="text-sm font-medium mb-3">Số Lượng</h3>
                <div className="flex items-center border border-border rounded-md w-32">
                  <button
                    className="w-10 h-10 flex items-center justify-center text-lg"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <div className="flex-1 text-center">{quantity}</div>
                  <button
                    className="w-10 h-10 flex items-center justify-center text-lg"
                    onClick={() =>
                      setQuantity(Math.min(
                        selectedSizeIndex !== null ? availableSizes[selectedSizeIndex].quantity : currentProduct.sizes[0].quantity,
                        quantity + 1
                      ))
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Product Features */}
              <div>
                <h3 className="text-sm font-medium mb-3">Thông Tin Sản Phẩm</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span className="text-muted-foreground">Chất liệu: {baseProduct.material}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span className="text-muted-foreground">Thương hiệu: {baseProduct.brand}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span className="text-muted-foreground">Loại sản phẩm: {baseProduct.productType}</span>
                  </li>
                </ul>
              </div>

              {/* Add to Cart and Wishlist */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
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
          </div>

          {/* Comment Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-medium mb-6">Bình Luận & Đánh Giá</h2>

            {/* Form thêm bình luận */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-medium mb-4">Viết bình luận của bạn</h3>
              <div className="flex items-center mb-4">
                <span className="mr-2">Đánh giá:</span>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={cn(
                      "w-6 h-6 cursor-pointer",
                      index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    )}
                    onClick={() => setRating(index + 1)}
                  />
                ))}
              </div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Nhập bình luận của bạn..."
                className="w-full p-3 border rounded-md mb-4"
                rows={4}
              />
              <button
                onClick={handleAddComment}
                className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
              >
                Gửi Bình Luận
              </button>
            </div>

            {/* Danh sách bình luận */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-muted-foreground">Chưa có bình luận nào.</p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.maBinhLuan}
                    className="bg-white p-4 rounded-lg shadow-md flex justify-between items-start"
                  >
                    <div>
                      <div className="flex items-center mb-2">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={cn(
                              "w-4 h-4",
                              index < comment.danhGia ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-gray-800">{comment.noiDungBinhLuan}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Bởi {comment.maNguoiDung} - {new Date(comment.ngayBinhLuan).toLocaleDateString()}
                      </p>
                      <div className="flex items-center mt-2">
                        <button
                          onClick={() => handleLikeComment(comment.maBinhLuan, comment.soTimBinhLuan)}
                          className="flex items-center gap-1"
                        >
                          <Heart
                            className={cn(
                              "w-5 h-5",
                              likedComments.has(comment.maBinhLuan) ? "fill-red-500 text-red-500" : "text-gray-400"
                            )}
                          />
                          <span className="text-sm">{comment.soTimBinhLuan}</span>
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteComment(comment.maBinhLuan)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductDetail;