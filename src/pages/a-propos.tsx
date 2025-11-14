import Head from 'next/head'
import { client } from '@/sanity/lib/client'
import groq from 'groq'
import { PortableText } from '@portabletext/react'
import Header from '@/components/Header'

interface StoryPageProps {
  storyContent: any;
  siteTitle?: string;
}

const components = {
  block: {
    normal: ({children}: any) => <p style={{ marginBottom: '1em', lineHeight: '1.6' }}>{children}</p>,
  },
  marks: {
    strong: ({children}: any) => <strong style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{children}</strong>,
    em: ({children}: any) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
  },
};

export default function AboutPage({ storyContent, siteTitle }: StoryPageProps) {
  return (
    <>
      <Head>
        <title>Mon Histoire | {siteTitle || "Kt'i"}</title>
        <meta name="description" content="L'histoire de la création de Kt'i, maroquinerie artisanale." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <article style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Mon Histoire</h1>
          {storyContent ? (
            <div style={{textAlign: 'left', textIndent: '2em'}}>
              <PortableText value={storyContent} components={components} />
            </div>
          ) : (
            <p>Le contenu de cette page est en cours de rédaction.</p>
          )}
        </article>
      </main>
    </>
  )
}

export async function getStaticProps() {
  const query = groq`*[_type == "siteSettings"][0]{
    myStoryContent,
    "siteTitle": title
  }`
  
  const data = await client.fetch(query)

  return {
    props: {
      storyContent: data?.myStoryContent || null,
      siteTitle: data?.siteTitle || null,
    },
    revalidate: 60,
  }
}
