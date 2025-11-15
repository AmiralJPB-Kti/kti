import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '@/components/Header';
import AddressForm from '@/components/AddressForm';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

// Define types for our data
export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
}

export interface Address {
  id: number;
  user_id: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  user_id: string;
  stripe_session_id: string;
  amount_total: number;
  status: string;
  created_at: string;
  order_items: OrderItem[]; // Joined items
}

const AccountPage = () => {
  const supabase = createClient();
  const router = useRouter();
  
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]); // New state for orders
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // States for address form
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles').select('*').eq('id', user.id).single();
      if (profileError && profileError.code !== 'PGRST116') console.error('Error fetching profile:', profileError);
      else setProfile(profileData);

      // Fetch addresses
      const { data: addressesData, error: addressesError } = await supabase
        .from('addresses').select('*').eq('user_id', user.id).order('created_at');
      if (addressesError) console.error('Error fetching addresses:', addressesError);
      else setAddresses(addressesData);

      // Fetch orders with their items
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*, order_items(*)') // Select order and join order_items
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }); // Newest orders first

      if (ordersError) console.error('Error fetching orders:', ordersError);
      else setOrders(ordersData as Order[]); // Cast to Order[]

      setLoading(false);
    };

    fetchUserData();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) router.push('/login');
      else setUser(session.user);
    });
    return () => subscription.unsubscribe();
  }, [supabase, router]);

  const handleProfileUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    const formData = new FormData(event.currentTarget);
    const updatedProfile = {
      first_name: formData.get('firstName') as string,
      last_name: formData.get('lastName') as string,
      phone: formData.get('phone') as string,
      updated_at: new Date().toISOString(),
    };

    if (user) {
      const { error } = await supabase.from('profiles').update(updatedProfile).eq('id', user.id);
      if (error) alert('Erreur lors de la mise à jour du profil.');
      else {
        alert('Profil mis à jour !');
        setProfile(prev => ({ ...prev!, ...updatedProfile }));
      }
    }
    setSaving(false);
  };

  const handleSaveAddress = async (addressData: Partial<Address>) => {
    if (!user) return;
    setSaving(true);

    if (selectedAddress) { // Update existing address
      const { data, error } = await supabase.from('addresses').update(addressData).eq('id', selectedAddress.id).select().single();
      if (error) alert('Erreur lors de la mise à jour de l\'adresse.');
      else {
        setAddresses(addresses.map(a => a.id === data.id ? data : a));
        alert('Adresse mise à jour !');
      }
    } else { // Add new address
      const { data, error } = await supabase.from('addresses').insert({ ...addressData, user_id: user.id }).select().single();
      if (error) alert('Erreur lors de l\'ajout de l\'adresse.');
      else {
        setAddresses([...addresses, data]);
        alert('Adresse ajoutée !');
      }
    }
    setSaving(false);
    setIsEditingAddress(false);
    setSelectedAddress(null);
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) {
      const { error } = await supabase.from('addresses').delete().eq('id', addressId);
      if (error) alert('Erreur lors de la suppression.');
      else {
        setAddresses(addresses.filter(a => a.id !== addressId));
        alert('Adresse supprimée.');
      }
    }
  };

  const handleAddNewAddress = () => {
    setSelectedAddress(null);
    setIsEditingAddress(true);
  };

  const handleEditAddress = (address: Address) => {
    setSelectedAddress(address);
    setIsEditingAddress(true);
  };

  if (loading) {
    return <><Head><title>Chargement...</title></Head><Header /><main className="container" style={{textAlign: 'center'}}><p>Chargement...</p></main></>;
  }

  return (
    <>
      <Head><title>Mon Compte | Kt'i</title></Head>
      <Header />
      <main className="container" style={{ paddingTop: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Mon Compte</h1>
        
        {user && (
          <>
            <section style={styles.section}>
              <h2>Mes Informations</h2>
              <p>Email : {user.email}</p>
              <form onSubmit={handleProfileUpdate}>
                <div style={styles.formGroup}><label htmlFor="firstName">Prénom</label><input type="text" id="firstName" name="firstName" defaultValue={profile?.first_name || ''} style={styles.input} /></div>
                <div style={styles.formGroup}><label htmlFor="lastName">Nom</label><input type="text" id="lastName" name="lastName" defaultValue={profile?.last_name || ''} style={styles.input} /></div>
                <div style={styles.formGroup}><label htmlFor="phone">Téléphone</label><input type="tel" id="phone" name="phone" defaultValue={profile?.phone || ''} style={styles.input} /></div>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</button>
              </form>
            </section>

            <section style={styles.section}>
              <h2>Mes Adresses</h2>
              {!isEditingAddress ? (
                <>
                  {addresses.length > 0 ? (
                    <ul style={styles.addressList}>
                      {addresses.map(addr => (
                        <li key={addr.id} style={styles.addressItem}>
                          <p>{addr.street}, {addr.postal_code} {addr.city}, {addr.country}</p>
                          <div>
                            <button onClick={() => handleEditAddress(addr)} className="btn btn-secondary btn-sm">Modifier</button>
                            <button onClick={() => handleDeleteAddress(addr.id)} className="btn btn-danger btn-sm" style={{marginLeft: '0.5rem'}}>Supprimer</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : <p>Vous n\'avez pas encore d\'adresse.</p>}
                  <button onClick={handleAddNewAddress} className="btn btn-primary" style={{marginTop: '1rem'}}>Ajouter une adresse</button>
                </>
              ) : (
                <AddressForm 
                  address={selectedAddress}
                  onSave={handleSaveAddress}
                  onCancel={() => { setIsEditingAddress(false); setSelectedAddress(null); }}
                  saving={saving}
                />
              )}
            </section>

            <section style={styles.section}>
                <h2>Mes Commandes</h2>
                {orders.length > 0 ? (
                    <ul style={styles.orderList}>
                        {orders.map(order => (
                            <li key={order.id} style={styles.orderItem}>
                                <div style={styles.orderHeader}>
                                    <h3>Commande #{order.id} - {new Date(order.created_at).toLocaleDateString()}</h3>
                                    <p>Statut: <strong>{order.status}</strong></p>
                                    <p>Total: <strong>{order.amount_total.toFixed(2)} €</strong></p>
                                </div>
                                <div style={styles.orderDetails}>
                                    <h4>Articles:</h4>
                                    <ul style={styles.orderItemsList}>
                                        {order.order_items.map(item => (
                                            <li key={item.id} style={styles.orderItemDetail}>
                                                {item.quantity} x {item.product_name} ({item.price.toFixed(2)} €/unité)
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Vous n\'avez pas encore passé de commande.</p>
                )}
            </section>
          </>
        )}

        <section style={styles.section}><h2 style={{marginTop: '2rem'}}>Mes Échanges</h2><p>Échanges à venir.</p></section>
      </main>
    </>
  );
};

const styles = {
  section: { backgroundColor: '#f9f9f9', padding: '2rem', borderRadius: '8px', border: '1px solid #eee', marginBottom: '2rem' },
  formGroup: { marginBottom: '1rem', display: 'flex', flexDirection: 'column' as 'column' },
  input: { padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' },
  addressList: { listStyle: 'none', padding: 0 },
  addressItem: { padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  orderList: { listStyle: 'none', padding: 0 },
  orderItem: { backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem', marginBottom: '1rem' },
  orderHeader: { marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' },
  orderDetails: { marginTop: '1rem' },
  orderItemsList: { listStyle: 'disc', paddingLeft: '1.5rem' },
  orderItemDetail: { marginBottom: '0.5rem' },
};

export default AccountPage;