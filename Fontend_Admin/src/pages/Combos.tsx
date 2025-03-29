import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, Grid2X2, List, MoreVertical, Tag } from "lucide-react";
import EditComboModal from "@/components/ComboAdmin/EditComboModal.jsx";
import CreateComboModal from "@/components/ComboAdmin/CreateComboModal.jsx";
import ComboDetailAdminModal from "@/components/ComboAdmin/DetailComboModal.jsx";
import Swal from "sweetalert2";

const Combos = () => {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedComboId, setSelectedComboId] = useState(null);
  const [sortBy, setSortBy] = useState(""); // "" | "price-asc" | "price-desc" | "name-asc" | "name-desc"
  const [currentPage, setCurrentPage] = useState(1);
  const combosPerPage = 12;

  const fetchCombos = async () => {
    try {
      const response = await fetch("http://localhost:5261/api/Combo/ComboSanPhamView", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        const normalizedData = (data || []).map((combo) => ({
          ...combo,
          sanPham: combo.sanPham || [],
        }));
        setCombos(normalizedData);
        console.log(normalizedData);
      } else {
        console.error("Lỗi khi lấy danh sách combo:", response.status);
        setCombos([]);
      }
    } catch (error) {
      console.error("Lỗi kết nối API danh sách combo:", error);
      setCombos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCombos();
  }, []);

  const getSortedCombos = () => {
    let filtered = [...combos].filter(
      (combo) =>
        (combo.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (combo.maCombo?.toString() || "").includes(searchTerm)
    );

    switch (sortBy) {
      case "price-asc":
        return filtered.sort((a, b) => (a.gia || 0) - (b.gia || 0));
      case "price-desc":
        return filtered.sort((a, b) => (b.gia || 0) - (a.gia || 0));
      case "name-asc":
        return filtered.sort((a, b) => 
          (a.name || "").localeCompare(b.name || ""));
      case "name-desc":
        return filtered.sort((a, b) => 
          (b.name || "").localeCompare(a.name || ""));
      default:
        return filtered;
    }
  };

  const sortedCombos = getSortedCombos();
  const indexOfLastCombo = currentPage * combosPerPage;
  const indexOfFirstCombo = indexOfLastCombo - combosPerPage;
  const currentCombos = sortedCombos.slice(indexOfFirstCombo, indexOfLastCombo);
  const totalPages = Math.ceil(sortedCombos.length / combosPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEditCombo = (combo) => {
    setSelectedComboId(combo.maCombo);
    setIsEditModalOpen(true);
  };

  const handleViewDetails = (comboId) => {
    setSelectedComboId(comboId);
    setIsDetailModalOpen(true);
  };

  const handleDeleteCombo = async (combo) => {
    Swal.fire({
      title: "Bạn có chắc chắn?",
      text: `Combo ${combo.name} mang mã ${combo.maCombo} sẽ chuyển sang trạng thái ngừng bán!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ngừng Bán",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `http://localhost:5261/api/Combo/DeleteCombo?id=${combo.maCombo}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );

          if (response.ok) {
            Swal.fire({
              title: "Thành công!",
              text: "Ngừng bán combo thành công!",
              icon: "success",
              timer: 3000,
              timerProgressBar: true,
              showConfirmButton: false,
            }).then(() => {
              fetchCombos();
            });
          } else {
            Swal.fire({
              title: "Lỗi!",
              text: "Có lỗi xảy ra khi ngừng bán combo.",
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
    });
  };

  const handleActiveCombo = async (combo) => {
    Swal.fire({
      title: "Bạn có chắc chắn?",
      text: `Combo ${combo.name} mang mã ${combo.maCombo} sẽ chuyển sang trạng thái đang bán!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Đang Bán",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `http://localhost:5261/api/Combo/DeleteCombo?id=${combo.maCombo}&status=true`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );

          if (response.ok) {
            Swal.fire({
              title: "Thành công!",
              text: "Mở bán lại combo thành công!",
              icon: "success",
              timer: 3000,
              timerProgressBar: true,
              showConfirmButton: false,
            }).then(() => {
              fetchCombos();
            });
          } else {
            Swal.fire({
              title: "Lỗi!",
              text: "Có lỗi xảy ra khi mở bán lại combo.",
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
    });
  };

  const handleAddComboSuccess = () => {
    fetchCombos();
    setIsCreateModalOpen(false);
  };

  const handleEditComboSuccess = () => {
    fetchCombos();
    setIsEditModalOpen(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Đang tải combo...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Combo</h1>
          <p className="text-muted-foreground mt-1">Quản lý combo trong cửa hàng của bạn</p>
        </div>
        <Button
          className="bg-purple hover:bg-purple-medium"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Thêm Combo Mới
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Tất cả combo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Gõ tên combo hoặc mã combo cần tìm"
                className="pl-8 w-full sm:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 self-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Filter className="h-4 w-4 mr-2" />
                    {sortBy === "" ? "Sắp xếp" : 
                      sortBy === "price-asc" ? "Giá thấp - cao" :
                      sortBy === "price-desc" ? "Giá cao - thấp" :
                      sortBy === "name-asc" ? "A - Z" : "Z - A"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSortBy("")}>
                    Mặc định
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("price-asc")}>
                    Giá: Thấp đến Cao
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("price-desc")}>
                    Giá: Cao đến Thấp
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("name-asc")}>
                    Tên: A - Z
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("name-desc")}>
                    Tên: Z - A
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex border rounded-md">
                <Button
                  variant={view === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-9 rounded-r-none"
                  onClick={() => setView("grid")}
                >
                  <Grid2X2 className="h-4 w-4" />
                </Button>
                <Button
                  variant={view === "list" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-9 rounded-l-none"
                  onClick={() => setView("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {currentCombos.map((combo) => (
                <Card key={combo.maCombo} className="hover-scale overflow-hidden group">
                  <div className="h-40 bg-purple-light flex items-center justify-center">
                    <img
                      src={
                        combo.hinhAnh
                          ? `data:image/jpeg;base64,${combo.hinhAnh}`
                          : "/placeholder-image.jpg"
                      }
                      alt={combo.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{combo.name || "Không có tên"}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          Mã Combo: {combo.maCombo || "Không xác định"}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditCombo(combo)}>
                            Chỉnh Sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewDetails(combo.maCombo)}>
                            Chi Tiết
                          </DropdownMenuItem>
                          {combo.trangThai === false ? (
                            <DropdownMenuItem
                              onClick={() => handleActiveCombo(combo)}
                              className="text-green-600"
                            >
                              Mở Bán
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleDeleteCombo(combo)}
                              className="text-red-600"
                            >
                              Ngừng Bán
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="outline" className="bg-secondary text-muted-foreground border-0">
                        <Tag className="h-3 w-3 mr-1" /> {(combo.sanPhams || []).length} sản phẩm
                      </Badge>
                      <Badge
                        variant={combo.trangThai === true ? "default" : "destructive"}
                        className="flex flex-col justify-center items-center text-center h-full px-2"
                      >
                        {combo.trangThai === true ? "Đang Bán" : "Ngừng Bán"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="font-bold text-purple">
                        {(combo.gia / 1000)?.toFixed(3) || "0"} VND
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Còn lại: {combo.soLuong || 0} combo
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border rounded-md divide-y">
              {currentCombos.map((combo) => (
                <div
                  key={combo.maCombo}
                  className="p-4 flex items-center gap-4 hover:bg-muted/50"
                >
                  <div className="h-12 w-12 bg-purple-light rounded-md flex items-center justify-center">
                    <img
                      src={
                        combo.hinhAnh
                          ? `data:image/jpeg;base64,${combo.hinhAnh}`
                          : "/placeholder-image.jpg"
                      }
                      alt={combo.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{combo.name || "Không có tên"}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      Mã Combo: {combo.maCombo || "Không xác định"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-secondary text-muted-foreground border-0">
                      {(combo.sanPhams || []).length} sản phẩm
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple">
                      {(combo.gia / 1000)?.toFixed(1) || "0"}K VND
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {combo.soLuong || 0} in stock
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditCombo(combo)}>
                        Chỉnh Sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewDetails(combo.maCombo)}>
                        Chi Tiết
                      </DropdownMenuItem>
                      {combo.trangThai === false ? (
                        <DropdownMenuItem
                          onClick={() => handleActiveCombo(combo)}
                          className="text-green-600"
                        >
                          Mở Bán
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleDeleteCombo(combo)}
                          className="text-red-600"
                        >
                          Ngừng Bán
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}

          {currentCombos.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Không tìm thấy combo nào</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <EditComboModal
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        comboId={selectedComboId}
      />
      <CreateComboModal
        isCreateModalOpen={isCreateModalOpen}
        setIsCreateModalOpen={setIsCreateModalOpen}
        onAddSuccess={handleAddComboSuccess}
      />
      <ComboDetailAdminModal
        comboId={selectedComboId}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  );
};

export default Combos;