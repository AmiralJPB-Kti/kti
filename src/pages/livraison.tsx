import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Script from 'next/script';
import Header from '@/components/Header';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/lib/supabase/client';
import AddressForm from '@/components/AddressForm';
import { Address } from './mon-compte';

import { client } from '@/sanity/lib/client';

declare global {
  interface Window {
    $: any;
    jQuery: any;
  }
}

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

  // Shipping Configuration (Default values before fetch)
  const [shippingRates, setShippingRates] = useState({
    home: 6.00,
    international: 18.00, // Default international rate
    relay: 4.50,
    relayInternational: 8.00, // Default international relay rate
    freeThreshold: 0 // 0 means disabled
  });

  // Delivery Mode State
  const [deliveryMode, setDeliveryMode] = useState<'home' | 'relay'>('home');
  const [relayCountry, setRelayCountry] = useState<string>('FR'); // Default country
  const [relayPostCode, setRelayPostCode] = useState<string>('');
  const [relayPoint, setRelayPoint] = useState<any>(null);
  const widgetLoaded = useRef(false);

  // Helper to map full country names to ISO codes expected by MR
  const getCountryCode = (countryName: string) => {
    if (!countryName) return 'FR';
    const normalized = countryName.toLowerCase().trim();
    if (normalized === 'france') return 'FR';
    if (normalized === 'belgique' || normalized === 'belgium') return 'BE';
    if (normalized === 'espagne' || normalized === 'spain') return 'ES';
    if (normalized === 'portugal') return 'PT';
    if (normalized === 'luxembourg') return 'LU';
    if (normalized === 'pays-bas' || normalized === 'netherlands') return 'NL';
    // Return as is if it looks like a code (2 chars), otherwise default FR
    return countryName.length === 2 ? countryName.toUpperCase() : 'FR';
  };

  // Helper to check if address is international (Not France)
  const isInternationalAddress = (addressId: number | null) => {
    if (!addressId || addresses.length === 0) return false;
    const addr = addresses.find(a => a.id === addressId);
    if (!addr) return false;
    const code = getCountryCode(addr.country);
    return code !== 'FR';
  };

  // Calculate Shipping Cost
  let baseShippingCost = 0;
  if (deliveryMode === 'relay') {
    // Check relay country
    if (relayCountry !== 'FR') {
      baseShippingCost = shippingRates.relayInternational;
    } else {
      baseShippingCost = shippingRates.relay;
    }
  } else {
    // Home delivery
    if (isInternationalAddress(selectedAddressId)) {
      baseShippingCost = shippingRates.international;
    } else {
      baseShippingCost = shippingRates.home;
    }
  }

  const isFreeShipping = shippingRates.freeThreshold > 0 && cartTotal >= shippingRates.freeThreshold;
  const shippingCost = isFreeShipping ? 0 : baseShippingCost;
  
  const totalWithShipping = cartTotal + shippingCost;

  useEffect(() => {
    if (itemCount === 0) {
      router.push('/panier');
      return;
    }

    const initPage = async () => {
      // 1. Fetch User
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?redirect=/livraison');
        return;
      }
      setUser(user);

      // 2. Fetch Addresses
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (!error && data) {
        setAddresses(data);
        if (data.length > 0) {
          setSelectedAddressId(data[0].id);
        }
      }

      // 3. Fetch Site Settings (Shipping Rates) from Sanity
      try {
        // FETCH THE MOST RECENTLY UPDATED SETTINGS (Fix for ghost documents)
        const settings = await client.fetch(`*[_type == "siteSettings"] | order(_updatedAt desc)[0]{
          _id,
          shippingRateHome,
          shippingRateInternational,
          shippingRateRelay,
          shippingRateRelayInternational,
          freeShippingThreshold
        }`);
        
        if (settings) {
          setShippingRates({
            home: settings.shippingRateHome ?? 6.00,
            international: settings.shippingRateInternational ?? 18.00,
            relay: settings.shippingRateRelay ?? 4.50,
            relayInternational: settings.shippingRateRelayInternational ?? 8.00,
            freeThreshold: settings.freeShippingThreshold ?? 0
          });
        }
      } catch (err: any) {
        console.error("Error fetching shipping rates:", err);
      }

      setLoading(false);
    };

    initPage();
  }, [itemCount, router, supabase]);

  // Sync Widget settings with Selected Address
  useEffect(() => {
    if (selectedAddressId && addresses.length > 0) {
      const selectedAddr = addresses.find(a => a.id === selectedAddressId);
      if (selectedAddr) {
        const code = getCountryCode(selectedAddr.country);
        setRelayCountry(code);
        setRelayPostCode(selectedAddr.postal_code);
      }
    }
  }, [selectedAddressId, addresses]);

  // MANUAL SCRIPT LOADING (Robustness Fix)
  useEffect(() => {
    // Only load if we are in relay mode and scripts aren't loaded yet
    if (deliveryMode === 'relay' && !window.$) {
      const loadScripts = () => {
        // 1. Load jQuery
        const scriptJquery = document.createElement('script');
        scriptJquery.src = "https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js";
        scriptJquery.onload = () => {
          console.log("jQuery loaded via manual script");
          
          // 2. Load MR Plugin (only after jQuery is done)
          const scriptMR = document.createElement('script');
          scriptMR.src = "https://widget.mondialrelay.com/parcelshop-picker/jquery.plugin.mondialrelay.parcelshoppicker.min.js";
          scriptMR.onload = () => {
             console.log("MR Plugin loaded via manual script");
             // We can trigger init via the other useEffect or directly here if needed
             // But the other useEffect listening to deliveryMode/window.$ will likely catch it
          };
          document.body.appendChild(scriptMR);
        };
        document.body.appendChild(scriptJquery);
      };
      loadScripts();
    } else if (deliveryMode === 'relay' && window.$ && window.$.fn.MR_ParcelShopPicker) {
       // Already loaded, just re-init
       initWidget();
    }
  }, [deliveryMode]);

  // Initialize Widget when mode changes to relay OR country/postcode changes
  useEffect(() => {
    if (deliveryMode === 'relay' && window.$ && window.$.fn.MR_ParcelShopPicker) {
      initWidget();
    }
  }, [deliveryMode, relayCountry, relayPostCode]);

  const initWidget = () => {
    // Use state-managed postcode (derived from selected address)
    // If no address selected, fallback to empty (shows whole country)
    const targetPostCode = relayPostCode || "";
    
    // Sanitize PostCode (remove spaces/dashes) to avoid breaking the widget
    // Example: "1234-567" -> "1234567"
    const cleanPostCode = targetPostCode.replace(/[^a-zA-Z0-9]/g, '');
    
    // Safety check
    if (!window.$ || !window.$.fn.MR_ParcelShopPicker) return;

    try {
      // CRITICAL: Empty the container before re-drawing to prevent conflicts
      window.$("#Zone_Widget").empty();
      // Ensure the input target is cleared too
      window.$("#Target_Widget").val('');

      console.log(`Initializing Widget for ${relayCountry} with Zip ${cleanPostCode}`);

      window.$("#Zone_Widget").MR_ParcelShopPicker({
        Target: "#Target_Widget",
        Brand: "BDTEST13", // Test Brand ID
        Country: relayCountry, // Dynamic Country
        PostCode: cleanPostCode, 
        ColLivMod: "24R",
        NbResults: "7",
        Responsive: true,
        ShowResultsOnMap: true,
        OnParcelShopSelected: (data: any) => {
          console.log("Relay selected:", data);
          setRelayPoint(data);
        }
      });
      widgetLoaded.current = true;
    } catch (e) {
      console.error("Widget init error", e);
    }
  };

  const handleScriptLoad = () => {
    console.log("Mondial Relay script loaded");
    if (deliveryMode === 'relay') {
      initWidget();
    }
  };

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
      // Also update relay country if needed since we just added an address
      if (data.country) {
         setRelayCountry(getCountryCode(data.country));
         setRelayPostCode(data.postal_code);
      }
    }
  };

  const handlePayment = async () => {
    let finalShippingAddress;

    if (deliveryMode === 'home') {
      if (!selectedAddressId) {
        alert('Veuillez sélectionner une adresse de livraison.');
        return;
      }
      finalShippingAddress = addresses.find(a => a.id === selectedAddressId);
    } else {
      if (!relayPoint) {
        alert('Veuillez sélectionner un Point Relais sur la carte.');
        return;
      }
      // Construct a "fake" address object from Relay data
      finalShippingAddress = {
        street: `[Relais] ${relayPoint.Nom} - ${relayPoint.Adresse1}`,
        city: relayPoint.Ville,
        postal_code: relayPoint.CP,
        country: relayPoint.Pays,
      };
    }

    setProcessingPayment(true);

    try {
      const response = await fetch('/api/checkout_sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cartItems, 
          user,
          shipping: {
            cost: shippingCost,
            address: finalShippingAddress,
            isGift: isGift,
            mode: deliveryMode,
            relayId: relayPoint ? relayPoint.ID : null
          }
        }),
      });

      let data;
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        // Show FULL error text now
        throw new Error(`Server Error: ${text}`);
      }

      if (!response.ok) {
        throw new Error(data.message || 'Erreur de paiement');
      }

      const { url } = data;
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
      
      {/* Scripts loaded manually in useEffect for better control */}

      <Header />
      <main className="container" style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
        <h1>Livraison</h1>
        
        <div style={styles.grid}>
          {/* Left Column: Address & Options */}
          <div style={styles.column}>
            
            {/* Mode Selection */}
            <section style={styles.section}>
              <h3>1. Mode de Livraison</h3>
              <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
                <button 
                  className={`btn ${deliveryMode === 'home' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setDeliveryMode('home')}
                  style={{flex: 1}}
                >
                  🏠 Domicile (Colissimo)
                </button>
                <button 
                  className={`btn ${deliveryMode === 'relay' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setDeliveryMode('relay')}
                  style={{flex: 1}}
                >
                  🏪 Point Relais
                </button>
              </div>
            </section>

            {/* Dynamic Content based on Mode */}
            <section style={styles.section}>
              {deliveryMode === 'home' ? (
                <>
                  <h3>2. Adresse de livraison</h3>
                  
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
                </>
              ) : (
                <>
                  <h3>2. Choisir mon Point Relais</h3>

                  {addresses.length === 0 ? (
                    <div style={{padding: '1rem', backgroundColor: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '8px', marginBottom: '1rem'}}>
                      <p style={{color: '#856404', marginBottom: '1rem'}}>
                        <strong>Attention :</strong> Vous devez enregistrer une adresse personnelle (pour la facturation) avant de pouvoir choisir un point relais.
                      </p>
                      <AddressForm 
                        onSave={handleAddressAdded} 
                        onCancel={() => {}} // No cancel possible here, mandatory
                        saving={false} 
                      />
                    </div>
                  ) : (
                    <>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                        <span>Pays du point relais :</span>
                        <select 
                          value={relayCountry} 
                          onChange={(e) => setRelayCountry(e.target.value)}
                          style={{padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd'}}
                        >
                          <option value="FR">France</option>
                          <option value="BE">Belgique</option>
                          <option value="ES">Espagne</option>
                          <option value="PT">Portugal</option>
                          <option value="LU">Luxembourg</option>
                          <option value="NL">Pays-Bas</option>
                        </select>
                      </div>

                      <div style={{minHeight: '550px', width: '100%'}}>
                        {/* Widget Container - Increased default size */}
                        <div id="Zone_Widget" style={{width: '100%', height: '600px'}}></div>
                        <input type="hidden" id="Target_Widget" />
                        
                        {relayPoint && (
                          <div style={{marginTop: '1rem', padding: '1rem', background: '#f0f9ff', border: '1px solid #0070f3', borderRadius: '8px'}}>
                            <strong>Point Relais sélectionné :</strong><br/>
                            {relayPoint.Nom}<br/>
                            {relayPoint.Adresse1}<br/>
                            {relayPoint.CP} {relayPoint.Ville}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </section>

            <section style={styles.section}>
              <h3>3. Options</h3>
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
                <span>Livraison ({deliveryMode === 'home' ? 'Domicile' : 'Point Relais'})</span>
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
                disabled={processingPayment || addresses.length === 0 || (deliveryMode === 'home' ? !selectedAddressId : !relayPoint)}
              >
                {processingPayment ? 'Chargement...' : 'Payer maintenant'}
              </button>
              
              {addresses.length === 0 && <p style={styles.errorMsg}>Adresse de facturation requise</p>}
              {addresses.length > 0 && deliveryMode === 'home' && !selectedAddressId && <p style={styles.errorMsg}>Veuillez choisir une adresse</p>}
              {addresses.length > 0 && deliveryMode === 'relay' && !relayPoint && <p style={styles.errorMsg}>Veuillez sélectionner un point relais</p>}
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
  errorMsg: { color: 'red', fontSize: '0.9rem', marginTop: '0.5rem', textAlign: 'center' as 'center' }
};
