// src/sanity/schemaTypes/legalPage.ts

import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'legalPage',
  title: 'Page Légale (Mentions, CGV, etc.)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titre de la Page',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Contenu',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }, { title: 'H1', value: 'h1' }, { title: 'H2', value: 'h2' }, { title: 'H3', value: 'h3' }],
          lists: [{ title: 'Bullet', value: 'bullet' }, { title: 'Numbered', value: 'number' }],
          marks: {
            decorators: [{ title: 'Strong', value: 'strong' }, { title: 'Emphasis', value: 'em' }],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'URL',
                fields: [
                  {
                    title: 'URL',
                    name: 'href',
                    type: 'url',
                  },
                ],
              },
            ],
          },
        },
        // You can add other types here, like images, if needed
        // {
        //   type: 'image',
        //   options: { hotspot: true },
        // },
      ],
    }),
  ],
});
