import Head from 'next/head'
import { client } from '@/sanity/lib/client'
import groq from 'groq'
import Header from '@/components/Header'
import ProductCard from '@/components/ProductCard'
import styles from '@/styles/Home.module.css' // Re-using homepage grid styles

// Define types for our data
interface Product {
  _id: string;
  name: string;
  mainImage: any;
  slug: { current: string };
  price?: number;
}

interface ProductsPageProps {
  products: Product[];
}

export default function ProductsPage({ products }: ProductsPageProps) {
  return (
    <>
      <Head>
        <title>Nos Produits | Kt'i</title>
        <meta name="description" content="Découvrez toutes nos créations de maroquinerie artisanale." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className="container">
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Tous Nos Produits</h1>
        <div className={styles.productGrid}>
          {products && products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          ) : (
            <p>Aucun produit à afficher pour le moment.</p>
          )}
        </div>
      </main>
    </>
  )
}

// This function runs at build time to fetch data from Sanity
export async function getStaticProps() {
  // Query all products, fetching all fields needed for the ProductCard
  const query = groq`*[_type == "product"]{
    _id,
    name,
    slug,
    price,
    "mainImage": images[0]
  }`
  
  const products = await client.fetch(query)

  return {
    props: {
      products: products || [],
    },
    revalidate: 60, // Re-generate the page every 60 seconds
  }
}
