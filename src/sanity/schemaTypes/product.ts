import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'product',
  title: 'Produits', // Titre du menu à gauche
  type: 'document',
  fieldsets: [
    {
      name: 'inventory',
      title: '📦 Inventaire & Prix',
      options: {collapsible: true, collapsed: false},
    },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Nom de la création',
      description: 'Donnez un nom unique et descriptif à votre produit.',
      type: 'string',
      validation: (Rule) => Rule.required().error('Le nom de la création est obligatoire.'),
    }),
    defineField({
      name: 'slug',
      title: 'Lien unique (URL)',
      type: 'slug',
      description:
        "C'est l'adresse web du produit. 👉 Cliquez simplement sur le bouton 'Generate' une fois le nom rempli.",
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error("N'oubliez pas de générer le lien (Slug) !"),
    }),
    defineField({
      name: 'images',
      title: 'Galerie Photos',
      description:
        "Ajoutez de belles photos. 💡 IMPORTANT : La première photo de la liste sera l'image principale du site.",
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
              description: "Permet d'afficher une légende sous la photo (ex: 'Vue de dos').",
              options: {
                list: [
                  {title: 'Face Avant', value: 'Face Av'},
                  {title: 'Face Arrière', value: 'Face Ar'},
                  {title: 'Dessus', value: 'Dessus'},
                  {title: 'Dessous', value: 'Dessous'},
                  {title: 'Côté Droit', value: 'Droit'},
                  {title: 'Côté Gauche', value: 'Gauche'},
                  {title: 'Détail / Singularité', value: 'Singularité'},
                  {title: 'Mise en situation', value: 'Mise en situation'},
                  {title: 'Autre', value: 'Autre'},
                ],
                layout: 'dropdown',
              },
            },
            {
              name: 'alt',
              type: 'string',
              title: 'Description pour aveugles & Google (Alt Text)',
              description:
                "Décrivez brièvement l'image (ex: 'Sac en cuir rouge posé sur une table'). C'est très important pour être bien classé sur Google.",
            },
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(1).error('Il faut au moins une photo !'),
    }),
    defineField({
      name: 'reference',
      title: 'Référence Unique',
      description: "Un code unique pour identifier ce produit (ex: 'SAC-CUIR-001').",
      type: 'string',
      fieldset: 'inventory',
      validation: (Rule) =>
        Rule.required()
          .error('La référence est obligatoire.')
          .custom(async (reference, context) => {
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
            return result ? true : 'Cette référence existe déjà pour un autre produit.'
          }),
    }),
    defineField({
      name: 'price',
      title: 'Prix (€)',
      type: 'number',
      fieldset: 'inventory',
      validation: (Rule) => Rule.required().positive().error('Le prix doit être supérieur à 0.'),
    }),
    defineField({
      name: 'stock',
      title: 'Stock disponible',
      description: 'Combien en avez-vous en stock prêt à partir ?',
      type: 'number',
      fieldset: 'inventory',
      validation: (Rule) => Rule.required().min(0).error('Le stock ne peut pas être négatif.'),
    }),
    defineField({
      name: 'status',
      title: 'Type de vente',
      description:
        "- Pièce Unique : Une seule existante.\n- Sur Commande : Vous pouvez en refaire sur demande.",
      type: 'string',
      fieldset: 'inventory',
      options: {
        list: [
          {title: '✨ Pièce Unique (1 seul exemplaire)', value: 'unique'},
          {title: '🛠️ Sur Commande (Refabrication possible)', value: 'sur-commande'},
        ],
        layout: 'radio',
      },
      initialValue: 'unique',
    }),
    defineField({
      name: 'customizationOptions',
      title: 'Options de personnalisation',
      description:
        'Expliquez ce qui est modifiable pour une commande (ex: "Choix de la couleur du fil, gravure initiales...").',
      type: 'text',
      rows: 3,
      fieldset: 'inventory',
      hidden: ({document}) => document?.status !== 'sur-commande',
    }),
    defineField({
      name: 'description',
      title: 'Description détaillée',
      description: "Racontez l'histoire de cet objet, ses usages, ses petits détails...",
      type: 'text',
      rows: 6,
    }),
    defineField({
      name: 'materials',
      title: 'Matériaux utilisés',
      description: 'Sélectionnez les matériaux qui composent ce produit.',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'material'}]}],
    }),
    defineField({
      name: 'dimensions',
      title: '📏 Dimensions',
      description: "Dimensions de l'objet fini (en centimètres). Cliquez pour dérouler.",
      type: 'object',
      options: {
        collapsible: true,
        collapsed: true,
      },
      fields: [
        defineField({name: 'height', type: 'number', title: 'Hauteur (cm)'}),
        defineField({name: 'width', type: 'number', title: 'Largeur (cm)'}),
        defineField({name: 'depth', type: 'number', title: 'Profondeur (cm)'}),
      ],
    }),
    defineField({
      name: 'isNew',
      title: 'Mettre en avant (Nouveauté)',
      description: "Si coché, ce produit apparaîtra dans la section 'Nouveautés' de l'accueil.",
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'price',
      media: 'images.0.asset',
      stock: 'stock',
    },
    prepare(selection) {
      const {title, subtitle, media, stock} = selection
      return {
        title: title,
        subtitle: `${subtitle}€ - Stock: ${stock}`,
        media: media,
      }
    },
  },
})
