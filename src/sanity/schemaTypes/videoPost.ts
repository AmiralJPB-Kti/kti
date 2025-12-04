import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'videoPost',
  title: 'Vidéos de l\'Atelier',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Date de publication',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'videoUrl',
      title: 'Lien Vidéo (YouTube, Vimeo, etc.)',
      type: 'url',
      description: 'Copiez ici l\'adresse complète de la vidéo (ex: https://www.youtube.com/watch?v=...)',
      validation: (rule) => rule.required().uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Une courte description de l\'événement ou de la vidéo.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'publishedAt',
    },
  },
})