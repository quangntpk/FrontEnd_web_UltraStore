import { useState, useEffect } from "react";
import { X, Edit, Trash } from "lucide-react";

const ComboDetailAdminModal = ({ comboId, isOpen, onClose }) => {
  const [combo, setCombo] = useState(null); // Lưu thông tin combo
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCombo = async () => {
      if (!comboId || !isOpen) return;

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5261/api/Combo/ComboSanPhamView?id=${comboId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch combo');
        }
        const data = await response.json();
        const comboData = Array.isArray(data) ? data[0] : data; // Đảm bảo dữ liệu là một combo duy nhất

        const formattedCombo = {
          maCombo: comboData.maCombo,
          name: comboData.name,
          description: comboData.moTa || "Không có mô tả",
          price: comboData.gia, // Chia 1000 để hiển thị đơn vị K VND
          quantity: comboData.soLuong,
          status: comboData.trangThai,
          createdDate: comboData.ngayTao,
          images: comboData.hinhAnh ? `data:image/jpeg;base64,${comboData.hinhAnh}` : "/placeholder-image.jpg", // Chỉ một hình ảnh
          products: comboData.sanPhams.map(product => ({
            id: product.id,
            name: product.name,
            brand: product.thuongHieu,
            type: product.loaiSanPham,
            sizes: product.kichThuoc,
            quantity: product.soLuong,
            price: product.donGia, // Chia 1000 để hiển thị đơn vị K VND
            material: product.chatLieu,
            colors: product.mauSac.map(color => `#${color}`),
            images: product.hinh?.map(base64 => `data:image/jpeg;base64,${base64}`) || []
          }))
        };

        setCombo(formattedCombo);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCombo();
  }, [comboId, isOpen]);

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc muốn xóa combo này?")) {
      try {
        const response = await fetch(`http://localhost:5261/api/Combo/DeleteCombo?id=${comboId}`, {
          method: "GET", // Giả định API sử dụng GET để xóa, thay đổi nếu cần
        });
        if (!response.ok) {
          throw new Error("Failed to delete combo");
        }
         Swal.fire({
                title: "Thành công!",
                text: "Xóa combo thành công!",
                icon: "success",
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false,
              }).then(() => {
                setIsCreateModalOpen(false);
                window.location.reload();
              });
        onClose();
      } catch (err) {
        console.error("Error deleting combo:", err);
        alert("Có lỗi xảy ra khi xóa combo!");
      }
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <p>Đang tải thông tin combo...</p>
        </div>
      </div>
    );
  }

  if (error || !combo) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <p>Error: {error || "Không tìm thấy combo"}</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">
            Đóng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-7xl max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Chi Tiết Combo</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Combo Image */}
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <img 
                src={combo.images} 
                alt={combo.name} 
                className="w-full aspect-[4/5] object-cover"
              />
            </div>
            {/* Không cần thumbnail vì chỉ có một hình ảnh */}
          </div>

          {/* Combo Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium">{combo.name}</h3>
              <p className="text-gray-600 mt-2">{combo.description}</p>
            </div>

            {/* Price & Quantity */}
            <div>
              <h4 className="font-medium">Giá & Số lượng:</h4>
              <ul className="mt-2 space-y-2 text-gray-600">
                <li>Giá: {combo.price} VND</li>
                <li>Số lượng: {combo.quantity}</li>
                <li>Trạng thái: {combo.status ? "Đang bán" : "Ngừng bán"}</li>
                <li>Ngày tạo: {new Date(combo.createdDate).toLocaleDateString()}</li>
              </ul>
            </div>

            {/* Products in Combo as Table */}
            <div style={{marginTop:100}}>
              <h4 className="font-medium mb-2">Sản phẩm trong combo:</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600 border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 border-b font-medium">Tên sản phẩm</th>
                      <th className="px-4 py-2 border-b font-medium">Thương hiệu</th>
                      <th className="px-4 py-2 border-b font-medium">Loại</th>
                      <th className="px-4 py-2 border-b font-medium">Chất liệu</th>
                      <th className="px-4 py-2 border-b font-medium">Kích thước</th>
                      <th className="px-4 py-2 border-b font-medium">Số lượng</th>
                      <th className="px-4 py-2 border-b font-medium">Giá (VND)</th>
                      <th className="px-4 py-2 border-b font-medium">Màu sắc</th>
                    </tr>
                  </thead>
                  <tbody>
                    {combo.products.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b">{product.name}</td>
                        <td className="px-4 py-2 border-b">{product.brand}</td>
                        <td className="px-4 py-2 border-b">{product.type}</td>
                        <td className="px-4 py-2 border-b">{product.material}</td>
                        <td className="px-4 py-2 border-b">{product.sizes.join(", ")}</td>
                        <td className="px-4 py-2 border-b">{product.quantity}</td>
                        <td className="px-4 py-2 border-b">{product.price}</td>
                        <td className="px-4 py-2 border-b">
                          {product.colors.map((color, idx) => (
                            <span
                              key={idx}
                              className="inline-block w-4 h-4 rounded-full ml-1"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ComboDetailAdminModal;