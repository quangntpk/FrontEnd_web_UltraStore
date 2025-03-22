import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Swal from "sweetalert2";

const CreateComboModal = ({ isCreateModalOpen, setIsCreateModalOpen }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [combo, setCombo] = useState({
    ID: 0,
    TenCombo: "",
    MoTa: "",
    SoLuong: 0,
    Gia: 0,
    HinhAnh: null,
    SanPham: [],
  });
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch products khi modal mở (giữ nguyên)
  useEffect(() => {
    if (isCreateModalOpen) {
      const fetchProducts = async () => {
        setSearchLoading(true);
        try {
          const response = await fetch("http://localhost:5261/api/SanPham/ListSanPham", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          if (!response.ok) throw new Error("Failed to fetch products");
          const data = await response.json();
          setProducts(data || []);
          setFilteredProducts(data || []);
        } catch (error) {
          console.error("Error fetching products:", error);
          setProducts([]);
          setFilteredProducts([]);
        } finally {
          setSearchLoading(false);
        }
      };
      fetchProducts();
    }
  }, [isCreateModalOpen]);

  // Filter products (giữ nguyên)
  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(
        (product) =>
          (product.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
          (product.loaiSanPham?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  // Handle file upload (giữ nguyên)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setCombo({ ...combo, HinhAnh: reader.result.replace(/^data:image\/[a-z]+;base64,/, "") });
      setErrors({ ...errors, HinhAnh: "" }); // Xóa lỗi hình ảnh khi upload
    };
    reader.readAsDataURL(file);
  };

  // Các hàm xử lý product (giữ nguyên)
  const addProductToCombo = (product) => {
    const existingProduct = combo.SanPham.find((p) => p.MaSanPham === product.id);
    if (existingProduct) {
      setCombo({
        ...combo,
        SanPham: combo.SanPham.map((p) =>
          p.MaSanPham === product.id ? { ...p, SoLuong: p.SoLuong + 1 } : p
        ),
      });
    } else {
      setCombo({
        ...combo,
        SanPham: [
          ...combo.SanPham,
          {
            MaSanPham: product.id,
            SoLuong: 1,
            TenSanPham: product.name || "Không có tên",
          },
        ],
      });
    }
    setErrors({ ...errors, SanPham: "" }); // Xóa lỗi sản phẩm khi thêm
  };

  const updateQuantity = (maSanPham, delta) => {
    setCombo({
      ...combo,
      SanPham: combo.SanPham.map((p) =>
        p.MaSanPham === maSanPham ? { ...p, SoLuong: Math.max(1, p.SoLuong + delta) } : p
      ),
    });
  };

  const removeProductFromCombo = (maSanPham) => {
    const newSanPham = combo.SanPham.filter((p) => p.MaSanPham !== maSanPham);
    setCombo({ ...combo, SanPham: newSanPham });
    if (newSanPham.length === 0) {
      setErrors({ ...errors, SanPham: "Combo phải có ít nhất 1 sản phẩm" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
  
    if (!combo.TenCombo.trim()) {
      newErrors.TenCombo = "Tên combo không được để trống";
    }
  
    if (!combo.MoTa.trim()) {
      newErrors.MoTa = "Mô tả không được để trống";
    }
  
    if (combo.Gia <= 1) {
      newErrors.Gia = "Giá phải lớn hơn 1";
    }
  
    if (!combo.HinhAnh) {
      newErrors.HinhAnh = "Vui lòng chọn ít nhất 1 hình ảnh";
    }
  
    if (combo.SanPham.length === 0) {
      newErrors.SanPham = "Combo phải có ít nhất 1 sản phẩm";
    }
  
    // Validation cho Số Lượng
    if (combo.SoLuong < 0) {
      newErrors.SoLuong = "Số lượng không thể nhỏ hơn 0";
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form với validation
  const handleSaveChanges = async () => {
    if (!validateForm()) {
      Swal.fire({
        title: "Lỗi!",
        text: "Vui lòng điền đầy đủ và đúng thông tin trước khi tạo combo",
        icon: "error",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    try {
      const comboDataToSend = {
        ID: combo.ID,
        TenCombo: combo.TenCombo,
        MoTa: combo.MoTa,
        SoLuong: combo.SoLuong,
        Gia: combo.Gia,
        HinhAnh: combo.HinhAnh,
        SanPham: combo.SanPham.map((product) => ({
          MaSanPham: product.MaSanPham,
          SoLuong: product.SoLuong,
        })),
      };

      const response = await fetch("http://localhost:5261/api/Combo/CreateComboSanPham", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(comboDataToSend),
      });

      if (!response.ok) throw new Error("Failed to create combo");

      Swal.fire({
        title: "Thành công!",
        text: "Tạo combo thành công!",
        icon: "success",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        setIsCreateModalOpen(false);
        window.location.reload();
      });
    } catch (error) {
      console.error("Error creating combo:", error);
      Swal.fire({
        title: "Lỗi!",
        text: "Có lỗi xảy ra khi tạo combo.",
        icon: "error",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  return (
    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
      <DialogContent className="max-w-7xl p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Tạo mới combo</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8">
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Tên Combo</label>
                  <Input
                    value={combo.TenCombo}
                    onChange={(e) => {
                      setCombo({ ...combo, TenCombo: e.target.value });
                      setErrors({ ...errors, TenCombo: "" });
                    }}
                    className="w-full"
                  />
                  {errors.TenCombo && (
                    <p className="text-red-500 text-sm mt-1">{errors.TenCombo}</p>
                  )}
                </div>
                <div>
                  <label className="block mb-1 font-medium">Giá</label>
                  <Input
                    type="number"
                    min="0"
                    value={combo.Gia}
                    onChange={(e) => {
                      setCombo({ ...combo, Gia: parseInt(e.target.value) || 0 });
                      setErrors({ ...errors, Gia: "" });
                    }}
                    className="w-full"
                  />
                  {errors.Gia && (
                    <p className="text-red-500 text-sm mt-1">{errors.Gia}</p>
                  )}
                </div>
                <div>
                  <label className="block mb-1 font-medium">Hình Ảnh</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full p-2 border rounded-md"
                  />
                  {combo.HinhAnh && (
                    <img
                      src={`data:image/jpeg;base64,${combo.HinhAnh}`}
                      alt="Combo Preview"
                      className="mt-2 w-24 h-24 object-cover"
                    />
                  )}
                  {errors.HinhAnh && (
                    <p className="text-red-500 text-sm mt-1">{errors.HinhAnh}</p>
                  )}
                </div>
                <div>
                  <label className="block mb-1 font-medium">Số Lượng</label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={combo.SoLuong}
                    onChange={(e) => {
                      setCombo({ ...combo, SoLuong: parseInt(e.target.value) || 0 });
                      setErrors({ ...errors, SoLuong: "" });
                    }}
                    className="w-full"
                  />
                  {errors.SoLuong && (
                    <p className="text-red-500 text-sm mt-1">{errors.SoLuong}</p>
                  )}
                </div>
                <div>
                  <label className="block mb-1 font-medium">Mô Tả</label>
                  <textarea
                    className="w-full h-[100px] p-2 border rounded-md"
                    value={combo.MoTa}
                    onChange={(e) => {
                      setCombo({ ...combo, MoTa: e.target.value });
                      setErrors({ ...errors, MoTa: "" });
                    }}
                    placeholder="Nhập mô tả combo"
                  />
                  {errors.MoTa && (
                    <p className="text-red-500 text-sm mt-1">{errors.MoTa}</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block mb-1 font-medium">Sản phẩm trong Combo</label>
                <div className="max-h-[200px] overflow-y-auto border p-4 rounded">
                  {combo.SanPham.length === 0 ? (
                    <p className="text-muted-foreground">Chưa có sản phẩm trong combo</p>
                  ) : (
                    combo.SanPham.map((product) => (
                      <div
                        key={product.MaSanPham}
                        className="grid grid-cols-12 gap-2 items-center mb-2"
                      >
                        <div className="col-span-4">{product.TenSanPham}</div>
                        <div className="col-span-4 flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(product.MaSanPham, -1)}
                          >
                            -
                          </Button>
                          <span>{product.SoLuong}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(product.MaSanPham, 1)}
                          >
                            +
                          </Button>
                        </div>
                        <div className="col-span-4">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeProductFromCombo(product.MaSanPham)}
                          >
                            Xóa
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                  {errors.SanPham && (
                    <p className="text-red-500 text-sm mt-1">{errors.SanPham}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-4 space-y-4">
              <div>
                <label className="block mb-1 font-medium">Tìm kiếm sản phẩm</label>
                <Input
                  type="text"
                  placeholder="Nhập tên sản phẩm cần tìm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="max-h-[400px] overflow-y-auto border p-4 rounded">
                {searchLoading ? (
                  <p>Loading products...</p>
                ) : filteredProducts.length === 0 ? (
                  <p className="text-muted-foreground">Không tìm thấy sản phẩm nào</p>
                ) : (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between mb-2 border-b pb-2"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            product.hinh && product.hinh[0]
                              ? `data:image/jpeg;base64,${product.hinh[0]}`
                              : "https://via.placeholder.com/50"
                          }
                          alt={product.name}
                          className="w-12 h-12 object-cover"
                        />
                        <span>{product.name || "Không có tên"}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addProductToCombo(product)}
                      >
                        Thêm
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
            Hủy
          </Button>
          <Button onClick={handleSaveChanges} disabled={searchLoading}>
            Tạo Combo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateComboModal;