import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialisation de l'IA
const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  if (!apiKey || !genAI) {
    return res.status(500).json({ message: 'Clé API Google manquante.' });
  }

  const { prompt, mode } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Le contexte est manquant.' });
  }

  try {
    // Utilisation du modèle performant Gemini 2.5 Flash
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    let systemInstruction = '';
    
    // Définition des rôles
    switch (mode) {
      case 'payment_reminder':
        systemInstruction = `
          Tu es une assistante comptable efficace, polie mais ferme.
          Ta mission : Rédiger un email de relance de paiement.
          Ton : Professionnel, factuel, respectueux.
          Structure : Rappel du contexte (facture/montant), demande de régularisation, rappel des moyens de paiement, formule de politesse.
          Si le contexte suggère une première relance : sois douce ("oubli probable").
          Si c'est une 2ème ou 3ème : sois plus ferme ("attente de règlement immédiat").
        `;
        break;
        
      case 'supplier_order':
        systemInstruction = `
          Tu es responsable des achats pour une entreprise artisanale.
          Ta mission : Rédiger un email de commande ou de demande de devis à un fournisseur.
          Ton : Direct, précis, professionnel.
          Structure : Salutation, liste claire des besoins (puces), demande de délais/prix, coordonnées de livraison si besoin.
        `;
        break;

      case 'social_post':
        systemInstruction = `
          Tu es Community Manager pour "Kt'i", une marque d'objets déco/pratiques faits main.
          Ta mission : Rédiger un post pour Instagram et Facebook.
          Ton : Engageant, dynamique, créatif, utilisation d'émojis 🎨✨.
          Structure : Accroche visuelle (texte), corps du message court, appel à l'action (Lien en bio / Venez nous voir), Hashtags pertinents à la fin.
        `;
        break;
      
      case 'support_reply':
        systemInstruction = `
          Tu es responsable du Service Après-Vente de Kt'i.
          Ta mission : Répondre à un client (réclamation, question, remerciement).
          Ton : Empathique, rassurant, orienté solution, très poli.
          Règle d'or : "Le client doit se sentir écouté". Toujours remercier pour le message.
        `;
        break;
      
      case 'correction':
        systemInstruction = `
          Tu es un correcteur professionnel et un expert en style.
          Ta mission : Corriger l'orthographe, la grammaire et améliorer la syntaxe du texte fourni, sans en changer le sens ni le ton original.
          Renvoie uniquement le texte corrigé.
        `;
        break;

      default:
        systemInstruction = `
          Tu es un assistant virtuel polyvalent.
          Ta mission : Aider à rédiger un texte clair et professionnel basé sur le contexte fourni.
        `;
    }

    const instructionFinale = `
      ${systemInstruction}
      
      Voici les notes/contexte de l'utilisateur :
      "${prompt}"
      
      Format de réponse : Renvoie UNIQUEMENT le texte final rédigé, prêt à être copié/collé (sans guillemets, sans intro "Voici le texte").
    `;

    const result = await model.generateContent(instructionFinale);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ generatedText: text.trim() });

  } catch (error: any) {
    console.error('Erreur Assistant:', error);
    res.status(500).json({ message: 'Erreur IA : ' + (error.message || 'Inconnue') });
  }
}
