import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaChevronDown, FaEye } from "react-icons/fa";
import Select from "react-select";

// Types
type Province = { ProvinceID: number; ProvinceName: string };
type District = { DistrictID: number; DistrictName: string };
type Ward = { WardCode: string; WardName: string };
type User = { maNguoiDung: string; hoTen: string };
type DiaChi = { maDiaChi: number; maNguoiDung: string; hoTen: string; sdt: string; moTa: string; diaChi: string; phuongXa: string; quanHuyen: string; tinh: string; trangThai: number };
type FormErrors = Partial<Record<keyof DiaChi, string>>;

// Base Modal
const BaseModal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) =>
  isOpen ? (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <Button variant="ghost" onClick={onClose}>✕</Button>
        </div>
        {children}
      </div>
    </div>
  ) : null;

// Address Form
const AddressForm = ({ formData, onChange, onSubmit, onCancel, provinces, districts, wards, selectedProvince, setSelectedProvince, selectedDistrict, setSelectedDistrict, selectedWard, setSelectedWard, isLoadingProvinces, isLoadingDistricts, isLoadingWards, formErrors, isViewMode = false }: { formData: Partial<DiaChi>; onChange: (f: keyof DiaChi, v: string) => void; onSubmit: () => void; onCancel: () => void; provinces: Province[]; districts: District[]; wards: Ward[]; selectedProvince: Province | null; setSelectedProvince: (p: Province | null) => void; selectedDistrict: District | null; setSelectedDistrict: (d: District | null) => void; selectedWard: Ward | null; setSelectedWard: (w: Ward | null) => void; isLoadingProvinces: boolean; isLoadingDistricts: boolean; isLoadingWards: boolean; formErrors: FormErrors; isViewMode?: boolean }) => (
  <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <div>
          <Label htmlFor="hoTen">Họ tên</Label>
          {isViewMode ? <p>{formData.hoTen}</p> : <Input id="hoTen" value={formData.hoTen || ""} onChange={(e) => onChange("hoTen", e.target.value)} className={formErrors.hoTen ? "border-red-500" : ""} />}
          {formErrors.hoTen && <p className="text-red-500 text-sm">{formErrors.hoTen}</p>}
        </div>
        <div>
          <Label htmlFor="sdt">Số điện thoại</Label>
          {isViewMode ? <p>{formData.sdt}</p> : <Input id="sdt" value={formData.sdt || ""} onChange={(e) => onChange("sdt", e.target.value)} className={formErrors.sdt ? "border-red-500" : ""} />}
          {formErrors.sdt && <p className="text-red-500 text-sm">{formErrors.sdt}</p>}
        </div>
        <div>
          <Label htmlFor="moTa">Mô tả</Label>
          {isViewMode ? <p>{formData.moTa || "Không có"}</p> : <textarea id="moTa" value={formData.moTa || ""} onChange={(e) => onChange("moTa", e.target.value)} className="w-full p-2 border rounded-md" rows={4} />}
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <Label htmlFor="tinh">Tỉnh/Thành phố</Label>
          {isViewMode ? <p>{formData.tinh}</p> : <Select options={provinces} getOptionLabel={(p) => p.ProvinceName} getOptionValue={(p) => p.ProvinceID.toString()} value={selectedProvince} onChange={setSelectedProvince} placeholder={isLoadingProvinces ? "Đang tải..." : "Chọn tỉnh"} isDisabled={isLoadingProvinces} isSearchable isClearable className={formErrors.tinh ? "border-red-500" : ""} />}
          {formErrors.tinh && <p className="text-red-500 text-sm">{formErrors.tinh}</p>}
        </div>
        <div>
          <Label htmlFor="quanHuyen">Quận/Huyện</Label>
          {isViewMode ? <p>{formData.quanHuyen}</p> : <Select options={districts} getOptionLabel={(d) => d.DistrictName} getOptionValue={(d) => d.DistrictID.toString()} value={selectedDistrict} onChange={setSelectedDistrict} placeholder={isLoadingDistricts ? "Đang tải..." : "Chọn quận/huyện"} isDisabled={!selectedProvince || isLoadingDistricts} isSearchable isClearable className={formErrors.quanHuyen ? "border-red-500" : ""} />}
          {formErrors.quanHuyen && <p className="text-red-500 text-sm">{formErrors.quanHuyen}</p>}
        </div>
        <div>
          <Label htmlFor="phuongXa">Phường/Xã</Label>
          {isViewMode ? <p>{formData.phuongXa}</p> : <Select options={wards} getOptionLabel={(w) => w.WardName} getOptionValue={(w) => w.WardCode} value={selectedWard} onChange={setSelectedWard} placeholder={isLoadingWards ? "Đang tải..." : "Chọn phường/xã"} isDisabled={!selectedDistrict || isLoadingWards} isSearchable isClearable className={formErrors.phuongXa ? "border-red-500" : ""} />}
          {formErrors.phuongXa && <p className="text-red-500 text-sm">{formErrors.phuongXa}</p>}
        </div>
        <div>
          <Label htmlFor="diaChi">Địa chỉ chi tiết</Label>
          {isViewMode ? <p>{formData.diaChi}</p> : <Input id="diaChi" value={formData.diaChi || ""} onChange={(e) => onChange("diaChi", e.target.value)} className={formErrors.diaChi ? "border-red-500" : ""} />}
          {formErrors.diaChi && <p className="text-red-500 text-sm">{formErrors.diaChi}</p>}
        </div>
      </div>
    </div>
    <div className="flex justify-end space-x-2">
      <Button variant="outline" onClick={onCancel}><FaTimes className="mr-2" /> {isViewMode ? "Đóng" : "Hủy"}</Button>
      {!isViewMode && <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white"><FaCheck className="mr-2" /> Lưu</Button>}
    </div>
  </form>
);

// Modals
const AddModal = ({ isOpen, onClose, onSubmit, ...props }: any) => {
  const [formData, setFormData] = useState<Partial<DiaChi>>({ trangThai: 1 });
  return <BaseModal isOpen={isOpen} onClose={onClose} title="Thêm địa chỉ"><AddressForm formData={formData} onChange={(f, v) => setFormData(p => ({ ...p, [f]: v }))} onSubmit={() => onSubmit(formData)} onCancel={onClose} {...props} /></BaseModal>;
};

const EditModal = ({ isOpen, onClose, onSubmit, diaChi, ...props }: any) => {
  const [formData, setFormData] = useState(diaChi);
  useEffect(() => setFormData(diaChi), [diaChi]);
  return <BaseModal isOpen={isOpen} onClose={onClose} title="Sửa địa chỉ"><AddressForm formData={formData} onChange={(f, v) => setFormData(p => ({ ...p, [f]: v }))} onSubmit={() => onSubmit(formData)} onCancel={onClose} {...props} /></BaseModal>;
};

const ViewModal = ({ isOpen, onClose, diaChi, ...props }: any) =>
  <BaseModal isOpen={isOpen} onClose={onClose} title="Xem địa chỉ"><AddressForm formData={diaChi} onChange={() => {}} onSubmit={() => {}} onCancel={onClose} isViewMode {...props} /></BaseModal>;

const DeleteModal = ({ isOpen, onClose, onConfirm }: any) => (
  <BaseModal isOpen={isOpen} onClose={onClose} title="Xác nhận xóa">
    <p className="mb-4">Bạn có chắc muốn xóa?</p>
    <div className="flex justify-end space-x-2">
      <Button variant="outline" onClick={onClose}><FaTimes className="mr-2" /> Hủy</Button>
      <Button variant="destructive" onClick={onConfirm}><FaCheck className="mr-2" /> Xóa</Button>
    </div>
  </BaseModal>
);

const SelectModal = ({ isOpen, onClose, onConfirm }: any) => (
  <BaseModal isOpen={isOpen} onClose={onClose} title="Xác nhận chọn">
    <p className="mb-4">Chọn địa chỉ này?</p>
    <div className="flex justify-end space-x-2">
      <Button variant="outline" onClick={onClose}><FaTimes className="mr-2" /> Hủy</Button>
      <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={onConfirm}><FaCheck className="mr-2" /> Chọn</Button>
    </div>
  </BaseModal>
);

// Main Component
const DiaChi = () => {
  const [diaChiList, setDiaChiList] = useState<DiaChi[]>([]);
  const [maNguoiDung, setMaNguoiDung] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState({ add: false, edit: false, view: false, delete: false, select: false });
  const [currentDiaChi, setCurrentDiaChi] = useState<DiaChi | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectId, setSelectId] = useState<number | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selected, setSelected] = useState<{ province: Province | null; district: District | null; ward: Ward | null }>({ province: null, district: null, ward: null });
  const [isLoadingLoc, setIsLoadingLoc] = useState({ provinces: false, districts: false, wards: false });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const { toast } = useToast();
  const navigate = useNavigate();

  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token") || ""}`, "Content-Type": "application/json" });

  const fetchData = async <T,>(url: string, method = "GET", body?: any): Promise<T | void> => {
    const res = await fetch(url, {
      method,
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP error ${res.status}: ${errorText || "Unknown error"}`);
    }
    // Nếu là DELETE (204 No Content), không cần parse JSON
    if (res.status === 204) return;
    return res.json();
  };

  const fetchProvinces = async () => {
    setIsLoadingLoc(p => ({ ...p, provinces: true }));
    try {
      setProvinces((await fetchData<any[]>("http://localhost:5261/api/GHN/provinces") || []).map(d => ({ ProvinceID: d.provinceID, ProvinceName: d.provinceName })));
    } catch {
      toast({ title: "Lỗi", description: "Tải tỉnh/thành phố thất bại", variant: "destructive" });
    } finally {
      setIsLoadingLoc(p => ({ ...p, provinces: false }));
    }
  };

  const fetchDistricts = async (id: number) => {
    setIsLoadingLoc(p => ({ ...p, districts: true }));
    try {
      setDistricts((await fetchData<any[]>(`http://localhost:5261/api/GHN/districts/${id}`) || []).map(d => ({ DistrictID: d.districtID, DistrictName: d.districtName })));
      setWards([]);
      setSelected(s => ({ ...s, district: null, ward: null }));
    } catch {
      toast({ title: "Lỗi", description: "Tải quận/huyện thất bại", variant: "destructive" });
    } finally {
      setIsLoadingLoc(p => ({ ...p, districts: false }));
    }
  };

  const fetchWards = async (id: number) => {
    setIsLoadingLoc(p => ({ ...p, wards: true }));
    try {
      setWards((await fetchData<any[]>(`http://localhost:5261/api/GHN/wards/${id}`) || []).map(d => ({ WardCode: d.wardCode, WardName: d.wardName })));
      setSelected(s => ({ ...s, ward: null }));
    } catch {
      toast({ title: "Lỗi", description: "Tải phường/xã thất bại", variant: "destructive" });
    } finally {
      setIsLoadingLoc(p => ({ ...p, wards: false }));
    }
  };

  const fetchDiaChiList = useCallback(async () => {
    if (!maNguoiDung) return;
    setIsLoading(true);
    try {
      setDiaChiList((await fetchData<DiaChi[]>(`http://localhost:5261/api/DanhSachDiaChi/maNguoiDung/${maNguoiDung}`) || []).sort((a, b) => b.trangThai - a.trangThai));
    } catch {
      toast({ title: "Lỗi", description: "Tải địa chỉ thất bại", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [maNguoiDung]);

  useEffect(() => { fetchProvinces(); }, []);
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setMaNguoiDung(JSON.parse(user).maNguoiDung);
    else navigate("/login");
  }, [navigate]);
  useEffect(() => { if (maNguoiDung) fetchDiaChiList(); }, [maNguoiDung, fetchDiaChiList]);
  useEffect(() => { if (selected.province && (showModal.add || showModal.edit)) fetchDistricts(selected.province.ProvinceID); }, [selected.province, showModal.add, showModal.edit]);
  useEffect(() => { if (selected.district && (showModal.add || showModal.edit)) fetchWards(selected.district.DistrictID); }, [selected.district, showModal.add, showModal.edit]);

  const validateForm = (data: Partial<DiaChi>): FormErrors => ({
    ...(data.hoTen && data.hoTen.length >= 5 ? {} : { hoTen: "Tên cần ≥ 5 ký tự" }),
    ...(data.sdt && /^\d{10}$/.test(data.sdt) ? {} : { sdt: "SĐT phải 10 số" }),
    ...(data.tinh ? {} : { tinh: "Chọn tỉnh" }),
    ...(data.quanHuyen ? {} : { quanHuyen: "Chọn quận/huyện" }),
    ...(data.phuongXa ? {} : { phuongXa: "Chọn phường/xã" }),
    ...(data.diaChi ? {} : { diaChi: "Nhập địa chỉ" }),
  });

  const handleAdd = async (data: Partial<DiaChi>) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}") as User;
    const fullData = { ...data, maNguoiDung: user.maNguoiDung, tinh: selected.province?.ProvinceName || "", quanHuyen: selected.district?.DistrictName || "", phuongXa: selected.ward?.WardName || "", trangThai: 1 };
    const errors = validateForm(fullData);
    if (Object.keys(errors).length) return setFormErrors(errors);
    if (diaChiList.length >= 5) return toast({ title: "Lỗi", description: "Tối đa 5 địa chỉ", variant: "destructive" });
    try {
      await fetchData("http://localhost:5261/api/DanhSachDiaChi", "POST", fullData);
      fetchDiaChiList();
      setShowModal(p => ({ ...p, add: false }));
      setFormErrors({});
      setSelected({ province: null, district: null, ward: null });
      toast({ title: "Thành công", description: "Đã thêm địa chỉ" });
    } catch (error) {
      toast({ title: "Lỗi", description: `Thêm thất bại: ${error.message}`, variant: "destructive" });
    }
  };

  const handleEdit = async (data: Partial<DiaChi>) => {
    if (!currentDiaChi) return;
    const fullData = { ...data, maDiaChi: currentDiaChi.maDiaChi, maNguoiDung: currentDiaChi.maNguoiDung, tinh: selected.province?.ProvinceName || currentDiaChi.tinh, quanHuyen: selected.district?.DistrictName || currentDiaChi.quanHuyen, phuongXa: selected.ward?.WardName || currentDiaChi.phuongXa, trangThai: currentDiaChi.trangThai };
    const errors = validateForm(fullData);
    if (Object.keys(errors).length) return setFormErrors(errors);
    try {
      await fetchData(`http://localhost:5261/api/DanhSachDiaChi/${currentDiaChi.maDiaChi}`, "PUT", fullData);
      fetchDiaChiList();
      setShowModal(p => ({ ...p, edit: false }));
      setFormErrors({});
      setSelected({ province: null, district: null, ward: null });
      toast({ title: "Thành công", description: "Đã sửa địa chỉ" });
    } catch (error) {
      toast({ title: "Lỗi", description: `Sửa thất bại: ${error.message}`, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetchData(`http://localhost:5261/api/DanhSachDiaChi/${deleteId}`, "DELETE");
      setDiaChiList(diaChiList.filter(d => d.maDiaChi !== deleteId));
      setShowModal(p => ({ ...p, delete: false }));
      setDeleteId(null);
      toast({ title: "Thành công", description: "Đã xóa địa chỉ" });
      fetchDiaChiList(); // Đảm bảo đồng bộ dữ liệu từ server
    } catch (error) {
      toast({ title: "Lỗi", description: `Xóa thất bại: ${error.message}`, variant: "destructive" });
    }
  };

  const handleSelect = async () => {
    if (!selectId) return;
    try {
      await Promise.all(diaChiList.map(d => fetchData(`http://localhost:5261/api/DanhSachDiaChi/${d.maDiaChi}`, "PUT", { ...d, trangThai: d.maDiaChi === selectId ? 1 : 0 })));
      fetchDiaChiList();
      setShowModal(p => ({ ...p, select: false }));
      setSelectId(null);
      toast({ title: "Thành công", description: "Đã chọn địa chỉ" });
    } catch (error) {
      toast({ title: "Lỗi", description: `Chọn thất bại: ${error.message}`, variant: "destructive" });
    }
  };

  const renderAddressCard = (dc: DiaChi) => (
    <div className={`border p-4 rounded-lg bg-white shadow-sm ${dc.trangThai === 1 ? "border-purple-600" : "border-gray-200"} flex justify-between`}>
      <div>
        <p><strong>Họ tên:</strong> {dc.hoTen}</p>
        <p><strong>SĐT:</strong> {dc.sdt}</p>
        <p><strong>Mô tả:</strong> {dc.moTa || "Không có"}</p>
        <p><strong>Địa chỉ:</strong> {dc.diaChi}, {dc.phuongXa}, {dc.quanHuyen}, {dc.tinh}</p>
        <p><strong>Trạng thái:</strong> {dc.trangThai === 1 ? "Hoạt động" : "Không hoạt động"}</p>
      </div>
      <div className="flex flex-col items-center space-y-2">
        <input type="checkbox" checked={dc.trangThai === 1} onChange={() => { setSelectId(dc.maDiaChi); setShowModal(p => ({ ...p, select: true })); }} className="h-5 w-5" />
        <Button onClick={() => { setCurrentDiaChi(dc); setShowModal(p => ({ ...p, view: true })); }} className="bg-blue-600 hover:bg-blue-700 text-white w-6 h-6 p-0"><FaEye size={12} /></Button>
        <Button onClick={() => { setCurrentDiaChi(dc); setSelected({ province: provinces.find(p => p.ProvinceName === dc.tinh) || null, district: districts.find(d => d.DistrictName === dc.quanHuyen) || null, ward: wards.find(w => w.WardName === dc.phuongXa) || null }); setShowModal(p => ({ ...p, edit: true })); }} className="bg-purple-600 hover:bg-purple-700 text-white w-6 h-6 p-0"><FaEdit size={12} /></Button>
        <Button onClick={() => { setDeleteId(dc.maDiaChi); setShowModal(p => ({ ...p, delete: true })); }} variant="destructive" className="w-6 h-6 p-0"><FaTrash size={12} /></Button>
      </div>
    </div>
  );

  const activeAddress = diaChiList.find(d => d.trangThai === 1);
  const inactiveAddresses = diaChiList.filter(d => d.trangThai === 0);

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>{/* Placeholder */}</div>
        <div>
          <div className="flex justify-between mb-4">
            <h1 className="text-2xl font-bold flex items-center space-x-2 border rounded-md p-2 bg-white hover:bg-gray-100 cursor-pointer" onClick={() => setShowInactive(!showInactive)}>
              <span>Danh sách địa chỉ</span>
              <FaChevronDown className={`transition-transform duration-300 ${showInactive ? "rotate-180" : ""}`} />
            </h1>
            <Button onClick={() => setShowModal(p => ({ ...p, add: true }))} className="bg-purple-600 hover:bg-purple-700 text-white"><FaPlus className="mr-2" /> Thêm</Button>
          </div>
          {isLoading ? <p>Đang tải...</p> : diaChiList.length === 0 ? <p>Chưa có địa chỉ</p> : (
            <div className="space-y-4">
              {activeAddress && renderAddressCard(activeAddress)}
              {showInactive && inactiveAddresses.map(dc => <div key={dc.maDiaChi}>{renderAddressCard(dc)}</div>)}
            </div>
          )}
        </div>
      </div>
      <Separator className="my-4" />
      <AddModal isOpen={showModal.add} onClose={() => setShowModal(p => ({ ...p, add: false }))} onSubmit={handleAdd} provinces={provinces} districts={districts} wards={wards} selectedProvince={selected.province} setSelectedProvince={(p) => setSelected(s => ({ ...s, province: p }))} selectedDistrict={selected.district} setSelectedDistrict={(d) => setSelected(s => ({ ...s, district: d }))} selectedWard={selected.ward} setSelectedWard={(w) => setSelected(s => ({ ...s, ward: w }))} isLoadingProvinces={isLoadingLoc.provinces} isLoadingDistricts={isLoadingLoc.districts} isLoadingWards={isLoadingLoc.wards} formErrors={formErrors} />
      {currentDiaChi && <EditModal isOpen={showModal.edit} onClose={() => setShowModal(p => ({ ...p, edit: false }))} onSubmit={handleEdit} diaChi={currentDiaChi} provinces={provinces} districts={districts} wards={wards} selectedProvince={selected.province} setSelectedProvince={(p) => setSelected(s => ({ ...s, province: p }))} selectedDistrict={selected.district} setSelectedDistrict={(d) => setSelected(s => ({ ...s, district: d }))} selectedWard={selected.ward} setSelectedWard={(w) => setSelected(s => ({ ...s, ward: w }))} isLoadingProvinces={isLoadingLoc.provinces} isLoadingDistricts={isLoadingLoc.districts} isLoadingWards={isLoadingLoc.wards} formErrors={formErrors} />}
      {currentDiaChi && <ViewModal isOpen={showModal.view} onClose={() => setShowModal(p => ({ ...p, view: false }))} diaChi={currentDiaChi} provinces={provinces} districts={districts} wards={wards} selectedProvince={selected.province} setSelectedProvince={(p) => setSelected(s => ({ ...s, province: p }))} selectedDistrict={selected.district} setSelectedDistrict={(d) => setSelected(s => ({ ...s, district: d }))} selectedWard={selected.ward} setSelectedWard={(w) => setSelected(s => ({ ...s, ward: w }))} isLoadingProvinces={isLoadingLoc.provinces} isLoadingDistricts={isLoadingLoc.districts} isLoadingWards={isLoadingLoc.wards} formErrors={formErrors} />}
      <DeleteModal isOpen={showModal.delete} onClose={() => setShowModal(p => ({ ...p, delete: false }))} onConfirm={handleDelete} />
      <SelectModal isOpen={showModal.select} onClose={() => setShowModal(p => ({ ...p, select: false }))} onConfirm={handleSelect} />
    </div>
  );
};

export default DiaChi;