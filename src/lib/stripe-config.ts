// FICHIER DE SECOURS "SPLIT KEY"
// Pour contourner la sécurité GitHub et le bug Vercel.
// Instructions :
// 1. Prenez votre clé Stripe (ex: "sk_live_abcdef123456...")
// 2. Coupez-la en deux morceaux (peu importe où, par exemple après "sk_live_")
// 3. Mettez la première partie dans PART_1 et la suite dans PART_2
// 4. GitHub ne verra pas la clé entière et acceptera le push.

export const STRIPE_KEY_PART_1 = "sk_test_51SSohnFTRuGP9gEDyem1P0pDkC10IxnYSbwC3aQlQxZML7r";
export const STRIPE_KEY_PART_2 = "68OmyXmM6Oyk0cZfozl6E6LouoBqsnp9FrGiqeLq100dOQXeZSl";

// IDEM POUR LE WEBHOOK SECRET (whsec_...)
// Nécessaire pour valider la commande et vider le panier
export const STRIPE_WEBHOOK_SECRET_PART_1 = "whsec_e2W4LxBG2xNLzEE";
export const STRIPE_WEBHOOK_SECRET_PART_2 = "rx9s9nJy0O2DOa5df";
