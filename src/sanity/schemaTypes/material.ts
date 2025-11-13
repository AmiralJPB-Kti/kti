import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'material',
  title: 'Matériau',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nom du matériau',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Catégorie',
      type: 'string',
      options: {
        list: [
          {title: 'Cuir', value: 'cuir'},
          {title: 'Tissu', value: 'tissu'},
          {title: 'Métal', value: 'metal'},
          {title: 'Autre', value: 'autre'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
    },
  },
})
