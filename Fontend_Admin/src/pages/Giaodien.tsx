import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Định nghĩa kiểu dữ liệu
interface GiaoDien {
  maGiaoDien: number;
  logo: string; // Chuỗi Base64
  slider1: string;
  slider2: string;
  slider3: string;
  slider4: string;
  avt: string;
}

// Modal Component
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode }> = ({
  isOpen,
  onClose,
  children,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-lg h-auto max-h-[120vh] overflow-y-auto">
        <button
          className="absolute top-2 right-2 text-black hover:text-gray-700"
          onClick={onClose}
        >
          X
        </button>
        {children}
      </div>
    </div>
  );
};

// Create Form Component
const CreateForm: React.FC<{ onSubmit: (e: React.FormEvent) => void; onCancel: () => void }> = ({
  onSubmit,
  onCancel,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">Tạo mới Giao Diện</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="logo">Logo</Label>
          <Input type="file" id="logo" name="logo" accept="image/*" />
        </div>
        <div>
          <Label htmlFor="avt">Avatar</Label>
          <Input type="file" id="avt" name="avt" accept="image/*" />
        </div>
        <div>
          <Label htmlFor="slider1">Slider 1</Label>
          <Input type="file" id="slider1" name="slider1" accept="image/*" />
        </div>
        <div>
          <Label htmlFor="slider2">Slider 2</Label>
          <Input type="file" id="slider2" name="slider2" accept="image/*" />
        </div>
        <div>
          <Label htmlFor="slider3">Slider 3</Label>
          <Input type="file" id="slider3" name="slider3" accept="image/*" />
        </div>
        <div>
          <Label htmlFor="slider4">Slider 4</Label>
          <Input type="file" id="slider4" name="slider4" accept="image/*" />
        </div>

      </div>
      <div className="flex space-x-4">
        <Button type="submit" className="bg-purple-500 text-white hover:bg-purple-600">
          Tạo
        </Button>
        <Button onClick={onCancel} variant="outline">
          Hủy
        </Button>
      </div>
    </form>
  );
};

// Edit Form Component
const EditForm: React.FC<{
  giaoDien: GiaoDien;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}> = ({ giaoDien, onSubmit, onCancel }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">Chỉnh sửa Giao Diện</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="logo">Logo</Label>
          <img
            src={`data:image/png;base64,${giaoDien.logo}`}
            alt="Current Logo"
            className="w-32 h-32 object-cover rounded-md mb-2"
          />
          <Input type="file" id="logo" name="logo" accept="image/*" />
        </div>
        <div>
          <Label htmlFor="avt">Avatar</Label>
          <img
            src={`data:image/png;base64,${giaoDien.avt}`}
            alt="Current Avatar"
            className="w-32 h-32 rounded-full mb-2"
          />
          <Input type="file" id="avt" name="avt" accept="image/*" />
        </div>
        <div>
          <Label htmlFor="slider1">Slider 1</Label>
          <img
            src={`data:image/png;base64,${giaoDien.slider1}`}
            alt="Current Slider1"
            className="w-32 h-16 object-cover rounded-md mb-2"
          />
          <Input type="file" id="slider1" name="slider1" accept="image/*" />
        </div>
        <div>
          <Label htmlFor="slider2">Slider 2</Label>
          <img
            src={`data:image/png;base64,${giaoDien.slider2}`}
            alt="Current Slider2"
            className="w-32 h-16 object-cover rounded-md mb-2"
          />
          <Input type="file" id="slider2" name="slider2" accept="image/*" />
        </div>
        <div>
          <Label htmlFor="slider3">Slider 3</Label>
          <img
            src={`data:image/png;base64,${giaoDien.slider3}`}
            alt="Current Slider3"
            className="w-32 h-16 object-cover rounded-md mb-2"
          />
          <Input type="file" id="slider3" name="slider3" accept="image/*" />
        </div>
        <div>
          <Label htmlFor="slider4">Slider 4</Label>
          <img
            src={`data:image/png;base64,${giaoDien.slider4}`}
            alt="Current Slider4"
            className="w-32 h-16 object-cover rounded-md mb-2"
          />
          <Input type="file" id="slider4" name="slider4" accept="image/*" />
        </div>

      </div>
      <div className="flex space-x-4">
        <Button type="submit" className="bg-purple-500 text-white hover:bg-purple-600">
          Cập nhật
        </Button>
        <Button onClick={onCancel} variant="outline">
          Hủy
        </Button>
      </div>
    </form>
  );
};

// Delete Confirmation Component
const DeleteConfirmation: React.FC<{
  giaoDien: GiaoDien;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ giaoDien, onConfirm, onCancel }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Xác nhận xóa Giao Diện</h2>
      <p>Bạn có chắc chắn muốn xóa giao diện có mã {giaoDien.maGiaoDien} không?</p>
      <div className="flex space-x-4">
        <Button onClick={onConfirm} variant="destructive">
          Xóa
        </Button>
        <Button onClick={onCancel} variant="outline">
          Hủy
        </Button>
      </div>
    </div>
  );
};

// Main Component
const Giaodien: React.FC = () => {
  const [giaoDiens, setGiaoDiens] = useState<GiaoDien[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "delete" | null>(null);
  const [selectedGiaoDien, setSelectedGiaoDien] = useState<GiaoDien | null>(null);

  const fetchGiaoDiens = async () => {
    try {
      const response = await fetch("http://localhost:5261/api/GiaoDien");
      if (!response.ok) throw new Error("Không thể tải dữ liệu.");
      const data: GiaoDien[] = await response.json();
      setGiaoDiens(data);
      setLoading(false);
    } catch (err) {
      setError("Lỗi khi tải danh sách giao diện.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGiaoDiens();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as HTMLFormElement;
    const formData = new FormData(target);

    try {
      const response = await fetch("http://localhost:5261/api/GiaoDien", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Lỗi khi tạo giao diện.");
      setIsModalOpen(false);
      fetchGiaoDiens();
    } catch (error) {
      console.error("Lỗi:", error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGiaoDien) return;
    const target = e.target as HTMLFormElement;
    const formData = new FormData(target);
    formData.append("MaGiaoDien", selectedGiaoDien.maGiaoDien.toString());

    // Nếu không có file mới, giữ nguyên dữ liệu Base64 cũ
    if (!formData.get("logo")) formData.set("logo", selectedGiaoDien.logo);
    if (!formData.get("slider1")) formData.set("slider1", selectedGiaoDien.slider1);
    if (!formData.get("slider2")) formData.set("slider2", selectedGiaoDien.slider2);
    if (!formData.get("slider3")) formData.set("slider3", selectedGiaoDien.slider3);
    if (!formData.get("slider4")) formData.set("slider4", selectedGiaoDien.slider4);
    if (!formData.get("avt")) formData.set("avt", selectedGiaoDien.avt);

    try {
      const response = await fetch(`http://localhost:5261/api/GiaoDien/${selectedGiaoDien.maGiaoDien}`, {
        method: "PUT",
        body: formData,
      });
      if (!response.ok) throw new Error("Lỗi khi cập nhật.");
      setIsModalOpen(false);
      fetchGiaoDiens();
    } catch (error) {
      console.error("Lỗi:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedGiaoDien) return;
    try {
      const response = await fetch(`http://localhost:5261/api/GiaoDien/${selectedGiaoDien.maGiaoDien}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Lỗi khi xóa.");
      setIsModalOpen(false);
      fetchGiaoDiens();
    } catch (error) {
      console.error("Lỗi:", error);
    }
  };

  const openCreateMode = () => {
    setModalMode("create");
    setIsModalOpen(true);
  };

  const openEditMode = (giaoDien: GiaoDien) => {
    setSelectedGiaoDien(giaoDien);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const openDeleteMode = (giaoDien: GiaoDien) => {
    setSelectedGiaoDien(giaoDien);
    setModalMode("delete");
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Danh sách Giao Diện</h1>
        <Button onClick={openCreateMode}>Tạo mới</Button>
      </div>
      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
          {giaoDiens.map((gd) => (
            <Card key={gd.maGiaoDien}>
              <CardHeader>
                <CardTitle>Mã: {gd.maGiaoDien}</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={`data:image/png;base64,${gd.logo}`}
                  alt="Logo"
                  className="w-full h-32 object-cover rounded-md"
                />
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <img
                    src={`data:image/png;base64,${gd.slider1}`}
                    alt="Slider1"
                    className="h-16 object-cover rounded-md"
                  />
                  <img
                    src={`data:image/png;base64,${gd.slider2}`}
                    alt="Slider2"
                    className="h-16 object-cover rounded-md"
                  />
                  <img
                    src={`data:image/png;base64,${gd.slider3}`}
                    alt="Slider3"
                    className="h-16 object-cover rounded-md"
                  />
                  <img
                    src={`data:image/png;base64,${gd.slider4}`}
                    alt="Slider4"
                    className="h-16 object-cover rounded-md"
                  />
                </div>
                <img
                  src={`data:image/png;base64,${gd.avt}`}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full mx-auto mt-4"
                />
                <div className="flex justify-between mt-4">
                  <Button onClick={() => openEditMode(gd)} variant="outline">
                    Chỉnh sửa
                  </Button>
                  <Button onClick={() => openDeleteMode(gd)} variant="destructive">
                    Xóa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {modalMode === "create" && (
          <CreateForm onSubmit={handleCreate} onCancel={() => setIsModalOpen(false)} />
        )}
        {modalMode === "edit" && selectedGiaoDien && (
          <EditForm
            giaoDien={selectedGiaoDien}
            onSubmit={handleUpdate}
            onCancel={() => setIsModalOpen(false)}
          />
        )}
        {modalMode === "delete" && selectedGiaoDien && (
          <DeleteConfirmation
            giaoDien={selectedGiaoDien}
            onConfirm={handleDelete}
            onCancel={() => setIsModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default Giaodien;