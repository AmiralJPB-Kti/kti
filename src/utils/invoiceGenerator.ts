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
  `Email: ${process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'kti@badie.eu'}`,
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
          doc.text(`Réf. Transaction Stripe :`, 140, 34);
          doc.setFontSize(8);
          // Apply text wrapping to the long Stripe ID
          const stripeId = order.stripe_session_id || '-';
          const MAX_STRIPE_ID_WIDTH = 55; // Adjust as needed to fit the column
          const wrappedStripeId = doc.splitTextToSize(stripeId, MAX_STRIPE_ID_WIDTH);
          
          let currentStripeIdY = 39; // Starting Y position below the label
          wrappedStripeId.forEach(line => {
              doc.text(line, 140, currentStripeIdY); // Align left with the label
              currentStripeIdY += 3.5; // Increment Y for each wrapped line (smaller increment due to smaller font)
          });
        }
      
        // --- CLIENT INFO ---
        // Prioritize Billing Info if available (New System)
        let clientName = order.billing_name;
        let clientAddr: string[] = [];

        if (clientName) {
          // Case A: Billing Info Exists (New Orders)
          clientAddr = [
            order.billing_address_line1,
            `${order.billing_postal_code || ''} ${order.billing_city || ''}`,
            order.billing_country || ''
          ].filter(Boolean); // Remove empty lines
        } else {
          // Case B: Legacy / Fallback / Offline
          if (order.source === 'offline') {
             clientName = order.customer_name_offline || 'Client Comptoir';
          } else {
             // Web Order Fallback
             const shippingName = order.shipping_street ? order.shipping_street.split('\n')[0] : '';
             
             if (order.source === 'stripe' && order.shipping_street && order.shipping_street.includes('[Relais]')) {
                // Relay delivery: The shipping_street starts with "[Relais] Name..."
                // We MUST NOT use this as the Client Name on the invoice.
                // Try to get a name from user metadata, email, or generic.
                clientName = order.billing_name || (order.user?.email ? `Client (${order.user.email})` : 'Client Web');
                clientAddr = []; // Do not show Relay address as billing address
             } else {
                // Standard Home Delivery
                clientName = shippingName || 'Client Web';
                if (order.shipping_street) {
                  clientAddr = [
                    order.shipping_street,
                    `${order.shipping_postal_code || ''} ${order.shipping_city || ''}`,
                    order.shipping_country || ''
                  ];
                }
             }
          }
        }
      
        // Safe access to email (order.user might be missing due to API optimization)
        const clientEmail = order.source === 'offline'
          ? (order.customer_email_offline || '')
          : (order.user?.email || '');
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

    // --- DELIVERY INFO (Right Column) ---
    // Display shipping address if available (Home or Relay)
    if (order.shipping_street) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Livré à :", 110, yPos + 15); // Right column start

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(44, 44, 44);
      
      // 1. Prepare raw lines based on Relay or Home logic
      let addressLines: string[] = [];
      const rawStreet = order.shipping_street;

      if (rawStreet.includes('[Relais]')) {
          // Relay Logic: Clean tag and split Name / Address
          const cleanStr = rawStreet.replace('[Relais]', '').trim();
          // Usually format is "Shop Name - Address"
          const parts = cleanStr.split(' - ');
          if (parts.length >= 2) {
              addressLines.push(parts[0].trim()); // Line 1: Shop Name
              addressLines.push(parts.slice(1).join(' - ').trim()); // Line 2: Address
          } else {
              addressLines.push(cleanStr);
          }
      } else {
          // Home Logic
          addressLines.push(rawStreet);
      }

      // Add Standard City/Country lines
      addressLines.push(`${order.shipping_postal_code || ''} ${order.shipping_city || ''}`);
      if (order.shipping_country) addressLines.push(order.shipping_country);

      addressLines = addressLines.filter(Boolean);

      // 2. Render with Auto-Wrapping (max width ~85mm to stay on page)
      const MAX_WIDTH = 85;
      let dAddrY = yPos + 22;

      addressLines.forEach(line => {
        // Split long text into multiple lines that fit MAX_WIDTH
        const wrappedLines = doc.splitTextToSize(line, MAX_WIDTH);
        doc.text(wrappedLines, 110, dAddrY);
        
        // Increment Y based on how many lines were actually drawn
        dAddrY += (wrappedLines.length * 5);
      });
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
