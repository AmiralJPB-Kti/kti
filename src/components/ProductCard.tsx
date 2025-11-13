import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/sanity/lib/image'
import styles from '@/styles/ProductCard.module.css'

// Define the type for a single product
// Note: This should be moved to a shared types file later for better organization
interface Product {
  _id: string;
  name: string;
  mainImage: any;
  slug: { current: string };
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // A product might not have a slug or an image, so we add checks
  if (!product.slug || !product.slug.current) {
    return null;
  }

  return (
    <Link href={`/produits/${product.slug.current}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        {product.mainImage ? (
          <Image
            src={urlFor(product.mainImage).url()}
            alt={product.name}
            fill
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: '#eee' }} />
        )}
      </div>
      <h3>{product.name}</h3>
    </Link>
  )
}
