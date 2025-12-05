import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: '⚙️ Paramètres du Site',
  type: 'document',
  // Onglets pour organiser
  groups: [
    {
      name: 'general',
      title: '🏠 Accueil & Général',
      default: true,
    },
    {
      name: 'story',
      title: '📖 L\'Atelier (Histoire)',
    },
    {
      name: 'shipping',
      title: '🚚 Frais de Livraison',
    },
    {
      name: 'communication',
      title: '📧 Communication & Footer',
    },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Nom du Site',
      description: "C'est le nom qui apparaît dans l'onglet du navigateur.",
      type: 'string',
      validation: (Rule) => Rule.required().error('Le titre du site est obligatoire.'),
      group: 'general',
    }),
    defineField({
      name: 'tagline',
      title: 'Phrase d\'accroche (Slogan)',
      description: "S'affiche sur la bannière d'accueil.",
      type: 'text',
      rows: 2,
      group: 'general',
    }),
    defineField({
      name: 'heroImage',
      title: 'Grande Image de Bannière',
      description: "Choisissez une image large et de haute qualité pour l'accueil.",
      type: 'image',
      options: {
        hotspot: true,
      },
      group: 'general',
    }),
    defineField({
        name: 'overlayOpacity',
        title: 'Assombrissement de la bannière (%)',
        description: "Règle l'intensité du filtre noir sur l'image pour rendre le texte plus lisible. 0 = Transparent, 100 = Tout noir.",
        type: 'number',
        validation: (Rule) => Rule.min(0).max(100),
        options: {
            range: { min: 0, max: 100, step: 10 }
        },
        initialValue: 30, // Valeur par défaut équilibrée
        group: 'general',
    }),
    defineField({
      name: 'callToActionText',
      title: 'Texte du Bouton Principal',
      description: "Ex: 'Découvrir les créations'",
      type: 'string',
      group: 'general',
    }),
    defineField({
      name: 'callToActionLink',
      title: 'Destination du Bouton',
      type: 'url',
      description:
        "Où le bouton doit-il emmener ? Utilisez '/produits' pour aller à la boutique, ou une adresse complète (https://...) pour un lien externe.",
      validation: (Rule) =>
        Rule.uri({
          allowRelative: true,
          scheme: ['http', 'https', 'mailto', 'tel'],
        }),
      group: 'general',
    }),
    defineField({
      name: 'myStoryContent',
      title: 'Texte "L\'Atelier"',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [],
          marks: {
            decorators: [
              {title: 'Gras', value: 'strong'},
              {title: 'Italique', value: 'em'},
            ],
            annotations: [],
          },
        },
      ],
      description: 'Rédigez ici le texte de présentation de votre atelier.',
      group: 'story',
    }),
    // --- Champs Communication ---
    defineField({
        name: 'footerText',
        title: 'Texte Pied de Page',
        description: "Petit texte court sous 'L\'Atelier Kt\'i' en bas de chaque page.",
        type: 'text',
        rows: 3,
        group: 'communication',
    }),
    defineField({
        name: 'contactEmail',
        title: 'Email de Contact Public',
        type: 'string',
        group: 'communication',
    }),
    defineField({
        name: 'instagramLink',
        title: 'Lien Instagram',
        type: 'url',
        group: 'communication',
    }),
    defineField({
        name: 'facebookLink',
        title: 'Lien Facebook',
        type: 'url',
        group: 'communication',
    }),
    // --- Champs Livraison ---
    defineField({
      name: 'shippingRateHome',
      title: '📦 Colissimo France (Domicile)',
      type: 'number',
      description: 'Prix de la livraison standard en France.',
      validation: (Rule) => Rule.min(0).error('Le prix ne peut pas être négatif.'),
      group: 'shipping',
    }),
    defineField({
      name: 'shippingRateInternational',
      title: '🌍 Colissimo International (Domicile)',
      type: 'number',
      description: 'Prix de la livraison à domicile pour le Reste du Monde.',
      validation: (Rule) => Rule.min(0).error('Le prix ne peut pas être négatif.'),
      group: 'shipping',
    }),
    defineField({
      name: 'shippingRateRelay',
      title: '🏪 Mondial Relay France',
      type: 'number',
      description: 'Prix de la livraison en Point Relais en France.',
      validation: (Rule) => Rule.min(0).error('Le prix ne peut pas être négatif.'),
      group: 'shipping',
    }),
    defineField({
      name: 'shippingRateRelayInternational',
      title: '🌍 Mondial Relay International',
      type: 'number',
      description: 'Prix de la livraison en Point Relais pour le Reste du Monde.',
      validation: (Rule) => Rule.min(0).error('Le prix ne peut pas être négatif.'),
      group: 'shipping',
    }),
    defineField({
      name: 'freeShippingThreshold',
      title: '🎁 Livraison OFFERTE à partir de...',
      type: 'number',
      description: "Montant du panier (en €) pour déclencher la livraison gratuite. Mettez 0 si vous ne voulez pas offrir la livraison.",
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