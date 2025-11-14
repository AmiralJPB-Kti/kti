import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { CartProvider } from '@/context/CartContext'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

// Load the Stripe promise outside of the component render to avoid recreating it on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CartProvider>
      <Elements stripe={stripePromise}>
        <Component {...pageProps} />
      </Elements>
    </CartProvider>
  )
}
