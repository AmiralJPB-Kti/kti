export const welcomeEmailTemplate = (email: string) => `
  <div style="font-family: sans-serif; color: #333;">
    <h1>Bienvenue chez Kt'i !</h1>
    <p>Bonjour,</p>
    <p>Nous sommes ravis de vous compter parmi nous.</p>
    <p>Votre inscription a bien été prise en compte avec l'adresse : <strong>${email}</strong>.</p>
    <p>À très vite sur notre boutique !</p>
    <p>L'équipe Kt'i</p>
  </div>
`;

export const orderConfirmationEmailTemplate = (orderId: string, totalAmount: number, items: any[]) => {
  const itemsHtml = items.map(item => `
    <li style="margin-bottom: 10px;">
      <strong>${item.description}</strong> x ${item.quantity} - ${(item.price.unit_amount / 100).toFixed(2)} €
    </li>
  `).join('');

  return `
    <div style="font-family: sans-serif; color: #333;">
      <h1>Merci pour votre commande !</h1>
      <p>Bonjour,</p>
      <p>Nous avons bien reçu votre commande <strong>#${orderId}</strong>.</p>
      
      <h3>Récapitulatif :</h3>
      <ul>
        ${itemsHtml}
      </ul>
      
      <p><strong>Total : ${totalAmount.toFixed(2)} €</strong></p>
      
      <p>Nous la traiterons dans les plus brefs délais.</p>
      <p>Merci de votre confiance,</p>
      <p>L'équipe Kt'i</p>
    </div>
  `;
};

export const adminNewOrderTemplate = (
  orderId: string, 
  totalAmount: number, 
  items: any[], 
  customerDetails: any, 
  shippingDetails: any,
  isGift: boolean
) => {
  const itemsHtml = items.map(item => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 8px;">${item.description}</td>
      <td style="padding: 8px;">${item.quantity}</td>
      <td style="padding: 8px;">${(item.price.unit_amount / 100).toFixed(2)} €</td>
    </tr>
  `).join('');

  const addressHtml = shippingDetails.mode === 'relay' 
    ? `<p><strong>🏪 POINT RELAIS (Mondial Relay) :</strong><br/>
       Nom : ${shippingDetails.relayName || 'Non spécifié'}<br/>
       Adresse : ${shippingDetails.address.street}<br/>
       ${shippingDetails.address.postal_code} ${shippingDetails.address.city}<br/>
       ${shippingDetails.address.country} (ID: ${shippingDetails.relayId})
       </p>`
    : `<p><strong>🏠 DOMICILE :</strong><br/>
       ${shippingDetails.address.street}<br/>
       ${shippingDetails.address.postal_code} ${shippingDetails.address.city}<br/>
       ${shippingDetails.address.country}
       </p>`;

  return `
    <div style="font-family: sans-serif; color: #333; border: 2px solid #0070f3; padding: 20px; border-radius: 10px;">
      <h2 style="color: #0070f3;">🔔 Nouvelle Commande Reçue !</h2>
      <p><strong>Commande :</strong> #${orderId}</p>
      <p><strong>Montant Total :</strong> ${totalAmount.toFixed(2)} €</p>
      
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />

      <h3>👤 Client</h3>
      <p>
        Nom : <strong>${customerDetails.name}</strong><br/>
        Email : <a href="mailto:${customerDetails.email}">${customerDetails.email}</a>
      </p>

      <h3>📦 Livraison</h3>
      ${addressHtml}
      
      ${isGift ? '<div style="background: #fff3cd; padding: 10px; border-radius: 5px; color: #856404;"><strong>🎁 CADEAU :</strong> Le client a demandé un emballage cadeau !</div>' : ''}

      <h3>🛒 Contenu de la commande</h3>
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="background: #f9f9f9;">
            <th style="padding: 8px;">Produit</th>
            <th style="padding: 8px;">Qté</th>
            <th style="padding: 8px;">Prix</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="margin-top: 30px; text-align: center;">
        <a href="https://kti.badie.eu" style="background: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Aller sur le site</a>
      </div>
    </div>
  `;
};

export const passwordChangedTemplate = (email: string) => `
  <div style="font-family: sans-serif; color: #333;">
    <h1>Sécurité : Mot de passe modifié</h1>
    <p>Bonjour,</p>
    <p>Le mot de passe associé à votre compte <strong>${email}</strong> vient d'être modifié.</p>
    <p>Si vous êtes à l'origine de cette action, vous pouvez ignorer cet email.</p>
    <p>Si vous n'avez pas demandé ce changement, veuillez nous contacter immédiatement.</p>
    <p>L'équipe Kt'i</p>
  </div>
`;

export const dailyReportTemplate = (date: string, orders: any[], totalRevenue: number) => {
  if (orders.length === 0) {
    return `
      <div style="font-family: sans-serif; color: #333;">
        <h1>Rapport du ${date}</h1>
        <p>Aucune commande n'a été passée aujourd'hui.</p>
        <p>À demain !</p>
      </div>
    `;
  }

  const ordersHtml = orders.map(order => {
    const itemsList = order.order_items && order.order_items.length > 0
      ? order.order_items.map((item: any) => `<li>${item.quantity}x ${item.product_name}</li>`).join('')
      : '<li>Aucun article (Erreur ?)</li>';

    return `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 8px;">#${String(order.id).slice(0, 8)}...</td>
        <td style="padding: 8px;">${order.shipping_city || 'N/A'}</td>
        <td style="padding: 8px;">${order.amount_total.toFixed(2)} €</td>
        <td style="padding: 8px;">
            <ul style="margin: 0; padding-left: 15px; font-size: 0.9em;">
                ${itemsList}
            </ul>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div style="font-family: sans-serif; color: #333; border: 2px solid #10B981; padding: 20px; border-radius: 10px;">
      <h2 style="color: #10B981;">📊 Rapport Quotidien : ${date}</h2>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; flex: 1; margin-right: 10px;">
            <strong style="display: block; color: #15803d; font-size: 0.9em;">COMMANDES</strong>
            <span style="font-size: 1.5em; font-weight: bold; color: #15803d;">${orders.length}</span>
        </div>
        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; flex: 1;">
            <strong style="display: block; color: #15803d; font-size: 0.9em;">CHIFFRE D'AFFAIRES</strong>
            <span style="font-size: 1.5em; font-weight: bold; color: #15803d;">${totalRevenue.toFixed(2)} €</span>
        </div>
      </div>

      <h3>Détail des commandes</h3>
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="background: #f9f9f9;">
            <th style="padding: 8px;">Réf</th>
            <th style="padding: 8px;">Ville</th>
            <th style="padding: 8px;">Montant</th>
            <th style="padding: 8px;">Détail</th>
          </tr>
        </thead>
        <tbody>
          ${ordersHtml}
        </tbody>
      </table>
      
      <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
        Ce rapport a été généré automatiquement par votre site Kti.
      </p>
    </div>
  `;
};