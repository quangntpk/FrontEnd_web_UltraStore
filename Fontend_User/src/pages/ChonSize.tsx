import React, { useState, useEffect, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";

const ChonSize: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"huongDan" | "bangSize">("huongDan");
  const [loaiSanPham, setLoaiSanPham] = useState<string>("Quần");
  const [formDang, setFormDang] = useState<"om" | "vua" | "rong">("vua");
  const [weight, setWeight] = useState<number>(56);
  const [height, setHeight] = useState<number>(160);

  const formRef = useRef<HTMLDivElement>(null);

  const forms: Record<"om" | "vua" | "rong", string> = {
    om: "Ôm",
    vua: "Vừa",
    rong: "Rộng",
  };

  const sizeData: Record<string, string[][]> = {
    "Quần - Ôm": [
      ["Cân nặng (kg)", "50-60", "61-65", "66-70", "71-76", "76-80", "81-86"],
      ["Vòng lưng (cm)", "74", "78", "81", "84", "88", "91"],
      ["Vòng đùi (cm)", "50", "52", "54", "56", "58", "60"],
      ["Rộng ống (cm)", "16.4", "16.5", "17", "17", "17", "17"],
      ["Dài quần (cm)", "98", "97", "97", "97", "98", "98"],
    ],
    "Quần - Vừa": [
      ["Cân nặng (kg)", "50-60", "61-65", "66-70", "71-76", "76-80", "81-86"],
      ["Vòng lưng (cm)", "74", "78", "81", "84", "88", "91"],
      ["Vòng đùi (cm)", "50", "52", "54", "56", "58", "60"],
      ["Rộng ống (cm)", "16.4", "16.5", "17", "17", "17", "17"],
      ["Dài quần (cm)", "98", "97", "97", "97", "98", "98"],
    ],
    "Quần - Rộng": [
      ["Cân nặng (kg)", "50-60", "61-65", "66-70", "71-76", "76-80", "81-86"],
      ["Vòng lưng (cm)", "78", "80", "82", "84", "88", "91"],
      ["Vòng đùi (cm)", "54", "56", "58", "60", "62", "64"],
      ["Rộng ống (cm)", "18", "18", "18", "18", "18", "18"],
      ["Dài quần (cm)", "98", "97", "97", "98", "100", "101"],
    ],
    "Áo - Ôm": [
      ["Chiều cao (cm)", "150-160", "161-170", "171-180", "181-190"],
      ["Ngang vai (cm)", "42", "43.5", "45", "46.5"],
      ["Rộng ngực (cm)", "46", "48", "50", "52"],
      ["Dài áo (cm)", "68", "70", "72", "74"],
    ],
    "Áo - Vừa": [
      ["Chiều cao (cm)", "150-160", "161-170", "171-180", "181-190"],
      ["Ngang vai (cm)", "43.5", "45", "46.5", "48"],
      ["Rộng ngực (cm)", "48", "50", "52", "54"],
      ["Dài áo (cm)", "70", "72", "74", "76"],
    ],
    "Áo - Rộng": [
      ["Chiều cao (cm)", "150-160", "161-170", "171-180", "181-190"],
      ["Ngang vai (cm)", "47.5", "49", "50.5", "52"],
      ["Rộng ngực (cm)", "52", "54", "56", "58"],
      ["Dài áo (cm)", "72", "74", "76", "78"],
    ],
  };

  const suggestSize = (weight: number, height: number, loaiSanPham: string) => {
    if (loaiSanPham === "Quần") {
      if (weight < 60) return "28";
      if (weight < 65) return "29";
      if (weight < 70) return "30";
      if (weight < 76) return "31";
      if (weight < 80) return "32";
      return "34";
    } else if (loaiSanPham === "Áo") {
      if (height < 160) return "S";
      if (height < 170) return "M";
      if (height < 180) return "L";
      return "XL";
    }
    return "Không xác định";
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setShowForm(false);
      }
    };

    if (showForm) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showForm]);

  return (
    <div className="relative">
      <h5
        onClick={() => setShowForm(!showForm)}
        className="px-3 py-1 text-sm rounded-md bg-white text-purple-600 mb-2 cursor-pointer flex items-center gap-2 border border-purple-500 w-fit"
      >
        {showForm ? (
          <>
            <EyeOff size={16} />
            Ẩn Hướng dẫn
          </>
        ) : (
          <>
            <Eye size={16} />
            Hướng dẫn chọn size
          </>
        )}
      </h5>

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div ref={formRef} className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative">
            <span
              onClick={() => setShowForm(false)}
              className="absolute top-[-10px] right-[-10px] text-1xl cursor-pointer bg-black text-white rounded-full w-8 h-8 flex items-center justify-center"
            >
              ×
            </span>

            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("huongDan")}
                  className={`px-4 py-2 rounded-md ${
                    activeTab === "huongDan" ? "bg-gray-300 font-bold" : "bg-gray-100"
                  }`}
                >
                  Hướng dẫn chọn size
                </button>
                <button
                  onClick={() => setActiveTab("bangSize")}
                  className={`px-4 py-2 rounded-md ${
                    activeTab === "bangSize" ? "bg-gray-300 font-bold" : "bg-gray-100"
                  }`}
                >
                  Bảng size
                </button>
              </div>
              <select
                className="border border-gray-300 rounded px-3 py-1"
                value={loaiSanPham}
                onChange={(e) => setLoaiSanPham(e.target.value)}
              >
                <option value="Quần">Quần</option>
                <option value="Áo">Áo</option>
              </select>
            </div>

            {activeTab === "huongDan" && (
              <div>
                <div className="mb-4 flex items-center">
                  <label className="text-sm mr-2">Chiều cao (cm):</label>
                  <span className="font-bold">{height}cm</span>
                  <input
                    type="range"
                    min="140"
                    max="200"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="ml-2 w-full"
                  />
                </div>
                <div className="mb-4 flex items-center">
                  <label className="text-sm mr-2">Cân nặng (kg):</label>
                  <span className="font-bold">{weight}kg</span>
                  <input
                    type="range"
                    min="40"
                    max="120"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="ml-2 w-full"
                  />
                </div>
                <div className="mt-4 flex flex-row justify-center gap-4">
                  <div
                    onClick={() => setFormDang("om")}
                    className={`cursor-pointer text-center ${formDang === "om" ? "border-2 border-blue-500" : ""}`}
                  >
                    <img
                      src="https://file.hstatic.net/1000253775/file/om_160_519a3dbfd5314c2fb5f4d90913534ec4.jpg"
                      alt="Ôm"
                      className="w-3/4 max-w-sm mx-auto"
                    />
                    <p className="mt-2 bg-black text-white rounded px-2 py-1 inline-block">Ôm</p>
                  </div>
                  <div
                    onClick={() => setFormDang("vua")}
                    className={`cursor-pointer text-center ${formDang === "vua" ? "border-2 border-blue-500" : ""}`}
                  >
                    <img
                      src="https://file.hstatic.net/1000253775/file/vua_160_85cf53bb243943ad90c3890031cc15ae.jpg"
                      alt="Vừa"
                      className="w-3/4 max-w-sm mx-auto"
                    />
                    <p className="mt-2 bg-black text-white rounded px-2 py-1 inline-block">Vừa</p>
                  </div>
                  <div
                    onClick={() => setFormDang("rong")}
                    className={`cursor-pointer text-center ${formDang === "rong" ? "border-2 border-blue-500" : ""}`}
                  >
                    <img
                      src="https://file.hstatic.net/1000253775/file/rong_160_09b702fafaca4d879af662e6383baa5f.jpg"
                      alt="Rộng"
                      className="w-3/4 max-w-sm mx-auto"
                    />
                    <p className="mt-2 bg-black text-white rounded px-2 py-1 inline-block">Rộng</p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-lg">UltraStore gợi ý bạn</p>
                  <div className="flex justify-center gap-4 mt-2">
                    <span className="bg-black text-white rounded px-3 py-1">
                      {suggestSize(weight, height, "Áo")} - Áo
                    </span>
                    <span className="bg-black text-white rounded px-3 py-1">
                      {suggestSize(weight, height, "Quần")} - Quần
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "bangSize" && (
              <div className="max-h-96 overflow-y-auto">
                {["om", "vua", "rong"].map((formKey) => (
                  <div key={formKey} className="mb-6">
                    <h3 className="text-lg font-bold mb-2">
                      {loaiSanPham} - {forms[formKey as "om" | "vua" | "rong"]}
                    </h3>
                    <table className="w-full border border-black text-sm">
                      <thead>
                        <tr className="bg-black text-white">
                          <th className="p-2">SIZE</th>
                          {loaiSanPham === "Quần" ? (
                            <>
                              <th className="p-2">28</th>
                              <th className="p-2">29</th>
                              <th className="p-2">30</th>
                              <th className="p-2">31</th>
                              <th className="p-2">32</th>
                              <th className="p-2">34</th>
                            </>
                          ) : (
                            <>
                              <th className="p-2">S</th>
                              <th className="p-2">M</th>
                              <th className="p-2">L</th>
                              <th className="p-2">XL</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {sizeData[`${loaiSanPham} - ${forms[formKey as "om" | "vua" | "rong"]}`].map((row, idx) => (
                          <tr key={idx} className="border-t border-gray-300">
                            {row.map((cell, i) => (
                              <td key={i} className="p-2 border-r border-gray-200">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
                <p className="text-sm text-gray-500 mt-4">
                  * Size có thể chênh lệch tùy theo từng dáng người, bạn nên thử trước khi mua.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChonSize;