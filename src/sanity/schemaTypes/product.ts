import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'product',
  title: 'Produit',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nom du produit',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'reference',
      title: 'Référence',
      type: 'string',
      validation: (Rule) =>
        Rule.required().custom(async (reference, context) => {
          const {document, getClient} = context
          if (!document || !reference) {
            return true
          }
          const client = getClient({apiVersion: '2023-05-03'})
          const id = document._id.replace('drafts.', '')
          const params = {
            draft: `drafts.${id}`,
            published: id,
            reference,
          }
          const query = `!defined(*[_type == "product" && !(_id in [$draft, $published]) && reference == $reference][0]._id)`
          const result = await client.fetch(query, params)
          return result ? true : 'Cette référence est déjà utilisée.'
        }),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description longue',
      type: 'text',
    }),
    defineField({
      name: 'dimensions',
      title: 'Dimensions (cm)',
      type: 'object',
      fields: [
        {name: 'height', type: 'number', title: 'Hauteur'},
        {name: 'width', type: 'number', title: 'Largeur'},
        {name: 'depth', type: 'number', title: 'Profondeur'},
      ],
    }),
    defineField({
      name: 'materials',
      title: 'Matériaux',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'material'}]}],
    }),
    defineField({
      name: 'images',
      title: 'Photos du produit',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {
              name: 'label',
              type: 'string',
              title: 'Vue / Angle',
              options: {
                list: [
                  {title: 'Face Avant', value: 'Face Av'},
                  {title: 'Face Arrière', value: 'Face Ar'},
                  {title: 'Dessus', value: 'Dessus'},
                  {title: 'Dessous', value: 'Dessous'},
                  {title: 'Côté Droit', value: 'Droit'},
                  {title: 'Côté Gauche', value: 'Gauche'},
                  {title: 'Détail / Singularité', value: 'Singularité'},
                  {title: 'Autre', value: 'Autre'},
                ],
                layout: 'dropdown', // Afficher en menu déroulant
              },
            },
            {
              name: 'alt',
              type: 'string',
              title: 'Texte alternatif (Pour le référencement Google)',
              description: 'Décrivez brièvement l\'image (ex: Sac rouge vue de face)',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'price',
      title: 'Prix (€)',
      type: 'number',
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: 'stock',
      title: 'Stock disponible',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'status',
      title: 'Statut',
      type: 'string',
      options: {
        list: [
          {title: 'Pièce Unique', value: 'unique'},
          {title: 'Sur Commande', value: 'sur-commande'},
        ],
        layout: 'radio',
      },
      initialValue: 'unique',
    }),
    defineField({
      name: 'customizationOptions',
      title: 'Options de personnalisation (Si "Sur Commande")',
      type: 'text',
      rows: 3,
      description: 'Expliquez ici ce qui peut être modifié pour une refabrication (ex: "Disponible dans d\'autres coloris de cuir, sangle différente...").',
      hidden: ({document}) => document?.status !== 'sur-commande', // Masquer si ce n'est pas sur commande
    }),
    defineField({
      name: 'isNew',
      title: 'Nouveauté',
      type: 'boolean',
      description: 'Cocher cette case pour faire apparaître le produit sur la page d\'accueil comme une nouveauté.',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'images.0.asset',
    },
  },
})
