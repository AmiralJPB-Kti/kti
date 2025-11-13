import { type SchemaTypeDefinition } from 'sanity'
import product from './product'
import material from './material'
import siteSettings from './siteSettings'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [product, material, siteSettings],
}
