import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { urlFor } from '@/sanity/lib/image';

interface HeroBannerProps {
  settings: {
    tagline?: string;
    heroImage?: any;
    overlayOpacity?: number; // Nouveau champ
    callToActionText?: string;
    callToActionLink?: string;
  };
}

const HeroBanner: React.FC<HeroBannerProps> = ({ settings }) => {
  if (!settings) return null;

  // Calcul de l'opacité : valeur Sanity (0-100) / 100, ou 0.3 par défaut
  const overlayOpacity = settings?.overlayOpacity !== undefined 
    ? settings.overlayOpacity / 100 
    : 0.3;

  // Define the keyframes for the text animation (optimized to only animate opacity)
  const animationKeyframes = `
    @keyframes pulseText {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.1; /* Keep the significant variation */
      }
    }
  `;

  return (
    <section style={{
      position: 'relative',
      width: '100%',
      height: '25vh', /* Hauteur réduite */
      color: 'var(--color-accent-white)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
    }}>
      <style>{animationKeyframes}</style> {/* Inject the keyframes into the component */}
      
      {settings.heroImage && (
        <Image
          src={urlFor(settings.heroImage).url()}
          alt={settings.tagline || 'Bannière'}
          fill
          style={{ objectFit: 'cover', zIndex: -1 }}
          priority
        />
      )}
      {/* Overlay (Voile noir) ajustable */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 1)', // Changed to full black, opacity handled by style prop
        opacity: overlayOpacity, // New line for opacity
        zIndex: -1,
      }} />
      <div style={{ zIndex: 0 }}>
        <h1 style={{
          fontSize: '2rem', /* Taille de police réduite */
          fontWeight: 'bold',
          textShadow: '0 0 10px rgba(255,255,255,0.9), 0 0 20px rgba(255,255,255,0.7), 0 0 30px rgba(255,255,255,0.5)', // More pronounced white glow
          animation: 'pulseText 10s infinite ease-in-out',
        }}>
          {settings.tagline}
        </h1>
        {settings.callToActionText && settings.callToActionLink && (
          <Link href={settings.callToActionLink} passHref>
            <button style={{
              marginTop: '1rem', /* Marge réduite */
              padding: '0.6rem 1.5rem', /* Padding réduit */
              fontSize: '1.1rem', /* Taille de police du bouton légèrement réduite */
              fontWeight: 'bold',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary)')}
            >
              {settings.callToActionText}
            </button>
          </Link>
        )}
      </div>
    </section>
  );
};

export default HeroBanner;