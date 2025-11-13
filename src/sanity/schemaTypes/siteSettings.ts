import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Paramètres du Site',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titre du Site',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Slogan / Phrase d\'accroche',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'heroImage',
      title: 'Image de Bannière (Hero)',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Image principale pour la bannière d\'introduction.',
    }),
    defineField({
      name: 'callToActionText',
      title: 'Texte du Bouton d\'Action',
      type: 'string',
    }),
    defineField({
      name: 'callToActionLink',
      title: 'Lien du Bouton d\'Action',
      type: 'url',
      description: 'Ex: /produits ou https://external.com',
    }),
    defineField({
      name: 'myStoryContent',
      title: 'Contenu "Mon Histoire"',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
            ],
            annotations: [],
          },
        },
      ],
      description: 'Contenu de la section "Mon Histoire" sur la page d\'accueil.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'tagline',
    },
  },
})