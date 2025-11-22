import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // apiVersion: '2024-06-20', // La version de l'API sera déterminée par la bibliothèque Stripe installée
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { cartItems, user, shipping } = req.body;

      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ error: 'Le panier est vide.' });
      }

      // Get customer IP address
      const forwarded = req.headers['x-forwarded-for'];
      const ip = typeof forwarded === 'string' ? forwarded.split(',')[0] : req.socket.remoteAddress;

      // Transform cart items into Stripe's line_items format
      let line_items = cartItems.map((item: any) => {
        return {
          price_data: {
            currency: 'eur',
            product_data: {
              name: item.name,
              // Note: You can pass more data here, like images, but they must be publicly accessible URLs.
            },
            unit_amount: Math.round(item.price * 100), // Price in cents, rounded to avoid floating point issues
          },
          quantity: item.quantity,
        };
      });

      // Add shipping cost as a line item if provided
      if (shipping && shipping.cost > 0) {
        line_items.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Frais de livraison',
            },
            unit_amount: Math.round(shipping.cost * 100),
          },
          quantity: 1,
        });
      }

      // Define the success and cancel URLs for redirection after payment
      const origin = req.headers.origin || 'http://localhost:3000';
      const success_url = `${origin}/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancel_url = `${origin}/panier`; // Redirect back to cart on cancellation

      // Create a new checkout session with the Stripe API
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: line_items,
        mode: 'payment',
        success_url: success_url,
        cancel_url: cancel_url,
        customer_email: user?.email,
        client_reference_id: user?.id,
        metadata: {
          customer_ip: ip || 'N/A',
          shipping_street: shipping?.address?.street || 'N/A',
          shipping_city: shipping?.address?.city || 'N/A',
          shipping_postal_code: shipping?.address?.postal_code || 'N/A',
          shipping_country: shipping?.address?.country || 'N/A',
          is_gift: shipping?.isGift ? 'true' : 'false',
        },
      });

      if (!session.url) {
        throw new Error('Stripe Checkout session URL not found.');
      }

      // Respond with the session URL
      res.status(200).json({ url: session.url });

    } catch (err: any) {
      console.error('Stripe API Error:', err.message);
      res.status(500).json({ error: { statusCode: 500, message: err.message } });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}