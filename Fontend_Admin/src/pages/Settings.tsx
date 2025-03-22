import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { Save, User } from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("account");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    hoTen: "",
    email: "",
    sdt: "",
    diaChi: "",
    vaiTro: "", // Giữ vaiTro trong formData để gửi lên server nhưng không cho sửa
    ngaySinh: "",
    cccd: "",
    moTa: "",
    hinhAnhFile: null,
  });

  const maNguoiDung = localStorage.getItem("maNguoiDung");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5261/api/NguoiDung/${maNguoiDung}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          setFormData({
            hoTen: data.hoTen || "",
            email: data.email || "",
            sdt: data.sdt || "",
            diaChi: data.diaChi || "",
            vaiTro: data.vaiTro?.toString() || "0", // Chuyển thành string
            ngaySinh: data.ngaySinh
              ? new Date(data.ngaySinh).toISOString().split("T")[0]
              : "",
            cccd: data.cccd || "",
            moTa: data.moTa || "",
            hinhAnhFile: null,
          });
        } else {
          toast.error("Không thể tải thông tin người dùng");
        }
      } catch (error) {
        toast.error("Lỗi kết nối đến server");
      } finally {
        setLoading(false);
      }
    };

    if (maNguoiDung && token) {
      fetchUserData();
    } else {
      toast.error("Vui lòng đăng nhập để tiếp tục");
      setLoading(false);
    }
  }, [maNguoiDung, token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, hinhAnhFile: file }));
      toast.success("Đã chọn ảnh mới, nhấn Save để cập nhật!");
    }
  };

  const saveSettings = async () => {
    const payload = new FormData();
    payload.append("MaNguoiDung", maNguoiDung);
    payload.append("HoTen", formData.hoTen || "");
    payload.append("Email", formData.email || "");
    payload.append("Sdt", formData.sdt || "");
    payload.append("DiaChi", formData.diaChi || "");
    payload.append("VaiTro", formData.vaiTro || ""); // Đảm bảo là string
    payload.append(
      "NgaySinh",
      formData.ngaySinh ? new Date(formData.ngaySinh).toISOString() : ""
    );
    payload.append("Cccd", formData.cccd || "");
    payload.append("MoTa", formData.moTa || "");
    payload.append("TaiKhoan", userData?.taiKhoan || "");
    payload.append("TrangThai", userData?.trangThai || "");
    payload.append("NgayTao", userData?.ngayTao || "");

    if (formData.hinhAnhFile) {
      payload.append("HinhAnhFile", formData.hinhAnhFile);
    }

    try {
      const response = await fetch(
        `http://localhost:5261/api/XacThuc/chitiet/${maNguoiDung}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: payload,
        }
      );

      if (response.ok) {
        const result = await response.json();
        setUserData(result.user);
        setFormData((prev) => ({ ...prev, hinhAnhFile: null }));
        toast.success("Cập nhật thành công", {
          description: result.message || "Thông tin của bạn đã được cập nhật",
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      toast.error("Lỗi kết nối đến server");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple"></div>
      </div>
    );
  }

  // Hàm ánh xạ vaiTro thành tên vai trò để hiển thị
  const getRoleName = (vaiTro) => {
    switch (vaiTro) {
      case "0":
        return "User";
      case "1":
        return "Admin";
      case "2":
        return "Staff";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/70 p-1">
          <TabsTrigger value="account" className="data-[state=active]:bg-white">
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Update your personal account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center space-y-3">
                  <div className="h-24 w-24 rounded-full bg-purple-light flex items-center justify-center">
                    {userData?.hinhAnh ? (
                      <img
                        src={`data:image/jpeg;base64,${btoa(
                          String.fromCharCode(...new Uint8Array(userData.hinhAnh))
                        )}`}
                        alt="Avatar"
                        className="h-24 w-24 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-purple" />
                    )}
                  </div>
                  <label>
                    <Button variant="outline" size="sm">
                      Change Avatar
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="hoTen" className="text-sm font-medium">
                      Full Name
                    </label>
                    <Input
                      id="hoTen"
                      name="hoTen"
                      value={formData.hoTen}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="sdt" className="text-sm font-medium">
                      Phone Number
                    </label>
                    <Input
                      id="sdt"
                      name="sdt"
                      value={formData.sdt}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="diaChi" className="text-sm font-medium">
                      Address
                    </label>
                    <Input
                      id="diaChi"
                      name="diaChi"
                      value={formData.diaChi}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="vaiTro" className="text-sm font-medium">
                      Role
                    </label>
                    <Input
                      id="vaiTro"
                      name="vaiTro"
                      value={getRoleName(formData.vaiTro)}
                      disabled // Không cho chỉnh sửa
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="ngaySinh" className="text-sm font-medium">
                      Date of Birth
                    </label>
                    <Input
                      id="ngaySinh"
                      name="ngaySinh"
                      type="date"
                      value={formData.ngaySinh}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="cccd" className="text-sm font-medium">
                      ID Number (CCCD)
                    </label>
                    <Input
                      id="cccd"
                      name="cccd"
                      value={formData.cccd}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="moTa" className="text-sm font-medium">
                      Description
                    </label>
                    <Input
                      id="moTa"
                      name="moTa"
                      value={formData.moTa}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="bg-purple hover:bg-purple-medium" onClick={saveSettings}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;