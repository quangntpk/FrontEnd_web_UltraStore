import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@radix-ui/react-dialog';
import './DonHangList.css';
import * as XLSX from 'xlsx'; // Import thư viện xlsx

// Định nghĩa kiểu dữ liệu cho phản hồi API
interface ApiResponse {
  $id: string;
  $values: DonHang[];
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
  code?: string;
}

interface ResponseData {
  message: string;
}

// Định nghĩa kiểu dữ liệu
interface ChiTietDonHang {
  maCtdh: number;
  maDonHang?: number;
  maSanPham?: string;
  tenSanPham?: string;
  soLuong?: number;
  gia?: number;
  thanhTien?: number;
  maCombo?: number;
}

interface DonHang {
  maDonHang: number;
  maNguoiDung?: string;
  maNhanVien?: string;
  ngayDat?: string;
  trangThaiDonHang?: string;
  trangThaiHang?: string;
  lyDoHuy?: string;
  tenNguoiNhan?: string;
  sdt?: string;
  diaChi?: string;
  tenNguoiDung?: string;
  chiTietDonHangs?: { $values: ChiTietDonHang[] };
}

const DonHangList: React.FC = () => {
  const [donHangs, setDonHangs] = useState<DonHang[]>([]);
  const [filteredDonHangs, setFilteredDonHangs] = useState<DonHang[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDonHang, setSelectedDonHang] = useState<DonHang | null>(null);

  // Lấy danh sách đơn hàng từ API
  useEffect(() => {
    const fetchDonHangs = async () => {
      try {
        const response = await axios.get<ApiResponse>('http://localhost:5261/api/DonHang');
        console.log('API Response:', response.data);
        const data = response.data.$values;
        setDonHangs(data);
        setFilteredDonHangs(data);
      } catch (error) {
        const apiError = error as ApiError;
        console.error('Error fetching orders:', apiError);
        console.error('Error message:', apiError.message);
        console.error('Error code:', apiError.code);
        if (apiError.response) {
          console.error('Response data:', apiError.response.data);
        }
        alert(apiError.message || 'Không thể tải danh sách đơn hàng! Vui lòng kiểm tra kết nối hoặc backend.');
      }
    };
    fetchDonHangs();
  }, []);

  // Lọc đơn hàng theo trạng thái giao hàng
  const handleFilter = (status: string) => {
    setStatusFilter(status);
    if (status === 'all') {
      setFilteredDonHangs(donHangs);
    } else {
      setFilteredDonHangs(donHangs.filter(dh => dh.trangThaiDonHang === status));
    }
  };

  // Hàm duyệt đơn
  const handleDuyet = async (maDonHang: number) => {
    const donHangToDuyet = donHangs.find(dh => dh.maDonHang === maDonHang);
    if (!donHangToDuyet || donHangToDuyet.trangThaiDonHang !== 'Đang xử lý') {
      alert('Chỉ có thể duyệt đơn hàng có trạng thái "Đang xử lý"!');
      return;
    }

    if (window.confirm('Bạn có chắc muốn duyệt đơn hàng này?')) {
      try {
        const response = await axios.put<ResponseData>(`http://localhost:5261/api/DonHang/duyet/${maDonHang}`);
        alert(response.data.message);
        const updatedDonHangs = donHangs.map(dh =>
          dh.maDonHang === maDonHang ? { ...dh, trangThaiDonHang: 'Đã xác nhận' } : dh // Chuyển trạng thái thành "Đã xác nhận"
        );
        setDonHangs(updatedDonHangs);
        handleFilter(statusFilter);
      } catch (error) {
        const apiError = error as ApiError;
        alert(apiError.response?.data?.message || 'Lỗi khi duyệt đơn hàng!');
      }
    }
  };

  // Hàm hủy đơn
  const handleHuy = async (maDonHang: number) => {
    const donHangToHuy = donHangs.find(dh => dh.maDonHang === maDonHang);
    if (!donHangToHuy || donHangToHuy.trangThaiDonHang !== 'Đang xử lý') {
      alert('Chỉ có thể hủy đơn hàng có trạng thái "Đang xử lý"!');
      return;
    }

    const lyDoHuy = prompt('Nhập lý do hủy đơn hàng:');
    if (lyDoHuy && window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
      try {
        const response = await axios.put<ResponseData>(`http://localhost:5261/api/DonHang/huy/${maDonHang}`, lyDoHuy, {
          headers: { 'Content-Type': 'application/json' }
        });
        alert(response.data.message);
        const updatedDonHangs = donHangs.map(dh =>
          dh.maDonHang === maDonHang ? { ...dh, trangThaiDonHang: 'Đã hủy', lyDoHuy } : dh
        );
        setDonHangs(updatedDonHangs);
        handleFilter(statusFilter);
      } catch (error) {
        const apiError = error as ApiError;
        alert(apiError.response?.data?.message || 'Lỗi khi hủy đơn hàng!');
      }
    } else if (!lyDoHuy) {
      alert('Vui lòng nhập lý do hủy!');
    }
  };

  // Hiển thị chi tiết đơn hàng
  const showChiTiet = async (maDonHang: number) => {
    try {
      const response = await axios.get<DonHang>(`http://localhost:5261/api/DonHang/${maDonHang}`);
      setSelectedDonHang(response.data);
      setIsModalOpen(true);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching order details:', error);
      alert(apiError.response?.data?.message || 'Không thể tải chi tiết đơn hàng!');
    }
  };

  // Hàm xuất file Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredDonHangs.map(dh => ({
      '#': dh.maDonHang,
      'Tên khách hàng': dh.tenNguoiNhan || 'N/A',
      'Ngày đặt': dh.ngayDat ? new Date(dh.ngayDat).toLocaleDateString('vi-VN') : 'N/A',
      'Trạng thái giao hàng': dh.trangThaiDonHang || 'N/A',
      'Trạng thái thanh toán': dh.trangThaiHang || 'N/A',
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách đơn hàng');
    XLSX.writeFile(workbook, 'DanhSachDonHang.xlsx');
  };

  // Hàm in danh sách đơn hàng
  const printList = () => {
    window.print();
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Quản lý Đơn hàng</h1>

          {/* Nút xuất Excel và in */}
          <div className="mb-6 flex space-x-4">
            <button
              className="py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
              onClick={exportToExcel}
            >
              Xuất file Excel
            </button>
            <button
              className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
              onClick={printList}
            >
              In danh sách đơn hàng
            </button>
          </div>

          {/* Bộ lọc trạng thái */}
          <div className="flex space-x-4 mb-6 overflow-x-auto">
            {['all', 'Đã xác nhận', 'Đang giao', 'Đã giao', 'Đã hủy', 'Chưa thanh toán', 'Đã thanh toán'].map(status => (
              <button
                key={status}
                className={`py-2 px-4 rounded-lg transition-all duration-300 ${
                  statusFilter === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-purple-100 hover:text-purple-600'
                }`}
                onClick={() => handleFilter(status)}
              >
                {status === 'all' ? 'Tất cả' : status}
              </button>
            ))}
          </div>

          {/* Bảng danh sách đơn hàng */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold border-b">#</th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold border-b">TÊN KHÁCH HÀNG</th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold border-b">NGÀY ĐẶT</th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold border-b">TRẠNG THÁI GIAO HÀNG</th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold border-b">TRẠNG THÁI THANH TOÁN</th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold border-b">THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonHangs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 px-4 text-center text-gray-500">
                      Không có đơn hàng nào.
                    </td>
                  </tr>
                ) : (
                  filteredDonHangs.map((dh, index) => (
                    <tr key={dh.maDonHang} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-3 px-4 border-b">{dh.maDonHang}</td>
                      <td className="py-3 px-4 border-b">{dh.tenNguoiNhan || 'N/A'}</td>
                      <td className="py-3 px-4 border-b">
                        {dh.ngayDat ? new Date(dh.ngayDat).toLocaleDateString('vi-VN') : 'N/A'}
                      </td>
                      <td className="py-3 px-4 border-b">
                        <span
                          className={`inline-block py-1 px-3 rounded-full text-sm font-medium ${
                            dh.trangThaiDonHang === 'Đã giao'
                              ? 'bg-green-100 text-green-600'
                              : dh.trangThaiDonHang === 'Đã hủy'
                              ? 'bg-red-100 text-red-600'
                              : dh.trangThaiDonHang === 'Đang giao'
                              ? 'bg-yellow-100 text-yellow-600'
                              : dh.trangThaiDonHang === 'Đã xác nhận'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {dh.trangThaiDonHang || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b">
                        <span
                          className={`inline-block py-1 px-3 rounded-full text-sm font-medium ${
                            dh.trangThaiHang === 'Đã thanh toán'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {dh.trangThaiHang || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b text-center">
                        <button
                          className="text-blue-500 mr-3 hover:text-blue-700 transition-all"
                          onClick={() => handleDuyet(dh.maDonHang)}
                          disabled={dh.trangThaiDonHang !== 'Đang xử lý'}
                        >
                          <i className="fas fa-check mr-1"></i>Duyệt
                        </button>
                        <button
                          className="text-red-500 mr-3 hover:text-red-700 transition-all"
                          onClick={() => handleHuy(dh.maDonHang)}
                          disabled={dh.trangThaiDonHang !== 'Đang xử lý'}
                        >
                          <i className="fas fa-times mr-1"></i>Hủy
                        </button>
                        <button
                          className="text-green-500 hover:text-green-700 transition-all"
                          onClick={() => showChiTiet(dh.maDonHang)}
                        >
                          <i className="fas fa-eye mr-1"></i>Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Dialog chi tiết đơn hàng */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white rounded-lg p-6 w-[90%] max-w-[1000px] max-h-[80vh] overflow-y-auto">
          {selectedDonHang && (
            <>
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <DialogTitle className="text-xl font-semibold">Chi tiết đơn hàng #{selectedDonHang.maDonHang}</DialogTitle>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setIsModalOpen(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {/* Bảng chi tiết sản phẩm */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-left border border-gray-200 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-gray-600 font-semibold border-b">#</th>
                      <th className="py-3 px-4 text-gray-600 font-semibold border-b">TÊN SẢN PHẨM</th>
                      <th className="py-3 px-4 text-gray-600 font-semibold border-b">SỐ LƯỢNG</th>
                      <th className="py-3 px-4 text-gray-600 font-semibold border-b">GIÁ</th>
                      <th className="py-3 px-4 text-gray-600 font-semibold border-b">THÀNH TIỀN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDonHang.chiTietDonHangs?.$values?.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 px-4 text-center text-gray-500">
                          Không có sản phẩm nào trong đơn hàng này.
                        </td>
                      </tr>
                    ) : (
                      selectedDonHang.chiTietDonHangs?.$values?.map((ct, index) => (
                        <tr key={ct.maCtdh} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="py-3 px-4 border-b">{ct.maCtdh}</td>
                          <td className="py-3 px-4 border-b">{ct.tenSanPham || 'N/A'}</td>
                          <td className="py-3 px-4 border-b">{ct.soLuong || 'N/A'}</td>
                          <td className="py-3 px-4 border-b">{ct.gia ? ct.gia.toLocaleString('vi-VN') : 'N/A'} VND</td>
                          <td className="py-3 px-4 border-b">{ct.thanhTien ? ct.thanhTien.toLocaleString('vi-VN') : 'N/A'} VND</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Thông tin người dùng và đơn hàng */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Thông tin người dùng</h3>
                  <p><span className="font-medium">Tên người nhận:</span> {selectedDonHang.tenNguoiNhan || 'N/A'}</p>
                  <p><span className="font-medium">Địa chỉ:</span> {selectedDonHang.diaChi || 'Chưa có thông tin'}</p>
                  <p><span className="font-medium">Số điện thoại:</span> {selectedDonHang.sdt || 'Chưa có thông tin'}</p>
                  <p><span className="font-medium">Tên người đặt:</span> {selectedDonHang.tenNguoiDung || 'Chưa có thông tin'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">Thông tin đơn hàng</h3>
                  <p><span className="font-medium">Ngày đặt:</span> {selectedDonHang.ngayDat ? new Date(selectedDonHang.ngayDat).toLocaleDateString('vi-VN') : 'N/A'}</p>
                  <p><span className="font-medium">Trạng thái giao hàng:</span> {selectedDonHang.trangThaiDonHang || 'N/A'}</p>
                  <p><span className="font-medium">Trạng thái thanh toán:</span> {selectedDonHang.trangThaiHang || 'N/A'}</p>
                  <p><span className="font-medium">Hình thức thanh toán:</span> {selectedDonHang.trangThaiHang === 'Chưa thanh toán' ? 'Thanh toán khi nhận hàng' : selectedDonHang.trangThaiHang === 'Đã thanh toán' ? 'Thanh toán VNPay' : 'N/A'}</p>
                  {selectedDonHang.lyDoHuy && (
                    <p><span className="font-medium">Lý do hủy:</span> {selectedDonHang.lyDoHuy}</p>
                  )}
                </div>
              </div>
            </>
          )}
          <DialogClose />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DonHangList;