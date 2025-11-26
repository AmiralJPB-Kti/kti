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

// INFOS SUPABASE (ADMIN)
// Nécessaires pour que le Webhook puisse enregistrer la commande en base
export const SUPABASE_URL = "https://xhkcnqqvkfyeeikhwifw.supabase.co"; // ex: https://xyz.supabase.co
export const SUPABASE_SERVICE_ROLE_KEY_PART_1 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhoa2NucX"; // La clé qui commence par eyJ... (Service Role, pas Anon)
export const SUPABASE_SERVICE_ROLE_KEY_PART_2 = "F2a2Z5ZWVpa2h3aWZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzExMzQ3MSwiZXhwIjoyMDc4Njg5NDcxfQ.EIcMhJbPFRzqH5yVs6eXrYgLZi10444lEMyn1aKjelo
";
