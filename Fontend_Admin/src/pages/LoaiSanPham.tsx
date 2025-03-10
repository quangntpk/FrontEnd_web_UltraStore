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
import toast, { Toaster } from "react-hot-toast";

const LoaiSanPham = () => {
  const [loaiSanPhams, setLoaiSanPhams] = useState([]);
  const [filteredLoaiSanPhams, setFilteredLoaiSanPhams] = useState([]);
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");
  const [dangTai, setDangTai] = useState(true);
  const [moModalThem, setMoModalThem] = useState(false);
  const [moModalSua, setMoModalSua] = useState(false);
  const [moModalXoa, setMoModalXoa] = useState(false);
  const [loaiSanPhamCanXoa, setLoaiSanPhamCanXoa] = useState(null);
  const [tenLoaiSanPhamMoi, setTenLoaiSanPhamMoi] = useState("");
  const [loaiSanPhamDangSua, setLoaiSanPhamDangSua] = useState(null);
  const [trangHienTai, setTrangHienTai] = useState(1);

  const soLoaiSanPhamMoiTrang = 10;
  const API_URL = "http://localhost:5261";

  const layDanhSachLoaiSanPham = async () => {
    try {
      setDangTai(true);
      const response = await fetch(`${API_URL}/api/LoaiSanPham`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Không thể lấy danh sách loại sản phẩm");
      }
      const data = await response.json();
      setLoaiSanPhams(data);
      setFilteredLoaiSanPhams(data);
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi tải danh sách");
    } finally {
      setDangTai(false);
    }
  };

  const locLoaiSanPham = () => {
    if (!tuKhoaTimKiem.trim()) {
      setFilteredLoaiSanPhams(loaiSanPhams);
    } else {
      const tuKhoa = tuKhoaTimKiem.toLowerCase();
      const filtered = loaiSanPhams.filter((lsp) =>
        lsp.maLoaiSanPham.toString().includes(tuKhoa) ||
        lsp.tenLoaiSanPham.toLowerCase().includes(tuKhoa)
      );
      setFilteredLoaiSanPhams(filtered);
      setTrangHienTai(1);
    }
  };

  useEffect(() => {
    layDanhSachLoaiSanPham();
  }, []);

  useEffect(() => {
    locLoaiSanPham();
  }, [tuKhoaTimKiem, loaiSanPhams]);

  const themLoaiSanPham = async () => {
    if (!tenLoaiSanPhamMoi.trim()) {
      toast.error("Tên loại sản phẩm không được để trống!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/LoaiSanPham`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ TenLoaiSanPham: tenLoaiSanPhamMoi }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Không thể thêm loại sản phẩm");
      }

      setTenLoaiSanPhamMoi("");
      setMoModalThem(false);
      layDanhSachLoaiSanPham();
      toast.success("Thêm loại sản phẩm thành công!");
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi thêm");
    }
  };

  const suaLoaiSanPham = async () => {
    if (!loaiSanPhamDangSua || !loaiSanPhamDangSua.tenLoaiSanPham.trim()) {
      toast.error("Tên loại sản phẩm không được để trống!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/LoaiSanPham/${loaiSanPhamDangSua.maLoaiSanPham}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          MaLoaiSanPham: loaiSanPhamDangSua.maLoaiSanPham, 
          TenLoaiSanPham: loaiSanPhamDangSua.tenLoaiSanPham 
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Không thể cập nhật loại sản phẩm");
      }

      setMoModalSua(false);
      setLoaiSanPhamDangSua(null);
      layDanhSachLoaiSanPham();
      toast.success("Cập nhật loại sản phẩm thành công!");
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật");
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
      toast.success("Xóa loại sản phẩm thành công!");
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi xóa");
    }
  };

  const chiSoLoaiSanPhamCuoi = trangHienTai * soLoaiSanPhamMoiTrang;
  const chiSoLoaiSanPhamDau = chiSoLoaiSanPhamCuoi - soLoaiSanPhamMoiTrang;
  const loaiSanPhamHienTai = filteredLoaiSanPhams.slice(chiSoLoaiSanPhamDau, chiSoLoaiSanPhamCuoi);
  const tongSoTrang = Math.ceil(filteredLoaiSanPhams.length / soLoaiSanPhamMoiTrang);

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

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
                placeholder="Tìm kiếm theo ID hoặc tên loại sản phẩm..."
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
                  <TableHead>ID</TableHead>
                  <TableHead>Tên Loại Sản Phẩm</TableHead>
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
                ) : loaiSanPhamHienTai.length > 0 ? (
                  loaiSanPhamHienTai.map((lsp) => (
                    <TableRow key={lsp.maLoaiSanPham} className="hover:bg-muted/50">
                      <TableCell>{lsp.maLoaiSanPham}</TableCell>
                      <TableCell>{lsp.tenLoaiSanPham}</TableCell>
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
                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
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
            <DialogTitle>Thêm Loại Sản Phẩm</DialogTitle>
            <DialogDescription>Nhập tên loại sản phẩm mới.</DialogDescription>
          </DialogHeader>
          <Input
            value={tenLoaiSanPhamMoi}
            onChange={(e) => setTenLoaiSanPhamMoi(e.target.value)}
            placeholder="Tên loại sản phẩm"
          />
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
            <DialogDescription>Cập nhật tên loại sản phẩm.</DialogDescription>
          </DialogHeader>
          <Input
            value={loaiSanPhamDangSua?.tenLoaiSanPham || ""}
            onChange={(e) => setLoaiSanPhamDangSua({ ...loaiSanPhamDangSua, tenLoaiSanPham: e.target.value })}
            placeholder="Tên loại sản phẩm"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoModalSua(false)}>
              Hủy
            </Button>
            <Button onClick={suaLoaiSanPham}>Lưu</Button>
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