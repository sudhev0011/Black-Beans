import { useState, useEffect } from "react";
import { LineChart, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetSalesReportQuery } from "@/store/api/adminApiSlice";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { format } from "date-fns";

const API_BASE_URL = "https://sudhev.in/backend/api/admin";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

export default function SalesReport() {
  const [reportPeriod, setReportPeriod] = useState("month");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [shouldFetchData, setShouldFetchData] = useState(true);

  const handlePeriodChange = (value) => {
    setReportPeriod(value);
    if (value !== "custom") {
      setShouldFetchData(true);
    } else {
      setShouldFetchData(false);
    }
  };

  const handleApplyCustomDates = () => {
    if (customStartDate && customEndDate) {
      setShouldFetchData(true);
    }
  };

  const { data: reportData, isLoading, error, refetch } = useGetSalesReportQuery(
    {
      period: reportPeriod,
      startDate: reportPeriod === "custom" ? customStartDate : undefined,
      endDate: reportPeriod === "custom" ? customEndDate : undefined,
    },
    {
      skip: reportPeriod === "custom" && (!customStartDate || !customEndDate || !shouldFetchData)
    }
  );

  const handleExportReport = (format) => {
    const queryParams = new URLSearchParams({
      period: reportPeriod,
      ...(reportPeriod === "custom" && customStartDate ? { startDate: customStartDate } : {}),
      ...(reportPeriod === "custom" && customEndDate ? { endDate: customEndDate } : {})
    }).toString();
    
    const endpoint = format === "pdf" 
      ? `/sales-report/export/pdf?${queryParams}`
      : `/sales-report/export/excel?${queryParams}`;
      
    window.open(`${API_BASE_URL}${endpoint}`, '_blank');
  };

  const getChartLabels = () => {
    if (!reportData?.chartData) return [];
    return reportData.chartData.map((item) => {
      const date = new Date(item.date);
      if (reportPeriod === "day") {
        return format(date, "HH:00");
      } else if (reportPeriod === "week" || reportPeriod === "month" || reportPeriod === "custom") {
        return format(date, "MMM dd");
      } else if (reportPeriod === "year") {
        return format(date, "MMM yyyy");
      }
      return item.date;
    });
  };

  const revenueChartData = {
    labels: getChartLabels(),
    datasets: [
      {
        label: "Revenue",
        data: reportData?.chartData?.map((item) => item.revenue) || [],
        borderColor: "#114639",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
      {
        label: "Orders",
        data: reportData?.chartData?.map((item) => item.orders) || [],
        borderColor: "rgb(161, 75, 35)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
      },
    ],
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading report: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sales Reports</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExportReport("excel")}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button variant="outline" onClick={() => handleExportReport("pdf")}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="month" onValueChange={handlePeriodChange}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <TabsList>
            <TabsTrigger value="day">Daily</TabsTrigger>
            <TabsTrigger value="week">Weekly</TabsTrigger>
            <TabsTrigger value="month">Monthly</TabsTrigger>
            <TabsTrigger value="year">Yearly</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          {reportPeriod === "custom" && (
            <div className="flex gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="border rounded px-2 py-1"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="border rounded px-2 py-1"
                placeholder="End Date"
              />
              <Button onClick={handleApplyCustomDates} disabled={!customStartDate || !customEndDate}>
                Apply
              </Button>
            </div>
          )}
        </div>

        <div className="mt-6">
          {["day", "week", "month", "year", "custom"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reportData?.overallOrderCount || 0}</div>
                    <p className="text-xs text-muted-foreground">For selected period</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Items Sold</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reportData?.overallSalesCount || 0}</div>
                    <p className="text-xs text-muted-foreground">For selected period</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₹{(reportData?.overallOrderAmount || 0).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">For selected period</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Discount</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₹{(reportData?.overallDiscount || 0).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">For selected period</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Coupon Discount</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₹{(reportData?.overallCouponDiscount || 0).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">For selected period</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue and Orders Trend</CardTitle>
                  <CardDescription>Revenue and order count over the period</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <Line data={revenueChartData} options={{ maintainAspectRatio: false }} />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}