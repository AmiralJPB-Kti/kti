import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import Link from 'next/link';
import { generateInvoice } from '@/utils/invoiceGenerator';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (!res.ok) throw new Error('Impossible de récupérer les commandes');
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getClientName = (order: any) => {
    if (order.source === 'offline') {
      return order.customer_name_offline || 'Client Comptoir';
    }
    return order.shipping_street ? order.shipping_street.split('\n')[0] : 'Client Web'; // Approximation
  };

  const getClientEmail = (order: any) => {
    if (order.source === 'offline') {
      return order.customer_email_offline || '-';
    }
    // User email from relation if available (not always populated depending on RLS)
    // or fallback to what we might have stored
    return order.user?.email || 'Client Web';
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Kaushan Script, cursive', color: '#2C2C2C', margin: 0 }}>Tableau de Bord</h1>
          <Link href="/admin/offline-order" style={{ background: '#0055A4', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
            + Nouvelle Vente
          </Link>
        </div>

        {loading ? (
          <p>Chargement des commandes...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f4f4f4' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Facture</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Client</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Source</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Montant</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Statut</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1rem' }}>{formatDate(order.created_at)}</td>
                    <td style={{ padding: '1rem', fontFamily: 'monospace', fontWeight: 'bold' }}>
                      {order.invoice_number || '-'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 'bold' }}>{getClientName(order)}</div>
                      <div style={{ fontSize: '0.85em', color: '#666' }}>{getClientEmail(order)}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '12px', 
                        fontSize: '0.85em',
                        background: order.source === 'offline' ? '#e3f2fd' : '#f3e5f5',
                        color: order.source === 'offline' ? '#0d47a1' : '#7b1fa2'
                      }}>
                        {order.source === 'offline' ? 'Salon/Direct' : 'Site Web'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>
                      {order.amount_total.toFixed(2)} €
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px', 
                        background: '#d4edda', 
                        color: '#155724',
                        fontSize: '0.9em'
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button 
                        onClick={() => generateInvoice(order)}
                        style={{ 
                          border: '1px solid #999', 
                          background: '#fff', 
                          color: '#333',
                          padding: '0.4rem 0.8rem', 
                          borderRadius: '4px', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.9em',
                          margin: '0 auto'
                        }}
                        title="Télécharger la facture PDF"
                      >
                        📄 Facture
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                Aucune commande trouvée.
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}