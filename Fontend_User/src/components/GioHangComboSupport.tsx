// src/components/GiohangComboSupport.tsx
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ComboItem {
  idCombo: number;
  tenCombo: string;
  hinhAnh: string;
  soLuong: number;
  sanPhamList: {
    maSanPham: string;
    soLuong: number;
    version: number;
  }[];
}

interface GiohangComboSupportProps {
  combo: ComboItem;
  onClose: () => void;
  onUpdateCombo: (updatedCombo: ComboItem) => void;
}

const GiohangComboSupport = ({ combo, onClose, onUpdateCombo }: GiohangComboSupportProps) => {
  const handleRemoveVersion = (version: number) => {
    const updatedSanPhamList = combo.sanPhamList.filter((item) => item.version !== version);
    const updatedCombo = { ...combo, sanPhamList: updatedSanPhamList };
    onUpdateCombo(updatedCombo);
    toast.success(`Removed items with version ${version} from combo`);
  };

  // Group sanPhamList by version
  const groupByVersion = (sanPhamList: ComboItem["sanPhamList"]) => {
    const grouped = sanPhamList.reduce((acc, item) => {
      if (!acc[item.version]) {
        acc[item.version] = [];
      }
      acc[item.version].push(item);
      return acc;
    }, {} as Record<number, ComboItem["sanPhamList"]>);
    return grouped;
  };

  const groupedItems = groupByVersion(combo.sanPhamList);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg w-full max-w-md aaaaa">
      <h2 className="text-xl font-semibold mb-4 ">Edit {combo.tenCombo}</h2>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Object.entries(groupedItems).map(([version, items]) => (
          <div key={version} className="p-3 bg-gray-100 rounded-md relative">
            <button
              onClick={() => handleRemoveVersion(parseInt(version))}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              <X size={16} />
            </button>
            <h4 className="font-medium">Version {version}</h4>
            {items.map((item, index) => (
              <p key={index} className="text-muted-foreground">
                {item.maSanPham} - Quantity: {item.soLuong}
              </p>
            ))}
          </div>
        ))}
      </div>
      <Button className="mt-4 w-full" variant="outline" onClick={onClose}>
        Close
      </Button>
    </div>
  );
};

export default GiohangComboSupport;