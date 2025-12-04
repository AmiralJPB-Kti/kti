import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Company Info
// MODIFIEZ ICI LES INFOS DE VOTRE ENTREPRISE
const COMPANY_NAME = "Kt'i - Créations Artisanales";
const COMPANY_ADDRESS = [
  "Atelier Kt'i'",           // Nom
  "57 CHALET DE TEYCHAN",       // Adresse Ligne 1
  "60 AV DE LA LIBÉRATION",       // Adresse Ligne 2
  "33138 LANTON",             // Code Postal Ville
  "SIRET: 420 058 125 00030",  // SIRET Réel (à vérifier)
  "Email: kti@badie.eu",
  "Site: https://kti.badie.eu"
];

export const generateInvoice = (order: any) => {
  try {
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
    const invoiceNum = order.invoice_number || `PROVISOIRE-${String(order.id || '').substring(0, 8)}`;
    const invoiceDate = order.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
    
    // Align right side info
    doc.text(`FACTURE N° :`, 140, 22);
    doc.setFont("helvetica", "bold");
    doc.text(invoiceNum, 195, 22, { align: 'right' }); // Aligned to right margin
    
    doc.setFont("helvetica", "normal");
    doc.text(`Date :`, 140, 28);
    doc.text(invoiceDate, 195, 28, { align: 'right' });

    if (order.source === 'stripe') {
      doc.text(`Réf. Paiement :`, 140, 34);
      doc.setFontSize(8);
      doc.text(order.stripe_session_id ? (order.stripe_session_id.substring(0, 15) + '...') : '-', 195, 34, { align: 'right' });
    }

    // --- CLIENT INFO ---
    const clientName = order.source === 'offline' 
      ? (order.customer_name_offline || 'Client Comptoir')
      : (order.shipping_street ? order.shipping_street.split('\n')[0] : 'Client Web');

    // Safe access to email (order.user might be missing due to API optimization)
    const clientEmail = order.source === 'offline'
      ? (order.customer_email_offline || '')
      : (order.user?.email || '');

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
    
    const items = Array.isArray(order.order_items) ? order.order_items : [];
    const tableHead = [['Désignation', 'Quantité', 'Prix Unit.', 'Total']];
    const tableBody = items.map((item: any) => {
      const price = typeof item.price === 'number' ? item.price : 0;
      const qty = typeof item.quantity === 'number' ? item.quantity : 1;
      return [
        item.product_name || 'Produit',
        qty,
        `${price.toFixed(2)} €`,
        `${(price * qty).toFixed(2)} €`
      ];
    });

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
    const finalY = doc.lastAutoTable.finalY + 15; // A bit more margin

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 44, 44);
    doc.text(`TOTAL À PAYER :`, 130, finalY); // Moved label left
    
    const total = typeof order.amount_total === 'number' ? order.amount_total : 0;
    doc.setFontSize(14);
    doc.setTextColor(0, 85, 164); // Blue
    doc.text(`${total.toFixed(2)} €`, 195, finalY, { align: 'right' }); // Aligned right

    // --- FOOTER / LEGAL ---
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.setFont("helvetica", "italic");
    const footerY = 280; // Near bottom of A4
    doc.text("TVA non applicable, art. 293 B du CGI", 105, footerY, { align: 'center' });
    doc.text("Merci pour votre confiance !", 105, footerY + 5, { align: 'center' });

    // Save File
    doc.save(`Facture-${invoiceNum}.pdf`);

  } catch (err: any) {
    console.error("Erreur Génération PDF:", err);
    alert(`Erreur lors de la création du PDF : ${err.message}`);
  }
};
