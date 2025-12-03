import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Company Info
const COMPANY_NAME = "Kt'i - Créations Artisanales";
const COMPANY_ADDRESS = [
  "Mme Badie",
  "Adresse de l'atelier",
  "Code Postal Ville",
  "SIRET: XXXXXXXXXXXXXX", // TODO: Replace with real SIRET
  "Email: kti@badie.eu",
  "Site: https://kti.badie.eu"
];

export const generateInvoice = (order: any) => {
  const doc = new jsPDF();

  // --- HEADER ---
  // Logo / Company Name (Left)
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(44, 44, 44); // Dark Grey
  doc.text(COMPANY_NAME, 14, 22);

  // Company Details (Left, below name)
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100); // Lighter Grey
  let yPos = 30;
  COMPANY_ADDRESS.forEach(line => {
    doc.text(line, 14, yPos);
    yPos += 5;
  });

  // Invoice Details (Right)
  doc.setFontSize(10);
  doc.setTextColor(44, 44, 44);
  const invoiceNum = order.invoice_number || `PROVISOIRE-${order.id.substring(0, 8)}`;
  const invoiceDate = new Date(order.created_at).toLocaleDateString('fr-FR');
  
  doc.text(`FACTURE N° :`, 140, 22);
  doc.setFont("helvetica", "bold");
  doc.text(invoiceNum, 170, 22);
  
  doc.setFont("helvetica", "normal");
  doc.text(`Date :`, 140, 28);
  doc.text(invoiceDate, 170, 28);

  if (order.source === 'stripe') {
    doc.text(`Réf. Paiement :`, 140, 34);
    doc.setFontSize(8);
    doc.text(order.stripe_session_id?.substring(0, 15) + '...', 170, 34);
  }

  // --- CLIENT INFO ---
  const clientName = order.source === 'offline' 
    ? (order.customer_name_offline || 'Client Comptoir')
    : (order.shipping_street ? order.shipping_street.split('\n')[0] : 'Client Web');

  const clientEmail = order.source === 'offline'
    ? (order.customer_email_offline || '')
    : order.user?.email || '';

  const clientAddr = order.shipping_street 
    ? [
        order.shipping_street,
        `${order.shipping_postal_code || ''} ${order.shipping_city || ''}`,
        order.shipping_country || ''
      ] 
    : [];

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Facturé à :", 14, yPos + 15);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(44, 44, 44);
  doc.text(clientName, 14, yPos + 22);
  
  if (clientAddr.length > 0) {
    let addrY = yPos + 27;
    clientAddr.forEach(line => {
      if (line) {
        doc.text(line, 14, addrY);
        addrY += 5;
      }
    });
    if (clientEmail) doc.text(clientEmail, 14, addrY);
  } else if (clientEmail) {
    doc.text(clientEmail, 14, yPos + 27);
  }


  // --- ITEMS TABLE ---
  const tableStartY = yPos + 50;
  
  const tableHead = [['Désignation', 'Quantité', 'Prix Unit.', 'Total']];
  const tableBody = order.order_items.map((item: any) => [
    item.product_name,
    item.quantity,
    `${item.price.toFixed(2)} €`,
    `${(item.price * item.quantity).toFixed(2)} €`
  ]);

  autoTable(doc, {
    startY: tableStartY,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    headStyles: { fillColor: [0, 85, 164] }, // Kti Blue
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 'auto' }, // Product Name
      1: { cellWidth: 20, halign: 'center' }, // Qty
      2: { cellWidth: 30, halign: 'right' }, // Unit Price
      3: { cellWidth: 30, halign: 'right' }  // Total
    }
  });

  // --- TOTALS ---
  // @ts-ignore (autoTable adds lastAutoTable property)
  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL À PAYER :`, 140, finalY);
  doc.setFontSize(12);
  doc.setTextColor(0, 85, 164); // Blue
  doc.text(`${order.amount_total.toFixed(2)} €`, 170, finalY);

  // --- FOOTER / LEGAL ---
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.setFont("helvetica", "italic");
  const footerY = 280; // Near bottom of A4
  doc.text("TVA non applicable, art. 293 B du CGI", 105, footerY, { align: 'center' });
  doc.text("Merci pour votre confiance !", 105, footerY + 5, { align: 'center' });

  // Save File
  doc.save(`Facture-${invoiceNum}.pdf`);
};
