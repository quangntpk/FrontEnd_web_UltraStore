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
import { Search, MoreVertical, RefreshCw } from "lucide-react";
import Notification from "@/components/layout/Notification";

interface KichThuoc {
  maKichThuoc: number;
  tenKichThuoc: string;
}

const KichThuoc = () => {
  const [kichThuocs, setKichThuocs] = useState<KichThuoc[]>([]);
  const [filteredKichThuocs, setFilteredKichThuocs] = useState<KichThuoc[]>([]);
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");
  const [dangTai, setDangTai] = useState(true);
  const [moModalThem, setMoModalThem] = useState(false);
  const [moModalSua, setMoModalSua] = useState(false);
  const [moModalXoa, setMoModalXoa] = useState(false);
  const [kichThuocCanXoa, setKichThuocCanXoa] = useState<KichThuoc | null>(null);
  const [tenKichThuocMoi, setTenKichThuocMoi] = useState("");
  const [kichThuocDangSua, setKichThuocDangSua] = useState<KichThuoc | null>(null);
  const [trangHienTai, setTrangHienTai] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [moModalChiTiet, setMoModalChiTiet] = useState(false);
  const [kichThuocChiTiet, setKichThuocChiTiet] = useState<KichThuoc | null>(null);

  const soKichThuocMoiTrang = 10;
  const API_URL = "http://localhost:5261";

  const layDanhSachKichThuoc = async () => {
    try {
      setDangTai(true);
      const response = await fetch(`${API_URL}/api/KichThuoc`);
      if (!response.ok) throw new Error("Không thể lấy danh sách kích thước");
      const data = await response.json();
      setKichThuocs(data.sort((a: KichThuoc, b: KichThuoc) => b.maKichThuoc - a.maKichThuoc));
      setFilteredKichThuocs(data.sort((a: KichThuoc, b: KichThuoc) => b.maKichThuoc - a.maKichThuoc));
    } catch (error) {
      setNotification({ message: error.message || "Có lỗi xảy ra khi tải danh sách", type: "error" });
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    layDanhSachKichThuoc();
  }, []);

  const locKichThuoc = useCallback(() => {
    if (!tuKhoaTimKiem.trim()) {
      setFilteredKichThuocs(kichThuocs);
    } else {
      const tuKhoa = tuKhoaTimKiem.toLowerCase();
      const filtered = kichThuocs.filter(
        (kt) =>
          kt.tenKichThuoc?.toLowerCase().includes(tuKhoa) ||
          kt.maKichThuoc?.toString().includes(tuKhoa)
      );
      setFilteredKichThuocs(filtered);
      setTrangHienTai(1);
    }
  }, [tuKhoaTimKiem, kichThuocs]);

  useEffect(() => {
    locKichThuoc();
  }, [locKichThuoc]);

  const themKichThuoc = async () => {
    if (!tenKichThuocMoi.trim()) {
      setErrorMessage("Tên kích thước không được để trống!");
      return;
    }
    setErrorMessage(null);
    try {
      const response = await fetch(`${API_URL}/api/KichThuoc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TenKichThuoc: tenKichThuocMoi }),
      });
      if (!response.ok) throw new Error("Không thể thêm kích thước");
      setTenKichThuocMoi("");
      setMoModalThem(false);
      layDanhSachKichThuoc();
      setNotification({ message: "Thêm kích thước thành công!", type: "success" });
    } catch (error) {
      setNotification({ message: error.message || "Có lỗi xảy ra khi thêm", type: "error" });
    }
  };

  const suaKichThuoc = async () => {
    if (!kichThuocDangSua || !kichThuocDangSua.tenKichThuoc.trim()) {
      setErrorMessage("Tên kích thước không được để trống!");
      return;
    }
    setErrorMessage(null);
    try {
      const response = await fetch(`${API_URL}/api/KichThuoc/${kichThuocDangSua.maKichThuoc}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          MaKichThuoc: kichThuocDangSua.maKichThuoc,
          TenKichThuoc: kichThuocDangSua.tenKichThuoc,
        }),
      });
      if (!response.ok) throw new Error("Không thể cập nhật kích thước");
      setMoModalSua(false);
      setKichThuocDangSua(null);
      layDanhSachKichThuoc();
      setNotification({ message: "Cập nhật kích thước thành công!", type: "success" });
    } catch (error) {
      setNotification({ message: error.message || "Có lỗi xảy ra khi cập nhật", type: "error" });
    }
  };

  const xoaKichThuoc = async () => {
    if (!kichThuocCanXoa) return;
    try {
      const response = await fetch(`${API_URL}/api/KichThuoc/${kichThuocCanXoa.maKichThuoc}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Không thể xóa kích thước");
      setMoModalXoa(false);
      setKichThuocCanXoa(null);
      layDanhSachKichThuoc();
      setNotification({ message: "Xóa kích thước thành công!", type: "success" });
    } catch (error) {
      setNotification({ message: error.message || "Có lỗi xảy ra khi xóa", type: "error" });
    }
  };

  const chiSoKichThuocCuoi = trangHienTai * soKichThuocMoiTrang;
  const chiSoKichThuocDau = chiSoKichThuocCuoi - soKichThuocMoiTrang;
  const kichThuocHienTai = filteredKichThuocs.slice(chiSoKichThuocDau, chiSoKichThuocCuoi);
  const tongSoTrang = Math.ceil(filteredKichThuocs.length / soKichThuocMoiTrang);

  return (
    <div className="space-y-6">
      {/* Hiển thị thông báo */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          duration={3000}
        />
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Kích Thước</h1>
        <Button className="bg-purple hover:bg-purple-medium" onClick={() => setMoModalThem(true)}>
          <FaPlus className="mr-2 h-4 w-4" /> Thêm Kích Thước
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Danh Sách Kích Thước</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm kích thước..."
                className="pl-8 w-full sm:w-[300px]"
                value={tuKhoaTimKiem}
                onChange={(e) => setTuKhoaTimKiem(e.target.value)}
                maxLength={40}
              />
            </div>
            <Button variant="outline" size="sm" className="h-9" onClick={layDanhSachKichThuoc}>
              <RefreshCw className="h-4 w-4 mr-2" /> Làm Mới
            </Button>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>STT</TableHead>
                  <TableHead>Tên Kích Thước</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dangTai ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : kichThuocHienTai.length > 0 ? (
                  kichThuocHienTai.map((kt, index) => (
                    <TableRow key={kt.maKichThuoc} className="hover:bg-muted/50">
                      <TableCell>{chiSoKichThuocDau + index + 1}</TableCell>
                      <TableCell>{kt.tenKichThuoc}</TableCell>
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
                                setKichThuocChiTiet(kt);
                                setMoModalChiTiet(true);
                              }}
                            >
                              <FaEye className="mr-2 h-4 w-4 text-green-500" /> Chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setKichThuocDangSua(kt);
                                setMoModalSua(true);
                              }}
                            >
                              <FaEdit className="mr-2 h-4 w-4 text-blue-500" /> Sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setKichThuocCanXoa(kt);
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
                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                      Không tìm thấy kích thước nào.
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

      {/* Modal thêm kích thước */}
      <Dialog
        open={moModalThem}
        onOpenChange={(open) => {
          setMoModalThem(open);
          if (!open) setErrorMessage(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm Kích Thước</DialogTitle>
            <DialogDescription>Nhập tên kích thước mới.</DialogDescription>
          </DialogHeader>
          <Input
            value={tenKichThuocMoi}
            onChange={(e) => setTenKichThuocMoi(e.target.value)}
            placeholder="Tên kích thước"
          />
          {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoModalThem(false)}>
              Hủy
            </Button>
            <Button onClick={themKichThuoc}>Thêm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal sửa kích thước */}
      <Dialog
        open={moModalSua}
        onOpenChange={(open) => {
          setMoModalSua(open);
          if (!open) setErrorMessage(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa Kích Thước</DialogTitle>
            <DialogDescription>Cập nhật tên kích thước.</DialogDescription>
          </DialogHeader>
          <Input
            value={kichThuocDangSua?.tenKichThuoc || ""}
            onChange={(e) =>
              setKichThuocDangSua({ ...kichThuocDangSua!, tenKichThuoc: e.target.value })
            }
            placeholder="Tên kích thước"
          />
          {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoModalSua(false)}>
              Hủy
            </Button>
            <Button onClick={suaKichThuoc}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal chi tiết kích thước */}
      <Dialog open={moModalChiTiet} onOpenChange={setMoModalChiTiet}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi Tiết Kích Thước</DialogTitle>
            <DialogDescription>Thông tin chi tiết của kích thước.</DialogDescription>
          </DialogHeader>
          {kichThuocChiTiet && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên Kích Thước</label>
                <Input value={kichThuocChiTiet.tenKichThuoc} disabled />
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

      {/* Modal xóa kích thước */}
      <Dialog open={moModalXoa} onOpenChange={setMoModalXoa}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa kích thước</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa kích thước này không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoModalXoa(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={xoaKichThuoc}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KichThuoc;