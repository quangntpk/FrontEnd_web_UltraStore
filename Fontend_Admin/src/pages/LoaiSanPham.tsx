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

interface NotificationProps {
  id?: number;
  message: string;
  type?: "success" | "error" | "info" | "warning";
  onClose?: () => void;
  duration?: number;
  inHeader?: boolean;
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type = "info",
  onClose,
  duration,
  inHeader = false,
}) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    info: "bg-green-100 text-green-800 border-green-400",
    error: "bg-red-100 text-red-800 border-red-400",
    success: "bg-blue-100 text-blue-800 border-blue-400",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-400",
  };

  return (
    <div
      className={`${
        inHeader ? "absolute top-2 right-2" : "fixed top-20 right-4"
      } max-w-sm w-full p-4 rounded-md border-l-4 shadow-md ${typeStyles[type]}`}
    >
      <div className="flex justify-between items-center">
        <span>{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

const formatBase64Image = (base64String) => {
  if (!base64String) return "";
  if (base64String.startsWith("data:image")) return base64String;
  return `data:image/png;base64,${base64String}`;
};

const getBase64 = (imageString) => {
  if (!imageString) return "";
  if (imageString.startsWith("data:")) {
    return imageString.split(",")[1];
  }
  return imageString;
};

const LoaiSanPham = () => {
  const [loaiSanPhams, setLoaiSanPhams] = useState([]);
  const [filteredLoaiSanPhams, setFilteredLoaiSanPhams] = useState([]);
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");
  const [dangTai, setDangTai] = useState(true);
  const [moModalThem, setMoModalThem] = useState(false);
  const [moModalSua, setMoModalSua] = useState(false);
  const [moModalXoa, setMoModalXoa] = useState(false);
  const [moModalChiTiet, setMoModalChiTiet] = useState(false); 
  const [loaiSanPhamCanXoa, setLoaiSanPhamCanXoa] = useState(null);
  const [tenLoaiSanPhamMoi, setTenLoaiSanPhamMoi] = useState("");
  const [kiHieuMoi, setKiHieuMoi] = useState("");
  const [hinhAnhMoi, setHinhAnhMoi] = useState("");
  const [loaiSanPhamDangSua, setLoaiSanPhamDangSua] = useState(null);
  const [loaiSanPhamChiTiet, setLoaiSanPhamChiTiet] = useState(null); 
  const [trangHienTai, setTrangHienTai] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  const [errorsThem, setErrorsThem] = useState({ ten: "", kiHieu: "", hinhAnh: "" });
  const [errorsSua, setErrorsSua] = useState({ ten: "", kiHieu: "", hinhAnh: "" });

  const soLoaiSanPhamMoiTrang = 10;
  const API_URL = "http://localhost:5261";

  const addNotification = (message: string, type: NotificationProps["type"], duration = 3000) => {
    const id = Date.now();
    setNotifications((prev) => [
      ...prev,
      { id, message, type, duration, onClose: () => removeNotification(id) },
    ]);
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const layDanhSachLoaiSanPham = async () => {
    try {
      setDangTai(true);
      const response = await fetch(`${API_URL}/api/LoaiSanPham`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Không thể lấy danh sách loại sản phẩm");
      }
      const data = await response.json();
      console.log("Dữ liệu từ API:", data);
      setLoaiSanPhams(data.sort((a, b) => b.maLoaiSanPham - a.maLoaiSanPham));
      setFilteredLoaiSanPhams(data.sort((a, b) => b.maLoaiSanPham - a.maLoaiSanPham));
    } catch (error) {
      addNotification(error.message || "Có lỗi xảy ra khi tải danh sách", "error");
    } finally {
      setDangTai(false);
    }
  };

  const locLoaiSanPham = useCallback(() => {
    if (!tuKhoaTimKiem.trim()) {
      setFilteredLoaiSanPhams(loaiSanPhams);
    } else {
      const tuKhoa = tuKhoaTimKiem.toLowerCase();
      const filtered = loaiSanPhams.filter(
        (lsp) =>
          (lsp.tenLoaiSanPham?.toLowerCase().includes(tuKhoa) || "") ||
          (lsp.kiHieu?.toLowerCase().includes(tuKhoa) || "")
      );
      setFilteredLoaiSanPhams(filtered);
      setTrangHienTai(1);
    }
  }, [tuKhoaTimKiem, loaiSanPhams]);

  useEffect(() => {
    layDanhSachLoaiSanPham();
  }, []);

  useEffect(() => {
    locLoaiSanPham();
  }, [locLoaiSanPham]);

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (moModalThem) {
        setHinhAnhMoi(base64String);
        setErrorsThem((prev) => ({ ...prev, hinhAnh: "" }));
      } else if (moModalSua && loaiSanPhamDangSua) {
        setLoaiSanPhamDangSua({ ...loaiSanPhamDangSua, hinhAnh: base64String });
        setErrorsSua((prev) => ({ ...prev, hinhAnh: "" }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    } else {
      addNotification("Vui lòng chọn một tệp hình ảnh!", "error");
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    } else {
      addNotification("Vui lòng chọn một tệp hình ảnh!", "error");
    }
  };

  const validateThem = () => {
    let valid = true;
    const newErrors = { ten: "", kiHieu: "", hinhAnh: "" };
    const kiHieuUpper = kiHieuMoi.trim().toUpperCase();

    if (!tenLoaiSanPhamMoi.trim()) {
      newErrors.ten = "Tên loại sản phẩm không được để trống!";
      valid = false;
    }
    if (!kiHieuMoi.trim()) {
      newErrors.kiHieu = "Ký hiệu không được để trống!";
      valid = false;
    } else if (kiHieuUpper.length !== 1) {
      newErrors.kiHieu = "Ký hiệu phải đúng 1 ký tự!";
      valid = false;
    } else if (loaiSanPhams.some((lsp) => lsp.kiHieu === kiHieuUpper)) {
      newErrors.kiHieu = "Ký hiệu đã tồn tại!";
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
    const newErrors = { ten: "", kiHieu: "", hinhAnh: "" };
    const kiHieuUpper = loaiSanPhamDangSua?.kiHieu.trim().toUpperCase();

    if (!loaiSanPhamDangSua?.tenLoaiSanPham?.trim()) {
      newErrors.ten = "Tên loại sản phẩm không được để trống!";
      valid = false;
    }

    if (!loaiSanPhamDangSua?.kiHieu?.trim()) {
      newErrors.kiHieu = "Ký hiệu không được để trống!";
      valid = false;
    } else if (kiHieuUpper.length !== 1) {
      newErrors.kiHieu = "Ký hiệu phải đúng 1 ký tự!";
      valid = false;
    } else if (
      loaiSanPhams.some(
        (lsp) =>
          lsp.kiHieu === kiHieuUpper &&
          lsp.maLoaiSanPham !== loaiSanPhamDangSua.maLoaiSanPham
      )
    ) {
      newErrors.kiHieu = "Ký hiệu đã tồn tại!";
      valid = false;
    }

    if (!loaiSanPhamDangSua?.hinhAnh) {
      newErrors.hinhAnh = "Hình ảnh không được để trống!";
      valid = false;
    }

    setErrorsSua(newErrors);
    return valid;
  };

  const themLoaiSanPham = async () => {
    if (!validateThem()) return;

    try {
      const base64Image = getBase64(hinhAnhMoi);
      const kiHieuUpper = kiHieuMoi.trim().toUpperCase();
      const response = await fetch(`${API_URL}/api/LoaiSanPham`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          TenLoaiSanPham: tenLoaiSanPhamMoi,
          KiHieu: kiHieuUpper,
          HinhAnh: base64Image,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Không thể thêm loại sản phẩm");
      }

      setTenLoaiSanPhamMoi("");
      setKiHieuMoi("");
      setHinhAnhMoi("");
      setErrorsThem({ ten: "", kiHieu: "", hinhAnh: "" });
      setMoModalThem(false);
      layDanhSachLoaiSanPham();
      addNotification("Thêm loại sản phẩm thành công!", "success");
    } catch (error) {
      addNotification(error.message || "Có lỗi xảy ra khi thêm", "error");
    }
  };

  const suaLoaiSanPham = async () => {
    if (!validateSua()) return;

    try {
      const base64Image = getBase64(loaiSanPhamDangSua.hinhAnh);
      const kiHieuUpper = loaiSanPhamDangSua.kiHieu.trim().toUpperCase();
      const response = await fetch(`${API_URL}/api/LoaiSanPham/${loaiSanPhamDangSua.maLoaiSanPham}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          MaLoaiSanPham: loaiSanPhamDangSua.maLoaiSanPham,
          TenLoaiSanPham: loaiSanPhamDangSua.tenLoaiSanPham,
          KiHieu: kiHieuUpper,
          HinhAnh: base64Image,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Không thể cập nhật loại sản phẩm");
      }

      setMoModalSua(false);
      setLoaiSanPhamDangSua(null);
      setErrorsSua({ ten: "", kiHieu: "", hinhAnh: "" });
      layDanhSachLoaiSanPham();
      addNotification("Cập nhật loại sản phẩm thành công!", "success");
    } catch (error) {
      addNotification(error.message || "Có lỗi xảy ra khi cập nhật", "error");
    }
  };

  const xoaLoaiSanPham = async () => {
    if (!loaiSanPhamCanXoa) return;

    try {
      const response = await fetch(`${API_URL}/api/LoaiSanPham/${loaiSanPhamCanXoa.maLoaiSanPham}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Không thể xóa loại sản phẩm");
      }

      setMoModalXoa(false);
      setLoaiSanPhamCanXoa(null);
      layDanhSachLoaiSanPham();
      addNotification("Xóa loại sản phẩm thành công!", "success");
    } catch (error) {
      addNotification(error.message || "Có lỗi xảy ra khi xóa", "error");
    }
  };

  const chiSoLoaiSanPhamCuoi = trangHienTai * soLoaiSanPhamMoiTrang;
  const chiSoLoaiSanPhamDau = chiSoLoaiSanPhamCuoi - soLoaiSanPhamMoiTrang;
  const loaiSanPhamHienTai = filteredLoaiSanPhams.slice(chiSoLoaiSanPhamDau, chiSoLoaiSanPhamCuoi);
  const tongSoTrang = Math.ceil(filteredLoaiSanPhams.length / soLoaiSanPhamMoiTrang);

  return (
    <div className="space-y-6 relative">
      {notifications.map((notif) => (
        <Notification key={notif.id} {...notif} />
      ))}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loại Sản Phẩm</h1>
        </div>
        <Button className="bg-purple hover:bg-purple-medium" onClick={() => setMoModalThem(true)}>
          <FaPlus className="mr-2 h-4 w-4" /> Thêm Loại Sản Phẩm
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Danh Sách Loại Sản Phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm..."
                className="pl-8 w-full sm:w-[300px]"
                value={tuKhoaTimKiem}
                onChange={(e) => setTuKhoaTimKiem(e.target.value)}
                maxLength={40}
              />
            </div>
            <div className="flex gap-2 self-end">
              <Button variant="outline" size="sm" className="h-9" onClick={layDanhSachLoaiSanPham}>
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
                  <TableHead>Tên Loại Sản Phẩm</TableHead>
                  <TableHead>Ký Hiệu</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dangTai ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : loaiSanPhamHienTai.length > 0 ? (
                  loaiSanPhamHienTai.map((lsp, index) => (
                    <TableRow key={lsp.maLoaiSanPham} className="hover:bg-muted/50">
                      <TableCell>{chiSoLoaiSanPhamDau + index + 1}</TableCell>
                      <TableCell>
                        {lsp.hinhAnh ? (
                          <img
                            src={formatBase64Image(lsp.hinhAnh)}
                            alt={lsp.tenLoaiSanPham}
                            className="h-12 w-12 object-cover rounded"
                            onError={(e) => (e.target as HTMLImageElement).src = "/placeholder-image.jpg"}
                          />
                        ) : (
                          "Không có hình"
                        )}
                      </TableCell>
                      <TableCell>{lsp.tenLoaiSanPham}</TableCell>
                      <TableCell>{lsp.kiHieu}</TableCell>
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
                                setLoaiSanPhamChiTiet(lsp);
                                setMoModalChiTiet(true);
                              }}
                            >
                              <FaEye className="mr-2 h-4 w-4 text-green-500" /> Chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setLoaiSanPhamDangSua(lsp);
                                setMoModalSua(true);
                              }}
                            >
                              <FaEdit className="mr-2 h-4 w-4 text-blue-500" /> Sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setLoaiSanPhamCanXoa(lsp);
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
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      Không tìm thấy loại sản phẩm nào.
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

      <Dialog open={moModalThem} onOpenChange={setMoModalThem}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm Loại Sản Phẩm</DialogTitle>
            <DialogDescription>Nhập thông tin loại sản phẩm mới.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                value={tenLoaiSanPhamMoi}
                onChange={(e) => {
                  setTenLoaiSanPhamMoi(e.target.value);
                  setErrorsThem((prev) => ({ ...prev, ten: "" }));
                }}
                placeholder="Tên loại sản phẩm"
              />
              {errorsThem.ten && <p className="text-red-500 text-sm mt-1">{errorsThem.ten}</p>}
            </div>
            <div>
              <Input
                value={kiHieuMoi}
                onChange={(e) => {
                  setKiHieuMoi(e.target.value);
                  setErrorsThem((prev) => ({ ...prev, kiHieu: "" }));
                }}
                placeholder="Ký hiệu"
                maxLength={1}
              />
              {errorsThem.kiHieu && <p className="text-red-500 text-sm mt-1">{errorsThem.kiHieu}</p>}
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
              <Button
                variant="outline"
                onClick={() => setHinhAnhMoi("")}
                className="w-full"
              >
                Xóa hình ảnh
              </Button>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoModalThem(false)}>
              Hủy
            </Button>
            <Button onClick={themLoaiSanPham}>Thêm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={moModalSua} onOpenChange={setMoModalSua}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa Loại Sản Phẩm</DialogTitle>
            <DialogDescription>Cập nhật thông tin loại sản phẩm.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                value={loaiSanPhamDangSua?.tenLoaiSanPham || ""}
                onChange={(e) => {
                  setLoaiSanPhamDangSua({ ...loaiSanPhamDangSua, tenLoaiSanPham: e.target.value });
                  setErrorsSua((prev) => ({ ...prev, ten: "" }));
                }}
                placeholder="Tên loại sản phẩm"
              />
              {errorsSua.ten && <p className="text-red-500 text-sm mt-1">{errorsSua.ten}</p>}
            </div>
            <div>
              <Input
                value={loaiSanPhamDangSua?.kiHieu || ""}
                onChange={(e) => {
                  setLoaiSanPhamDangSua({ ...loaiSanPhamDangSua, kiHieu: e.target.value });
                  setErrorsSua((prev) => ({ ...prev, kiHieu: "" }));
                }}
                placeholder="Ký hiệu"
                maxLength={1}
              />
              {errorsSua.kiHieu && <p className="text-red-500 text-sm mt-1">{errorsSua.kiHieu}</p>}
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
                {loaiSanPhamDangSua?.hinhAnh ? (
                  <img
                    src={formatBase64Image(loaiSanPhamDangSua.hinhAnh)}
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
            {loaiSanPhamDangSua?.hinhAnh && (
              <Button
                variant="outline"
                onClick={() => setLoaiSanPhamDangSua({ ...loaiSanPhamDangSua, hinhAnh: "" })}
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
            <Button onClick={suaLoaiSanPham}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={moModalChiTiet} onOpenChange={setMoModalChiTiet}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi Tiết Loại Sản Phẩm</DialogTitle>
            <DialogDescription>Thông tin chi tiết của loại sản phẩm.</DialogDescription>
          </DialogHeader>
          {loaiSanPhamChiTiet && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Hình Ảnh</label>
                {loaiSanPhamChiTiet.hinhAnh ? (
                  <img
                    src={formatBase64Image(loaiSanPhamChiTiet.hinhAnh)}
                    alt={loaiSanPhamChiTiet.tenLoaiSanPham}
                    className="h-20 w-20 object-cover rounded"
                  />
                ) : (
                  <p>Không có hình ảnh</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên Loại Sản Phẩm</label>
                <Input value={loaiSanPhamChiTiet.tenLoaiSanPham} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ký Hiệu</label>
                <Input value={loaiSanPhamChiTiet.kiHieu} disabled />
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
            <DialogTitle>Xác nhận xóa loại sản phẩm</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa loại sản phẩm này không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoModalXoa(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={xoaLoaiSanPham}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoaiSanPham;