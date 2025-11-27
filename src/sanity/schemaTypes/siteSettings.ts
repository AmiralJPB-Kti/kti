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
    {
      name: 'shipping',
      title: 'Livraison',
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
    // --- Champs Livraison ---
    defineField({
      name: 'shippingRateHome',
      title: 'Frais de Port : Domicile (Colissimo)',
      type: 'number',
      description: 'Prix standard pour la livraison à domicile en FRANCE (en €).',
      validation: (Rule) => Rule.min(0),
      group: 'shipping',
    }),
    defineField({
      name: 'shippingRateInternational',
      title: 'Frais de Port : Domicile (International)',
      type: 'number',
      description: 'Prix standard pour la livraison à domicile HORS FRANCE (en €).',
      validation: (Rule) => Rule.min(0),
      group: 'shipping',
    }),
    defineField({
      name: 'shippingRateRelay',
      title: 'Frais de Port : Point Relais',
      type: 'number',
      description: 'Prix standard pour la livraison en point relais en FRANCE (en €).',
      validation: (Rule) => Rule.min(0),
      group: 'shipping',
    }),
    defineField({
      name: 'shippingRateRelayInternational',
      title: 'Frais de Port : Point Relais (International)',
      type: 'number',
      description: 'Prix standard pour la livraison en point relais HORS FRANCE (en €).',
      validation: (Rule) => Rule.min(0),
      group: 'shipping',
    }),
    defineField({
      name: 'freeShippingThreshold',
      title: 'Seuil de Livraison Offerte',
      type: 'number',
      description: 'Montant du panier à partir duquel la livraison est GRATUITE (en €). Laisser vide ou 0 pour désactiver.',
      validation: (Rule) => Rule.min(0),
      group: 'shipping',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'tagline',
    },
  },
})