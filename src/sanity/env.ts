export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-11-13'

export const dataset =

  process.env.NEXT_PUBLIC_SANITY_DATASET || 'production' // Ajout d'une valeur par défaut pour le build Vercel

export const projectId =

  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'h0hullke' // Ajout d'une valeur par défaut pour le build Vercel. IMPORTANT: configurez la vraie valeur sur Vercel!

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}
