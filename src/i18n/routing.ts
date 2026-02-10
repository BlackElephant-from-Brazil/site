import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['pt', 'es', 'en', 'de', 'fr', 'it'],
  defaultLocale: 'pt',
  localePrefix: 'as-needed',
})
