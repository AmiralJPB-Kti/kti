import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '@/components/Header';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/lib/supabase/client';
import AddressForm from '@/components/AddressForm';
import { Address } from './mon-compte'; // Import Address type from account page

export default function LivraisonPage() {
  const { cartItems, cartTotal, itemCount } = useCart();
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Shipping cost logic (simplified for now)
  const shippingCost = 5.00; // 5€ fixed shipping
  const totalWithShipping = cartTotal + shippingCost;

  useEffect(() => {
    // 1. Check cart
    if (itemCount === 0) {
      router.push('/panier');
      return;
    }

    // 2. Check auth and fetch addresses
    const initPage = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login?redirect=/livraison');
        return;
      }
      setUser(user);

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false }); // Default address first

      if (!error && data) {
        setAddresses(data);
        // Auto-select default address if exists
        if (data.length > 0) {
          setSelectedAddressId(data[0].id);
        }
      }
      setLoading(false);
    };

    initPage();
  }, [itemCount, router, supabase]);

  const handleAddressAdded = async (newAddress: Partial<Address>) => {
    if (!user) return;
    // Add new address to DB
    const { data, error } = await supabase
      .from('addresses')
      .insert({ ...newAddress, user_id: user.id })
      .select()
      .single();

    if (error) {
      alert("Erreur lors de l'ajout de l'adresse.");
    } else {
      setAddresses([...addresses, data]);
      setSelectedAddressId(data.id); // Select the new address
      setIsAddingAddress(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedAddressId) {
      alert('Veuillez sélectionner une adresse de livraison.');
      return;
    }

    setProcessingPayment(true);

    try {
      // Find the full address object
      const address = addresses.find(a => a.id === selectedAddressId);

      const response = await fetch('/api/checkout_sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // We send extra data to the API
        body: JSON.stringify({ 
          cartItems, 
          user,
          shipping: {
            cost: shippingCost,
            address: address,
            isGift: isGift
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur de paiement');
      }

      const { url } = await response.json();
      window.location.href = url;

    } catch (error: any) {
      console.error('Payment error:', error);
      alert(`Erreur: ${error.message}`);
      setProcessingPayment(false);
    }
  };

  if (loading) return <p style={{textAlign: 'center', marginTop: '2rem'}}>Chargement...</p>;

  return (
    <>
      <Head><title>Livraison | Kt'i</title></Head>
      <Header />
      <main className="container" style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
        <h1>Livraison</h1>
        
        <div style={styles.grid}>
          {/* Left Column: Address & Options */}
          <div style={styles.column}>
            
            <section style={styles.section}>
              <h3>1. Adresse de livraison</h3>
              
              {addresses.length === 0 && !isAddingAddress && (
                <div style={{marginBottom: '1rem'}}>
                  <p>Aucune adresse enregistrée.</p>
                  <button className="btn btn-primary" onClick={() => setIsAddingAddress(true)}>Ajouter une adresse</button>
                </div>
              )}

              {addresses.length > 0 && !isAddingAddress && (
                <div style={styles.addressList}>
                  {addresses.map(addr => (
                    <label key={addr.id} style={{
                      ...styles.addressCard,
                      borderColor: selectedAddressId === addr.id ? '#0070f3' : '#ddd',
                      backgroundColor: selectedAddressId === addr.id ? '#f0f9ff' : '#fff'
                    }}>
                      <input 
                        type="radio" 
                        name="address" 
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        style={{marginRight: '1rem'}}
                      />
                      <div>
                        <strong>{addr.street}</strong><br/>
                        {addr.postal_code} {addr.city}<br/>
                        {addr.country}
                      </div>
                    </label>
                  ))}
                  <button 
                    className="btn btn-secondary btn-sm" 
                    style={{marginTop: '1rem'}}
                    onClick={() => setIsAddingAddress(true)}
                  >
                    + Nouvelle adresse
                  </button>
                </div>
              )}

              {isAddingAddress && (
                <div style={{marginTop: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px'}}>
                  <h4>Nouvelle adresse</h4>
                  <AddressForm 
                    onSave={handleAddressAdded} 
                    onCancel={() => setIsAddingAddress(false)} 
                    saving={false} 
                  />
                </div>
              )}
            </section>

            <section style={styles.section}>
              <h3>2. Options</h3>
              <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                <input 
                  type="checkbox" 
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                  style={{width: '1.2rem', height: '1.2rem', marginRight: '0.8rem'}}
                />
                <span>🎁 C'est pour un cadeau (Emballage soigné offert)</span>
              </label>
            </section>

          </div>

          {/* Right Column: Order Summary */}
          <div style={styles.column}>
            <div style={styles.summaryCard}>
              <h3>Résumé</h3>
              <div style={styles.summaryRow}>
                <span>Sous-total</span>
                <span>{cartTotal.toFixed(2)} €</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Livraison (Standard)</span>
                <span>{shippingCost.toFixed(2)} €</span>
              </div>
              <div style={{...styles.summaryRow, fontWeight: 'bold', fontSize: '1.2rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee'}}>
                <span>Total à payer</span>
                <span>{totalWithShipping.toFixed(2)} €</span>
              </div>

              <button 
                className="btn btn-primary" 
                style={{width: '100%', marginTop: '1.5rem', padding: '1rem'}}
                onClick={handlePayment}
                disabled={processingPayment || !selectedAddressId}
              >
                {processingPayment ? 'Chargement...' : 'Payer maintenant'}
              </button>
              
              {!selectedAddressId && <p style={{color: 'red', fontSize: '0.9rem', marginTop: '0.5rem', textAlign: 'center'}}>Veuillez choisir une adresse</p>}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

const styles = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' },
  column: { display: 'flex', flexDirection: 'column' as 'column', gap: '1.5rem' },
  section: { backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #eee' },
  addressList: { display: 'flex', flexDirection: 'column' as 'column', gap: '1rem' },
  addressCard: { display: 'flex', alignItems: 'center', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' },
  summaryCard: { backgroundColor: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', position: 'sticky' as 'sticky', top: '2rem' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' },
};
