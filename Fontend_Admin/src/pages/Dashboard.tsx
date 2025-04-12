import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Chart from "chart.js/auto";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [timeFilter, setTimeFilter] = useState("daily");
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().split("T")[0]);
  const [monthlyYear, setMonthlyYear] = useState("2025");
  const [monthlyMonth, setMonthlyMonth] = useState("1");
  const [yearlyYear, setYearlyYear] = useState("2025");
  const [dailyData, setDailyData] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any>(null);
  const [yearlyData, setYearlyData] = useState<any>(null);
  const [orderStatusData, setOrderStatusData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("revenue"); // Track active tab

  const dailyChartRef = useRef<Chart | null>(null);
  const monthlyChartRef = useRef<Chart | null>(null);
  const yearlyChartRef = useRef<Chart | null>(null);
  const orderStatusChartRef = useRef<Chart | null>(null);

  const years = Array.from({ length: 76 }, (_, i) => 2025 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const API_BASE_URL = "http://localhost:5261/api/ThongKe";

  const createLineChart = (
    canvasId: string,
    labels: string[],
    revenues: number[],
    orders: number[],
    title: string,
    chartRef: React.MutableRefObject<Chart | null>
  ) => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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
          legend: { position: "top" as const },
          tooltip: { mode: "index" as const, intersect: false },
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

  const createPieChart = () => {
    const canvas = document.getElementById("orderStatusChart") as HTMLCanvasElement | null;
    console.log("Canvas found for pie chart:", canvas);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (orderStatusChartRef.current) {
      orderStatusChartRef.current.destroy();
    }

    console.log("Pie chart data:", orderStatusData);
    orderStatusChartRef.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels: orderStatusData.map((item) => item.tenTrangThai),
        datasets: [
          {
            data: orderStatusData.map((item) => item.tongDonHang),
            backgroundColor: [
              "#FF6384", // Chưa xác nhận
              "#36A2EB", // Đang xử lý
              "#FFCE56", // Đang giao
              "#4BC0C0", // Hoàn thành
              "#9966FF", // Đã hủy
            ],
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" as const },
          tooltip: {
            callbacks: {
              label: (context) => `${context.label}: ${context.raw} đơn hàng`,
            },
          },
        },
      },
    });
  };

  const getDailyStatistics = async () => {
    if (!dailyDate) return;

    const [year, month, day] = dailyDate.split("-");
    try {
      const response = await fetch(`${API_BASE_URL}/Daily?year=${year}&month=${month}&day=${day}`);
      if (!response.ok) throw new Error("Failed to fetch daily statistics");
      const data = await response.json();

      const labels = data.map((x: any) => `${x.ngay}/${x.thang}/${x.nam}`);
      const revenues = data.map((x: any) => x.tongDoanhThu);
      const orders = data.map((x: any) => x.tongDonHang);

      createLineChart("dailyChart", labels, revenues, orders, "Thống kê theo ngày", dailyChartRef);
      setDailyData({
        totalRevenue: data.reduce((acc: number, curr: any) => acc + curr.tongDoanhThu, 0),
        totalOrders: data.reduce((acc: number, curr: any) => acc + curr.tongDonHang, 0),
      });
    } catch (error) {
      console.error("Error fetching daily statistics:", error);
      setDailyData(null);
    }
  };

  const getMonthlyStatistics = async () => {
    if (!monthlyYear || !monthlyMonth) return;

    try {
      const response = await fetch(`${API_BASE_URL}/Monthly?year=${monthlyYear}&month=${monthlyMonth}`);
      if (!response.ok) throw new Error("Failed to fetch monthly statistics");
      const data = await response.json();

      const labels = data.map((x: any) => `${x.ngay}/${x.thang}/${x.nam}`);
      const revenues = data.map((x: any) => x.tongDoanhThu);
      const orders = data.map((x: any) => x.tongDonHang);

      createLineChart("monthlyChart", labels, revenues, orders, "Thống kê theo tháng", monthlyChartRef);
      setMonthlyData({
        totalRevenue: data.reduce((acc: number, curr: any) => acc + curr.tongDoanhThu, 0),
        totalOrders: data.reduce((acc: number, curr: any) => acc + curr.tongDonHang, 0),
      });
    } catch (error) {
      console.error("Error fetching monthly statistics:", error);
      setMonthlyData(null);
    }
  };

  const getYearlyStatistics = async () => {
    if (!yearlyYear) return;

    try {
      const response = await fetch(`${API_BASE_URL}/Yearly?year=${yearlyYear}`);
      if (!response.ok) throw new Error("Failed to fetch yearly statistics");
      const data = await response.json();

      const labels = data.map((x: any) => `${x.ngay}/${x.thang}/${x.nam}`);
      const revenues = data.map((x: any) => x.tongDoanhThu);
      const orders = data.map((x: any) => x.tongDonHang);

      createLineChart("yearlyChart", labels, revenues, orders, "Thống kê theo năm", yearlyChartRef);
      setYearlyData({
        totalRevenue: data.reduce((acc: number, curr: any) => acc + curr.tongDoanhThu, 0),
        totalOrders: data.reduce((acc: number, curr: any) => acc + curr.tongDonHang, 0),
      });
    } catch (error) {
      console.error("Error fetching yearly statistics:", error);
      setYearlyData(null);
    }
  };

  const getOrderStatusStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/OrderStatus`);
      if (!response.ok) throw new Error("Failed to fetch order status statistics");
      const data = await response.json();
      console.log("Fetched order status data:", data);
      setOrderStatusData(data);
    } catch (error) {
      console.error("Error fetching order status statistics:", error);
      setOrderStatusData([]);
    }
  };

  useEffect(() => {
    if (timeFilter === "daily") getDailyStatistics();
    else if (timeFilter === "monthly") getMonthlyStatistics();
    else if (timeFilter === "yearly") getYearlyStatistics();
    getOrderStatusStatistics(); // Fetch order status data on mount or filter change
  }, [timeFilter, dailyDate, monthlyYear, monthlyMonth, yearlyYear]);

  useEffect(() => {
    console.log("Active tab:", activeTab, "Order status data:", orderStatusData);
    if (activeTab === "orderStatus" && orderStatusData.length > 0) {
      createPieChart();
    }
  }, [activeTab, orderStatusData]);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Quản Lý Thống Kê</h1>

      <Tabs defaultValue="revenue" onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Danh sách doanh thu</TabsTrigger>
          <TabsTrigger value="orderStatus">Danh sách trạng thái đơn hàng</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <div className="space-y-6">
           
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
        </TabsContent>

        <TabsContent value="orderStatus">
          <div className="space-y-6">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Thống kê trạng thái đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <canvas
                  id="orderStatusChart"
                  width="400"
                  height="400"
                  style={{ margin: "auto", display: "block" }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;