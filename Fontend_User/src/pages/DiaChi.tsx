import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaChevronDown, FaEye } from "react-icons/fa";
import Select from "react-select";

// Định nghĩa kiểu dữ liệu
interface ApiProvince { provinceID: number; provinceName: string; }
interface ApiDistrict { districtID: number; districtName: string; }
interface ApiWard { wardCode: string; wardName: string; }
interface DiaChi {
  maDiaChi: number;
  maNguoiDung: string;
  hoTen: string;
  sdt: string;
  moTa: string;
  diaChi: string;
  phuongXa: string;
  quanHuyen: string;
  tinh: string;
  trangThai: number;
}
interface User {
  maNguoiDung: string;
  hoTen: string;
  ngaySinh: string | null;
  sdt: string | null;
  cccd: string | null;
  email: string;
}
interface Province { ProvinceID: number; ProvinceName: string; }
interface District { DistrictID: number; DistrictName: string; }
interface Ward { WardCode: string; WardName: string; }
interface FormErrors {
  hoTen?: string;
  sdt?: string;
  tinh?: string;
  quanHuyen?: string;
  phuongXa?: string;
  diaChi?: string;
}
type Mode = "add" | "edit" | "view";

// Component AddressForm
const AddressForm = ({
  mode,
  diaChi,
  onSubmit,
  onCancel,
  provinces,
  districts,
  wards,
  selectedProvince,
  setSelectedProvince,
  selectedDistrict,
  setSelectedDistrict,
  selectedWard,
  setSelectedWard,
  isLoadingProvinces,
  isLoadingDistricts,
  isLoadingWards,
  formErrors,
}: {
  mode: Mode;
  diaChi: Partial<DiaChi>;
  onSubmit: (formData: Partial<DiaChi>) => void;
  onCancel: () => void;
  provinces: Province[];
  districts: District[];
  wards: Ward[];
  selectedProvince: Province | null;
  setSelectedProvince: (province: Province | null) => void;
  selectedDistrict: District | null;
  setSelectedDistrict: (district: District | null) => void;
  selectedWard: Ward | null;
  setSelectedWard: (ward: Ward | null) => void;
  isLoadingProvinces: boolean;
  isLoadingDistricts: boolean;
  isLoadingWards: boolean;
  formErrors: FormErrors;
}) => {
  const isViewMode = mode === "view";
  const [formData, setFormData] = useState<Partial<DiaChi>>(diaChi);

  useEffect(() => {
    setFormData(diaChi);
  }, [diaChi]);

  const handleChange = (field: keyof DiaChi, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="hoTen" className="font-semibold text-black">Họ tên</Label>
            <Input
              id="hoTen"
              value={formData.hoTen || ""}
              onChange={(e) => handleChange("hoTen", e.target.value)}
              disabled={isViewMode}
              className={`border-gray-200 rounded-md text-black ${formErrors.hoTen ? "border-red-500" : ""}`}
            />
            {formErrors.hoTen && <p className="text-red-500 text-sm mt-1">{formErrors.hoTen}</p>}
          </div>
          <div>
            <Label htmlFor="sdt" className="font-semibold text-black">Số điện thoại</Label>
            <Input
              id="sdt"
              value={formData.sdt || ""}
              onChange={(e) => handleChange("sdt", e.target.value)}
              disabled={isViewMode}
              className={`border-gray-200 rounded-md text-black ${formErrors.sdt ? "border-red-500" : ""}`}
            />
            {formErrors.sdt && <p className="text-red-500 text-sm mt-1">{formErrors.sdt}</p>}
          </div>
          <div>
            <Label htmlFor="moTa" className="font-semibold text-black">Mô tả</Label>
            <textarea
              id="moTa"
              value={formData.moTa || ""}
              onChange={(e) => handleChange("moTa", e.target.value)}
              disabled={isViewMode}
              className="w-full p-2 border border-gray-200 rounded-md text-black"
              rows={4}
            />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="tinh" className="font-semibold text-black">Tỉnh/Thành phố</Label>
            <Select
              options={provinces}
              getOptionLabel={(option: Province) => option.ProvinceName}
              getOptionValue={(option: Province) => option.ProvinceID.toString()}
              value={selectedProvince}
              onChange={(option) => setSelectedProvince(option as Province | null)}
              placeholder={isLoadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành phố"}
              isDisabled={isLoadingProvinces || isViewMode}
              isSearchable
              isClearable
              className={`border-gray-200 rounded-md text-black ${formErrors.tinh ? "border-red-500" : ""}`}
              styles={{
                control: (base) => ({
                  ...base,
                  color: 'black',
                }),
                singleValue: (base) => ({
                  ...base,
                  color: 'black',
                }),
                placeholder: (base) => ({
                  ...base,
                  color: 'black',
                }),
              }}
            />
            {formErrors.tinh && <p className="text-red-500 text-sm mt-1">{formErrors.tinh}</p>}
          </div>
          <div>
            <Label htmlFor="quanHuyen" className="font-semibold text-black">Quận/Huyện</Label>
            <Select
              options={districts}
              getOptionLabel={(option: District) => option.DistrictName}
              getOptionValue={(option: District) => option.DistrictID.toString()}
              value={selectedDistrict}
              onChange={(option) => setSelectedDistrict(option as District | null)}
              placeholder={isLoadingDistricts ? "Đang tải..." : "Chọn quận/huyện"}
              isDisabled={!selectedProvince || isLoadingDistricts || isViewMode}
              isSearchable
              isClearable
              className={`border-gray-200 rounded-md text-black ${formErrors.quanHuyen ? "border-red-500" : ""}`}
              styles={{
                control: (base) => ({
                  ...base,
                  color: 'black',
                }),
                singleValue: (base) => ({
                  ...base,
                  color: 'black',
                }),
                placeholder: (base) => ({
                  ...base,
                  color: 'black',
                }),
              }}
            />
            {formErrors.quanHuyen && <p className="text-red-500 text-sm mt-1">{formErrors.quanHuyen}</p>}
          </div>
          <div>
            <Label htmlFor="phuongXa" className="font-semibold text-black">Phường/Xã</Label>
            <Select
              options={wards}
              getOptionLabel={(option: Ward) => option.WardName}
              getOptionValue={(option: Ward) => option.WardCode}
              value={selectedWard}
              onChange={(option) => setSelectedWard(option as Ward | null)}
              placeholder={isLoadingWards ? "Đang tải..." : "Chọn phường/xã"}
              isDisabled={!selectedDistrict || isLoadingWards || isViewMode}
              isSearchable
              isClearable
              className={`border-gray-200 rounded-md text-black ${formErrors.phuongXa ? "border-red-500" : ""}`}
              styles={{
                control: (base) => ({
                  ...base,
                  color: 'black',
                }),
                singleValue: (base) => ({
                  ...base,
                  color: 'black',
                }),
                placeholder: (base) => ({
                  ...base,
                  color: 'black',
                }),
              }}
            />
            {formErrors.phuongXa && <p className="text-red-500 text-sm mt-1">{formErrors.phuongXa}</p>}
          </div>
          <div>
            <Label htmlFor="diaChi" className="font-semibold text-black">Địa chỉ chi tiết</Label>
            <Input
              id="diaChi"
              value={formData.diaChi || ""}
              onChange={(e) => handleChange("diaChi", e.target.value)}
              disabled={isViewMode}
              className={`border-gray-200 rounded-md text-black ${formErrors.diaChi ? "border-red-500" : ""}`}
            />
            {formErrors.diaChi && <p className="text-red-500 text-sm mt-1">{formErrors.diaChi}</p>}
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex items-center">
          <FaTimes className="mr-2" /> {isViewMode ? "Đóng" : "Hủy"}
        </Button>
        {!isViewMode && (
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white flex items-center">
            <FaCheck className="mr-2" /> {mode === "add" ? "Thêm" : "Cập nhật"}
          </Button>
        )}
      </div>
    </form>
  );
};

// Component chính
const DiaChi = () => {
  const [diaChiList, setDiaChiList] = useState<DiaChi[]>([]);
  const [newDiaChi, setNewDiaChi] = useState<Partial<DiaChi>>({ trangThai: 1 });
  const [editingDiaChi, setEditingDiaChi] = useState<DiaChi | null>(null);
  const [viewingDiaChi, setViewingDiaChi] = useState<DiaChi | null>(null);
  const [maNguoiDung, setMaNguoiDung] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [deleteMaDiaChi, setDeleteMaDiaChi] = useState<number | null>(null);
  const [pendingSelectMaDiaChi, setPendingSelectMaDiaChi] = useState<number | null>(null);
  const [showInactiveAddresses, setShowInactiveAddresses] = useState(false);
  const [formMode, setFormMode] = useState<Mode>("add");

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const { toast } = useToast();
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchProvinces = async () => {
      setIsLoadingProvinces(true);
      try {
        const response = await fetch("http://localhost:5261/api/GHN/provinces", { headers: getAuthHeaders() });
        if (!response.ok) throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
        const data: ApiProvince[] = await response.json();
        const transformedProvinces: Province[] = data.map((item) => ({
          ProvinceID: item.provinceID,
          ProvinceName: item.provinceName,
        }));
        setProvinces(transformedProvinces);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách tỉnh/thành phố:", error);
        toast({ title: "Lỗi", description: "Không thể lấy danh sách tỉnh/thành phố", variant: "destructive" });
      } finally {
        setIsLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, [toast]);

  useEffect(() => {
    if (selectedProvince?.ProvinceID) {
      const fetchDistricts = async () => {
        setIsLoadingDistricts(true);
        try {
          const response = await fetch(`http://localhost:5261/api/GHN/districts/${selectedProvince.ProvinceID}`, { headers: getAuthHeaders() });
          if (!response.ok) throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
          const data: ApiDistrict[] = await response.json();
          const transformedDistricts: District[] = data.map((item) => ({
            DistrictID: item.districtID,
            DistrictName: item.districtName,
          }));
          setDistricts(transformedDistricts);
          setWards([]);
          setSelectedDistrict(null);
          setSelectedWard(null);
        } catch (error) {
          console.error("Lỗi khi lấy danh sách quận/huyện:", error);
          toast({ title: "Lỗi", description: "Không thể lấy danh sách quận/huyện", variant: "destructive" });
        } finally {
          setIsLoadingDistricts(false);
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
      setWards([]);
      setSelectedDistrict(null);
      setSelectedWard(null);
    }
  }, [selectedProvince, toast]);

  useEffect(() => {
    if (selectedDistrict?.DistrictID) {
      const fetchWards = async () => {
        setIsLoadingWards(true);
        try {
          const response = await fetch(`http://localhost:5261/api/GHN/wards/${selectedDistrict.DistrictID}`, { headers: getAuthHeaders() });
          if (!response.ok) throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
          const data: ApiWard[] = await response.json();
          const transformedWards: Ward[] = data.map((item) => ({
            WardCode: item.wardCode,
            WardName: item.wardName,
          }));
          setWards(transformedWards);
          setSelectedWard(null);
        } catch (error) {
          console.error("Lỗi khi lấy danh sách phường/xã:", error);
          toast({ title: "Lỗi", description: "Không thể lấy danh sách phường/xã", variant: "destructive" });
        } finally {
          setIsLoadingWards(false);
        }
      };
      fetchWards();
    } else {
      setWards([]);
      setSelectedWard(null);
    }
  }, [selectedDistrict, toast]);

  const fetchDiaChiList = useCallback(async () => {
    if (!maNguoiDung) return;
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5261/api/DanhSachDiaChi/maNguoiDung/${maNguoiDung}`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
      const data: DiaChi[] = await response.json();
      const sortedData = data.sort((a, b) => b.trangThai - a.trangThai);
      setDiaChiList(sortedData);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách địa chỉ:", error);
      toast({ title: "Lỗi", description: "Không thể lấy danh sách địa chỉ", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [maNguoiDung, toast]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser: User = JSON.parse(userData);
        setMaNguoiDung(parsedUser.maNguoiDung);
      } catch (error) {
        console.error("Lỗi khi phân tích dữ liệu người dùng:", error);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (maNguoiDung) fetchDiaChiList();
  }, [maNguoiDung, fetchDiaChiList]);

  useEffect(() => {
    if ((formMode === "edit" || formMode === "view") && (editingDiaChi || viewingDiaChi)) {
      const diaChi = formMode === "edit" ? editingDiaChi : viewingDiaChi;
      if (diaChi && provinces.length > 0) {
        // Tìm tỉnh/thành phố
        const province = provinces.find((p) => p.ProvinceName.trim().toLowerCase() === diaChi.tinh?.trim().toLowerCase());
        setSelectedProvince(province || null);

        if (province) {
          const fetchDistrictsForEdit = async () => {
            setIsLoadingDistricts(true);
            try {
              const response = await fetch(`http://localhost:5261/api/GHN/districts/${province.ProvinceID}`, { headers: getAuthHeaders() });
              if (!response.ok) throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
              const data: ApiDistrict[] = await response.json();
              const transformedDistricts: District[] = data.map((item) => ({
                DistrictID: item.districtID,
                DistrictName: item.districtName,
              }));
              setDistricts(transformedDistricts);
              const district = transformedDistricts.find((d) => d.DistrictName.trim().toLowerCase() === diaChi.quanHuyen?.trim().toLowerCase());
              setSelectedDistrict(district || null);

              if (district) {
                setIsLoadingWards(true);
                try {
                  const responseWards = await fetch(`http://localhost:5261/api/GHN/wards/${district.DistrictID}`, { headers: getAuthHeaders() });
                  if (!responseWards.ok) throw new Error(`Lỗi HTTP! Trạng thái: ${responseWards.status}`);
                  const wardsData: ApiWard[] = await responseWards.json();
                  const transformedWards: Ward[] = wardsData.map((item) => ({
                    WardCode: item.wardCode,
                    WardName: item.wardName,
                  }));
                  setWards(transformedWards);
                  const ward = transformedWards.find((w) => w.WardName.trim().toLowerCase() === diaChi.phuongXa?.trim().toLowerCase());
                  setSelectedWard(ward || null);

                  // Debug để kiểm tra
                  if (!ward) {
                    console.log("Không tìm thấy phường/xã:", diaChi.phuongXa);
                    console.log("Danh sách phường/xã từ API:", transformedWards.map((w) => w.WardName));
                  } else {
                    console.log("Đã tìm thấy phường/xã:", ward.WardName);
                  }
                } catch (error) {
                  console.error("Lỗi khi lấy phường/xã:", error);
                  toast({ title: "Lỗi", description: "Không thể lấy danh sách phường/xã", variant: "destructive" });
                } finally {
                  setIsLoadingWards(false);
                }
              }
            } catch (error) {
              console.error("Lỗi khi lấy quận/huyện:", error);
              toast({ title: "Lỗi", description: "Không thể lấy danh sách quận/huyện", variant: "destructive" });
            } finally {
              setIsLoadingDistricts(false);
            }
          };
          fetchDistrictsForEdit();
        } else {
          console.log("Không tìm thấy tỉnh/thành phố:", diaChi.tinh);
          console.log("Danh sách tỉnh/thành phố từ API:", provinces.map((p) => p.ProvinceName));
        }
      }
    } else {
      setSelectedProvince(null);
      setSelectedDistrict(null);
      setSelectedWard(null);
      setDistricts([]);
      setWards([]);
    }
  }, [formMode, editingDiaChi, viewingDiaChi, provinces, toast]);

  const validateForm = (formData: Partial<DiaChi>): FormErrors => {
    const errors: FormErrors = {};
    if (!formData.hoTen || formData.hoTen.length < 5) errors.hoTen = "Họ tên phải có ít nhất 5 ký tự";
    if (!formData.sdt) errors.sdt = "Số điện thoại là bắt buộc";
    else if (!/^\d{10}$/.test(formData.sdt)) errors.sdt = "Số điện thoại phải có đúng 10 chữ số";
    if (!formData.tinh) errors.tinh = "Tỉnh/Thành phố là bắt buộc";
    if (!formData.quanHuyen) errors.quanHuyen = "Quận/Huyện là bắt buộc";
    if (!formData.phuongXa) errors.phuongXa = "Phường/Xã là bắt buộc";
    if (!formData.diaChi) errors.diaChi = "Địa chỉ chi tiết là bắt buộc";
    return errors;
  };

  const handleFormSubmit = async (formData: Partial<DiaChi>) => {
    const provinceName = selectedProvince?.ProvinceName || formData.tinh || "";
    const districtName = selectedDistrict?.DistrictName || formData.quanHuyen || "";
    const wardName = selectedWard?.WardName || formData.phuongXa || "";
    const fullFormData = { ...formData, tinh: provinceName, quanHuyen: districtName, phuongXa: wardName };
    const errors = validateForm(fullFormData);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast({ title: "Lỗi", description: "Vui lòng điền đầy đủ thông tin", variant: "destructive" });
      return;
    }

    if (formMode === "add") {
      if (diaChiList.length >= 5) {
        toast({ title: "Lỗi", description: "Bạn chỉ có thể có tối đa 5 địa chỉ.", variant: "destructive" });
        return;
      }

      try {
        const response = await fetch("http://localhost:5261/api/DanhSachDiaChi", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ ...fullFormData, maNguoiDung, trangThai: 1 }),
        });
        if (!response.ok) throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
        await response.json();
        toast({ title: "Thành công", description: "Đã thêm địa chỉ mới" });
        await fetchDiaChiList();
      } catch (error) {
        console.error("Lỗi khi thêm địa chỉ:", error);
        toast({ title: "Lỗi", description: "Không thể thêm địa chỉ", variant: "destructive" });
      }
    } else if (formMode === "edit" && editingDiaChi) {
      try {
        const response = await fetch(`http://localhost:5261/api/DanhSachDiaChi/${editingDiaChi.maDiaChi}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ ...fullFormData, maDiaChi: editingDiaChi.maDiaChi, maNguoiDung, trangThai: editingDiaChi.trangThai }),
        });
        if (!response.ok) throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
        await response.json();
        toast({ title: "Thành công", description: "Đã cập nhật địa chỉ" });
        await fetchDiaChiList();
      } catch (error) {
        console.error("Lỗi khi cập nhật địa chỉ:", error);
        toast({ title: "Lỗi", description: "Không thể cập nhật địa chỉ", variant: "destructive" });
      }
    }
    setShowFormModal(false);
    setFormErrors({});
  };

  const handleDelete = (maDiaChi: number) => {
    setDeleteMaDiaChi(maDiaChi);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteMaDiaChi === null) return;
    try {
      const response = await fetch(`http://localhost:5261/api/DanhSachDiaChi/${deleteMaDiaChi}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
      setDiaChiList(diaChiList.filter((dc) => dc.maDiaChi !== deleteMaDiaChi));
      toast({ title: "Thành công", description: "Đã xóa địa chỉ" });
    } catch (error) {
      console.error("Lỗi khi xóa địa chỉ:", error);
      toast({ title: "Lỗi", description: "Không thể xóa địa chỉ", variant: "destructive" });
    } finally {
      setShowDeleteModal(false);
      setDeleteMaDiaChi(null);
    }
  };

  const handleSelectDiaChi = (maDiaChi: number) => {
    setPendingSelectMaDiaChi(maDiaChi);
    setShowSelectModal(true);
  };

  const confirmSelectDiaChi = async () => {
    if (pendingSelectMaDiaChi === null) return;
    try {
      await Promise.all(
        diaChiList.map(async (dc) => {
          const newStatus = dc.maDiaChi === pendingSelectMaDiaChi ? 1 : 0;
          await fetch(`http://localhost:5261/api/DanhSachDiaChi/${dc.maDiaChi}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", ...getAuthHeaders() },
            body: JSON.stringify({ ...dc, trangThai: newStatus }),
          });
        })
      );
      toast({ title: "Thành công", description: "Đã chọn địa chỉ" });
      await fetchDiaChiList();
    } catch (error) {
      console.error("Lỗi khi chọn địa chỉ:", error);
      toast({ title: "Lỗi", description: "Không thể chọn địa chỉ", variant: "destructive" });
    } finally {
      setShowSelectModal(false);
      setPendingSelectMaDiaChi(null);
    }
  };

  const openAddForm = () => {
    setFormMode("add");
    setNewDiaChi({ trangThai: 1 });
    setEditingDiaChi(null);
    setViewingDiaChi(null);
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setFormErrors({});
    setShowFormModal(true);
  };

  const openEditForm = (diaChi: DiaChi) => {
    setFormMode("edit");
    setEditingDiaChi(diaChi);
    setViewingDiaChi(null);
    setShowFormModal(true);
  };

  const openViewForm = (diaChi: DiaChi) => {
    setFormMode("view");
    setViewingDiaChi(diaChi);
    setEditingDiaChi(null);
    setShowFormModal(true);
  };

  const activeAddress = diaChiList.find((dc) => dc.trangThai === 1);
  const inactiveAddresses = diaChiList.filter((dc) => dc.trangThai === 0);

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>{/* Có thể thêm nội dung khác ở đây */}</div>
        <div>
          <div className="flex justify-between items-center mb-4">
            <h1
              className="text-2xl font-bold mb-4 flex items-center space-x-2 border border-gray-300 rounded-md p-2 bg-white hover:bg-gray-100 cursor-pointer"
              onClick={() => setShowInactiveAddresses(!showInactiveAddresses)}
            >
              <span>Danh sách địa chỉ</span>
              <FaChevronDown className={`transition-transform duration-300 ${showInactiveAddresses ? "rotate-180" : ""}`} />
            </h1>
            <Button onClick={openAddForm} className="bg-purple-600 hover:bg-purple-700 text-white flex items-center">
              <FaPlus className="mr-2" /> Thêm Địa Chỉ Mới
            </Button>
          </div>
          {isLoading ? (
            <p>Đang tải danh sách địa chỉ...</p>
          ) : diaChiList.length === 0 ? (
            <p>Không có địa chỉ nào để hiển thị.</p>
          ) : (
            <div className="space-y-4">
              {activeAddress && (
                <div className="border p-4 rounded-lg bg-white shadow-sm border-purple-600 flex justify-between items-start">
                  <div>
                    <p><strong className="font-semibold">Họ tên:</strong> {activeAddress.hoTen}</p>
                    <p><strong className="font-semibold">Số điện thoại:</strong> {activeAddress.sdt}</p>
                    <p><strong className="font-semibold">Mô tả:</strong> {activeAddress.moTa}</p>
                    <p><strong className="font-semibold">Địa chỉ:</strong> {activeAddress.diaChi}, {activeAddress.phuongXa}, {activeAddress.quanHuyen}, {activeAddress.tinh}</p>
                    <p><strong className="font-semibold">Trạng thái:</strong> Hoạt động</p>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <input 
                      type="checkbox" 
                      checked={true} 
                      onChange={() => handleSelectDiaChi(activeAddress.maDiaChi)} 
                      className="h-5 w-5"
                    />
                    <Button 
                      onClick={() => openViewForm(activeAddress)} 
                      className="bg-blue-600 hover:bg-blue-700 text-white w-6 h-6 p-0"
                    >
                      <FaEye size={12} />
                    </Button>
                    <Button 
                      onClick={() => openEditForm(activeAddress)} 
                      className="bg-purple-600 hover:bg-purple-700 text-white w-6 h-6 p-0"
                    >
                      <FaEdit size={12} />
                    </Button>
                    <Button 
                      onClick={() => handleDelete(activeAddress.maDiaChi)} 
                      variant="destructive" 
                      className="w-6 h-6 p-0"
                    >
                      <FaTrash size={12} />
                    </Button>
                  </div>
                </div>
              )}
              {inactiveAddresses.length > 0 && (
                <div>
                  {showInactiveAddresses && (
                    <div className="mt-2 space-y-2">
                      {inactiveAddresses.map((dc) => (
                        <div key={dc.maDiaChi} className="border p-4 rounded-lg bg-white shadow-sm border-gray-200 flex justify-between items-start">
                          <div>
                            <p><strong className="font-semibold">Họ tên:</strong> {dc.hoTen}</p>
                            <p><strong className="font-semibold">Số điện thoại:</strong> {dc.sdt}</p>
                            <p><strong className="font-semibold">Mô tả:</strong> {dc.moTa}</p>
                            <p><strong className="font-semibold">Địa chỉ:</strong> {dc.diaChi}, {dc.phuongXa}, {dc.quanHuyen}, {dc.tinh}</p>
                            <p><strong className="font-semibold">Trạng thái:</strong> Không hoạt động</p>
                          </div>
                          <div className="flex flex-col items-center space-y-2">
                            <input 
                              type="checkbox" 
                              checked={false} 
                              onChange={() => handleSelectDiaChi(dc.maDiaChi)} 
                              className="h-5 w-5"
                            />
                            <Button 
                              onClick={() => openViewForm(dc)} 
                              className="bg-blue-600 hover:bg-blue-700 text-white w-6 h-6 p-0"
                            >
                              <FaEye size={12} />
                            </Button>
                            <Button 
                              onClick={() => openEditForm(dc)} 
                              className="bg-purple-600 hover:bg-purple-700 text-white w-6 h-6 p-0"
                            >
                              <FaEdit size={12} />
                            </Button>
                            <Button 
                              onClick={() => handleDelete(dc.maDiaChi)} 
                              variant="destructive" 
                              className="w-6 h-6 p-0"
                            >
                              <FaTrash size={12} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Separator className="my-4" />
      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {formMode === "add" ? "Thêm địa chỉ mới" : formMode === "edit" ? "Chỉnh sửa địa chỉ" : "Xem chi tiết địa chỉ"}
              </h2>
              <Button variant="ghost" onClick={() => setShowFormModal(false)}>✕</Button>
            </div>
            <AddressForm
              mode={formMode}
              diaChi={formMode === "add" ? newDiaChi : formMode === "edit" ? editingDiaChi! : viewingDiaChi!}
              onSubmit={handleFormSubmit}
              onCancel={() => setShowFormModal(false)}
              provinces={provinces}
              districts={districts}
              wards={wards}
              selectedProvince={selectedProvince}
              setSelectedProvince={setSelectedProvince}
              selectedDistrict={selectedDistrict}
              setSelectedDistrict={setSelectedDistrict}
              selectedWard={selectedWard}
              setSelectedWard={setSelectedWard}
              isLoadingProvinces={isLoadingProvinces}
              isLoadingDistricts={isLoadingDistricts}
              isLoadingWards={isLoadingWards}
              formErrors={formErrors}
            />
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Xác nhận xóa</h2>
            <p className="mb-4">Bạn có chắc chắn muốn xóa địa chỉ này?</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="flex items-center">
                <FaTimes className="mr-2" /> Hủy
              </Button>
              <Button variant="destructive" onClick={confirmDelete} className="flex items-center">
                <FaCheck className="mr-2" /> Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}
      {showSelectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Xác nhận chọn địa chỉ</h2>
            <p className="mb-4">Bạn có muốn đổi qua địa chỉ này không?</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowSelectModal(false)} className="flex items-center">
                <FaTimes className="mr-2" /> Hủy
              </Button>
              <Button onClick={confirmSelectDiaChi} className="bg-purple-600 hover:bg-purple-700 text-white flex items-center">
                <FaCheck className="mr-2" /> Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiaChi;