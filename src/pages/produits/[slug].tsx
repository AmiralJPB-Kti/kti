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
import { useState, useEffect, useRef } from 'react'
// Pas besoin d'importer de librairie de zoom ici

// Define the type for a single detailed product
interface ProductImage {
  asset: any;
  label?: string;
  alt?: string;
}

interface Product {
  _id: string;
  name: string;
  images: ProductImage[];
  description: string;
  price: number;
  dimensions: {
    height?: number;
    width?: number;
    depth?: number;
  };
  reference: string;
  materials: { _id: string; name: string; }[];
  stock: number; 
  status: 'unique' | 'sur-commande';
  customizationOptions?: string; 
}

interface ProductDetailPageProps {
  product: Product;
}

import { useCart } from '@/context/CartContext';

// ... (imports existants)

export default function ProductDetailPage({ product }: ProductDetailPageProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  
  // Custom Zoom Logic
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomCoords, setZoomCoords] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // State for the interactive gallery
  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(
    (product && product.images && product.images.length > 0) ? product.images[0] : null
  );

  // If product changes (e.g. via router push, not static props) ensure selectedImage resets to first image
  useEffect(() => {
    if (product && product.images && product.images.length > 0 && selectedImage !== product.images[0]) {
      setSelectedImage(product.images[0]);
    }
  }, [product, selectedImage]);
  
  if (!product) {
    console.log("Product data is null or undefined.");
    return <div>Produit non trouvé.</div>;
  }

  // --- Debugging Logs ---
  console.log("Product data:", product);
  console.log("Selected Image state:", selectedImage);
  console.log("Product has images:", product.images && product.images.length > 0);
  console.log("Initial selectedImage:", (product && product.images && product.images.length > 0) ? product.images[0] : null);
  // --- End Debugging Logs ---

  const handleAddToCart = () => {
    const itemToAdd = {
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0] : undefined,
      reference: product.reference,
    };
    addToCart(itemToAdd);
    alert(`"${product.name}" a été ajouté au panier !`);
  };

  // Logic to determine what to show based on stock and status
  const isOutOfStock = product.stock <= 0;
  const isMadeToOrder = product.status === 'sur-commande';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;

    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - left; // x position within the element.
    const y = e.clientY - top;  // y position within the element.

    // Calculate percentage position
    const xPercent = (x / width) * 100;
    const yPercent = (y / height) * 100;

    setZoomCoords({ x: xPercent, y: yPercent });
  };
  // End Custom Zoom Logic

  // URLs for the main image and zoom image
  const displayImageUrl = selectedImage ? urlFor(selectedImage).width(800).auto('format').url() : '';
  const zoomImageUrl = selectedImage ? urlFor(selectedImage).width(2000).quality(90).auto('format').url() : '';

  console.log("Generated displayImageUrl:", displayImageUrl);
  console.log("Generated zoomImageUrl:", zoomImageUrl);
  useEffect(() => {
    console.log("Image container ref:", imageContainerRef.current);
  }, [imageContainerRef]);


  return (
    <>
      <Head>
        <title>{`${product.name} | Kt'i`}</title>
      </Head>
      <Header />
      <main className={`container ${styles.productLayout}`}>
        {/* Navigation Rapide */}
        <div style={{ 
          gridColumn: '1 / -1', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #eee',
          width: '100%'
        }}>
          <Link href="/produits" style={{ textDecoration: 'none', color: '#666', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
            ← Retour aux produits
          </Link>
          <Link href="/panier" style={{ textDecoration: 'none', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            Voir mon panier →
          </Link>
        </div>

        {/* Image Gallery */}
        <div className={styles.imageGallery}>
          {/* Main Large Image */}
          <div 
            ref={imageContainerRef}
            className={styles.imageZoomContainer} // Use a class for custom styles
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
          >
            {selectedImage ? (
              <Image
                src={displayImageUrl}
                alt={selectedImage.alt || product.name}
                fill
                style={{ objectFit: 'contain' }}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className={styles.imagePlaceholder} style={{ width: '100%', height: '100%' }} />
            )}
            
            {isZoomed && (
              <div 
                className={styles.loupe}
                style={{
                  backgroundImage: `url(${zoomImageUrl})`,
                  backgroundPosition: `${zoomCoords.x}% ${zoomCoords.y}%`
                }}
              />
            )}
          </div>

          {/* Caption for the view */}
          {selectedImage && selectedImage.label && (
            <p style={{ textAlign: 'center', marginTop: '0.5rem', fontStyle: 'italic', color: '#666' }}>
              Vue : {selectedImage.label} <span style={{ fontSize: '0.8rem', color: '#999' }}>(Survoler ou cliquer pour zoomer)</span>
            </p>
          )}

          {/* Thumbnails Grid */}
          {product.images && product.images.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem', overflowX: 'auto', paddingBottom: '10px' }}>
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  style={{
                    border: selectedImage === img ? '2px solid var(--color-primary)' : '1px solid #ddd',
                    borderRadius: '4px',
                    padding: 0,
                    cursor: 'pointer',
                    minWidth: '80px',
                    height: '80px',
                    position: 'relative',
                    overflow: 'hidden',
                    opacity: selectedImage === img ? 1 : 0.7,
                    transition: 'all 0.2s'
                  }}
                >
                   <Image
                    src={urlFor(img).width(200).url()} // Load smaller version for thumbnail
                    alt={img.alt || `Vue ${index + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </button>
              ))}
            </div>
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
      images[]{..., asset->}, // Fetch all fields including label and alt
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
