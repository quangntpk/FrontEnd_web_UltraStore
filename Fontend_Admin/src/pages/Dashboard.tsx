import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Chart from "chart.js/auto";

const Dashboard = () => {
  const [timeFilter, setTimeFilter] = useState("daily");
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().split("T")[0]);
  const [monthlyYear, setMonthlyYear] = useState("2025");
  const [monthlyMonth, setMonthlyMonth] = useState("1");
  const [yearlyYear, setYearlyYear] = useState("2025");
  const [dailyData, setDailyData] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any>(null);
  const [yearlyData, setYearlyData] = useState<any>(null);

  // Refs để lưu trữ các instance của biểu đồ
  const dailyChartRef = useRef<Chart | null>(null);
  const monthlyChartRef = useRef<Chart | null>(null);
  const yearlyChartRef = useRef<Chart | null>(null);

  const years = Array.from({ length: 76 }, (_, i) => 2025 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const createLineChart = (
    canvasId: string,
    labels: string[],
    revenues: number[],
    orders: number[],
    title: string,
    chartRef: React.MutableRefObject<Chart | null>
  ) => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Hủy biểu đồ hiện tại nếu tồn tại
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: `${title} - Doanh thu`,
            data: revenues,
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderWidth: 2,
            tension: 0.4,
            fill: true,
          },
          {
            label: `${title} - Đơn hàng`,
            data: orders,
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderWidth: 2,
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" },
          tooltip: { mode: "index", intersect: false },
        },
        scales: {
          x: { title: { display: true, text: "Thời gian" } },
          y: {
            title: { display: true, text: "Giá trị (VND/Đơn hàng)" },
            beginAtZero: true,
            ticks: {
              callback: (value) => value.toLocaleString(),
            },
          },
        },
      },
    });
  };

  const getDailyStatistics = async () => {
    if (!dailyDate) return;

    // Dữ liệu mẫu cho thống kê theo ngày (10 ngày trong tháng 3/2025)
    const sampleData = [
      { ngay: 1, thang: 3, nam: 2025, tongDoanhThu: 3000000, tongDonHang: 8 },
      { ngay: 5, thang: 3, nam: 2025, tongDoanhThu: 4500000, tongDonHang: 12 },
      { ngay: 10, thang: 3, nam: 2025, tongDoanhThu: 6000000, tongDonHang: 15 },
      { ngay: 15, thang: 3, nam: 2025, tongDoanhThu: 7500000, tongDonHang: 20 },
      { ngay: 20, thang: 3, nam: 2025, tongDoanhThu: 5000000, tongDonHang: 10 },
      { ngay: 21, thang: 3, nam: 2025, tongDoanhThu: 7000000, tongDonHang: 18 },
      { ngay: 22, thang: 3, nam: 2025, tongDoanhThu: 6500000, tongDonHang: 14 },
      { ngay: 25, thang: 3, nam: 2025, tongDoanhThu: 8000000, tongDonHang: 22 },
      { ngay: 28, thang: 3, nam: 2025, tongDoanhThu: 9000000, tongDonHang: 25 },
      { ngay: 31, thang: 3, nam: 2025, tongDoanhThu: 8500000, tongDonHang: 23 },
    ];

    const labels = sampleData.map((x) => `${x.ngay}/${x.thang}/${x.nam}`);
    const revenues = sampleData.map((x) => x.tongDoanhThu);
    const orders = sampleData.map((x) => x.tongDonHang);

    createLineChart("dailyChart", labels, revenues, orders, "Thống kê theo ngày", dailyChartRef);
    setDailyData({
      totalRevenue: sampleData.reduce((acc, curr) => acc + curr.tongDoanhThu, 0),
      totalOrders: sampleData.reduce((acc, curr) => acc + curr.tongDonHang, 0),
    });
  };

  const getMonthlyStatistics = async () => {
    if (!monthlyYear || !monthlyMonth) return;

    // Dữ liệu mẫu cho thống kê theo tháng (15 ngày trong tháng 1/2025)
    const sampleData = [
      { ngay: 1, thang: 1, nam: 2025, tongDoanhThu: 3000000, tongDonHang: 5 },
      { ngay: 3, thang: 1, nam: 2025, tongDoanhThu: 3500000, tongDonHang: 7 },
      { ngay: 5, thang: 1, nam: 2025, tongDoanhThu: 4000000, tongDonHang: 10 },
      { ngay: 7, thang: 1, nam: 2025, tongDoanhThu: 4500000, tongDonHang: 12 },
      { ngay: 10, thang: 1, nam: 2025, tongDoanhThu: 5000000, tongDonHang: 15 },
      { ngay: 12, thang: 1, nam: 2025, tongDoanhThu: 5500000, tongDonHang: 13 },
      { ngay: 15, thang: 1, nam: 2025, tongDoanhThu: 6000000, tongDonHang: 18 },
      { ngay: 17, thang: 1, nam: 2025, tongDoanhThu: 6500000, tongDonHang: 20 },
      { ngay: 20, thang: 1, nam: 2025, tongDoanhThu: 7000000, tongDonHang: 22 },
      { ngay: 22, thang: 1, nam: 2025, tongDoanhThu: 7500000, tongDonHang: 19 },
      { ngay: 25, thang: 1, nam: 2025, tongDoanhThu: 8000000, tongDonHang: 25 },
      { ngay: 27, thang: 1, nam: 2025, tongDoanhThu: 8500000, tongDonHang: 23 },
      { ngay: 28, thang: 1, nam: 2025, tongDoanhThu: 9000000, tongDonHang: 28 },
      { ngay: 30, thang: 1, nam: 2025, tongDoanhThu: 9500000, tongDonHang: 30 },
      { ngay: 31, thang: 1, nam: 2025, tongDoanhThu: 10000000, tongDonHang: 32 },
    ];

    const labels = sampleData.map((x) => `${x.ngay}/${x.thang}/${x.nam}`);
    const revenues = sampleData.map((x) => x.tongDoanhThu);
    const orders = sampleData.map((x) => x.tongDonHang);

    createLineChart("monthlyChart", labels, revenues, orders, "Thống kê theo tháng", monthlyChartRef);
    setMonthlyData({
      totalRevenue: sampleData.reduce((acc, curr) => acc + curr.tongDoanhThu, 0),
      totalOrders: sampleData.reduce((acc, curr) => acc + curr.tongDonHang, 0),
    });
  };

  const getYearlyStatistics = async () => {
    if (!yearlyYear) return;

    // Dữ liệu mẫu cho thống kê theo năm (12 tháng trong năm 2025)
    const sampleData = [
      { ngay: 15, thang: 1, nam: 2025, tongDoanhThu: 12000000, tongDonHang: 30 },
      { ngay: 15, thang: 2, nam: 2025, tongDoanhThu: 11000000, tongDonHang: 25 },
      { ngay: 15, thang: 3, nam: 2025, tongDoanhThu: 13000000, tongDonHang: 35 },
      { ngay: 15, thang: 4, nam: 2025, tongDoanhThu: 14000000, tongDonHang: 40 },
      { ngay: 15, thang: 5, nam: 2025, tongDoanhThu: 15000000, tongDonHang: 45 },
      { ngay: 15, thang: 6, nam: 2025, tongDoanhThu: 16000000, tongDonHang: 50 },
      { ngay: 15, thang: 7, nam: 2025, tongDoanhThu: 17000000, tongDonHang: 55 },
      { ngay: 15, thang: 8, nam: 2025, tongDoanhThu: 18000000, tongDonHang: 60 },
      { ngay: 15, thang: 9, nam: 2025, tongDoanhThu: 19000000, tongDonHang: 65 },
      { ngay: 15, thang: 10, nam: 2025, tongDoanhThu: 20000000, tongDonHang: 70 },
      { ngay: 15, thang: 11, nam: 2025, tongDoanhThu: 21000000, tongDonHang: 75 },
      { ngay: 15, thang: 12, nam: 2025, tongDoanhThu: 22000000, tongDonHang: 80 },
    ];

    const labels = sampleData.map((x) => `${x.ngay}/${x.thang}/${x.nam}`);
    const revenues = sampleData.map((x) => x.tongDoanhThu);
    const orders = sampleData.map((x) => x.tongDonHang);

    createLineChart("yearlyChart", labels, revenues, orders, "Thống kê theo năm", yearlyChartRef);
    setYearlyData({
      totalRevenue: sampleData.reduce((acc, curr) => acc + curr.tongDoanhThu, 0),
      totalOrders: sampleData.reduce((acc, curr) => acc + curr.tongDonHang, 0),
    });
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Thống kê Doanh thu & Đơn hàng</h1>
      <p className="text-muted-foreground">Theo dõi hiệu suất kinh doanh theo ngày, tháng hoặc năm.</p>

      <div className="flex items-center gap-4">
        <label htmlFor="timeFilter" className="font-medium">Chọn khoảng thời gian:</label>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chọn khoảng thời gian" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Theo ngày</SelectItem>
            <SelectItem value="monthly">Theo tháng</SelectItem>
            <SelectItem value="yearly">Theo năm</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {timeFilter === "daily" && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Thống kê theo ngày</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <input
                type="date"
                value={dailyDate}
                onChange={(e) => setDailyDate(e.target.value)}
                className="border rounded-md p-2"
                style={{ width: "350px" }}
              />
              <Button onClick={getDailyStatistics}>Thống kê</Button>
            </div>
            <canvas
              id="dailyChart"
              width="900"
              height="500"
              style={{ margin: "auto", display: "block" }}
            />
            {dailyData && (
              <div className="mt-4">
                <p>Tổng doanh thu: {dailyData.totalRevenue.toLocaleString()} VND</p>
                <p>Tổng đơn hàng: {dailyData.totalOrders.toLocaleString()}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {timeFilter === "monthly" && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Thống kê theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Select value={monthlyYear} onValueChange={setMonthlyYear}>
                <SelectTrigger className="w-[350px]">
                  <SelectValue placeholder="Chọn năm" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={monthlyMonth} onValueChange={setMonthlyMonth}>
                <SelectTrigger className="w-[350px]">
                  <SelectValue placeholder="Chọn tháng" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month.toString()}>Tháng {month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={getMonthlyStatistics}>Thống kê</Button>
            </div>
            <canvas
              id="monthlyChart"
              width="900"
              height="500"
              style={{ margin: "auto", display: "block" }}
            />
            {monthlyData && (
              <div className="mt-4">
                <p>Tổng doanh thu: {monthlyData.totalRevenue.toLocaleString()} VND</p>
                <p>Tổng đơn hàng: {monthlyData.totalOrders.toLocaleString()}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {timeFilter === "yearly" && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Thống kê theo năm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Select value={yearlyYear} onValueChange={setYearlyYear}>
                <SelectTrigger className="w-[350px]">
                  <SelectValue placeholder="Chọn năm" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={getYearlyStatistics}>Thống kê</Button>
            </div>
            <canvas
              id="yearlyChart"
              width="900"
              height="500"
              style={{ margin: "auto", display: "block" }}
            />
            {yearlyData && (
              <div className="mt-4">
                <p>Tổng doanh thu: {yearlyData.totalRevenue.toLocaleString()} VND</p>
                <p>Tổng đơn hàng: {yearlyData.totalOrders.toLocaleString()}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;