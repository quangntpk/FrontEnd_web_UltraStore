import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrashAlt } from 'react-icons/fa';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  MoreVertical,
  RefreshCw
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast"; // Thêm lại import này

const ThuongHieu = () => {
  const [thuongHieus, setThuongHieus] = useState([]);
  const [filteredThuongHieus, setFilteredThuongHieus] = useState([]);
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");
  const [dangTai, setDangTai] = useState(true);
  const [moModalThem, setMoModalThem] = useState(false);
  const [moModalSua, setMoModalSua] = useState(false);
  const [moModalXoa, setMoModalXoa] = useState(false);
  const [thuongHieuCanXoa, setThuongHieuCanXoa] = useState(null);
  const [tenThuongHieuMoi, setTenThuongHieuMoi] = useState("");
  const [thuongHieuDangSua, setThuongHieuDangSua] = useState(null);
  const [trangHienTai, setTrangHienTai] = useState(1);
  // Xóa state notification

  const soThuongHieuMoiTrang = 10;
  const API_URL = "http://localhost:5261";

  // Xóa useEffect cho notification

  const layDanhSachThuongHieu = async () => {
    try {
      setDangTai(true);
      const response = await fetch(`${API_URL}/api/ThuongHieu`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Không thể lấy danh sách thương hiệu");
      }
      const data = await response.json();
      setThuongHieus(data);
      setFilteredThuongHieus(data);
     
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi tải danh sách");
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    layDanhSachThuongHieu();
  }, []);

  useEffect(() => {
    const filtered = thuongHieus.filter((th) =>
      th.tenThuongHieu.toLowerCase().includes(tuKhoaTimKiem.toLowerCase()) ||
      th.maThuongHieu.toString().includes(tuKhoaTimKiem.toLowerCase())
    );
    setFilteredThuongHieus(filtered);
  }, [tuKhoaTimKiem, thuongHieus]);

  const themThuongHieu = async () => {
    if (!tenThuongHieuMoi.trim()) {
      toast.error("Tên thương hiệu không được để trống!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/ThuongHieu`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ TenThuongHieu: tenThuongHieuMoi }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Không thể thêm thương hiệu");
      }

      setTenThuongHieuMoi("");
      setMoModalThem(false);
      layDanhSachThuongHieu();
      toast.success("Thêm thương hiệu thành công!");
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi thêm");
    }
  };

  const suaThuongHieu = async () => {
    if (!thuongHieuDangSua || !thuongHieuDangSua.tenThuongHieu.trim()) {
      toast.error("Tên thương hiệu không được để trống!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/ThuongHieu/${thuongHieuDangSua.maThuongHieu}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          MaThuongHieu: thuongHieuDangSua.maThuongHieu, 
          TenThuongHieu: thuongHieuDangSua.tenThuongHieu 
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Không thể cập nhật thương hiệu");
      }

      setMoModalSua(false);
      setThuongHieuDangSua(null);
      layDanhSachThuongHieu();
      toast.success("Cập nhật thương hiệu thành công!");
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật");
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
      toast.success("Xóa thương hiệu thành công!");
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi xóa");
    }
  };

  const chiSoThuongHieuCuoi = trangHienTai * soThuongHieuMoiTrang;
  const chiSoThuongHieuDau = chiSoThuongHieuCuoi - soThuongHieuMoiTrang;
  const thuongHieuHienTai = filteredThuongHieus.slice(chiSoThuongHieuDau, chiSoThuongHieuCuoi);
  const tongSoTrang = Math.ceil(filteredThuongHieus.length / soThuongHieuMoiTrang);

  return (
    <div className="space-y-6">
      <Toaster position="top-right" /> {/* Thêm lại Toaster */}

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
                  <TableHead>ID</TableHead>
                  <TableHead>Tên Thương Hiệu</TableHead>
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
                ) : thuongHieuHienTai.length > 0 ? (
                  thuongHieuHienTai.map((th) => (
                    <TableRow key={th.maThuongHieu} className="hover:bg-muted/50">
                      <TableCell>{th.maThuongHieu}</TableCell>
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
                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
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
            <span>
              Trang {trangHienTai} / {tongSoTrang}
            </span>
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
            <DialogTitle>Thêm Thương Hiệu</DialogTitle>
            <DialogDescription>Nhập tên thương hiệu mới.</DialogDescription>
          </DialogHeader>
          <Input
            value={tenThuongHieuMoi}
            onChange={(e) => setTenThuongHieuMoi(e.target.value)}
            placeholder="Tên thương hiệu"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoModalThem(false)}>
              Hủy
            </Button>
            <Button onClick={themThuongHieu}>Thêm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={moModalSua} onOpenChange={setMoModalSua}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa Thương Hiệu</DialogTitle>
            <DialogDescription>Cập nhật tên thương hiệu.</DialogDescription>
          </DialogHeader>
          <Input
            value={thuongHieuDangSua?.tenThuongHieu || ""}
            onChange={(e) => setThuongHieuDangSua({ ...thuongHieuDangSua, tenThuongHieu: e.target.value })}
            placeholder="Tên thương hiệu"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoModalSua(false)}>
              Hủy
            </Button>
            <Button onClick={suaThuongHieu}>Lưu</Button>
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