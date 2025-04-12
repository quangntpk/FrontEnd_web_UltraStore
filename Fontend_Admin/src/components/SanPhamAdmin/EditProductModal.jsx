import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Swal from "sweetalert2";

const EditProductModal = ({ isEditModalOpen, setIsEditModalOpen, selectedProduct, productData }) => {
  const [colors, setColors] = useState([]);
  const [tenSanPham, setTenSanPham] = useState("");
  const [maThuongHieu, setMaThuongHieu] = useState("");
  const [loaiSanPham, setLoaiSanPham] = useState("");
  const [moTa, setMoTa] = useState("");
  const [chatLieu, setChatLieu] = useState("");
  const [images, setImages] = useState([]); // Lưu trữ base64 strings (bao gồm cả có tiền tố)
  const [errors, setErrors] = useState({});
  const [loaiSanPhamList, setLoaiSanPhamList] = useState([]);
  const [thuongHieuList, setThuongHieuList] = useState([]);

  // Fetch dữ liệu từ API và khởi tạo dữ liệu sản phẩm
  useEffect(() => {
    const fetchLoaiSanPham = async () => {
      try {
        const response = await fetch("http://localhost:5261/api/LoaiSanPham");
        const data = await response.json();
        setLoaiSanPhamList(data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách loại sản phẩm:", error);
      }
    };

    const fetchThuongHieu = async () => {
      try {
        const response = await fetch("http://localhost:5261/api/ThuongHieu");
        const data = await response.json();
        setThuongHieuList(data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách thương hiệu:", error);
      }
    };

    fetchLoaiSanPham();
    fetchThuongHieu();
  }, []);

  useEffect(() => {
    if (productData && productData.length > 0) {
      const productInfo = productData[0];
      setTenSanPham(productInfo.tenSanPham || "");
      setMaThuongHieu(productInfo.maThuongHieu || "");
      setLoaiSanPham(productInfo.loaiSanPham || "");
      setMoTa(productInfo.moTa || "");
      setChatLieu(productInfo.chatLieu || "");
      const cleanedImages = (productInfo.hinhAnhs || []).map(img => {
        return img;
      });
      setImages(cleanedImages);

      initializeColors(productData);
      console.log(productData);
    }
  }, [productData]);

  const initializeColors = (data) => {
    if (data && data.length > 0) {
      const uniqueColors = data.map(item => ({
        color: `#${item.mauSac}`,
        sizes: item.details.map(detail => ({
          size: detail.kichThuoc.trim(),
          price: detail.gia.toString(),
          quantity: detail.soLuong.toString(),
        })),
      }));
      setColors(uniqueColors);
    } else {
      setColors([{ color: "#ffffff", sizes: [{ size: "S", price: "", quantity: "" }] }]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.replace(/^data:image\/[a-z]+;base64,/, "");
        setImages(prevImages => [...prevImages, base64String]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeleteImage = (index) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const handleAddColor = () => {
    setColors([...colors, { color: "#ffffff", sizes: [{ size: "S", price: "", quantity: "" }] }]);
  };

  const handleAddSize = (colorIndex) => {
    const newColors = [...colors];
    newColors[colorIndex].sizes.push({ size: "S", price: "", quantity: "" });
    setColors(newColors);
  };

  const handleRemoveSize = (colorIndex, sizeIndex) => {
    const newColors = [...colors];
    newColors[colorIndex].sizes.splice(sizeIndex, 1);
    setColors(newColors);
  };

  const handleRemoveColor = (colorIndex) => {
    const newColors = colors.filter((_, index) => index !== colorIndex);
    setColors(newColors);
  };

  const handleInputChange = (colorIndex, sizeIndex, field, value) => {
    const newColors = [...colors];
    if (field === "color") {
      newColors[colorIndex].color = value;
    } else {
      newColors[colorIndex].sizes[sizeIndex][field] = value;
    }
    setColors(newColors);
  };

  const handleSaveChanges = async () => {
    const imagesToSend = images.map(img => 
      img.startsWith("data:image") ? img.replace(/^data:image\/[a-z]+;base64,/, "") : img
    );

    const updatedData = colors.map(colorItem => ({
      ID: selectedProduct?.id || "A00001",
      TenSanPham: tenSanPham,
      MaThuongHieu: parseInt(maThuongHieu),
      LoaiSanPham: parseInt(loaiSanPham),
      MauSac: colorItem.color.slice(1),
      MoTa: moTa || null,
      HinhAnhs: imagesToSend, 
      ChatLieu: chatLieu,
      Details: colorItem.sizes.map(sizeItem => ({
        KichThuoc: sizeItem.size.padEnd(10, " ").trim(),
        SoLuong: parseInt(sizeItem.quantity),
        Gia: parseInt(sizeItem.price),
      })),
    }));

    let errorList = {};
    let hasError = false;
    const colorSet = new Set();

    updatedData.forEach((item, index) => {
      if (colorSet.has(item.MauSac)) {
        errorList[`${index}-mauSac`] = `- Màu ${item.MauSac} đã tồn tại.`;
        hasError = true;
      } else {
        colorSet.add(item.MauSac);
      }

      const sizeSet = new Set();
      item.Details.forEach((detail, detailIndex) => {
        if (sizeSet.has(detail.KichThuoc)) {
          errorList[`${index}-details-${detailIndex}-kichThuoc`] = `- Kích thước ${detail.KichThuoc} của mã màu ${item.MauSac} đã tồn tại.`;
          hasError = true;
        } else {
          sizeSet.add(detail.KichThuoc);
        }
        if (detail.SoLuong < 0) {
          errorList[`${index}-details-${detailIndex}-soLuong`] = `- Số lượng của kích thước ${detail.KichThuoc} thuộc mã màu ${item.MauSac} phải lớn hơn 0.`;
          hasError = true;
        }
        if (detail.Gia <= 0) {
          errorList[`${index}-details-${detailIndex}-gia`] = `- Giá của kích thước ${detail.KichThuoc} thuộc mã màu ${item.MauSac} phải lớn hơn 0.`;
          hasError = true;
        }
      });
    });

    if (hasError) {
      setErrors(errorList);
    } else {
      setErrors({});
      console.log("Lưu thành công", updatedData);
      try {
        const response = await fetch("http://localhost:5261/api/SanPham/EditSanPham", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        });

        if (response.ok) {
          Swal.fire({
            title: "Thành công!",
            text: "Cập nhật sản phẩm thành công!",
            icon: "success",
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
          }).then(() => {
            setIsEditModalOpen(false);
            window.location.reload();
          });
        } else {
          Swal.fire({
            title: "Lỗi!",
            text: "Có lỗi xảy ra khi cập nhật sản phẩm.",
            icon: "error",
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        }
      } catch (error) {
        console.error("Lỗi khi gửi dữ liệu:", error);
        Swal.fire({
          title: "Lỗi!",
          text: "Có lỗi xảy ra khi gửi dữ liệu tới API.",
          icon: "error",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      }
    }
  };

  return (
    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
      <DialogContent className="max-w-7xl p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Chỉnh sửa thông tin sản phẩm</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8">
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Tên Sản Phẩm</label>
                  <Input
                    value={tenSanPham}
                    onChange={(e) => setTenSanPham(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Thương Hiệu</label>
                  <select
                    value={maThuongHieu}
                    onChange={(e) => setMaThuongHieu(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Chọn thương hiệu</option>
                    {thuongHieuList.map((thuongHieu) => (
                      <option key={thuongHieu.maThuongHieu} value={thuongHieu.maThuongHieu}>
                        {thuongHieu.tenThuongHieu}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">Loại Sản Phẩm</label>
                  <select
                    value={loaiSanPham}
                    onChange={(e) => e.preventDefault()}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Chọn loại sản phẩm</option>
                    {loaiSanPhamList.map((loai) => (
                      <option key={loai.maLoaiSanPham} value={loai.maLoaiSanPham}>
                        {loai.tenLoaiSanPham}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">Chất Liệu</label>
                  <Input
                    value={chatLieu}
                    onChange={(e) => setChatLieu(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="mt-4">
                <div className="grid grid-cols-12 text-center font-medium">
                  <div className="col-span-2 ml-12">Màu Sắc</div>
                  <div className="col-span-2 ml-10">Kích Thước</div>
                  <div className="col-span-2 ml-5">Đơn Giá</div>
                  <div className="col-span-2 ml-3">Số Lượng</div>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {colors.map((colorItem, colorIndex) => (
                  <div key={colorIndex} className="mt-4 border p-4 rounded relative">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveColor(colorIndex)}
                      className="absolute top-2 right-2"
                    >
                      X
                    </Button>
                    <div className="grid grid-cols-10 gap-4 border rounded p-4">
                      <div className="col-span-2 flex justify-center">
                        <input
                          type="color"
                          value={colorItem.color}
                          onChange={(e) => handleInputChange(colorIndex, null, "color", e.target.value)}
                          className="w-[100px] h-[100px] border-2 border-gray-300 rounded"
                        />
                      </div>
                      <div className="col-span-8">
                        {colorItem.sizes.map((sizeItem, sizeIndex) => (
                          <div key={sizeIndex} className="grid grid-cols-12 gap-2 items-center mb-2">
                            <div className="col-span-2">
                              <select
                                value={sizeItem.size}
                                onChange={(e) => handleInputChange(colorIndex, sizeIndex, "size", e.target.value)}
                                className="w-full p-2 border rounded-md"
                              >
                                <option value="S">S</option>
                                <option value="M">M</option>
                                <option value="XL">XL</option>
                                <option value="XXL">XXL</option>
                                <option value="XXXL">XXXL</option>
                              </select>
                            </div>
                            <div className="col-span-3">
                              <Input
                                type="number"
                                min="1"
                                placeholder="Đơn Giá"
                                value={sizeItem.price}
                                onChange={(e) => handleInputChange(colorIndex, sizeIndex, "price", e.target.value)}
                              />
                            </div>
                            <div className="col-span-2">
                              <Input
                                type="number"
                                min="1"
                                placeholder="Số Lượng"
                                value={sizeItem.quantity}
                                onChange={(e) => handleInputChange(colorIndex, sizeIndex, "quantity", e.target.value)}
                                className="w-[100px]"
                              />
                            </div>
                            <div className="col-span-2 flex items-left justify-start gap-2 ml-3">
                              {colorItem.sizes.length > 1 && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRemoveSize(colorIndex, sizeIndex)}
                                >
                                  x
                                </Button>
                              )}
                              {sizeIndex === colorItem.sizes.length - 1 && (
                                <Button onClick={() => handleAddSize(colorIndex)} size="sm">
                                  +
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-center ml-10">
                <Button onClick={handleAddColor} className="w-[250px]">
                  +
                </Button>
              </div>
            </div>

            <div className="col-span-4 space-y-4">
              <div>
                <label className="block mb-1 font-medium">Hình Ảnh</label>
                <div
                  className="w-full h-[300px] border flex items-center justify-center overflow-y-auto"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {images.length === 0 ? (
                    <p className="text-muted-foreground">Kéo thả hình ảnh vào đây</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 p-2">
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={
                              image.startsWith("data:image")
                                ? image
                                : `data:image/jpeg;base64,${image}`
                            }
                            alt={`Image ${index}`}
                            className="w-24 h-24 object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center"
                            onClick={() => handleDeleteImage(index)}
                          >
                            X
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium">Mô Tả</label>
                <textarea
                  className="w-full h-[200px] p-2 border rounded-md"
                  value={moTa}
                  onChange={(e) => setMoTa(e.target.value)}
                  placeholder="Nhập mô tả sản phẩm"
                />
              </div>
              <div>
                {Object.keys(errors).length > 0 && (
                  <div className="text-red-500 mb-4">
                    Đã xảy ra lỗi:
                    <ul>
                      {Object.values(errors).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
            Hủy
          </Button>
          <Button onClick={handleSaveChanges}>Lưu Thay Đổi</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductModal;