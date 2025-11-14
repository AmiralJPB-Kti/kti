import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useRouter } from 'next/router'
import Header from '@/components/Header'
import Head from 'next/head'

const LoginPage = () => {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        const redirectPath = router.query.redirect || '/';
        router.push(redirectPath as string);
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  return (
    <>
      <Head>
        <title>Connexion | Kt'i</title>
      </Head>
      <Header />
      <main className="container" style={{ paddingTop: '4rem', maxWidth: '480px' }}>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google']} // Example: add Google as a provider
          localization={{
            variables: {
              sign_in: {
                email_label: 'Adresse e-mail',
                password_label: 'Mot de passe',
                button_label: 'Se connecter',
                social_provider_text: 'Se connecter avec {{provider}}',
                link_text: 'Déjà un compte ? Connectez-vous',
              },
              sign_up: {
                email_label: 'Adresse e-mail',
                password_label: 'Mot de passe',
                button_label: 'Créer un compte',
                social_provider_text: 'S\'inscrire avec {{provider}}',
                link_text: 'Pas encore de compte ? Créez-en un',
              },
              forgotten_password: {
                email_label: 'Adresse e-mail',
                button_label: 'Envoyer les instructions',
                link_text: 'Mot de passe oublié ?',
              },
            },
          }}
        />
      </main>
    </>
  )
}

export default LoginPage
