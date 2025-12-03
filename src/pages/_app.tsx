import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { CartProvider } from '@/context/CartContext'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import Footer from '@/components/Footer'
import { Kaushan_Script, Lato } from 'next/font/google'

const kaushan = Kaushan_Script({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-kaushan',
})

const lato = Lato({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-lato',
})

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CartProvider>
      <Elements stripe={stripePromise}>
        <main className={`${kaushan.variable} ${lato.variable}`}>
          <Component {...pageProps} />
          <Footer />
        </main>
      </Elements>
    </CartProvider>
  )
}
