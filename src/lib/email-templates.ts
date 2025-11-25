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
