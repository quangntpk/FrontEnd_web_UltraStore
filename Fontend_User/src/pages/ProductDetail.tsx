import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Heart, ShoppingBag, Star, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={cn("fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 font-roboto", type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white")}>
      <p>{message}</p>
      <button onClick={onClose} className="absolute top-1 right-1 text-white hover:text-gray-200">×</button>
    </div>
  );
};

const ConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 font-roboto">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h3 className="text-lg font-medium mb-4">Xác nhận xóa</h3>
        <p className="mb-6">Bạn có chắc muốn xóa bình luận này không?</p>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">Không</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Có</button>
        </div>
      </div>
    </div>
  );
};

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likedId, setLikedId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(0);
  const [likedComments, setLikedComments] = useState(new Set());
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const showNotification = (message, type) => setNotification({ message, type });
  const closeNotification = () => setNotification(null);

  useEffect(() => {
    const fetchProductAndComments = async () => {
      if (!productId) {
        setError("Product ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const baseProductId = productId.split('_')[0] || productId;

        const productResponse = await fetch(`http://localhost:5261/api/SanPham/SanPhamByIDSorted?id=${baseProductId}`);
        if (!productResponse.ok) throw new Error('Failed to fetch product');
        const productData = await productResponse.json();
        const productArray = Array.isArray(productData) ? productData : [productData];

        const formattedProducts = productArray.map(product => {
          const [baseId, colorCode] = product.id.split('_');
          return {
            id: product.id,
            baseId,
            colorCode,
            name: product.tenSanPham,
            description: product.moTa || "Không có mô tả",
            price: product.details[0]?.gia || 0,
            rating: 0,
            color: `#${product.mauSac || colorCode}`,
            sizes: product.details.map(detail => ({
              size: detail.kichThuoc.trim(),
              quantity: detail.soLuong,
              price: detail.gia
            })),
            material: product.chatLieu,
            brand: product.maThuongHieu,
            productType: product.loaiSanPham,
            images: product.hinhAnhs?.map(base64 => `data:image/jpeg;base64,${base64}`) || []
          };
        });

        // Fetch comments với số lượng tim
        const commentResponse = await fetch("http://localhost:5261/api/Comment/list");
        if (!commentResponse.ok) throw new Error("Failed to fetch comments");
        const commentData = await commentResponse.json();
        const productComments = commentData
          .filter(comment => comment.maSanPham === baseProductId && comment.trangThai === 1)
          .map(comment => ({
            ...comment,
            soTimBinhLuan: comment.soTimBinhLuan || 0 // Đảm bảo có số tim, mặc định là 0 nếu không có
          }))
          .sort((a, b) => b.soTimBinhLuan - a.soTimBinhLuan); // Sắp xếp theo số tim giảm dần

        const userData = JSON.parse(localStorage.getItem("user"));
        const currentUserId = userData?.maNguoiDung;
        if (currentUserId) {
          const yeuThichResponse = await fetch("http://localhost:5261/api/YeuThich");
          if (!yeuThichResponse.ok) throw new Error("Failed to fetch favorites");
          const yeuThichData = await yeuThichResponse.json();
          const userFavorite = yeuThichData.find(
            yeuThich => yeuThich.maSanPham === baseProductId && yeuThich.maNguoiDung === currentUserId
          );
          if (userFavorite) {
            setIsLiked(true);
            setLikedId(userFavorite.maYeuThich);
          }

          // Khôi phục trạng thái likedComments từ localStorage
          const likedCommentsKey = `likedComments_${currentUserId}`;
          const storedLikedComments = JSON.parse(localStorage.getItem(likedCommentsKey)) || [];
          setLikedComments(new Set(storedLikedComments));
        }

        const currentUserHoTen = userData?.hoTen;
        const enrichedComments = productComments.map(comment => ({
          ...comment,
          hoTen: comment.maNguoiDung === currentUserId ? currentUserHoTen : comment.maNguoiDung
        }));
        setComments(enrichedComments);

        const totalRating = enrichedComments.reduce((sum, comment) => sum + comment.danhGia, 0);
        const averageRating = enrichedComments.length > 0 ? totalRating / enrichedComments.length : 0;
        const roundedAverageRating = Number(averageRating.toFixed(1));

        formattedProducts.forEach(product => {
          product.rating = roundedAverageRating;
        });
        setProducts(formattedProducts);

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

  const handleToggleLike = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const maNguoiDung = userData?.maNguoiDung;
    const hoTen = userData?.hoTen;

    if (!maNguoiDung) {
      showNotification("Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích!", "error");
      return;
    }

    const baseProductId = productId.split('_')[0] || productId;
    const tenSanPham = products[0]?.name;

    if (isLiked) {
      try {
        const response = await fetch(`http://localhost:5261/api/YeuThich/${likedId}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        });
        if (!response.ok) throw new Error("Failed to remove favorite");
        setIsLiked(false);
        setLikedId(null);
        showNotification("Đã xóa sản phẩm khỏi danh sách yêu thích!", "success");
      } catch (err) {
        showNotification("Có lỗi xảy ra khi xóa yêu thích!", "error");
      }
    } else {
      const yeuThichData = {
        maSanPham: baseProductId,
        tenSanPham: tenSanPham,
        maNguoiDung: maNguoiDung,
        hoTen: hoTen,
        soLuongYeuThich: 1,
        ngayYeuThich: new Date().toISOString(),
      };
      try {
        const response = await fetch("http://localhost:5261/api/YeuThich", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify(yeuThichData),
        });
        if (!response.ok) throw new Error("Failed to add favorite");
        const addedFavorite = await response.json();
        setIsLiked(true);
        setLikedId(addedFavorite.maYeuThich);
        showNotification("Đã thêm sản phẩm vào danh sách yêu thích!", "success");
      } catch (err) {
        showNotification("Có lỗi xảy ra khi thêm yêu thích!", "error");
      }
    }
  };

  const handleAddToCart = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      Swal.fire({
        title: "Vui lòng đăng nhập!",
        text: "Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.",
        icon: "warning",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => navigate("/login"));
      return;
    }

    if (selectedSizeIndex === null) {
      showNotification("Vui lòng chọn kích thước trước khi thêm vào giỏ hàng!", "error");
      return;
    }

    const userData = JSON.parse(localStorage.getItem("user"));
    const maNguoiDung = userData?.maNguoiDung;

    if (!maNguoiDung) {
      showNotification("Vui lòng đăng nhập trước khi thêm vào giỏ hàng!", "error");
      return;
    }

    const selectedProduct = products[selectedColorIndex];
    const selectedSize = selectedProduct.sizes[selectedSizeIndex];
    const cartData = {
      IDNguoiDung: maNguoiDung,
      IDSanPham: productId.split('_')[0] || productId,
      MauSac: selectedProduct.colorCode,
      KichThuoc: selectedSize.size,
      SoLuong: quantity
    };

    try {
      const response = await fetch("http://localhost:5261/api/Cart/ThemSanPhamVaoGioHang", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(cartData),
      });
      if (!response.ok) throw new Error("Failed to add to cart");
      showNotification("Đã thêm vào giỏ hàng thành công!", "success");
    } catch (err) {
      showNotification("Có lỗi xảy ra khi thêm vào giỏ hàng!", "error");
    }
  };

  const handleAddComment = async () => {
    if (!newComment || rating < 1 || rating > 5) {
      showNotification("Vui lòng nhập nội dung bình luận và chọn đánh giá từ 1 đến 5 sao!", "error");
      return;
    }

    const userData = JSON.parse(localStorage.getItem("user"));
    const maNguoiDung = userData?.maNguoiDung;
    const hoTen = userData?.hoTen;
    const tenSanPham = products[0]?.name;

    if (!maNguoiDung) {
      showNotification("Vui lòng đăng nhập trước khi thêm bình luận!", "error");
      return;
    }

    const commentData = {
      maSanPham: productId.split('_')[0] || productId,
      tenSanPham: tenSanPham,
      maNguoiDung: maNguoiDung,
      hoTen: hoTen,
      noiDungBinhLuan: newComment,
      danhGia: rating,
      ngayBinhLuan: new Date().toISOString(),
      trangThai: 0,
      soTimBinhLuan: 0 // Khởi tạo số tim là 0
    };

    try {
      const response = await fetch("http://localhost:5261/api/Comment/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(commentData),
      });
      if (!response.ok) throw new Error("Failed to add comment");
      setNewComment("");
      setRating(0);
      showNotification("Bình luận của bạn đã được ghi lại và chờ duyệt!", "success");
    } catch (err) {
      showNotification("Có lỗi xảy ra khi thêm bình luận!", "error");
    }
  };

  const handleDeleteComment = async (maBinhLuan) => {
    setCommentToDelete(maBinhLuan);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      const response = await fetch(`http://localhost:5261/api/Comment/delete/${commentToDelete}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error("Failed to delete comment");
      setComments(prevComments => {
        const updatedComments = prevComments.filter(comment => comment.maBinhLuan !== commentToDelete);
        const totalRating = updatedComments.reduce((sum, comment) => sum + comment.danhGia, 0);
        const averageRating = updatedComments.length > 0 ? totalRating / updatedComments.length : 0;
        const roundedAverageRating = Number(averageRating.toFixed(1));
        setProducts(prevProducts => 
          prevProducts.map(product => ({ ...product, rating: roundedAverageRating }))
        );
        return updatedComments;
      });
      showNotification("Xóa bình luận thành công!", "success");
    } catch (err) {
      showNotification("Có lỗi xảy ra khi xóa bình luận!", "error");
    } finally {
      setIsConfirmModalOpen(false);
      setCommentToDelete(null);
    }
  };

  const handleLikeComment = async (maBinhLuan) => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const maNguoiDung = userData?.maNguoiDung;

    if (!maNguoiDung) {
      showNotification("Vui lòng đăng nhập để thích bình luận!", "error");
      return;
    }

    const isLiked = likedComments.has(maBinhLuan);
    const currentComment = comments.find(comment => comment.maBinhLuan === maBinhLuan);
    if (!currentComment) return;

    // Tăng hoặc giảm số lượng tim
    const updatedSoTimBinhLuan = isLiked ? currentComment.soTimBinhLuan - 1 : currentComment.soTimBinhLuan + 1;

    const updatedCommentData = {
      maBinhLuan: currentComment.maBinhLuan,
      maSanPham: currentComment.maSanPham,
      maNguoiDung: currentComment.maNguoiDung,
      noiDungBinhLuan: currentComment.noiDungBinhLuan,
      danhGia: currentComment.danhGia,
      ngayBinhLuan: currentComment.ngayBinhLuan,
      soTimBinhLuan: updatedSoTimBinhLuan,
      trangThai: currentComment.trangThai
    };

    try {
      const response = await fetch(`http://localhost:5261/api/Comment/update/${maBinhLuan}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(updatedCommentData),
      });

      if (!response.ok) throw new Error("Failed to update like count");
      const updatedComment = await response.json();
      updatedComment.hoTen = currentComment.hoTen;

      setComments(prev =>
        prev
          .map(comment => (comment.maBinhLuan === maBinhLuan ? updatedComment : comment))
          .sort((a, b) => b.soTimBinhLuan - a.soTimBinhLuan) // Sắp xếp theo số tim giảm dần
      );

      setLikedComments(prev => {
        const newSet = new Set(prev);
        if (isLiked) newSet.delete(maBinhLuan);
        else newSet.add(maBinhLuan);
        const likedCommentsKey = `likedComments_${maNguoiDung}`;
        localStorage.setItem(likedCommentsKey, JSON.stringify([...newSet]));
        return newSet;
      });
    } catch (err) {
      showNotification("Có lỗi xảy ra khi cập nhật số tim!", "error");
    }
  };

  if (loading) return <div className="pt-24 pb-16 px-6 min-h-screen flex items-center justify-center"><p>Loading product details...</p></div>;
  if (error || !products.length) return <div className="pt-24 pb-16 px-6 min-h-screen flex items-center justify-center"><p>Error: {error || "Product not found"}</p></div>;

  const baseProduct = products[0];
  const currentProduct = products[selectedColorIndex];
  const availableSizes = getSizesForColor();
  const selectedPrice = selectedSizeIndex !== null ? currentProduct.sizes[selectedSizeIndex].price : currentProduct.price;
  const currentUserId = JSON.parse(localStorage.getItem("user"))?.maNguoiDung;

  return (
    <>
      <Navigation />
      <div className="pt-24 pb-16 px-6 min-h-screen bg-gradient-to-b from-white to-secondary/20">
        {notification && <Notification message={notification.message} type={notification.type} onClose={closeNotification} />}
        <ConfirmModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={confirmDeleteComment} />
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden border border-border bg-white shadow-sm">
                <img src={baseProduct.images[selectedImage]} alt={baseProduct.name} className="w-full aspect-[4/5] object-cover" />
              </div>
              <div className="flex gap-3 overflow-auto pb-2">
                {baseProduct.images.map((image, index) => (
                  <button
                    key={index}
                    className={cn("rounded-lg overflow-hidden border-2 min-w-[80px] w-20 aspect-square transition-all", selectedImage === index ? "border-primary ring-2 ring-primary/20" : "border-border/50 hover:border-primary/50")}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={image} alt={`${baseProduct.name} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-medium mb-2 gradient-text">{baseProduct.name}</h1>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className={cn("w-4 h-4", index < Math.floor(baseProduct.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{baseProduct.rating}</span>
                </div>
                <p className="text-2xl font-medium text-primary mb-4">{selectedPrice} VND</p>
                <p className="text-muted-foreground">{baseProduct.description}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3">Màu Sắc</h3>
                <div className="flex gap-3">
                  {getUniqueColorList().map((item, index) => (
                    <button
                      key={item.id}
                      className={cn("w-8 h-8 rounded-full transition-all", selectedColorIndex === index ? "ring-2 ring-offset-2 ring-primary" : "ring-1 ring-border hover:ring-primary")}
                      style={{ backgroundColor: item.color }}
                      onClick={() => {
                        setSelectedColorIndex(index);
                        setSelectedSizeIndex(null);
                      }}
                      aria-label={`Select color ${item.color}`}
                    />
                  ))}
                </div>
              </div>
              {currentProduct && (
                <div>
                  <h3 className="text-sm font-medium mb-3">Kích Thước</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((sizeObj, index) => (
                      <button
                        key={index}
                        className={cn("h-10 min-w-[40px] px-3 rounded border text-sm font-medium transition-all", selectedSizeIndex === index ? "border-primary bg-primary/10 shadow-lg" : "border-border hover:border-primary/50")}
                        onClick={() => setSelectedSizeIndex(index)}
                      >
                        {sizeObj.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium mb-3">Số Lượng</h3>
                <div className="flex items-center border border-border rounded-md w-32">
                  <button className="w-10 h-10 flex items-center justify-center text-lg" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>-</button>
                  <div className="flex-1 text-center">{quantity}</div>
                  <button
                    className="w-10 h-10 flex items-center justify-center text-lg"
                    onClick={() => setQuantity(Math.min(selectedSizeIndex !== null ? availableSizes[selectedSizeIndex].quantity : currentProduct.sizes[0].quantity, quantity + 1))}
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3">Thông Tin Sản Phẩm</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" /><span className="text-muted-foreground">Chất liệu: {baseProduct.material}</span></li>
                  <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" /><span className="text-muted-foreground">Thương hiệu: {baseProduct.brand}</span></li>
                  <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" /><span className="text-muted-foreground">Loại sản phẩm: {baseProduct.productType}</span></li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button className="flex-1 h-12 px-6 gradient-bg text-white rounded-full hover:opacity-90 transition-opacity flex items-center justify-center" onClick={handleAddToCart}>
                  <ShoppingBag className="mr-2 h-5 w-5" /> Thêm Vào Giỏ Hàng
                </button>
                <button onClick={handleToggleLike} className="h-12 w-12 border border-primary/30 rounded-full hover:bg-primary/5 transition-colors flex items-center justify-center">
                  <Heart className={cn("h-5 w-5", isLiked ? "fill-red-500 text-red-500" : "text-gray-400")} />
                </button>
              </div>
            </div>
          </div>
          <div className="mt-12">
            <h2 className="text-2xl font-medium mb-6">Bình Luận & Đánh Giá</h2>
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-medium mb-4">Viết bình luận của bạn</h3>
              <div className="flex items-center mb-4">
                <span className="mr-2">Đánh giá:</span>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={cn("w-6 h-6 cursor-pointer", index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300")}
                    onClick={() => setRating(index + 1)}
                  />
                ))}
              </div>
              <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Nhập bình luận của bạn..." className="w-full p-3 border rounded-md mb-4" rows={4} />
              <button onClick={handleAddComment} className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors">Gửi Bình Luận</button>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-muted-foreground">Chưa có bình luận nào.</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.maBinhLuan} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-start">
                    <div>
                      <div className="flex items-center mb-2">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star key={index} className={cn("w-4 h-4", index < comment.danhGia ? "fill-yellow-400 text-yellow-400" : "text-gray-300")} />
                        ))}
                      </div>
                      <p className="text-gray-800">{comment.noiDungBinhLuan}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Bởi {comment.hoTen || comment.maNguoiDung} - {new Date(comment.ngayBinhLuan).toLocaleDateString()}
                      </p>
                      <div className="flex items-center mt-2">
                        <button onClick={() => handleLikeComment(comment.maBinhLuan)} className="flex items-center gap-1">
                          <Heart className={cn("w-5 h-5", likedComments.has(comment.maBinhLuan) ? "fill-red-500 text-red-500" : "text-gray-400")} />
                          <span>{comment.soTimBinhLuan}</span> {/* Hiển thị số lượng tim */}
                        </button>
                      </div>
                    </div>
                    {comment.maNguoiDung === currentUserId && (
                      <button onClick={() => handleDeleteComment(comment.maBinhLuan)} className="text-red-500 hover:text-red-700 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
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