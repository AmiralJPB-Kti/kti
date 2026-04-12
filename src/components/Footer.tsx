import Link from 'next/link';
import { useState, useEffect } from 'react';
import { client } from '@/sanity/lib/client';
import Newsletter from './Newsletter';
import { FaInstagram, FaFacebookF, FaEnvelope } from 'react-icons/fa'; // Assurez-vous d'avoir react-icons installé, sinon on utilisera du texte ou des svg simples

interface FooterSettings {
  footerText?: string;
  contactEmail?: string;
  instagramLink?: string;
  facebookLink?: string;
}

const Footer = () => {
  const [settings, setSettings] = useState<FooterSettings | null>(null);

  useEffect(() => {
    // Récupération des données Footer uniquement
    const fetchSettings = async () => {
      try {
        // On cherche spécifiquement le document singleton 'siteSettings'
        // Si on ne précise pas l'ID, on risque de récupérer un vieux document orphelin
        const query = `*[_type == "siteSettings" && _id == "siteSettings"][0]{
          footerText,
          contactEmail,
          instagramLink,
          facebookLink
        }`;
        const data = await client.fetch(query);
        setSettings(data);
      } catch (error) {
        console.error("Erreur chargement footer:", error);
      }
    };

    fetchSettings();
  }, []);

  return (
    <footer className="bg-[#1c1c1c] text-gray-300 py-12 mt-16">
      <div className="container mx-auto px-4 text-center"> {/* Container global centré */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 justify-items-center">
          
          {/* Colonne 1 (mobile) / Colonne 3 (desktop) : Newsletter */}
          <div className="md:order-3 w-full flex flex-col items-center">
             <div className="w-full max-w-xs mx-auto text-center">
                <Newsletter />
             </div>
             
             {/* Réseaux Sociaux (Sous la newsletter) */}
             <div className="flex gap-4 mt-6 justify-center">
                {settings?.instagramLink && (
                  <a href={settings.instagramLink} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-full hover:bg-pink-700 hover:text-white transition-all" aria-label="Instagram">
                    <FaInstagram size={20} />
                  </a>
                )}
                {settings?.facebookLink && (
                  <a href={settings.facebookLink} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-full hover:bg-blue-600 hover:text-white transition-all" aria-label="Facebook">
                    <FaFacebookF size={20} />
                  </a>
                )}
                {settings?.contactEmail && (
                  <a href={`mailto:${settings.contactEmail}`} className="p-2 bg-gray-800 rounded-full hover:bg-gray-600 hover:text-white transition-all" aria-label="Email">
                    <FaEnvelope size={20} />
                  </a>
                )}
             </div>
          </div>

          {/* Colonne 2 : L'Atelier */}
          <div className="md:order-2 w-full flex flex-col items-center">
            <h3 className="text-white font-heading text-xl mb-4 w-full text-center">L'Atelier Kt'i</h3>
            <p className="text-sm leading-loose mb-4 max-w-xs mx-auto font-sans text-center">
              {settings?.footerText || "Créations artisanales uniques, faites main avec passion. Chaque pièce raconte une histoire."}
            </p>
          </div>

          {/* Colonne 3 (mobile) / Colonne 1 (desktop) : Navigation */}
          <div className="md:order-1 w-full" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <h3 className="text-white font-heading text-xl mb-4" style={{ fontFamily: 'var(--font-lato), sans-serif', width: '100%', textAlign: 'center' }}>Informations</h3>
            
            {/* Conteneur de liens HORIZONTAL */}
            <div className="flex flex-row flex-wrap justify-center items-center w-full text-[10px] uppercase tracking-widest" style={{ fontFamily: 'var(--font-lato), sans-serif' }}>
              
              <span className="px-2">
                <Link href="/legal/mentions-legales" className="hover:text-white transition-colors whitespace-nowrap">
                  Mentions Légales
                </Link>
              </span>

              <span className="text-gray-600 select-none">|</span>

              <span className="px-2">
                <Link href="/legal/cgv" className="hover:text-white transition-colors whitespace-nowrap">
                  CGV
                </Link>
              </span>

              <span className="text-gray-600 select-none">|</span>

              <span className="px-2">
                <Link href="/contact?subject=Livraison et Retours" className="hover:text-white transition-colors whitespace-nowrap">
                  Livraison & Retours
                </Link>
              </span>

              <span className="text-gray-600 select-none">|</span>

              <span className="px-2">
                <Link href="/contact" className="hover:text-white transition-colors whitespace-nowrap">
                  Contact
                </Link>
              </span>

            </div>
          </div>
        </div>

        {/* Bas de page : Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex justify-center items-center w-full" style={{ fontFamily: 'var(--font-lato), sans-serif' }}>
          <p className="text-xs text-gray-600 text-center">&copy; {new Date().getFullYear()} Kt'i. Tous droits réservés. | Site réalisé avec ❤️</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;