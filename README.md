# Bolsía

Landing page for Bolsía, a personal finance Android application. The site presents the product, its real Android screenshots, APK download instructions, and support for Spanish and English.

## Tech Stack

- **Astro 6** - Web framework
- **Tailwind CSS 4** - Styling
- **TypeScript** - Configuration and end-to-end tests
- **Playwright Test** - Browser testing

## Project Structure

```
public/             # Static logo, favicon, screenshots, and media
src/
├── components/     # Landing sections and client-side interactions
├── config/         # Centralized Bolsía brand and download configuration
├── layouts/        # Page layouts and metadata
├── pages/          # Astro routes
└── styles/         # Global styles
tests/
└── landing.spec.ts # Playwright end-to-end coverage
```

## Commands

| Command | Action |
| :--- | :--- |
| `pnpm install` | Installs dependencies |
| `pnpm dev` | Starts Astro development server |
| `pnpm build` | Builds the production site to `./dist/` |
| `pnpm preview` | Previews the production build locally |
| `pnpm test:e2e` | Builds the site and runs Playwright tests |
| `pnpm test:e2e:ui` | Opens the Playwright test UI |

## Development

```sh
pnpm install
pnpm dev
```

## End-to-end tests

The Playwright suite runs against the static production output through `astro preview`:

```sh
pnpm test:e2e
```

The first setup may require installing the browser binary:

```sh
pnpm exec playwright install chromium
```

Tests cover loading and key resources, navigation anchors, language switching, the mobile menu, APK links, FAQ interaction, responsive overflow, Features storytelling, reduced motion, and basic accessibility.

## Brand configuration

The public name, SEO copy, APK metadata, favicon, logo, screenshots, supported locales, and default locale are centralized in [`src/config/site.ts`](src/config/site.ts).
