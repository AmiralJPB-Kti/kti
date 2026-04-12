import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '@/components/Header';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/lib/supabase/client';
import AddressForm from '@/components/AddressForm';
import { Address } from './mon-compte';

import { client } from '@/sanity/lib/client';
import styles from '@/styles/Livraison.module.css';

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
  // Billing Address State
  const [useBillingSameAsShipping, setUseBillingSameAsShipping] = useState(true);
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<number | null>(null);

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
          setSelectedBillingAddressId(data[0].id); // Default billing to first address too
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
      // Small delay to ensure the DOM element #Zone_Widget is rendered by React
      const timer = setTimeout(() => {
        initWidget();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [deliveryMode, relayCountry, relayPostCode]);

  const initWidget = () => {
    // Safety check: Element existence
    if (!document.getElementById('Zone_Widget')) {
       console.warn('Zone_Widget not found in DOM yet. Retrying in 500ms...');
       setTimeout(initWidget, 500);
       return;
    }

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
        Brand: process.env.NEXT_PUBLIC_MONDIAL_RELAY_BRAND || "BDTEST13", // Use env var or fallback to test ID
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
      // Determine which address to update based on current mode/intent
      // If user was adding an address while "billing different" was checked, they probably wanted that one.
      // But simplistically, we just select it as primary for now, user can switch.
      // Actually, let's stick to "select as main address" logic for now.
      if (selectedAddressId === null) setSelectedAddressId(data.id);
      if (selectedBillingAddressId === null) setSelectedBillingAddressId(data.id);

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
    let finalBillingAddress;

    if (deliveryMode === 'home') {
      if (!selectedAddressId) {
        alert('Veuillez sélectionner une adresse de livraison.');
        return;
      }
      finalShippingAddress = addresses.find(a => a.id === selectedAddressId);

      // Logic for Billing Address in Home Mode
      if (useBillingSameAsShipping) {
        finalBillingAddress = finalShippingAddress;
      } else {
        if (!selectedBillingAddressId) {
           alert('Veuillez sélectionner une adresse de facturation.');
           return;
        }
        finalBillingAddress = addresses.find(a => a.id === selectedBillingAddressId);
      }

    } else {
      // RELAY MODE
      if (!relayPoint) {
        alert('Veuillez sélectionner un Point Relais sur la carte.');
        return;
      }
      // Construct a "fake" address object from Relay data for SHIPPING
      finalShippingAddress = {
        street: `[Relais] ${relayPoint.Nom} - ${relayPoint.Adresse1}`,
        city: relayPoint.Ville,
        postal_code: relayPoint.CP,
        country: relayPoint.Pays,
      };

      // For Billing, user MUST have selected a personal address
      // (We force this check in the UI, but double check here)
      if (!selectedAddressId && !selectedBillingAddressId) {
         // Fallback logic: In relay mode, the "selectedAddressId" (used to init the map) 
         // is often considered the "User Address". We use that as billing by default.
         alert('Veuillez sélectionner une adresse personnelle pour la facturation.');
         return;
      }
      
      // In Relay mode, we can explicitely ask for billing address, 
      // OR use the one selected to initialize the map (selectedAddressId).
      // Let's use selectedBillingAddressId if set, otherwise selectedAddressId.
      const billingId = selectedBillingAddressId || selectedAddressId;
      if (!billingId) {
        alert('Adresse de facturation manquante.');
        return;
      }
      finalBillingAddress = addresses.find(a => a.id === billingId);
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
          },
          billing: {
            // Do NOT fallback to email here. If name is missing, let it be empty.
            // The backend/webhook will pick up the name from Stripe input (Credit Card Name).
            name: user.user_metadata?.full_name,
            address: finalBillingAddress
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
      <main className="container">
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Livraison</h1>
        
        <div className={styles.grid}>
          {/* Left Column: Address & Options */}
          <div className={styles.column}>
            
            {/* Mode Selection */}
            <section className={styles.section}>
              <h3>1. Mode de Livraison</h3>
              <div className={styles.modeSelector}>
                <button 
                  className={`${styles.modeBtn} ${deliveryMode === 'home' ? styles.modeBtnActive : ''}`}
                  onClick={() => setDeliveryMode('home')}
                >
                  🏠 Domicile (Colissimo)
                </button>
                <button 
                  className={`${styles.modeBtn} ${deliveryMode === 'relay' ? styles.modeBtnActive : ''}`}
                  onClick={() => setDeliveryMode('relay')}
                >
                  🏪 Point Relais
                </button>
              </div>
            </section>

            {/* Dynamic Content based on Mode */}
            <section className={styles.section}>
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
                    <div className={styles.addressList}>
                      {addresses.map(addr => (
                        <label 
                          key={addr.id} 
                          className={`${styles.addressCard} ${selectedAddressId === addr.id ? styles.addressCardSelected : ''}`}
                        >
                          <input 
                            type="radio" 
                            name="address" 
                            className={styles.addressRadio}
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
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
                        style={{marginTop: '1rem', alignSelf: 'flex-start'}}
                        onClick={() => setIsAddingAddress(true)}
                      >
                        + Nouvelle adresse
                      </button>
                    </div>
                  )}

                  {/* Billing Address Logic for Home Delivery */}
                  {addresses.length > 0 && !isAddingAddress && (
                    <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                       <label className={styles.giftOption} style={{ marginBottom: '1rem' }}>
                          <input 
                            type="checkbox" 
                            checked={useBillingSameAsShipping}
                            onChange={(e) => setUseBillingSameAsShipping(e.target.checked)}
                            className={styles.giftCheckbox}
                          />
                          <span>L'adresse de facturation est identique à l'adresse de livraison</span>
                       </label>

                       {!useBillingSameAsShipping && (
                         <div className="animate-fade-in">
                           <h4 style={{marginBottom: '1rem'}}>Adresse de facturation</h4>
                           <div className={styles.addressList}>
                            {addresses.map(addr => (
                              <label 
                                key={`billing-${addr.id}`} 
                                className={`${styles.addressCard} ${selectedBillingAddressId === addr.id ? styles.addressCardSelected : ''}`}
                              >
                                <input 
                                  type="radio" 
                                  name="billingAddress" 
                                  className={styles.addressRadio}
                                  checked={selectedBillingAddressId === addr.id}
                                  onChange={() => setSelectedBillingAddressId(addr.id)}
                                />
                                <div>
                                  <strong>{addr.street}</strong><br/>
                                  {addr.postal_code} {addr.city}<br/>
                                  {addr.country}
                                </div>
                              </label>
                            ))}
                           </div>
                         </div>
                       )}
                    </div>
                  )}

                  {isAddingAddress && (
                    <div className={styles.newAddressContainer}>
                      <h4 style={{ marginBottom: '1rem' }}>Nouvelle adresse</h4>
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

                  {/* In Relay mode, we MUST have a personal address for Billing */}
                  {addresses.length === 0 ? (
                    <div className={styles.alertBox}>
                      <p style={{ marginBottom: '1rem' }}>
                        <strong>Attention :</strong> Vous devez enregistrer une adresse personnelle (pour la <strong>facturation</strong>) avant de pouvoir choisir un point relais.
                      </p>
                      <AddressForm 
                        onSave={handleAddressAdded} 
                        onCancel={() => {}} // No cancel possible here, mandatory
                        saving={false} 
                      />
                    </div>
                  ) : (
                    <>
                      {/* Selector for billing address in Relay mode (often just one, but let's be clean) */}
                      <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid #eee' }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Adresse de facturation :</h4>
                        <select 
                          className="form-control" 
                          style={{ width: '100%', padding: '0.5rem' }}
                          value={selectedBillingAddressId || selectedAddressId || ''}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setSelectedBillingAddressId(val);
                            setSelectedAddressId(val); // Sync both for now to keep widget logic simple (country detection)
                          }}
                        >
                          {addresses.map(addr => (
                            <option key={addr.id} value={addr.id}>
                              {addr.street}, {addr.postal_code} {addr.city} ({addr.country})
                            </option>
                          ))}
                        </select>
                        <small style={{ color: '#666', display: 'block', marginTop: '0.5rem' }}>
                          (Cette adresse détermine aussi le pays de recherche par défaut)
                        </small>
                      </div>
                      
                      <div className={styles.relaySelectorHeader}>
                        <span>Pays du point relais :</span>
                        <select 
                          value={relayCountry} 
                          onChange={(e) => setRelayCountry(e.target.value)}
                          className={styles.countrySelect}
                        >
                          <option value="FR">France</option>
                          <option value="BE">Belgique</option>
                          <option value="ES">Espagne</option>
                          <option value="PT">Portugal</option>
                          <option value="LU">Luxembourg</option>
                          <option value="NL">Pays-Bas</option>
                        </select>
                      </div>

                      <div className={styles.widgetContainer}>
                        {/* Widget Container */}
                        <div id="Zone_Widget" style={{width: '100%', height: '600px'}}></div>
                        <input type="hidden" id="Target_Widget" />
                      </div>
                      
                      {relayPoint && (
                        <div className={styles.selectedRelayInfo}>
                          <strong>Point Relais sélectionné :</strong><br/>
                          {relayPoint.Nom}<br/>
                          {relayPoint.Adresse1}<br/>
                          {relayPoint.CP} {relayPoint.Ville}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </section>

            <section className={styles.section}>
              <h3>3. Options</h3>
              <label className={styles.giftOption}>
                <input 
                  type="checkbox" 
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                  className={styles.giftCheckbox}
                />
                <span>🎁 C'est pour un cadeau (Emballage soigné offert)</span>
              </label>
            </section>

          </div>

          {/* Right Column: Order Summary */}
          <div className={styles.column}>
            <div className={styles.summaryCard}>
              <h3>Résumé</h3>
              <div className={styles.summaryRow}>
                <span>Sous-total</span>
                <span>{cartTotal.toFixed(2)} €</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Livraison ({deliveryMode === 'home' ? 'Domicile' : 'Point Relais'})</span>
                <span>{shippingCost.toFixed(2)} €</span>
              </div>
              <div className={styles.summaryTotal}>
                <span>Total à payer</span>
                <span>{totalWithShipping.toFixed(2)} €</span>
              </div>

              <div className={styles.paymentInfo}>
                💡 <strong>Info Paiement :</strong> Lors de la saisie de votre carte, merci d'indiquer l'année d'expiration à <strong>2 chiffres</strong> (ex: pour 2026, tapez <strong>26</strong>).
              </div>

              <button 
                className={`btn btn-primary ${styles.payBtn}`}
                onClick={handlePayment}
                disabled={processingPayment || addresses.length === 0 || (deliveryMode === 'home' ? !selectedAddressId : !relayPoint)}
              >
                {processingPayment ? 'Chargement...' : 'Payer maintenant'}
              </button>
              
              {addresses.length === 0 && <p className={styles.errorMsg}>Adresse de facturation requise</p>}
              {addresses.length > 0 && deliveryMode === 'home' && !selectedAddressId && <p className={styles.errorMsg}>Veuillez choisir une adresse</p>}
              {addresses.length > 0 && deliveryMode === 'relay' && !relayPoint && <p className={styles.errorMsg}>Veuillez sélectionner un point relais</p>}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
