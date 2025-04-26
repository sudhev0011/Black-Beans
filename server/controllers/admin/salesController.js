const Order = require("../../models/orderModel");
const { subDays, subWeeks, subMonths, subYears, startOfDay, endOfDay } = require("date-fns");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");

const salesReportController = {

generateSalesReport: async (req, res) => {
    try {
      const {
        period ,
        startDate,
        endDate,
        page = 1,
        limit = 10,
        search = "",
        downloadAll = false,
      } = req.query;

      let start, end;
      const today = new Date();

      switch (period) {
        case "day":
          start = startOfDay(subDays(today, 1));
          end = endOfDay(today);
          break;
        case "week":
          start = startOfDay(subWeeks(today, 1));
          end = endOfDay(today);
          break;
        case "month":
          start = startOfDay(subMonths(today, 1));
          end = endOfDay(today);
          break;
        case "year":
          start = startOfDay(subYears(today, 1));
          end = endOfDay(today);
          break;
        case "custom":
          if (!startDate || !endDate) {
            return res.status(400).json({ message: "Start and end dates are required for custom period" });
          }
          start = startOfDay(new Date(startDate));
          end = endOfDay(new Date(endDate));
          break;
        default:
          return res.status(400).json({ message: "Invalid period" });
      }

      const query = {
        createdAt: {
          $gte: start,
          $lte: end,
        },
        status: "delivered",
      };

      if (search) {
        query.$or = [
          { orderId: { $regex: search, $options: "i" } },
          { "shippingAddress.fullname": { $regex: search, $options: "i" } },
        ];
      }

      const totalOrders = await Order.countDocuments(query);

      let ordersQuery = Order.find(query)
        .populate("user", "username")
        .sort({ createdAt: -1 });

      if (!downloadAll) {
        ordersQuery = ordersQuery
          .skip((page - 1) * limit)
          .limit(parseInt(limit));
      }

      const orders = await ordersQuery;

      // Aggregation for chart data
      let groupBy;
      switch (period) {
        case "day":
          groupBy = {
            $dateToString: { format: "%Y-%m-%d %H:00", date: "$createdAt" },
          };
          break;
        case "week":
          groupBy = {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          };
          break;
        case "month":
          groupBy = {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          };
          break;
        case "year":
          groupBy = {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          };
          break;
        case "custom":
          groupBy = {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          };
          break;
        default:
          groupBy = {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          };
      }

      const aggregatedData = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            status: "delivered",
          },
        },
        {
          $group: {
            _id: groupBy,
            totalRevenue: { $sum: "$total" },
            orderCount: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      const report = {
        period,
        startDate: start,
        endDate: end,
        orders,
        overallSalesCount: orders.reduce((sum, order) => sum + order.items.reduce((acc, item) => acc + item.quantity, 0), 0),
        overallOrderCount: orders.length,
        overallOrderAmount: orders.reduce((sum, order) => sum + order.total, 0),
        overallDiscount: orders.reduce((sum, order) => sum + (order.discount || 0), 0),
        overallCouponDiscount: orders.reduce((sum, order) => sum + (order.appliedCoupons?.reduce((acc, coupon) => acc + coupon.discount, 0) || 0), 0),
        chartData: aggregatedData.map(item => ({
          date: item._id,
          revenue: item.totalRevenue,
          orders: item.orderCount,
        })),
      };

      if (!downloadAll) {
        report.currentPage = parseInt(page);
        report.totalPages = Math.ceil(totalOrders / limit);
        report.totalOrders = totalOrders;
      }

      res.json(report);
    } catch (error) {
      console.error("Error generating sales report:", error);
      res.status(500).json({ message: "Error generating sales report", error: error.message });
    }
  },

  exportSalesReportPDF: async (req, res) => {
    try {
      const { period, startDate, endDate } = req.query;
  
      let start, end;
      const today = new Date();
  
      switch (period) {
        case "day":
          start = startOfDay(subDays(today, 1));
          end = endOfDay(today);
          break;
        case "week":
          start = startOfDay(subWeeks(today, 1));
          end = endOfDay(today);
          break;
        case "month":
          start = startOfDay(subMonths(today, 1));
          end = endOfDay(today);
          break;
        case "year":
          start = startOfDay(subYears(today, 1));
          end = endOfDay(today);
          break;
        case "custom":
          if (!startDate || !endDate) {
            return res.status(400).json({ message: "Start and end dates are required for custom period" });
          }
          start = startOfDay(new Date(startDate));
          end = endOfDay(new Date(endDate));
          break;
        default:
          return res.status(400).json({ message: "Invalid period" });
      }
  
      const orders = await Order.find({
        createdAt: { $gte: start, $lte: end },
        status: "delivered",
      }).populate("user", "username").populate('items.productId', 'name').lean();
      console.log('orders fron the sales report',orders);
      
  
      // Calculate summary data
      const totalOrders = orders.length;
      const totalItemsSold = orders.reduce((sum, order) => sum + order.items.reduce((acc, item) => acc + item.quantity, 0), 0);
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      const totalDiscount = orders.reduce((sum, order) => sum + (order.discount || 0), 0);
      const totalCouponDiscount = orders.reduce((sum, order) => sum + (order.appliedCoupons?.reduce((acc, coupon) => acc + coupon.discount, 0) || 0), 0);
  
      // Get top-selling products
      const productSales = {};
      orders.forEach(order => {
        order.items.forEach(item => {
          if (productSales[item.productId]) {
            productSales[item.productId].quantity += item.quantity;
            productSales[item.productId].revenue += item.price * item.quantity;
          } else {
            productSales[item.productId] = {
              name: item.productId.name,
              quantity: item.quantity,
              revenue: item.price * item.quantity
            };
          }
        });
      });
  
      const topProducts = Object.entries(productSales)
        .map(([id, data]) => ({
          id,
          name: data.name,
          quantity: data.quantity,
          revenue: data.revenue
        }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
  
      // Create a new PDF document
      const doc = new PDFDocument({
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        size: 'A4',
        info: {
          Title: `Sales Report - ${period}`,
          Author: 'Admin Dashboard',
          Subject: 'Sales Report',
        }
      });
  
      // Set response headers for file download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=sales-report-${period}.pdf`);
      doc.pipe(res);
  
      // Helper function to draw a colored rectangle
      const drawRect = (x, y, width, height, color) => {
        doc.rect(x, y, width, height)
          .fill(color);
      };
  
      // Helper function for creating tables
      const createTable = (headers, data, startX, startY, options = {}) => {
        const { rowHeight = 30, columnWidths, textColor = '#000000', headerBgColor = '#4F46E5', headerTextColor = '#FFFFFF', zebra = true, zebraColor = '#F3F4F6' } = options;
        
        let currentY = startY;
        const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const tableWidth = columnWidths ? columnWidths.reduce((sum, w) => sum + w, 0) : pageWidth;
        
        // Calculate column widths if not provided
        const colWidths = columnWidths || headers.map(() => tableWidth / headers.length);
        
        // Draw header row
        let currentX = startX;
        drawRect(startX, currentY, tableWidth, rowHeight, headerBgColor);
        
        headers.forEach((header, i) => {
          doc.font('Helvetica-Bold')
             .fontSize(10)
             .fill(headerTextColor)
             .text(
                header, 
                currentX + 5, 
                currentY + rowHeight / 3, 
                { width: colWidths[i] - 10, align: 'left' }
             );
          currentX += colWidths[i];
        });
        
        currentY += rowHeight;
        
        // Draw data rows
        data.forEach((row, rowIndex) => {
          // Check for page overflow and add a new page if necessary
          if (currentY + rowHeight > doc.page.height - doc.page.margins.bottom) {
            doc.addPage();
            currentY = doc.page.margins.top;
          }
          
          // Draw zebra striping
          if (zebra && rowIndex % 2 === 1) {
            drawRect(startX, currentY, tableWidth, rowHeight, zebraColor);
          }
          
          // Draw cell data
          currentX = startX;
          headers.forEach((_, i) => {
            const cellValue = row[i] !== undefined ? row[i].toString() : '';
            doc.font('Helvetica')
               .fontSize(9)
               .fill(textColor)
               .text(
                  cellValue, 
                  currentX + 5, 
                  currentY + rowHeight / 3, 
                  { width: colWidths[i] - 10, align: ['number', 'currency'].includes(typeof row[i]) ? 'right' : 'left' }
               );
            currentX += colWidths[i];
          });
          
          currentY += rowHeight;
        });
        
        return currentY; // Return the Y position after the table
      };
  
      // Add company logo or title
      doc.font('Helvetica-Bold')
         .fontSize(24)
         .fillColor('#333333')
         .text('SALES REPORT', { align: 'center' });
      
      // Add report period subtitle
      doc.font('Helvetica')
         .fontSize(14)
         .fillColor('#666666')
         .text(
           `${period.charAt(0).toUpperCase() + period.slice(1)} Report: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`, 
           { align: 'center' }
         );
      
      // Draw divider line
      doc.moveTo(50, 120)
         .lineTo(doc.page.width - 50, 120)
         .stroke('#CCCCCC');
      
      let yPos = 140;
      
      // Summary boxes with colored backgrounds
      const boxWidth = (doc.page.width - 100 - 30) / 3; // Width of each box (3 boxes in a row with 15px spacing)
      const boxHeight = 80;
      
      // First row of summary boxes
      drawRect(50, yPos, boxWidth, boxHeight, '#4F46E5');
      doc.font('Helvetica-Bold')
         .fontSize(12)
         .fillColor('#FFFFFF')
         .text('TOTAL ORDERS', 50 + 10, yPos + 15, { width: boxWidth - 20 });
      doc.font('Helvetica-Bold')
         .fontSize(22)
         .fillColor('#FFFFFF')
         .text(totalOrders.toString(), 50 + 10, yPos + 40, { width: boxWidth - 20 });
      
      drawRect(50 + boxWidth + 15, yPos, boxWidth, boxHeight, '#10B981');
      doc.font('Helvetica-Bold')
         .fontSize(12)
         .fillColor('#FFFFFF')
         .text('TOTAL ITEMS SOLD', 50 + boxWidth + 15 + 10, yPos + 15, { width: boxWidth - 20 });
      doc.font('Helvetica-Bold')
         .fontSize(22)
         .fillColor('#FFFFFF')
         .text(totalItemsSold.toString(), 50 + boxWidth + 15 + 10, yPos + 40, { width: boxWidth - 20 });
      
      drawRect(50 + (boxWidth + 15) * 2, yPos, boxWidth, boxHeight, '#F59E0B');
      doc.font('Helvetica-Bold')
         .fontSize(12)
         .fillColor('#FFFFFF')
         .text('TOTAL REVENUE', 50 + (boxWidth + 15) * 2 + 10, yPos + 15, { width: boxWidth - 20 });
      doc.font('Helvetica-Bold')
         .fontSize(22)
         .fillColor('#FFFFFF')
         .text(`₹${totalRevenue.toFixed(2)}`, 50 + (boxWidth + 15) * 2 + 10, yPos + 40, { width: boxWidth - 20 });
      
      yPos += boxHeight + 30;
      
      // Second row of summary boxes
      drawRect(50, yPos, boxWidth, boxHeight, '#EF4444');
      doc.font('Helvetica-Bold')
         .fontSize(12)
         .fillColor('#FFFFFF')
         .text('TOTAL DISCOUNT', 50 + 10, yPos + 15, { width: boxWidth - 20 });
      doc.font('Helvetica-Bold')
         .fontSize(22)
         .fillColor('#FFFFFF')
         .text(`₹${totalDiscount.toFixed(2)}`, 50 + 10, yPos + 40, { width: boxWidth - 20 });
      
      drawRect(50 + boxWidth + 15, yPos, boxWidth, boxHeight, '#8B5CF6');
      doc.font('Helvetica-Bold')
         .fontSize(12)
         .fillColor('#FFFFFF')
         .text('COUPON DISCOUNT', 50 + boxWidth + 15 + 10, yPos + 15, { width: boxWidth - 20 });
      doc.font('Helvetica-Bold')
         .fontSize(22)
         .fillColor('#FFFFFF')
         .text(`₹${totalCouponDiscount.toFixed(2)}`, 50 + boxWidth + 15 + 10, yPos + 40, { width: boxWidth - 20 });
      
      drawRect(50 + (boxWidth + 15) * 2, yPos, boxWidth, boxHeight, '#14B8A6');
      doc.font('Helvetica-Bold')
         .fontSize(12)
         .fillColor('#FFFFFF')
         .text('AVG ORDER VALUE', 50 + (boxWidth + 15) * 2 + 10, yPos + 15, { width: boxWidth - 20 });
      doc.font('Helvetica-Bold')
         .fontSize(22)
         .fillColor('#FFFFFF')
         .text(`₹${totalOrders ? (totalRevenue / totalOrders).toFixed(2) : '0.00'}`, 50 + (boxWidth + 15) * 2 + 10, yPos + 40, { width: boxWidth - 20 });
      
      yPos += boxHeight + 50;
      
      doc.font('Helvetica-Bold')
         .fontSize(16)
         .fillColor('#333333')
         .text('Top 5 Products', 50, yPos);
      
      yPos += 25;
      
      const topProductsHeaders = ['Product Name', 'Quantity Sold', 'Revenue'];
      const topProductsData = topProducts.map(product => [
        product.name,
        product.quantity.toString(),
        `₹${product.revenue.toFixed(2)}`
      ]);
      
      yPos = createTable(
        topProductsHeaders, 
        topProductsData, 
        50, 
        yPos, 
        {
          columnWidths: [300, 100, 100],
          headerBgColor: '#4F46E5',
          zebra: true
        }
      );
      
      yPos += 50;
      
      if (yPos + 200 > doc.page.height - 50) {
        doc.addPage();
        yPos = 50;
      }
      
      doc.font('Helvetica-Bold')
         .fontSize(16)
         .fillColor('#333333')
         .text('Recent Orders', 50, yPos);
      
      yPos += 25;
      
      const recentOrders = orders.slice(0, 10);
      const ordersHeaders = ['Order ID', 'Customer', 'Date', 'Items', 'Total'];
      const ordersData = recentOrders.map(order => [
        order.orderId || '—',
        order.shippingAddress?.fullname || '—',
        new Date(order.createdAt).toLocaleDateString(),
        order.items.reduce((acc, item) => acc + item.quantity, 0).toString(),
        `₹${order.total.toFixed(2)}`
      ]);
      
      createTable(
        ordersHeaders, 
        ordersData, 
        50, 
        yPos, 
        {
          columnWidths: [100, 150, 100, 50, 100],
          headerBgColor: '#4F46E5',
          zebra: true
        }
      );

      
      doc.end();
    } catch (error) {
      console.error("Error generating PDF report:", error);
      res.status(500).json({ message: "Error generating PDF report", error: error.message });
    }
  },

  exportSalesReportExcel: async (req, res) => {
    try {
      const { period, startDate, endDate } = req.query;

      let start, end;
      const today = new Date();

      switch (period) {
        case "day":
          start = startOfDay(subDays(today, 1));
          end = endOfDay(today);
          break;
        case "week":
          start = startOfDay(subWeeks(today, 1));
          end = endOfDay(today);
          break;
        case "month":
          start = startOfDay(subMonths(today, 1));
          end = endOfDay(today);
          break;
        case "year":
          start = startOfDay(subYears(today, 1));
          end = endOfDay(today);
          break;
        case "custom":
          if (!startDate || !endDate) {
            return res.status(400).json({ message: "Start and end dates are required for custom period" });
          }
          start = startOfDay(new Date(startDate));
          end = endOfDay(new Date(endDate));
          break;
        default:
          return res.status(400).json({ message: "Invalid period" });
      }

      const orders = await Order.find({
        createdAt: { $gte: start, $lte: end },
        status: "delivered",
      }).populate("user", "username");

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sales Report");

      worksheet.columns = [
        { header: "Metric", key: "metric", width: 30 },
        { header: "Value", key: "value", width: 20 },
      ];

      worksheet.addRow({ metric: "Period", value: `${start.toDateString()} - ${end.toDateString()}` });
      worksheet.addRow({ metric: "Total Orders", value: orders.length });
      worksheet.addRow({
        metric: "Total Items Sold",
        value: orders.reduce((sum, order) => sum + order.items.reduce((acc, item) => acc + item.quantity, 0), 0),
      });
      worksheet.addRow({
        metric: "Total Revenue",
        value: `$${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}`,
      });
      worksheet.addRow({
        metric: "Total Discount",
        value: `$${orders.reduce((sum, order) => sum + (order.discount || 0), 0).toFixed(2)}`,
      });
      worksheet.addRow({
        metric: "Total Coupon Discount",
        value: `$${orders.reduce((sum, order) => sum + (order.appliedCoupons?.reduce((acc, coupon) => acc + coupon.discount, 0) || 0), 0).toFixed(2)}`,
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=sales-report-${period}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error("Error generating Excel report:", error);
      res.status(500).json({ message: "Error generating Excel report", error: error.message });
    }
  },
};

module.exports = salesReportController;


