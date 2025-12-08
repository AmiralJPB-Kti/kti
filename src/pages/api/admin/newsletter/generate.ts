import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialisation de l'IA uniquement si la clé est présente
const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  // Vérification basique de sécurité (à renforcer si besoin avec une session admin)
  // Pour l'instant, on suppose que cette route est protégée par le contexte de l'app ou l'obscurité relative,
  // mais idéalement elle devrait vérifier l'authentification admin comme les autres routes admin.

  if (!apiKey || !genAI) {
    return res.status(500).json({ 
      message: 'La clé API Google Gemini n\'est pas configurée sur le serveur. Ajoutez GOOGLE_GEMINI_API_KEY dans vos variables d\'environnement.' 
    });
  }

  const { prompt, type } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Le texte à améliorer est manquant.' });
  }

  try {
    // Configuration du modèle (aligné sur l'Assistant IA qui fonctionne)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    let systemInstruction = '';
    
    if (type === 'subject') {
      systemInstruction = `
        Tu es un expert en marketing digital spécialisé dans l'e-commerce familial et artisanal.
        Ta mission : Rédiger 3 propositions de sujets d'email (Objet) percutants, courts et chaleureux basés sur le texte fourni.
        Le ton doit être : Amical, enthousiaste, mais professionnel.
        Important : Utilise des émojis avec parcimonie mais efficacité.
        Format de réponse : Renvoie UNIQUEMENT les 3 propositions séparées par un saut de ligne, sans texte d'introduction.
      `;
    } else {
      // Default: Amélioration du corps du message
      systemInstruction = `
        Tu es un assistant de rédaction pour "Kt'i", une boutique familiale d'objets déco et pratiques.
        Ta mission : Réécrire et améliorer le brouillon de newsletter suivant.
        
        Consignes de style :
        - Ton : Chaleureux, proche des clients (tutoiement ou vouvoiement léger, style "famille"), bienveillant.
        - Structure : Aère le texte avec des sauts de ligne. Utilise des listes à puces si nécessaire.
        - Orthographe : Parfaite.
        - Call-to-Action : Invite subtilement à cliquer sur le bouton (ne pas créer le bouton, juste le texte qui mène vers lui).
        
        Texte brouillon à améliorer :
        "${prompt}"
        
        Format de réponse : Renvoie UNIQUEMENT le texte amélioré, prêt à être collé dans l'éditeur.
      `;
    }

    // Construction d'une instruction unique (comme dans l'Assistant IA)
    const promptFinal = type === 'subject' 
      ? `${systemInstruction}\n\nTexte de base : "${prompt}"`
      : systemInstruction;

    const result = await model.generateContent(promptFinal);
    
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ generatedText: text.trim() });

  } catch (error: any) {
    console.error('Erreur Gemini:', error);
    // Renvoie le message d'erreur détaillé pour le débogage
    res.status(500).json({ 
      message: 'Erreur IA : ' + (error.message || 'Erreur inconnue lors de la génération.') 
    });
  }
}
