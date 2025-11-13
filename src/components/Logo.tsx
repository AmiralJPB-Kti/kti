import React from 'react';

interface LogoProps {
  size?: string; /* e.g., '1.5rem', '2em', '32px' */
}

const Logo: React.FC<LogoProps> = ({ size = '2.5rem' }) => {
  return (
    <h1 style={{ fontSize: size, fontWeight: 'bold', margin: 0, padding: 0, lineHeight: 1 }}>
      <span style={{ color: 'var(--color-accent-blue)' }}>K</span>
      <span style={{ color: 'var(--color-accent-white)' }}>t'</span>
      <span style={{ color: 'var(--color-accent-red)' }}>i</span>
    </h1>
  );
};

export default Logo;
