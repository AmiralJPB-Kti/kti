import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Create a supabase client on the browser with project's credentials
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xhkcnqqvkfyeeikhwifw.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhoa2NucXF2a2Z5ZWVpa2h3aWZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMTM0NzEsImV4cCI6MjA3ODY4OTQ3MX0.Y5rKXpdYx_7Z6ZCFKoLgVvqzciTVdbIHdh3yxbdVhn4"
  )
}
