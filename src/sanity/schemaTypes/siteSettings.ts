import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Paramètres du Site',
  type: 'document',
  // Add tabs
  groups: [
    {
      name: 'general',
      title: 'Paramètres Généraux',
      default: true,
    },
    {
      name: 'story',
      title: 'Mon Histoire',
    },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Titre du Site',
      type: 'string',
      validation: (Rule) => Rule.required(),
      group: 'general',
    }),
    defineField({
      name: 'tagline',
      title: 'Slogan / Phrase d\'accroche',
      type: 'text',
      rows: 2,
      group: 'general',
    }),
    defineField({
      name: 'heroImage',
      title: 'Image de Bannière (Hero)',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Image principale pour la bannière d\'introduction.',
      group: 'general',
    }),
    defineField({
      name: 'callToActionText',
      title: 'Texte du Bouton d\'Action',
      type: 'string',
      group: 'general',
    }),
    defineField({
      name: 'callToActionLink',
      title: 'Lien du Bouton d\'Action',
      type: 'url',
      description: 'Ex: /produits ou https://external.com',
      group: 'general',
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
      group: 'story',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'tagline',
    },
  },
})