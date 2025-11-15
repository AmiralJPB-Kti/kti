import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { urlFor } from '@/sanity/lib/image';

interface HeroBannerProps {
  settings: {
    tagline?: string;
    heroImage?: any;
    callToActionText?: string;
    callToActionLink?: string;
  };
}

const HeroBanner: React.FC<HeroBannerProps> = ({ settings }) => {
  if (!settings) return null;

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
      height: '40vh',
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
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: -1,
      }} />
      <div style={{ zIndex: 0 }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          textShadow: '0 0 10px rgba(255,255,255,0.9), 0 0 20px rgba(255,255,255,0.7), 0 0 30px rgba(255,255,255,0.5)', // More pronounced white glow
          animation: 'pulseText 10s infinite ease-in-out',
        }}>
          {settings.tagline}
        </h1>
        {settings.callToActionText && settings.callToActionLink && (
          <Link href={settings.callToActionLink} passHref>
            <button style={{
              marginTop: '1.5rem',
              padding: '0.8rem 2rem',
              fontSize: '1.2rem',
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