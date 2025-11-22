// src/pages/api/webhooks/stripe.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client
// IMPORTANT: Use service_role key for admin access to bypass RLS.
// Store this in your environment variables and never expose it on the client side.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // apiVersion: '2024-06-20', // La version de l'API sera déterminée par la bibliothèque Stripe installée
});

// Get the webhook secret from environment variables
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Tell Next.js to disable body parsing for this route,
// as we need the raw body to verify the webhook signature.
export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature']!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err: any) {
      console.error(`❌ Error message: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('✅ Checkout session completed:', session.id);
        
        // Our custom logic to create an order in Supabase
        await createOrderFromSession(session);
        
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};

const createOrderFromSession = async (session: Stripe.Checkout.Session) => {
  const { client_reference_id: userId, amount_total, id: stripe_session_id, metadata } = session;
  const customerIp = metadata?.customer_ip;
  const shippingStreet = metadata?.shipping_street;
  const shippingCity = metadata?.shipping_city;
  const shippingPostalCode = metadata?.shipping_postal_code;
  const shippingCountry = metadata?.shipping_country;
  const isGift = metadata?.is_gift === 'true';

  if (!userId) {
    console.error('❌ No user ID in Stripe session. Order cannot be created.');
    return;
  }
  
  if (!amount_total) {
    console.error('❌ No total amount in Stripe session. Order cannot be created.');
    return;
  }

  try {
    // 1. Create the order in the 'orders' table
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        stripe_session_id: stripe_session_id,
        amount_total: amount_total / 100, // Convert from cents to euros
        status: 'paid', // Or 'pending' if you have further processing
        customer_ip_address: customerIp, // Add the customer's IP address
        shipping_street: shippingStreet,
        shipping_city: shippingCity,
        shipping_postal_code: shippingPostalCode,
        shipping_country: shippingCountry,
        is_gift: isGift,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    console.log(`📝 Order ${orderData.id} created for user ${userId} from IP ${customerIp}`);

    // 2. Retrieve line items from the session
    const { data: lineItems } = await stripe.checkout.sessions.listLineItems(session.id);

    if (!lineItems) {
      console.error('❌ Could not retrieve line items for session:', session.id);
      return;
    }

    // 3. Create order items in the 'order_items' table
    const orderItems = lineItems.map(item => ({
      order_id: orderData.id,
      product_name: item.description, // Using description as product name
      quantity: item.quantity,
      price: item.price!.unit_amount! / 100, // Convert from cents
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    console.log(`🛍️ ${orderItems.length} items added to order ${orderData.id}`);

  } catch (error) {
    console.error('❌ Error creating order in Supabase:', error);
  }
};

export default handler;