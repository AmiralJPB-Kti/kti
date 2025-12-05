import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'material',
  title: 'Matériaux',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nom du matériau',
      description: 'Ex: Cuir de vachette, Lin lavé, Laiton...',
      type: 'string',
      validation: (Rule) => Rule.required().error('Le nom du matériau est obligatoire.'),
    }),
    defineField({
      name: 'category',
      title: 'Type de matière',
      description: 'Cela permet de classer les matériaux.',
      type: 'string',
      options: {
        list: [
          {title: '🐮 Cuir / Peau', value: 'cuir'},
          {title: '🧶 Tissu / Textile', value: 'tissu'},
          {title: '🔗 Métal / Bouclerie', value: 'metal'},
          {title: '✨ Autre', value: 'autre'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required().error('Veuillez choisir une catégorie.'),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
    },
  },
})
