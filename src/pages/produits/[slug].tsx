import Head from 'next/head'
import { GetStaticProps, GetStaticPaths } from 'next'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import groq from 'groq'
import Image from 'next/image'
import { useRouter } from 'next/router'
import Header from '@/components/Header'
import styles from '@/styles/ProductDetail.module.css'
import Link from 'next/link'

// Define the type for a single detailed product
interface Product {
  _id: string;
  name: string;
  images: any[];
  description: string;
  price: number;
  dimensions: {
    height?: number;
    width?: number;
    depth?: number;
  };
  reference: string;
  materials: { _id: string; name: string; }[];
  stock: number; // Added stock
  status: 'unique' | 'sur-commande'; // Added status
  customizationOptions?: string; // Added customizationOptions
}

interface ProductDetailPageProps {
  product: Product;
}

import { useCart } from '@/context/CartContext';

// ... (imports existants)

export default function ProductDetailPage({ product }: ProductDetailPageProps) {
  const router = useRouter();
  
  if (!product) {
    return <div>Produit non trouvé.</div>;
  }

  const { addToCart } = useCart();

  const handleAddToCart = () => {
    const itemToAdd = {
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0] : undefined,
      reference: product.reference,
    };
    addToCart(itemToAdd);
    // Optional: Add user feedback, e.g., a toast notification
    alert(`"${product.name}" a été ajouté au panier !`);
  };

  // Logic to determine what to show based on stock and status
  const isOutOfStock = product.stock <= 0;
  const isMadeToOrder = product.status === 'sur-commande';

  return (
    <>
      <Head>
        <title>{product.name} | Kt'i</title>
      </Head>
      <Header />
      <main className={`container ${styles.productLayout}`}>
        {/* Image Gallery */}
        <div className={styles.imageGallery}>
          {product.images && product.images.length > 0 ? (
            <Image
              src={urlFor(product.images[0]).url()}
              alt={product.name}
              width={800}
              height={800}
              style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
            />
          ) : (
            <div className={styles.imagePlaceholder} />
          )}
        </div>

        {/* Product Info */}
        <div className={styles.productInfo}>
          <h1>{product.name}</h1>
          <p className={styles.price}>{product.price.toFixed(2)} €</p>
          
          <div className={styles.description}>
            {product.description ? <p>{product.description}</p> : <p>Aucune description disponible.</p>}
          </div>

          {product.dimensions && (
            <div className={styles.dimensions}>
              <h4>Dimensions</h4>
              <p>
                {product.dimensions.height && `Hauteur : ${product.dimensions.height} cm `}
                {product.dimensions.width && `Largeur : ${product.dimensions.width} cm `}
                {product.dimensions.depth && `Profondeur : ${product.dimensions.depth} cm`}
              </p>
            </div>
          )}

          {product.materials && product.materials.length > 0 && (
            <div className={styles.materials}>
              <h4>Matériaux</h4>
              <p>{product.materials.map(m => m.name).join(', ')}</p>
            </div>
          )}

          {/* Call to Action Section */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
            {!isOutOfStock ? (
              // Case 1: IN STOCK
              <button 
                className="btn btn-primary" 
                style={{width: '100%'}}
                onClick={handleAddToCart}
              >
                Ajouter au panier
              </button>
            ) : (
              // Case 2: OUT OF STOCK
              isMadeToOrder ? (
                // Case 2a: MADE TO ORDER
                <div style={{ backgroundColor: '#f0f9ff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #bde0fe' }}>
                  <h4 style={{ color: '#0056b3', marginTop: 0 }}>✨ Ce modèle unique a été vendu</h4>
                  <p style={{ fontSize: '0.95rem', color: '#333' }}>
                    Mais je peux en réaliser une version similaire spécialement pour vous !
                  </p>
                  
                  {product.customizationOptions && (
                    <div style={{ marginTop: '1rem', marginBottom: '1rem', fontStyle: 'italic', fontSize: '0.9rem' }}>
                      <strong>Options possibles :</strong><br/>
                      {product.customizationOptions}
                    </div>
                  )}

                  <Link 
                    href={`/contact?product=${encodeURIComponent(product.name)}&reference=${encodeURIComponent(product.reference)}`}
                    className="btn btn-primary"
                    style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '1rem' }}
                  >
                    Commander une création similaire
                  </Link>
                </div>
              ) : (
                // Case 2b: SOLD OUT (ARCHIVED)
                <button 
                  className="btn btn-secondary" 
                  style={{width: '100%', cursor: 'not-allowed', opacity: 0.7}}
                  disabled
                >
                  ❌ Pièce unique vendue
                </button>
              )
            )}
          </div>

        </div>
      </main>
    </>
  );
}

// This function tells Next.js which pages to pre-render
export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await client.fetch(
    groq`*[_type == "product" && defined(slug.current)][].slug.current`
  );

  return {
    paths: paths.map((slug: string) => ({ params: { slug } })),
    fallback: 'blocking',
  };
};

// This function fetches the data for a single product
export const getStaticProps: GetStaticProps = async (context) => {
  const { slug = "" } = context.params as { slug: string };
  const product = await client.fetch(
    groq`*[_type == "product" && slug.current == $slug][0]{
      _id,
      name,
      images,
      description,
      price,
      dimensions,
      reference,
      materials[]->{_id, name},
      stock,
      status,
      customizationOptions
    }`,
    { slug }
  );

  if (!product) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      product,
    },
    revalidate: 60,
  };
};
