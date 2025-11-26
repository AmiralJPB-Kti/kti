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
      type: 'blockContent', // Utilisez le type blockContent si défini, sinon 'array' avec des blocs
    }),
  ],
});
