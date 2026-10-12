import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates an automotive resale value appraisal PDF report for a given prediction.
 * 
 * Format specs:
 * - Clean white background with DriveWorth blue accents
 * - Well-organized vehicle specification tables
 * - Clear estimated resale value result section
 * - Short valuation summary disclaimer
 * - Footer with DriveWorth info & generated date
 * 
 * @param {Object} data - The prediction result object containing vehicle specs and predicted_price
 */
export const generatePredictionPDF = (data) => {
  if (!data) return;

  const row = data.vehicle || data;
  const predictedPrice = data.predicted_price || row.predicted_price || 0;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Currency Formatter Helper (Using Rs. format for PDF rendering)
  const formatCurrency = (val) => {
    if (val === null || val === undefined || val === 0) return 'Not Provided';
    const num = Number(val);
    if (isNaN(num)) return 'Not Provided';
    return 'Rs. ' + new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(num);
  };

  const currentDateObj = new Date();
  const formattedDate = currentDateObj.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const predYear = currentDateObj.getFullYear();
  const vehicleAge = Number(row.vehicle_age || 0);
  const manufacturingYear = predYear - vehicleAge;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // --- Top Decorative Blue Accent Line ---
  doc.setFillColor(30, 64, 175); // #1E40AF Deep Royal Blue
  doc.rect(0, 0, pageWidth, 4, 'F');

  // --- 1. DriveWorth Branding & Header ---
  doc.setTextColor(30, 64, 175);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('DRIVEWORTH', margin, 17);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Used Car Resale Valuation Report', margin, 23);

  // Right: Appraisal Date Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 64, 175);
  doc.text('VALUATION REPORT', pageWidth - margin, 17, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Appraisal Date: ${formattedDate}`, pageWidth - margin, 23, { align: 'right' });

  // Horizontal divider line below header
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, 27, pageWidth - margin, 27);

  let currentY = 34;

  // --- 2. Vehicle Specifications Section ---
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, contentWidth, 7, 'F');
  doc.setTextColor(30, 64, 175);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('1. VEHICLE SPECIFICATIONS', margin + 3, currentY + 5);

  currentY += 10;

  const specsData = [
    [
      { content: 'Brand', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } },
      { content: String(row.brand || 'N/A'), styles: { fontStyle: 'bold', textColor: [15, 23, 42] } },
      { content: 'Model', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } },
      { content: String(row.model || 'N/A'), styles: { fontStyle: 'bold', textColor: [15, 23, 42] } },
    ],
    [
      { content: 'Age / Approx Year', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } },
      { content: `${vehicleAge} ${vehicleAge === 1 ? 'Year' : 'Years'} Old (~${manufacturingYear})`, styles: { textColor: [15, 23, 42] } },
      { content: 'Fuel Type', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } },
      { content: String(row.fuel_type || 'N/A'), styles: { textColor: [15, 23, 42] } },
    ],
    [
      { content: 'Transmission', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } },
      { content: String(row.transmission || 'N/A'), styles: { textColor: [15, 23, 42] } },
      { content: 'Engine Capacity', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } },
      { content: `${row.engine} CC`, styles: { textColor: [15, 23, 42] } },
    ],
    [
      { content: 'Max Power', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } },
      { content: `${row.max_power} bhp`, styles: { textColor: [15, 23, 42] } },
      { content: 'Seats', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } },
      { content: `${row.seats} Seater`, styles: { textColor: [15, 23, 42] } },
    ],
    [
      { content: 'Kilometres Driven', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } },
      { content: `${Number(row.km_driven || 0).toLocaleString('en-IN')} km`, styles: { textColor: [15, 23, 42] } },
      { content: 'Mileage', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } },
      { content: `${row.mileage} km/l`, styles: { textColor: [15, 23, 42] } },
    ],
    [
      { content: 'Seller Type', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } },
      { content: String(row.seller_type || 'Individual'), styles: { textColor: [15, 23, 42] } },
      { content: '', styles: {} },
      { content: '', styles: {} },
    ]
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    body: specsData,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3,
      lineColor: [226, 232, 240],
      lineWidth: 0.3,
    },
    columnStyles: {
      0: { cellWidth: 35, fillColor: [248, 250, 252] },
      1: { cellWidth: 55 },
      2: { cellWidth: 35, fillColor: [248, 250, 252] },
      3: { cellWidth: 55 },
    },
  });

  currentY = doc.lastAutoTable.finalY + 9;

  // --- 3. Valuation Result Section ---
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, contentWidth, 7, 'F');
  doc.setTextColor(30, 64, 175);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('2. VALUATION RESULT', margin + 3, currentY + 5);

  currentY += 10;

  // Highlight Box for Estimated Resale Value
  const boxHeight = 22;
  doc.setFillColor(236, 253, 245); // Emerald light fill #ECFDF5
  doc.setDrawColor(167, 243, 208); // Emerald border #A7F3D0
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, currentY, contentWidth, boxHeight, 2, 2, 'FD');

  doc.setTextColor(4, 120, 87); // Emerald 700
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('ESTIMATED RESALE VALUE', margin + 6, currentY + 7);

  doc.setFontSize(18);
  doc.text(formatCurrency(predictedPrice), margin + 6, currentY + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Estimated resale market valuation generated by DriveWorth', pageWidth - margin - 6, currentY + 13, { align: 'right' });

  currentY += boxHeight + 9;

  // --- 4. Short Valuation Summary & Disclaimer Section ---
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, contentWidth, 7, 'F');
  doc.setTextColor(30, 64, 175);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('3. VALUATION SUMMARY & DISCLAIMER', margin + 3, currentY + 5);

  currentY += 10;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  const summaryBoxHeight = 25;
  doc.roundedRect(margin, currentY, contentWidth, summaryBoxHeight, 2, 2, 'FD');

  const summaryLines = [
    "DriveWorth estimates resale values based on vehicle specifications and historical used-car data.",
    "The valuation is calculated by analyzing vehicle attributes including age, distance driven,",
    "fuel efficiency, transmission, engine specifications, and seller category.",
    "This estimated resale value is provided for informational purposes and is not a guaranteed transaction offer."
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  let lineY = currentY + 5;
  summaryLines.forEach((line) => {
    doc.text(line, margin + 4, lineY);
    lineY += 4.5;
  });

  // --- 5. Footer Section ---
  const footerY = pageHeight - 12;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 64, 175);
  doc.text('DriveWorth', margin, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(' Used Car Resale Price Valuation Platform', margin + 17, footerY);

  doc.text(`Generated: ${formattedDate}`, pageWidth - margin, footerY, { align: 'right' });

  // Filename format: DriveWorth_<Brand>_<Model>_Report.pdf
  const cleanBrand = (row.brand || 'Vehicle').trim().replace(/[^a-zA-Z0-9]/g, '_');
  const cleanModel = (row.model || 'Model').trim().replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `DriveWorth_${cleanBrand}_${cleanModel}_Valuation.pdf`;

  // Download PDF file
  doc.save(fileName);
};
