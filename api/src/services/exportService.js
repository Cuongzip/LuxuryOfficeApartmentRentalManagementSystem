import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
};

const HEADER_FILL = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
const HEADER_FONT = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
const TITLE_FONT = { bold: true, size: 14 };

const styleHeaderRow = (row) => {
  row.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });
  row.height = 25;
};

const styleDataCell = (cell) => {
  cell.border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };
};


// ============ EXCEL EXPORTS ============

export const exportSummaryToExcel = async (data, res) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Luxury Rental System";
  workbook.created = new Date();

  const { revenueData, contractData, roomData } = data;

  // Sheet 1: Tong quan
  const summarySheet = workbook.addWorksheet("Tong quan");
  summarySheet.columns = [
    { header: "Chi tieu", key: "label", width: 30 },
    { header: "Gia tri", key: "value", width: 25 },
  ];
  styleHeaderRow(summarySheet.getRow(1));
  [
    { label: "Tong doanh thu", value: formatCurrency(revenueData.totalRevenue) },
    { label: "Tong so hop dong", value: contractData.totalCreated },
    { label: "Dang hieu luc", value: contractData.activeCount },
    { label: "Het han", value: contractData.expiredCount },
    { label: "Da huy", value: contractData.cancelledCount },
    { label: "Tong so phong", value: roomData.total },
    { label: "Con trong", value: roomData.available },
    { label: "Dang thue", value: roomData.rented },
    { label: "Bao tri", value: roomData.maintenance },
    { label: "Ty le lap day (%)", value: roomData.occupancyRate + "%" },
  ].forEach((item) => {
    const row = summarySheet.addRow(item);
    row.eachCell(styleDataCell);
  });

  // Sheet 2: Doanh thu
  const revSheet = workbook.addWorksheet("Doanh thu");
  
  // Months table
  revSheet.addRow(["Doanh thu theo thang"]).font = TITLE_FONT;
  revSheet.addRow([]);
  const mHeader = revSheet.addRow(["Thang", "Doanh thu"]);
  styleHeaderRow(mHeader);
  revenueData.byMonth.forEach((m) => {
    const r = revSheet.addRow([m.month, formatCurrency(m.amount)]);
    r.eachCell(styleDataCell);
  });
  revSheet.addRow([]);

  // Buildings table
  revSheet.addRow(["Doanh thu theo toa nha"]).font = TITLE_FONT;
  revSheet.addRow([]);
  const bHeader = revSheet.addRow(["Toa nha", "Doanh thu"]);
  styleHeaderRow(bHeader);
  revenueData.byBuilding.forEach((b) => {
    const r = revSheet.addRow([b.building, formatCurrency(b.amount)]);
    r.eachCell(styleDataCell);
  });
  revSheet.addRow([]);

  // Services table
  revSheet.addRow(["Doanh thu theo dich vu"]).font = TITLE_FONT;
  revSheet.addRow([]);
  const sHeader = revSheet.addRow(["Dich vu", "Doanh thu"]);
  styleHeaderRow(sHeader);
  revenueData.byService.forEach((s) => {
    const r = revSheet.addRow([s.service, formatCurrency(s.amount)]);
    r.eachCell(styleDataCell);
  });

  // Sheet 3: Hop dong
  const conSheet = workbook.addWorksheet("Hop dong");
  conSheet.addRow(["Xu huong hop dong"]).font = TITLE_FONT;
  conSheet.addRow([]);
  const trendHeader = conSheet.addRow(["Thang", "So luong"]);
  styleHeaderRow(trendHeader);
  contractData.trend.forEach((t) => {
    const r = conSheet.addRow([t.month, t.count]);
    r.eachCell(styleDataCell);
  });

  // Sheet 4: Phong
  const roomSheet = workbook.addWorksheet("Phong");
  roomSheet.addRow(["Trang thai phong tung toa nha"]).font = TITLE_FONT;
  roomSheet.addRow([]);
  const rHeader = roomSheet.addRow(["Toa nha", "Tong", "Con trong", "Dang thue", "Bao tri", "Ty le (%)"]);
  styleHeaderRow(rHeader);
  roomData.byBuilding.forEach((b) => {
    const r = roomSheet.addRow([
      b.buildingName,
      b.total,
      b.available,
      b.rented,
      b.maintenance,
      b.occupancyRate + "%",
    ]);
    r.eachCell(styleDataCell);
  });

  revSheet.getColumn(1).width = 25;
  revSheet.getColumn(2).width = 25;
  conSheet.getColumn(1).width = 25;
  conSheet.getColumn(2).width = 25;
  roomSheet.getColumn(1).width = 30;
  roomSheet.getColumn(2).width = 12;
  roomSheet.getColumn(3).width = 12;
  roomSheet.getColumn(4).width = 12;
  roomSheet.getColumn(5).width = 12;
  roomSheet.getColumn(6).width = 15;

  const filename = `bao-cao-tong-hop-${Date.now()}.xlsx`;
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  await workbook.xlsx.write(res);
  res.end();
};

const createPdfDoc = (res, filename) => {
  const doc = new PDFDocument({ margin: 40, size: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  doc.pipe(res);
  return doc;
};

const drawPdfTitle = (doc, title) => {
  doc.fontSize(18).text(title, { align: "center" });
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor("#666666").text(`Ngay xuat: ${new Date().toLocaleDateString("vi-VN")}`, { align: "center" });
  doc.fillColor("#000000");
  doc.moveDown(1);
};

const drawPdfTable = (doc, headers, rows, colWidths) => {
  const startX = doc.x;
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);
  const rowHeight = 22;

  // Header row
  doc.fontSize(9).font("Helvetica-Bold");
  let x = startX;
  doc.rect(x, doc.y, tableWidth, rowHeight).fill("#2563EB");
  const headerY = doc.y + 6;
  headers.forEach((header, i) => {
    doc.fillColor("#FFFFFF").text(header, x + 4, headerY, { width: colWidths[i] - 8, align: "center" });
    x += colWidths[i];
  });
  doc.y = headerY - 6 + rowHeight;

  // Data rows
  doc.font("Helvetica").fontSize(9).fillColor("#000000");
  rows.forEach((row, rowIndex) => {
    const currentY = doc.y;

    // Check if we need a new page
    if (currentY + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
    }

    const bgColor = rowIndex % 2 === 0 ? "#F9FAFB" : "#FFFFFF";
    x = startX;
    doc.rect(x, doc.y, tableWidth, rowHeight).fill(bgColor);

    const dataY = doc.y + 6;
    row.forEach((cell, i) => {
      doc.fillColor("#333333").text(String(cell), x + 4, dataY, { width: colWidths[i] - 8, align: i === 0 ? "left" : "right" });
      x += colWidths[i];
    });
    doc.y = dataY - 6 + rowHeight;
  });

  doc.moveDown(1);
};

export const exportSummaryToPdf = async (data, res) => {
  const filename = `bao-cao-tong-hop-${Date.now()}.pdf`;
  const doc = createPdfDoc(res, filename);

  const { revenueData, contractData, roomData } = data;

  drawPdfTitle(doc, "BAO CAO THONG KE TONG HOP");

  // Summary section
  doc.fontSize(12).font("Helvetica-Bold").text("1. Tong quan chung");
  doc.moveDown(0.5);
  drawPdfTable(
    doc,
    ["Chi tieu", "Gia tri"],
    [
      ["Tong doanh thu", formatCurrency(revenueData.totalRevenue)],
      ["Tong so hop dong", String(contractData.totalCreated)],
      ["Dang hieu luc", String(contractData.activeCount)],
      ["Het han", String(contractData.expiredCount)],
      ["Da huy", String(contractData.cancelledCount)],
      ["Tong so phong", String(roomData.total)],
      ["Con trong", String(roomData.available)],
      ["Dang thue", String(roomData.rented)],
      ["Bao tri", String(roomData.maintenance)],
      ["Ty le lap day", roomData.occupancyRate + "%"],
    ],
    [260, 260]
  );
  doc.moveDown(1);

  // Revenue section
  doc.addPage();
  doc.fontSize(12).font("Helvetica-Bold").text("2. Chi tiet Doanh thu");
  doc.moveDown(0.5);
  
  if (revenueData.byMonth && revenueData.byMonth.length > 0) {
    doc.fontSize(10).font("Helvetica-Bold").text("Doanh thu theo thang");
    doc.moveDown(0.3);
    drawPdfTable(doc, ["Thang", "Doanh thu"], revenueData.byMonth.map(m => [m.month, formatCurrency(m.amount)]), [260, 260]);
  }

  if (revenueData.byBuilding && revenueData.byBuilding.length > 0) {
    doc.fontSize(10).font("Helvetica-Bold").text("Doanh thu theo toa nha");
    doc.moveDown(0.3);
    drawPdfTable(doc, ["Toa nha", "Doanh thu"], revenueData.byBuilding.map(b => [b.building, formatCurrency(b.amount)]), [260, 260]);
  }

  // Contract section
  doc.addPage();
  doc.fontSize(12).font("Helvetica-Bold").text("3. Chi tiet Hop dong");
  doc.moveDown(0.5);
  if (contractData.trend && contractData.trend.length > 0) {
    doc.fontSize(10).font("Helvetica-Bold").text("Xu huong hop dong theo thang");
    doc.moveDown(0.3);
    drawPdfTable(doc, ["Thang", "So luong"], contractData.trend.map(t => [t.month, String(t.count)]), [260, 260]);
  }

  // Room section
  doc.addPage();
  doc.fontSize(12).font("Helvetica-Bold").text("4. Chi tiet Phong");
  doc.moveDown(0.5);
  if (roomData.byBuilding && roomData.byBuilding.length > 0) {
    doc.fontSize(10).font("Helvetica-Bold").text("Trang thai phong theo toa nha");
    doc.moveDown(0.3);
    const colWidths = [120, 60, 70, 70, 70, 70];
    drawPdfTable(
      doc,
      ["Toa nha", "Tong", "Con trong", "Dang thue", "Bao tri", "Ty le (%)"],
      roomData.byBuilding.map(b => [
        b.buildingName,
        String(b.total),
        String(b.available),
        String(b.rented),
        String(b.maintenance),
        b.occupancyRate + "%"
      ]),
      colWidths
    );
  }

  doc.end();
};
