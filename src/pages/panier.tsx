import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import { useCart } from '@/context/CartContext'
import { urlFor } from '@/sanity/lib/image'
import styles from '@/styles/Panier.module.css'

export default function PanierPage() {
  const { cartItems, removeFromCart, updateItemQuantity, cartTotal, itemCount } = useCart();

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
                      <Image src={urlFor(item.image).url()} alt={item.name} width={100} height={100} style={{objectFit: 'cover'}} />
                    )}
                  </div>
                  <div className={styles.itemInfo}>
                    <Link href={`/produits/${item._id.replace('drafts.', '')}`}>
                      <h3>{item.name}</h3>
                    </Link>
                    {item.reference && <p style={{ fontSize: '0.8em', color: '#888', margin: '0' }}>Réf: {item.reference}</p>}
                    <p>{item.price.toFixed(2)} €</p>
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
                    <button onClick={() => removeFromCart(item._id)}>×</button>
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
                <span>Calculée à l'étape suivante</span>
              </div>
              <div className={`${styles.summaryLine} ${styles.summaryTotal}`}>
                <span>Total</span>
                <span>{cartTotal.toFixed(2)} €</span>
              </div>
              <button className="btn btn-primary" style={{width: '100%', marginTop: '1rem'}}>
                Passer la commande
              </button>
            </div>
          </div>
        ) : (
          <div style={{textAlign: 'center'}}>
            <p>Votre panier est vide.</p>
            <Link href="/produits" className="btn btn-primary">
              Voir nos produits
            </Link>
          </div>
        )}
      </main>
    </>
  )
}
