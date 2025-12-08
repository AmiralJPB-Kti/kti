import type { NextConfig } from "next";

// DEBUG: Vérification des variables au moment du build
console.log("--- DIAGNOSTIC VERCEL ---");
console.log("VERCEL_ENV:", process.env.VERCEL_ENV);
console.log("GOOGLE_GEMINI_API_KEY présente ?", !!process.env.GOOGLE_GEMINI_API_KEY ? "OUI" : "NON");
console.log("STRIPE_SECRET_KEY présente ?", !!process.env.STRIPE_SECRET_KEY ? "OUI" : "NON");
console.log("-------------------------");

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
