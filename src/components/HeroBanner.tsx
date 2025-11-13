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
      {settings.heroImage && (
        <Image
          src={urlFor(settings.heroImage).url()}
          alt={settings.tagline || 'Bannière'}
          fill
          style={{ objectFit: 'cover', zIndex: -1 }}
          priority // Good for LCP
        />
      )}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dark overlay for text readability
        zIndex: -1,
      }} />
      <div>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}>
          {settings.tagline}
        </h1>
      </div>
    </section>
  );
};

export default HeroBanner;
