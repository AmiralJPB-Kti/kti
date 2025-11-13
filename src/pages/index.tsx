import Head from 'next/head'
import { client } from '@/sanity/lib/client'
import groq from 'groq'
import ProductCard from '@/components/ProductCard'
import Header from '@/components/Header'
import HeroBanner from '@/components/HeroBanner' // Import the new HeroBanner component
import styles from '@/styles/Home.module.css'

// Define types for our data
interface Product {
  _id: string;
  name: string;
  mainImage: any;
  slug: { current: string };
}

interface SiteSettings {
  title: string;
  tagline?: string;
  heroImage?: any;
  callToActionText?: string;
  callToActionLink?: string;
}

interface HomeProps {
  products: Product[];
  settings: SiteSettings;
}

export default function Home({ products, settings }: HomeProps) {
  return (
    <>
      <Head>
        <title>{settings?.title || "Kt'i - Maroquinerie Artisanale"}</title>
        <meta name="description" content={settings?.tagline || "Sacs et accessoires en cuir faits main."} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <HeroBanner settings={settings} />
      <main className="container" style={{ paddingTop: '4rem' }}>
        <section>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Nos Produits</h2>
          <div className={styles.productGrid}>
            {products && products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <p>Aucun produit à afficher pour le moment.</p>
            )}
          </div>
        </section>
      </main>
    </>
  )
}

// This function runs at build time to fetch data from Sanity
export async function getStaticProps() {
  const query = groq`{
    "products": *[_type == "product"]{
      _id,
      name,
      slug,
      "mainImage": images[0]
    },
    "settings": *[_type == "siteSettings"][0]{
      title,
      tagline,
      heroImage,
      callToActionText,
      callToActionLink
    }
  }`
  
  const data = await client.fetch(query)

  return {
    props: {
      products: data.products || [],
      settings: data.settings || {},
    },
    revalidate: 60,
  }
}
