// src/sanity/schemaTypes/legalPage.ts

import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'legalPage',
  title: 'Pages Légales (CGV, Mentions...)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titre de la Page',
      description: "Ex: 'Conditions Générales de Vente' ou 'Mentions Légales'",
      type: 'string',
      validation: (rule) => rule.required().error('Le titre est obligatoire.'),
    }),
    defineField({
      name: 'slug',
      title: 'Lien (URL)',
      description: "C'est l'adresse de la page. Cliquez sur 'Generate' une fois le titre rempli.",
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required().error('Le lien (slug) est obligatoire.'),
    }),
    defineField({
      name: 'content',
      title: 'Contenu du texte',
      description: 'Rédigez ici votre texte légal. Vous pouvez mettre des titres et du gras.',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }, { title: 'Grand Titre (H1)', value: 'h1' }, { title: 'Sous-Titre (H2)', value: 'h2' }, { title: 'Petit Titre (H3)', value: 'h3' }],
          lists: [{ title: 'Liste à puces', value: 'bullet' }, { title: 'Liste numérotée', value: 'number' }],
          marks: {
            decorators: [{ title: 'Gras', value: 'strong' }, { title: 'Italique', value: 'em' }],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Lien Externe',
                fields: [
                  {
                    title: 'URL (Adresse web)',
                    name: 'href',
                    type: 'url',
                  },
                ],
              },
            ],
          },
        },
      ],
    }),
  ],
});
