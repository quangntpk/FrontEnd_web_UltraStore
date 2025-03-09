import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EditProductModal = ({ isEditModalOpen, setIsEditModalOpen, selectedProduct, productData }) => {
  const [colors, setColors] = useState([]);

  const initializeColors = (data) => {
    if (data && data.length > 0) {
      const uniqueColors = data.map(item => ({
        color: `#${item.mauSac}`,
        sizes: item.details.map(detail => ({
          size: detail.kichThuoc.trim(),
          price: detail.gia.toString(),
          quantity: detail.soLuong.toString()
        }))
      }));
      setColors(uniqueColors);
    } else {
      setColors([{ color: '#ffffff', sizes: [{ size: 'S', price: '', quantity: '' }] }]);
    }
  };

  useEffect(() => {
    initializeColors(productData);
  }, [productData]);

  const handleAddColor = () => {
    setColors([...colors, { color: '#ffffff', sizes: [{ size: 'S', price: '', quantity: '' }] }]);
  };

  const handleAddSize = (colorIndex) => {
    const newColors = [...colors];
    newColors[colorIndex].sizes.push({ size: 'S', price: '', quantity: '' });
    setColors(newColors);
  };

  const handleRemoveSize = (colorIndex, sizeIndex) => {
    const newColors = [...colors];
    newColors[colorIndex].sizes.splice(sizeIndex, 1);
    setColors(newColors);
  };

  const handleInputChange = (colorIndex, sizeIndex, field, value) => {
    const newColors = [...colors];
    if (field === 'color') {
      newColors[colorIndex].color = value;
    } else {
      newColors[colorIndex].sizes[sizeIndex][field] = value;
    }
    setColors(newColors);
  };

  const productInfo = productData?.[0] || {};

  return (
    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
      <DialogContent className="max-w-4xl p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Chỉnh sửa thông tin sản phẩm</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8">
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Tên Sản Phẩm</label>
                  <Input defaultValue={productInfo.tenSanPham} className="w-full" />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Thương Hiệu</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value={productInfo.maThuongHieu}>
                      {productInfo.maThuongHieu === 1 ? 'Gucci' : 'Unknown'}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">Loại Sản Phẩm</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value={productInfo.loaiSanPham}>
                      {productInfo.loaiSanPham === 1 ? 'Áo' : 'Unknown'}
                    </option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <div className="grid grid-cols-12 text-center font-medium">
                  <div className="col-span-3">Màu Sắc</div>
                  <div className="col-span-3">Kích Thước</div>
                  <div className="col-span-3">Đơn Giá</div>
                  <div className="col-span-3">Số Lượng</div>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {colors.map((colorItem, colorIndex) => (
                  <div key={colorIndex} className="mt-4 border p-4 rounded">
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-3 flex justify-center">
                        <input
                          type="color"
                          value={colorItem.color}
                          onChange={(e) => handleInputChange(colorIndex, null, 'color', e.target.value)}
                          className="w-[100px] h-[100px] ml-4 border-2 border-gray-300 rounded"
                        />
                      </div>
                      <div className="col-span-9">
                        {colorItem.sizes.map((sizeItem, sizeIndex) => (
                          <div key={sizeIndex} className="grid grid-cols-12 gap-2 items-center mb-2">
                            <div className="col-span-3">
                              <select
                                value={sizeItem.size}
                                onChange={(e) => handleInputChange(colorIndex, sizeIndex, 'size', e.target.value)}
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
                                onChange={(e) => handleInputChange(colorIndex, sizeIndex, 'price', e.target.value)}
                              />
                            </div>
                            <div className="col-span-2">
                              <Input
                                type="number"
                                min="1"
                                placeholder="Số Lượng"
                                value={sizeItem.quantity}
                                onChange={(e) => handleInputChange(colorIndex, sizeIndex, 'quantity', e.target.value)}
                                className="w-[100px]"
                              />
                            </div>
                            <div className="col-span-4 flex items-center gap-2">
                              {colorItem.sizes.length > 1 && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRemoveSize(colorIndex, sizeIndex)}
                                  className="ml-4"
                                >
                                  x
                                </Button>
                              )}
                              {sizeIndex === colorItem.sizes.length - 1 && (
                                <Button onClick={() => handleAddSize(colorIndex)} size="sm">+</Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-center">
                <Button onClick={handleAddColor} className="w-[250px]">
                  +
                </Button>
              </div>
            </div>

            <div className="col-span-4 space-y-4">
              <div>
                <label className="block mb-1 font-medium">Hình Ảnh</label>
                <div className="w-full h-[300px] border flex items-center justify-center">
                  <p className="text-muted-foreground">Chưa có hình ảnh</p>
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium">Mô Tả</label>
                <textarea
                  className="w-full h-[200px] p-2 border rounded-md"
                  defaultValue={productInfo.moTa || ''}
                  placeholder="Nhập mô tả sản phẩm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
            Hủy
          </Button>
          <Button>Lưu Thay Đổi</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductModal;