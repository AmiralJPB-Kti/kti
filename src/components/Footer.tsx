import Link from 'next/link';
import Newsletter from './Newsletter';

const Footer = () => {
  return (
    <footer className="bg-[#1c1c1c] text-gray-300 py-12 mt-16">
      <div className="container mx-auto px-4 text-center"> {/* Container global centré */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 justify-items-center">
          
          {/* Colonne 1 (mobile) / Colonne 3 (desktop) : Newsletter */}
          <div className="md:order-3 w-full flex flex-col items-center"> {/* Centrage Flexbox */}
             <div className="w-full max-w-xs mx-auto text-center"> {/* Newsletter Form centré */}
                <Newsletter />
             </div>
          </div>

          {/* Colonne 2 : L'Atelier */}
          <div className="md:order-2 w-full flex flex-col items-center"> {/* Centrage Flexbox */}
            <h3 className="text-white font-heading text-xl mb-4 w-full text-center">L'Atelier Kt'i</h3>
            <p className="text-sm leading-loose mb-4 max-w-xs mx-auto font-sans text-center"> {/* Texte centré */}
              Créations artisanales uniques, faites main avec passion.
              Chaque pièce raconte une histoire.
            </p>
          </div>

          {/* Colonne 3 (mobile) / Colonne 1 (desktop) : Navigation */}
          <div className="md:order-1 w-full" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <h3 className="text-white font-heading text-xl mb-4" style={{ fontFamily: 'var(--font-lato), sans-serif', width: '100%', textAlign: 'center' }}>Informations</h3>
            
            {/* Conteneur de liens HORIZONTAL (Option A) avec Séparateurs Physiques */}
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
                <Link href="/livraison" className="hover:text-white transition-colors whitespace-nowrap">
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