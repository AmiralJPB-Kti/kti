import { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { useRouter } from 'next/router';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

export default function OfflineOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card_terminal'); // card_terminal, cash, check
  const [items, setItems] = useState<OrderItem[]>([
    { name: '', price: 0, quantity: 1 }
  ]);

  // Computed Total
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { name: '', price: 0, quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/offline-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          totalAmount,
          paymentMethod,
          customerInfo: { name: customerName, email: customerEmail },
          date
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la commande');
      }

      setSuccess(`Commande validée ! Facture : ${data.invoiceNumber}`);
      // Reset form
      setItems([{ name: '', price: 0, quantity: 1 }]);
      setCustomerName('');
      setCustomerEmail('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'Kaushan Script, cursive', color: '#2C2C2C', marginBottom: '2rem' }}>Saisie Vente (Salon / Direct)</h1>

        {success && (
          <div style={{ padding: '1rem', backgroundColor: '#d4edda', color: '#155724', marginBottom: '1rem', borderRadius: '4px' }}>
            {success}
          </div>
        )}

        {error && (
          <div style={{ padding: '1rem', backgroundColor: '#f8d7da', color: '#721c24', marginBottom: '1rem', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          
          {/* Date & Client */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Date</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Moyen de Paiement</label>
              <select 
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="card_terminal">💳 TPE (Carte Bancaire)</option>
                <option value="cash">💶 Espèces</option>
                <option value="check">cheque Chèque</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nom Client (Optionnel)</label>
              <input 
                type="text" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="ex: Jean Dupont"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email (Optionnel)</label>
              <input 
                type="email" 
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Pour envoyer la facture"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '1.5rem 0' }} />

          {/* Products */}
          <h3 style={{ marginBottom: '1rem' }}>Produits</h3>
          <div style={{ marginBottom: '1.5rem' }}>
            {items.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                <input 
                  type="text" 
                  placeholder="Nom du produit / Réf"
                  value={item.name}
                  onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                  required
                  style={{ flex: 2, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <input 
                  type="number" 
                  placeholder="Qté"
                  value={item.quantity}
                  min="1"
                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                  required
                  style={{ width: '60px', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number" 
                    placeholder="Prix U."
                    value={item.price}
                    step="0.01"
                    onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                    required
                    style={{ width: '100px', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }}>€</span>
                </div>
                
                {items.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => removeItem(index)}
                    style={{ background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '4px', padding: '0.5rem', cursor: 'pointer' }}
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
            
            <button 
              type="button" 
              onClick={addItem}
              style={{ marginTop: '0.5rem', background: '#e3f2fd', color: '#0d47a1', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              + Ajouter une ligne
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f9f9f9', borderRadius: '4px', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Total Commande</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0055A4' }}>{totalAmount.toFixed(2)} €</span>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '1rem', 
              background: loading ? '#ccc' : '#0055A4', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              fontSize: '1.1rem', 
              fontWeight: 'bold', 
              cursor: loading ? 'not-allowed' : 'pointer' 
            }}
          >
            {loading ? 'Enregistrement...' : 'Valider la Vente'}
          </button>

        </form>
      </div>
    </AdminLayout>
  );
}
