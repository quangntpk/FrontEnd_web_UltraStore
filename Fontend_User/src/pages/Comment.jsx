import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Heart, Star, Trash2 } from "lucide-react";

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={cn(
        "fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 font-roboto",
        type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
      )}
    >
      <p>{message}</p>
      <button
        onClick={onClose}
        className="absolute top-1 right-1 text-white hover:text-gray-200"
      >
        ×
      </button>
    </div>
  );
};

const ConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 font-roboto">
    <div className="bg-white p-6 rounded-lg shadow-lg w-64">
        <h3 className="text-lg font-medium mb-4">Xác nhận xóa</h3>
        <p className="mb-6">Bạn có chắc muốn xóa bình luận này không?</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Không
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Có
          </button>
        </div>
      </div>
    </div>
  );
};

const Comments = ({ productId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(0);
  const [likedComments, setLikedComments] = useState(new Set());
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [notification, setNotification] = useState(null);
  const [averageRating, setAverageRating] = useState(0);

  const showNotification = (message, type) => setNotification({ message, type });
  const closeNotification = () => setNotification(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const baseProductId = productId.split("_")[0] || productId;
        const commentResponse = await fetch("http://localhost:5261/api/Comment/list");
        if (!commentResponse.ok) throw new Error("Failed to fetch comments");
        const commentData = await commentResponse.json();
        const productComments = commentData
          .filter((comment) => comment.maSanPham === baseProductId && comment.trangThai === 1)
          .map((comment) => ({
            ...comment,
            soTimBinhLuan: comment.soTimBinhLuan || 0,
          }))
          .sort((a, b) => b.soTimBinhLuan - a.soTimBinhLuan);

        // Tính điểm trung bình từ các đánh giá
        if (productComments.length > 0) {
          const totalRating = productComments.reduce((sum, comment) => {
            return sum + (comment.danhGia || 0); // Sử dụng field 'danhGia' từ API
          }, 0);
          const avgRating = totalRating / productComments.length;
          setAverageRating(avgRating);
        } else {
          setAverageRating(0);
        }

        const userData = JSON.parse(localStorage.getItem("user"));
        const currentUserId = userData?.maNguoiDung;
        if (currentUserId) {
          const likedCommentsKey = `likedComments_${currentUserId}`;
          const storedLikedComments = JSON.parse(localStorage.getItem(likedCommentsKey)) || [];
          setLikedComments(new Set(storedLikedComments));
        }

        setComments(productComments);
      } catch (err) {
        console.error("Error fetching comments:", err);
        showNotification("Có lỗi xảy ra khi tải bình luận!", "error");
        setAverageRating(0); // Đặt rating về 0 nếu fetch thất bại
      }
    };

    fetchComments();
  }, [productId]);

  const handleAddComment = async () => {
    if (!newComment || rating < 1 || rating > 5) {
      showNotification("Vui lòng nhập nội dung bình luận và chọn đánh giá từ 1 đến 5 sao!", "error");
      return;
    }

    const userData = JSON.parse(localStorage.getItem("user"));
    const maNguoiDung = userData?.maNguoiDung;
    const hoTen = userData?.hoTen;

    if (!maNguoiDung) {
      showNotification("Vui lòng đăng nhập trước khi thêm bình luận!", "error");
      return;
    }

    const commentData = {
      maSanPham: productId.split("_")[0] || productId,
      maNguoiDung: maNguoiDung,
      noiDungBinhLuan: newComment,
      danhGia: rating,
      ngayBinhLuan: new Date().toISOString(),
      trangThai: 0,
      soTimBinhLuan: 0,
    };

    try {
      const response = await fetch("http://localhost:5261/api/Comment/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
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

  const handleDeleteComment = (maBinhLuan) => {
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
      setComments((prevComments) => {
        const updatedComments = prevComments.filter((comment) => comment.maBinhLuan !== commentToDelete);
        // Cập nhật lại điểm trung bình sau khi xóa
        if (updatedComments.length > 0) {
          const totalRating = updatedComments.reduce((sum, comment) => sum + (comment.danhGia || 0), 0);
          setAverageRating(totalRating / updatedComments.length);
        } else {
          setAverageRating(0);
        }
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
    const endpoint = isLiked
      ? `http://localhost:5261/api/Comment/Unlike/${maBinhLuan}`
      : `http://localhost:5261/api/Comment/Like/${maBinhLuan}`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to update like status");

      setComments((prevComments) =>
        prevComments
          .map((comment) =>
            comment.maBinhLuan === maBinhLuan
              ? {
                  ...comment,
                  soTimBinhLuan: isLiked
                    ? Math.max(0, comment.soTimBinhLuan - 1)
                    : comment.soTimBinhLuan + 1,
                }
              : comment
          )
          .sort((a, b) => b.soTimBinhLuan - a.soTimBinhLuan)
      );

      setLikedComments((prev) => {
        const newSet = new Set(prev);
        if (isLiked) newSet.delete(maBinhLuan);
        else newSet.add(maBinhLuan);
        const likedCommentsKey = `likedComments_${maNguoiDung}`;
        localStorage.setItem(likedCommentsKey, JSON.stringify([...newSet]));
        return newSet;
      });

      showNotification(isLiked ? "Đã bỏ thích bình luận!" : "Đã thích bình luận!", "success");
    } catch (err) {
      showNotification("Có lỗi xảy ra khi cập nhật số tim!", "error");
    }
  };

  const currentUserId = JSON.parse(localStorage.getItem("user"))?.maNguoiDung;

  return (
    <div className="mt-12">
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={closeNotification} />
      )}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteComment}
      />
      <h2 className="text-2xl font-medium mb-6">Bình Luận & Đánh Giá</h2>
      {/* Hiển thị điểm trung bình và số sao */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="text-lg font-medium">Đánh giá trung bình:</span>
          <div className="flex">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={cn(
                  "w-5 h-5",
                  index < Math.floor(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                )}
              />
            ))}
          </div>
          <span className="text-lg font-medium">{averageRating.toFixed(1)} / 5</span>
        </div>
      </div>
      { <div className="bg-white p-6 rounded-lg shadow-md mb-6">
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
      </div> }
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-muted-foreground">Chưa có bình luận nào.</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.maBinhLuan}
              className="bg-white p-4 rounded-lg shadow-md flex items-start gap-4"
            >
              <div className="flex-shrink-0">
                <img
                  src={comment.hinhAnh || "https://via.placeholder.com/50"}
                  alt={`Ảnh của ${comment.hoTen || comment.maNguoiDung}`}
                  className="w-12 h-12 rounded-full object-cover border border-border"
                />
              </div>
              <div className="flex-1 flex justify-between items-start">
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
                    Bởi {comment.hoTen || comment.maNguoiDung} -{" "}
                    {new Date(comment.ngayBinhLuan).toLocaleDateString()}
                  </p>
                  <div className="flex items-center mt-2">
                    <button
                      onClick={() => handleLikeComment(comment.maBinhLuan)}
                      className="flex items-center gap-1"
                    >
                      <Heart
                        className={cn(
                          "w-5 h-5",
                          likedComments.has(comment.maBinhLuan)
                            ? "fill-red-500 text-red-500"
                            : "text-gray-400"
                        )}
                      />
                      <span>{comment.soTimBinhLuan}</span>
                    </button>
                  </div>
                </div>
                {comment.maNguoiDung === currentUserId && (
                  <button
                    onClick={() => handleDeleteComment(comment.maBinhLuan)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;