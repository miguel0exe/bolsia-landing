export const siteConfig = {
  brand: {
    name: 'Bolsía',
    description:
      'Controla tus gastos, establece metas y entiende mejor tus finanzas personales.',
    logo: '/logo.png',
    favicon: '/favicon.ico',
  },
  seo: {
    title: 'Bolsía — Tus finanzas, a tu manera',
    description:
      'Bolsía te ayuda a controlar tus gastos, establecer metas y tomar mejores decisiones con tu dinero.',
  },
  download: {
    apkUrl: 'https://github.com/miguel0exe/app-releases/releases/latest/download/bolsia-app.apk',
    fileName: 'Bolsia.apk',
    version: '1.0.0',
    size: '~15 MB',
  },
  assets: {
    heroScreenshot: '/home-balance.webp',
    historyScreenshot: '/transaction-history.webp',
    goalsScreenshot: '/savings-empty.webp',
    expenseScreenshot: '/expense-entry.webp',
    analysisScreenshot: '/spending-analysis.webp',
    quickActionsScreenshot: '/quick-actions.webp',
    logo: '/logo.png',
    favicon: '/favicon.ico',
  },
  locales: ['es', 'en'] as const,
  defaultLocale: 'es' as const,
};

export type Locale = (typeof siteConfig.locales)[number];
export type HeroVariant = 'mint' | 'lavender';
