import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import { useCart } from '@/context/CartContext'
import { urlFor } from '@/sanity/lib/image'
import styles from '@/styles/Panier.module.css'
import { useRouter } from 'next/router'

export default function PanierPage() {
  const { cartItems, removeFromCart, updateItemQuantity, cartTotal, itemCount } = useCart();
  const router = useRouter();
  
  const handleCheckout = async () => {
    router.push('/livraison');
  };

  return (
    <>
      <Head>
        <title>Votre Panier | Kt'i</title>
      </Head>
      <Header />
      <main className="container">
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Votre Panier</h1>
        {itemCount > 0 ? (
          <div className={styles.cartLayout}>
            <div className={styles.cartItems}>
              {cartItems.map(item => (
                <div key={item._id} className={styles.cartItem}>
                  <div className={styles.itemImage}>
                    {item.image && (
                      <Image 
                        src={urlFor(item.image).url()} 
                        alt={item.name} 
                        fill
                        sizes="100px"
                        style={{objectFit: 'cover'}} 
                      />
                    )}
                  </div>
                  <div className={styles.itemInfo}>
                    <Link href={`/produits/${item._id.replace('drafts.', '')}`}>
                      <h3>{item.name}</h3>
                    </Link>
                    {item.reference && <p>Réf: {item.reference}</p>}
                    <p className={styles.mobilePrice}>{item.price.toFixed(2)} €</p>
                  </div>
                  <div className={styles.itemQuantity}>
                    <button onClick={() => updateItemQuantity(item._id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateItemQuantity(item._id, item.quantity + 1)}>+</button>
                  </div>
                  <div className={styles.itemTotal}>
                    <p>{(item.price * item.quantity).toFixed(2)} €</p>
                  </div>
                  <div className={styles.itemRemove}>
                    <button onClick={() => removeFromCart(item._id)} aria-label="Supprimer">×</button>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.cartSummary}>
              <h2>Résumé</h2>
              <div className={styles.summaryLine}>
                <span>Sous-total ({itemCount} articles)</span>
                <span>{cartTotal.toFixed(2)} €</span>
              </div>
              <div className={styles.summaryLine}>
                <span>Livraison</span>
                <span style={{ fontStyle: 'italic', fontSize: '0.9em' }}>Calculé à l'étape suivante</span>
              </div>
              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span>{cartTotal.toFixed(2)} €</span>
              </div>
              <button 
                className={`btn btn-primary ${styles.checkoutBtn}`}
                onClick={handleCheckout}
              >
                Commander
              </button>
            </div>
          </div>
        ) : (
          <div style={{textAlign: 'center', padding: '4rem 1rem'}}>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#666' }}>Votre panier est vide pour le moment.</p>
            <Link href="/produits" className="btn btn-primary">
              Découvrir nos créations
            </Link>
          </div>
        )}
      </main>
    </>
  )
}
