import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { client } from '@/sanity/lib/client';
import groq from 'groq';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import styles from '@/styles/Home.module.css';

// Define types for our data (same as products.tsx)
interface Product {
  _id: string;
  name: string;
  mainImage: any;
  slug: { current: string };
  price?: number;
}

export default function SearchPage() {
  const router = useRouter();
  const { q } = router.query; // Get search term from URL
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only search if 'q' is defined and is a string
    if (q && typeof q === 'string') {
      const fetchResults = async () => {
        setLoading(true);
        try {
          // GROQ Query: Search in name, description, or reference
          // Use wildcards * for partial matches
          const query = groq`*[_type == "product" && (
            name match $term + "*" || 
            description match $term + "*" ||
            reference match $term + "*"
          )]{
            _id,
            name,
            slug,
            price,
            "mainImage": images[0]
          }`;

          const results = await client.fetch(query, { term: q });
          setProducts(results || []);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchResults();
    } else {
      setProducts([]);
    }
  }, [q]); // Re-run effect when 'q' changes

  return (
    <>
      <Head>
        <title>{`Recherche : ${q || ''} | Kt'i`}</title>
        <meta name="description" content="Résultats de recherche." />
      </Head>
      <Header />
      <main className="container">
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {q ? `Résultats pour "${q}"` : 'Recherche'}
        </h1>

        {loading ? (
          <p style={{ textAlign: 'center' }}>Recherche en cours...</p>
        ) : (
          <div className={styles.productGrid}>
            {products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              q && <p style={{ textAlign: 'center', width: '100%' }}>Aucun résultat trouvé pour "{q}".</p>
            )}
          </div>
        )}
      </main>
    </>
  );
}
