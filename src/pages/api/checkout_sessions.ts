import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // 1. Check API Key availability
      if (!process.env.STRIPE_SECRET_KEY) {
        console.error("CRITICAL: STRIPE_SECRET_KEY is missing in environment variables.");
        return res.status(500).json({ message: 'Configuration Error: Stripe Secret Key is missing.' });
      }

      // 2. Initialize Stripe inside the handler to catch errors safely
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        // apiVersion: '2024-06-20', // Optional: lock version
      });

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
      const shippingCost = Number(shipping?.cost) || 0;
      if (shippingCost > 0) {
        line_items.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Frais de livraison',
            },
            unit_amount: Math.round(shippingCost * 100),
          },
          quantity: 1,
        });
      }

      // Define the success and cancel URLs for redirection after payment
      const origin = req.headers.origin || 'http://localhost:3000';
      const success_url = `${origin}/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancel_url = `${origin}/panier`; // Redirect back to cart on cancellation

      console.log("Creating Stripe Session for user:", user?.email);

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
          customer_ip: String(ip || 'N/A'),
          shipping_street: String(shipping?.address?.street || 'N/A'),
          shipping_city: String(shipping?.address?.city || 'N/A'),
          shipping_postal_code: String(shipping?.address?.postal_code || 'N/A'),
          shipping_country: String(shipping?.address?.country || 'N/A'),
          is_gift: shipping?.isGift ? 'true' : 'false',
          delivery_mode: String(shipping?.mode || 'home'),
          relay_id: String(shipping?.relayId || ''),
        },
      });

      if (!session.url) {
        throw new Error('Stripe Checkout session URL not found.');
      }

      // Respond with the session URL
      res.status(200).json({ url: session.url });

    } catch (err: any) {
      console.error('Stripe API Error:', err); // Log full error
      // Return a proper JSON error response
      res.status(500).json({ message: err.message || 'Internal Server Error' });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}