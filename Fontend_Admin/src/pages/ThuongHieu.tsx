import { useState, useEffect, useCallback } from "react";
import { FaPlus, FaEdit, FaTrashAlt, FaEye } from "react-icons/fa";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, MoreVertical, RefreshCw, Upload } from "lucide-react";
import Notification from "@/components/layout/Notification";

interface ThuongHieu {
  maThuongHieu: number;
  tenThuongHieu: string;
  hinhAnh?: string;
}

interface NotificationProps {
  id: number;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

const ThuongHieu = () => {
  const [thuongHieus, setThuongHieus] = useState<ThuongHieu[]>([]);
  const [filteredThuongHieus, setFilteredThuongHieus] = useState<ThuongHieu[]>([]);
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");
  const [dangTai, setDangTai] = useState(true);
  const [moModalThem, setMoModalThem] = useState(false);
  const [moModalSua, setMoModalSua] = useState(false);
  const [moModalXoa, setMoModalXoa] = useState(false);
  const [moModalChiTiet, setMoModalChiTiet] = useState(false);
  const [thuongHieuCanXoa, setThuongHieuCanXoa] = useState<ThuongHieu | null>(null);
  const [thuongHieuChiTiet, setThuongHieuChiTiet] = useState<ThuongHieu | null>(null);
  const [tenThuongHieuMoi, setTenThuongHieuMoi] = useState("");
  const [hinhAnhMoi, setHinhAnhMoi] = useState("");
  const [thuongHieuDangSua, setThuongHieuDangSua] = useState<ThuongHieu | null>(null);
  const [trangHienTai, setTrangHienTai] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [errorsThem, setErrorsThem] = useState({ ten: "", hinhAnh: "" });
  const [errorsSua, setErrorsSua] = useState({ ten: "", hinhAnh: "" });
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const soThuongHieuMoiTrang = 10;
  const API_URL = "http://localhost:5261";

  const addNotification = (message: string, type: NotificationProps["type"]) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const formatBase64Image = (base64String: string) => {
    if (!base64String) return "";
    if (base64String.startsWith("data:image")) return base64String;
    return `data:image/png;base64,${base64String}`;
  };

  const getBase64 = (imageString: string) => {
    if (!imageString) return "";
    if (imageString.startsWith("data:")) {
      return imageString.split(",")[1];
    }
    return imageString;
  };

  const layDanhSachThuongHieu = async () => {
    try {
      setDangTai(true);
      const response = await fetch(`${API_URL}/api/ThuongHieu`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Không thể lấy danh sách thương hiệu");
      }
      const data = await response.json();
      setThuongHieus(data.sort((a: ThuongHieu, b: ThuongHieu) => b.maThuongHieu - a.maThuongHieu));
      setFilteredThuongHieus(data.sort((a: ThuongHieu, b: ThuongHieu) => b.maThuongHieu - a.maThuongHieu));
    } catch (error) {
      addNotification(error instanceof Error ? error.message : "Có lỗi xảy ra khi tải danh sách", "error");
    } finally {
      setDangTai(false);
    }
  };

  const locThuongHieu = useCallback(() => {
    if (!tuKhoaTimKiem.trim()) {
      setFilteredThuongHieus(thuongHieus);
    } else {
      const tuKhoa = tuKhoaTimKiem.toLowerCase();
      const filtered = thuongHieus.filter(
        (th) =>
          (th.tenThuongHieu?.toLowerCase().includes(tuKhoa) || "") ||
          (th.maThuongHieu?.toString().includes(tuKhoa) || "")
      );
      setFilteredThuongHieus(filtered);
      setTrangHienTai(1);
    }
  }, [tuKhoaTimKiem, thuongHieus]);

  useEffect(() => {
    layDanhSachThuongHieu();
  }, []);

  useEffect(() => {
    locThuongHieu();
  }, [locThuongHieu]);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (moModalThem) {
        setHinhAnhMoi(base64String);
        setErrorsThem((prev) => ({ ...prev, hinhAnh: "" }));
      } else if (moModalSua && thuongHieuDangSua) {
        setThuongHieuDangSua({ ...thuongHieuDangSua, hinhAnh: base64String });
        setErrorsSua((prev) => ({ ...prev, hinhAnh: "" }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    } else {
      addNotification("Vui lòng chọn một tệp hình ảnh!", "error");
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    } else {
      addNotification("Vui lòng chọn một tệp hình ảnh!", "error");
    }
  };

  const validateThem = () => {
    let valid = true;
    const newErrors = { ten: "", hinhAnh: "" };

    if (!tenThuongHieuMoi.trim()) {
      newErrors.ten = "Tên thương hiệu không được để trống!";
      valid = false;
    }

    if (!hinhAnhMoi) {
      newErrors.hinhAnh = "Hình ảnh không được để trống!";
      valid = false;
    }

    setErrorsThem(newErrors);
    return valid;
  };

  const validateSua = () => {
    let valid = true;
    const newErrors = { ten: "", hinhAnh: "" };

    if (!thuongHieuDangSua?.tenThuongHieu?.trim()) {
      newErrors.ten = "Tên thương hiệu không được để trống!";
      valid = false;
    }

    if (!thuongHieuDangSua?.hinhAnh) {
      newErrors.hinhAnh = "Hình ảnh không được để trống!";
      valid = false;
    }

    setErrorsSua(newErrors);
    return valid;
  };

  const themThuongHieu = async () => {
    if (!validateThem()) return;

    try {
      const base64Image = getBase64(hinhAnhMoi);
      const response = await fetch(`${API_URL}/api/ThuongHieu`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          TenThuongHieu: tenThuongHieuMoi,
          HinhAnh: base64Image,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Không thể thêm thương hiệu");
      }

      setTenThuongHieuMoi("");
      setHinhAnhMoi("");
      setErrorsThem({ ten: "", hinhAnh: "" });
      setMoModalThem(false);
      layDanhSachThuongHieu();
      addNotification("Thêm thương hiệu thành công!", "success");
    } catch (error) {
      addNotification(error instanceof Error ? error.message : "Có lỗi xảy ra khi thêm", "error");
    }
  };

  const suaThuongHieu = async () => {
    if (!validateSua()) return;

    try {
      const base64Image = getBase64(thuongHieuDangSua!.hinhAnh!);
      const response = await fetch(`${API_URL}/api/ThuongHieu/${thuongHieuDangSua!.maThuongHieu}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          MaThuongHieu: thuongHieuDangSua!.maThuongHieu,
          TenThuongHieu: thuongHieuDangSua!.tenThuongHieu,
          HinhAnh: base64Image,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Không thể cập nhật thương hiệu");
      }

      setMoModalSua(false);
      setThuongHieuDangSua(null);
      setErrorsSua({ ten: "", hinhAnh: "" });
      layDanhSachThuongHieu();
      addNotification("Cập nhật thương hiệu thành công!", "success");
    } catch (error) {
      addNotification(error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật", "error");
    }
  };

  const xoaThuongHieu = async () => {
    if (!thuongHieuCanXoa) return;

    try {
      const response = await fetch(`${API_URL}/api/ThuongHieu/${thuongHieuCanXoa.maThuongHieu}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Không thể xóa thương hiệu");
      }

      setMoModalXoa(false);
      setThuongHieuCanXoa(null);
      layDanhSachThuongHieu();
      addNotification("Xóa thương hiệu thành công!", "success");
    } catch (error) {
      addNotification(error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa", "error");
    }
  };

  const chiSoThuongHieuCuoi = trangHienTai * soThuongHieuMoiTrang;
  const chiSoThuongHieuDau = chiSoThuongHieuCuoi - soThuongHieuMoiTrang;
  const thuongHieuHienTai = filteredThuongHieus.slice(chiSoThuongHieuDau, chiSoThuongHieuCuoi);
  const tongSoTrang = Math.ceil(filteredThuongHieus.length / soThuongHieuMoiTrang);

  return (
    <div className="space-y-6 relative">
      {/* Hiển thị danh sách thông báo */}
      {notifications.map((notif) => (
        <Notification
          key={notif.id}
          message={notif.message}
          type={notif.type}
          onClose={() => removeNotification(notif.id)}
          duration={3000}
        />
      ))}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thương Hiệu</h1>
        </div>
        <Button className="bg-purple hover:bg-purple-medium" onClick={() => setMoModalThem(true)}>
          <FaPlus className="mr-2 h-4 w-4" /> Thêm Thương Hiệu
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Danh Sách Thương Hiệu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm thương hiệu..."
                className="pl-8 w-full sm:w-[300px]"
                value={tuKhoaTimKiem}
                onChange={(e) => setTuKhoaTimKiem(e.target.value)}
                maxLength={40}
              />
            </div>
            <div className="flex gap-2 self-end">
              <Button variant="outline" size="sm" className="h-9" onClick={layDanhSachThuongHieu}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Làm Mới
              </Button>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>STT</TableHead>
                  <TableHead>Hình Ảnh</TableHead>
                  <TableHead>Tên Thương Hiệu</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dangTai ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : thuongHieuHienTai.length > 0 ? (
                  thuongHieuHienTai.map((th, index) => (
                    <TableRow key={th.maThuongHieu} className="hover:bg-muted/50">
                      <TableCell>{chiSoThuongHieuDau + index + 1}</TableCell>
                      <TableCell>
                        {th.hinhAnh ? (
                          <img
                            src={formatBase64Image(th.hinhAnh)}
                            alt={th.tenThuongHieu}
                            className="h-12 w-12 object-cover rounded"
                            onError={(e) => (e.currentTarget.src = "/placeholder-image.jpg")}
                          />
                        ) : (
                          "Không có hình"
                        )}
                      </TableCell>
                      <TableCell>{th.tenThuongHieu}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setThuongHieuChiTiet(th);
                                setMoModalChiTiet(true);
                              }}
                            >
                              <FaEye className="mr-2 h-4 w-4 text-green-500" /> Chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setThuongHieuDangSua(th);
                                setMoModalSua(true);
                              }}
                            >
                              <FaEdit className="mr-2 h-4 w-4 text-blue-500" /> Sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setThuongHieuCanXoa(th);
                                setMoModalXoa(true);
                              }}
                            >
                              <FaTrashAlt className="mr-2 h-4 w-4 text-red-500" /> Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                      Không tìm thấy thương hiệu nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTrangHienTai(Math.max(1, trangHienTai - 1))}
              disabled={trangHienTai === 1}
            >
              Trang Trước
            </Button>
            <span>Trang {trangHienTai} / {tongSoTrang}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTrangHienTai(Math.min(tongSoTrang, trangHienTai + 1))}
              disabled={trangHienTai === tongSoTrang}
            >
              Trang Sau
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal Thêm Thương Hiệu */}
      <Dialog open={moModalThem} onOpenChange={setMoModalThem}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm Thương Hiệu</DialogTitle>
            <DialogDescription>Nhập thông tin thương hiệu mới.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                value={tenThuongHieuMoi}
                onChange={(e) => {
                  setTenThuongHieuMoi(e.target.value);
                  setErrorsThem((prev) => ({ ...prev, ten: "" }));
                }}
                placeholder="Tên thương hiệu"
              />
              {errorsThem.ten && <p className="text-red-500 text-sm mt-1">{errorsThem.ten}</p>}
            </div>
            <div>
              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center ${
                  isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {hinhAnhMoi ? (
                  <img src={hinhAnhMoi} alt="Preview" className="h-20 w-20 mx-auto object-cover rounded" />
                ) : (
                  <div>
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Kéo và thả hình ảnh vào đây hoặc nhấp để chọn
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="fileInputThem"
                      onChange={handleFileInputChange}
                    />
                    <label htmlFor="fileInputThem" className="cursor-pointer text-blue-500 hover:underline">
                      Chọn tệp
                    </label>
                  </div>
                )}
              </div>
              {errorsThem.hinhAnh && <p className="text-red-500 text-sm mt-1">{errorsThem.hinhAnh}</p>}
            </div>
            {hinhAnhMoi && (
              <Button variant="outline" onClick={() => setHinhAnhMoi("")} className="w-full">
                Xóa hình ảnh
              </Button>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoModalThem(false)}>
              Hủy
            </Button>
            <Button onClick={themThuongHieu}>Thêm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Sửa Thương Hiệu */}
      <Dialog open={moModalSua} onOpenChange={setMoModalSua}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa Thương Hiệu</DialogTitle>
            <DialogDescription>Cập nhật thông tin thương hiệu.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                value={thuongHieuDangSua?.tenThuongHieu || ""}
                onChange={(e) => {
                  setThuongHieuDangSua({ ...thuongHieuDangSua!, tenThuongHieu: e.target.value });
                  setErrorsSua((prev) => ({ ...prev, ten: "" }));
                }}
                placeholder="Tên thương hiệu"
              />
              {errorsSua.ten && <p className="text-red-500 text-sm mt-1">{errorsSua.ten}</p>}
            </div>
            <div>
              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center ${
                  isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {thuongHieuDangSua?.hinhAnh ? (
                  <img
                    src={formatBase64Image(thuongHieuDangSua.hinhAnh)}
                    alt="Preview"
                    className="h-20 w-20 mx-auto object-cover rounded"
                  />
                ) : (
                  <div>
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Kéo và thả hình ảnh vào đây hoặc nhấp để chọn
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="fileInputSua"
                      onChange={handleFileInputChange}
                    />
                    <label htmlFor="fileInputSua" className="cursor-pointer text-blue-500 hover:underline">
                      Chọn tệp
                    </label>
                  </div>
                )}
              </div>
              {errorsSua.hinhAnh && <p className="text-red-500 text-sm mt-1">{errorsSua.hinhAnh}</p>}
            </div>
            {thuongHieuDangSua?.hinhAnh && (
              <Button
                variant="outline"
                onClick={() => setThuongHieuDangSua({ ...thuongHieuDangSua!, hinhAnh: "" })}
                className="w-full"
              >
                Xóa hình ảnh
              </Button>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoModalSua(false)}>
              Hủy
            </Button>
            <Button onClick={suaThuongHieu}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Chi Tiết Thương Hiệu */}
      <Dialog open={moModalChiTiet} onOpenChange={setMoModalChiTiet}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi Tiết Thương Hiệu</DialogTitle>
            <DialogDescription>Thông tin chi tiết của thương hiệu.</DialogDescription>
          </DialogHeader>
          {thuongHieuChiTiet && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên Thương Hiệu</label>
                <Input value={thuongHieuChiTiet.tenThuongHieu} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hình Ảnh</label>
                {thuongHieuChiTiet.hinhAnh ? (
                  <img
                    src={formatBase64Image(thuongHieuChiTiet.hinhAnh)}
                    alt={thuongHieuChiTiet.tenThuongHieu}
                    className="h-20 w-20 object-cover rounded"
                  />
                ) : (
                  <p>Không có hình ảnh</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoModalChiTiet(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={moModalXoa} onOpenChange={setMoModalXoa}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa thương hiệu</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa thương hiệu này không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoModalXoa(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={xoaThuongHieu}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ThuongHieu;