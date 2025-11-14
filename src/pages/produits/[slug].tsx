import Head from 'next/head'
import { GetStaticProps, GetStaticPaths } from 'next'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import groq from 'groq'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import Header from '@/components/Header'
import styles from '@/styles/ProductDetail.module.css'

// Define the type for a single detailed product
interface Product {
  _id: string;
  name: string;
  images: any[];
  description: string; // Changed to string
  price: number;
  dimensions: {
    height?: number;
    width?: number;
    depth?: number;
  };
  reference: string; // Added reference
  materials: { _id: string; name: string; }[]; // Added materials
}

interface ProductDetailPageProps {
  product: Product;
}

import { useCart } from '@/context/CartContext';

// ... (imports existants)

export default function ProductDetailPage({ product }: ProductDetailPageProps) {
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
      reference: product.reference, // Pass reference
    };
    addToCart(itemToAdd);
    // Optional: Add user feedback, e.g., a toast notification
    alert(`"${product.name}" a été ajouté au panier !`);
  };

  return (
    <>
      <Head>
        <title>{product.name} | Kt'i</title>
        {/* Add a meta description if a short description field exists */}
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
          {/* Thumbnails could go here */}
        </div>

        {/* Product Info */}
        <div className={styles.productInfo}>
          <h1>{product.name}</h1>
          <p className={styles.price}>{product.price.toFixed(2)} €</p>
          
          <div className={styles.description}>
            {product.description ? (
              <p>{product.description}</p> // Render as plain text
            ) : (
              <p>Aucune description disponible.</p>
            )}
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

          <button 
            className="btn btn-primary" 
            style={{marginTop: '2rem', width: '100%'}}
            onClick={handleAddToCart}
          >
            Ajouter au panier
          </button>
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
    fallback: 'blocking', // or true if you want to show a loading state
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
      reference, // Fetch reference
      materials[]->{_id, name} // Fetch materials
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
