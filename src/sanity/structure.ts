import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenu')
    .items([
      // Singleton: Paramètres du Site
      S.listItem()
        .title('Paramètres du Site')
        .id('siteSettings')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
        ),
        
      S.divider(),

      // List out the rest of the document types, but filter out the singleton type
      ...S.documentTypeListItems().filter(
        (listItem) => listItem.getId() !== 'siteSettings'
      ),
    ])
