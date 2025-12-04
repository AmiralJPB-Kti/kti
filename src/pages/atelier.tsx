import { GetStaticProps } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic'; // Import dynamic de Next.js
import { client } from '../sanity/lib/client';
import { PortableText } from '@portabletext/react';
import Header from '@/components/Header';
import groq from 'groq';

// Import dynamique de ReactPlayer avec SSR désactivé
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

// Helper pour extraire l'ID YouTube
const getYouTubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Types
interface VideoPost {
  _id: string;
  title: string;
  videoUrl: string;
  description: string;
  publishedAt: string;
}

interface AtelierPageProps {
  videoPosts: VideoPost[];
  storyContent: any;
  siteTitle?: string;
}

// Composants pour le texte riche (PortableText)
const components = {
  block: {
    normal: ({children}: any) => <p style={{ marginBottom: '1em', lineHeight: '1.6' }}>{children}</p>,
  },
  marks: {
    strong: ({children}: any) => <strong style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{children}</strong>,
    em: ({children}: any) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
  },
};

export default function AtelierPage({ videoPosts, storyContent, siteTitle }: AtelierPageProps) {
  return (
    <>
      <Head>
        <title>{`L'Atelier | ${siteTitle || "Kt'i"}`}</title>
        <meta name="description" content="Découvrez l'histoire et les coulisses de l'atelier Kt'i en vidéo." />
      </Head>
      
      <Header />

      <main className="container mx-auto px-4 py-12">
        
        {/* Section 1 : L'Histoire (Texte) */}
        <article className="max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl font-heading text-center mb-8">L'Atelier</h1>
          
          {storyContent ? (
            <div className="text-left indent-8 text-lg leading-relaxed text-gray-700 font-body">
              <PortableText value={storyContent} components={components} />
            </div>
          ) : (
            <p className="text-center text-gray-500 italic">L'histoire de l'atelier est en cours d'écriture...</p>
          )}
        </article>

        {/* Section 2 : Les Vidéos */}
        <section>
          <h2 className="text-3xl font-heading text-center mb-10 border-t border-gray-200 pt-10">
            En Vidéo
          </h2>

          {videoPosts.length === 0 ? (
            <p className="text-center text-gray-500">Aucune vidéo pour le moment. Revenez bientôt !</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videoPosts.map((video) => {
                const youtubeId = getYouTubeId(video.videoUrl);
                
                return (
                  <div key={video._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
                    {/* Conteneur Vidéo (Ratio 16:9) */}
                    <div className="relative pt-[56.25%] bg-black">
                      {youtubeId ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${youtubeId}`}
                          title={video.title}
                          className="absolute top-0 left-0 w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : (
                        <ReactPlayer
                          url={video.videoUrl}
                          controls={true}
                          width="100%"
                          height="100%"
                          className="absolute top-0 left-0"
                        />
                      )}
                    </div>
                    
                    {/* Contenu Texte */}
                    <div className="p-6 flex-grow flex flex-col">
                      <h3 className="text-xl font-heading mb-2">{video.title}</h3>
                      <p className="text-gray-500 text-xs mb-3 uppercase tracking-wide">
                        {new Date(video.publishedAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      {video.description && (
                        <p className="text-gray-600 text-sm leading-relaxed flex-grow">
                          {video.description}
                        </p>
                      )}
                                          </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps<AtelierPageProps> = async () => {
  // Requête combinée pour récupérer les Settings (Histoire) ET les Vidéos
  const query = groq`{
    "settings": *[_type == "siteSettings"][0]{
      myStoryContent,
      "siteTitle": title
    },
    "videoPosts": *[_type == "videoPost"] | order(publishedAt desc){
      _id,
      title,
      videoUrl,
      description,
      publishedAt
    }
  }`;

  const data = await client.fetch(query);

  return {
    props: {
      storyContent: data?.settings?.myStoryContent || null,
      siteTitle: data?.settings?.siteTitle || null,
      videoPosts: data?.videoPosts || [],
    },
    revalidate: 60, // Revalidate every 60 seconds
  };
};
