// src/pages/legal/[slug].tsx

import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { client } from '@/sanity/lib/client'; // Assuming Sanity client is already configured
import { PortableText } from '@portabletext/react'; // For rendering block content
import Header from '@/components/Header'; // Assuming you have a Header component
import Footer from '@/components/Footer'; // Assuming you have a Footer component, or will create one

// Define the type for the legal page data
interface LegalPageData {
  title: string;
  slug: { current: string };
  content: any[]; // PortableText content
}

// PortableText components to customize rendering (e.g., for custom blocks, marks)
// You might want to move this to a separate file if it gets complex
const components = {
  block: {
    // Ex. customize paragraph
    normal: ({children}: any) => <p style={{ marginBottom: '1em', lineHeight: '1.6' }}>{children}</p>,
    h1: ({children}: any) => <h1 style={{ fontSize: '2em', marginTop: '1.5em', marginBottom: '0.5em' }}>{children}</h1>,
    h2: ({children}: any) => <h2 style={{ fontSize: '1.5em', marginTop: '1.2em', marginBottom: '0.5em' }}>{children}</h2>,
    h3: ({children}: any) => <h3 style={{ fontSize: '1.2em', marginTop: '1em', marginBottom: '0.5em' }}>{children}</h3>,
  },
  list: {
    bullet: ({children}: any) => <ul style={{ listStyleType: 'disc', marginLeft: '1.5em', marginBottom: '1em' }}>{children}</ul>,
    number: ({children}: any) => <ol style={{ listStyleType: 'decimal', marginLeft: '1.5em', marginBottom: '1em' }}>{children}</ol>,
  },
  listItem: {
    bullet: ({children}: any) => <li style={{ marginBottom: '0.5em' }}>{children}</li>,
    number: ({children}: any) => <li style={{ marginBottom: '0.5em' }}>{children}</li>,
  },
  // Add more custom components for marks (bold, italic, links), types (images, custom blocks)
  // For basic text, the default rendering often works for simple marks.
};


interface LegalPageProps {
  page: LegalPageData;
}

const LegalPage = ({ page }: LegalPageProps) => {
  const router = useRouter();

  if (router.isFallback) {
    return <p style={{textAlign: 'center', marginTop: '2rem'}}>Chargement de la page...</p>;
  }

  if (!page) {
    return (
      <>
        <Head><title>Page introuvable | Kt'i</title></Head>
        <Header />
        <main style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem', minHeight: '60vh' }}>
          <h1 style={{textAlign: 'center'}}>Page introuvable</h1>
          <p style={{textAlign: 'center'}}>Désolé, cette page n'existe pas ou n'est pas encore publiée.</p>
        </main>
        {/* <Footer /> */}
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{page.title} | Kt'i</title>
      </Head>
      <Header />
      <main style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem', minHeight: '60vh' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>{page.title}</h1>
        <div className="prose"> {/* Add 'prose' class for default styling if you use Tailwind CSS typography plugin */}
          {page.content && <PortableText value={page.content} components={components} />}
        </div>
      </main>
      {/* <Footer /> */}
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  // Fetch all possible slugs for legal pages
  const slugs = await client.fetch(`*[_type == "legalPage" && defined(slug.current)][].slug.current`);

  const paths = slugs.map((slug: string) => ({
    params: { slug },
  }));

  return { paths, fallback: true };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;

  const page = await client.fetch(`*[_type == "legalPage" && slug.current == $slug][0]{
    title,
    slug,
    content
  }`, { slug });

  if (!page) {
    return {
      notFound: true,
      revalidate: 1, // Revalidate every 1 second
    };
  }

  return {
    props: {
      page,
    },
    revalidate: 1, // Revalidate every 1 second (ISR)
  };
};

export default LegalPage;
