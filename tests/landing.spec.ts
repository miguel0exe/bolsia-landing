import { expect, test, type Page } from '@playwright/test';

const viewports = {
  desktopLarge: { width: 1440, height: 900 },
  desktopSmall: { width: 1366, height: 768 },
  mobileLarge: { width: 390, height: 844 },
  mobileSmall: { width: 375, height: 667 },
};

const apkUrl =
  'https://github.com/miguel0exe/app-releases/releases/latest/download/bolsia-app.apk';

async function activeFeature(page: Page) {
  return page.locator('[data-feature-panel]').evaluateAll((panels) =>
    panels.findIndex((panel) => panel.getAttribute('aria-hidden') !== 'true'),
  );
}

async function scrollFeatureProgress(page: Page, progress: number) {
  const metrics = await page.locator('[data-feature-story]').evaluate((story) => {
    const sticky = story.querySelector<HTMLElement>('.features-sticky');
    return {
      top: story.getBoundingClientRect().top + window.scrollY,
      travel: story.offsetHeight - (sticky?.getBoundingClientRect().height ?? window.innerHeight),
    };
  });

  await page.evaluate(({ top, travel, progress }) => {
    window.scrollTo(0, top + travel * progress);
  }, { ...metrics, progress });
}

test.describe('landing basics', () => {
  test('loads the landing and its primary resources', async ({ page }) => {
    await page.goto('/?variant=mint&lang=es', { waitUntil: 'networkidle' });

    await expect(page).toHaveTitle('Bolsía — Tus finanzas, a tu manera');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /Bolsía/,
    );
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.ico');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('.hero-variant img').first()).toHaveAttribute(
      'src',
      '/home-balance.webp',
    );
    await expect(page.locator('.hero-variant img').first()).toBeVisible();
  });

  test('keeps navigation anchors connected to sections', async ({ page }) => {
    await page.goto('/?variant=mint&lang=es');

    for (const href of ['#features', '#download', '#how-to-install']) {
      await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
      await expect(page.locator(href)).toHaveCount(1);
    }
  });

  test('keeps the APK URL on every download CTA', async ({ page }) => {
    await page.goto('/?variant=mint&lang=es');

    const downloadLinks = page.locator(`a[href="${apkUrl}"]`);
    await expect(downloadLinks).toHaveCount(2);
    await expect(downloadLinks).toHaveAttribute('download', '');
  });
});

test.describe('interaction and accessibility', () => {
  test('switches between Spanish and English', async ({ page }) => {
    await page.setViewportSize(viewports.desktopLarge);
    await page.goto('/?variant=mint&lang=es');

    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.locator('[data-i18n="download.title"]')).toHaveText('Descarga Bolsía');
    await page.locator('#lang-en').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('[data-i18n="download.title"]')).toHaveText('Download Bolsía');
  });

  test('opens the mobile menu and closes it after navigation', async ({ page }) => {
    await page.setViewportSize(viewports.mobileLarge);
    await page.goto('/?variant=mint&lang=es');

    const toggle = page.locator('.nav-menu-toggle');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#site-nav-menu')).toBeVisible();
    await page.locator('a[href="#features"]').click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('opens and closes FAQ items with native controls', async ({ page }) => {
    await page.goto('/?variant=mint&lang=es');

    const item = page.locator('details').first();
    await item.locator('summary').press('Enter');
    await expect(item).toHaveAttribute('open', '');
    await expect(item.locator('p')).toBeVisible();
    await item.locator('summary').press('Enter');
    await expect(item).not.toHaveAttribute('open', '');
  });

  test('has basic accessible structure and no horizontal overflow', async ({ page }) => {
    for (const viewport of Object.values(viewports)) {
      await page.setViewportSize(viewport);
      await page.goto('/?variant=mint&lang=es');
      await expect.poll(() => page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      )).toBe(true);
      await expect(page.locator('img[alt]')).toHaveCount(await page.locator('img').count());
      await expect(page.locator('.nav-menu-toggle')).toHaveAccessibleName('Abrir menú');
    }
  });
});

test.describe('Features storytelling', () => {
  for (const viewport of [viewports.desktopLarge, viewports.desktopSmall]) {
    test(`advances through all five steps at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/?variant=mint&lang=es');

      await expect(page.locator('.features-sticky')).toHaveCSS('position', 'sticky');
      await expect(page.locator('[data-feature-panel]')).toHaveCount(5);

      for (const [index, progress] of [0, 0.25, 0.5, 0.75, 1].entries()) {
        await scrollFeatureProgress(page, progress);
        await expect.poll(() => activeFeature(page)).toBe(index);
        await expect(page.locator('[data-feature-panel]').nth(index)).toBeVisible();
        await expect.poll(() => page.locator('[data-feature-panel]').nth(index).locator('img').evaluate(
          (img: HTMLImageElement) => img.naturalWidth > 0,
        )).toBe(true);
      }

      await scrollFeatureProgress(page, 0.75);
      await expect.poll(() => activeFeature(page)).toBe(3);
      await scrollFeatureProgress(page, 0);
      await expect.poll(() => activeFeature(page)).toBe(0);
      await expect(page.locator('#how-to-install')).toHaveCount(1);
    });
  }

  for (const viewport of [viewports.mobileLarge, viewports.mobileSmall]) {
    test(`shows five complete vertical panels at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/?variant=mint&lang=es');

      await expect(page.locator('.features-sticky')).toHaveCSS('position', 'relative');
      const panels = page.locator('[data-feature-panel]');
      await expect(panels).toHaveCount(5);

      for (let index = 0; index < 5; index += 1) {
        const panel = panels.nth(index);
        await panel.scrollIntoViewIfNeeded();
        await expect(panel).toBeVisible();
        await expect.poll(() => panel.locator('img').evaluate(
          (img: HTMLImageElement) => img.naturalWidth > 0 && img.naturalHeight > 0,
        )).toBe(true);
        await expect.poll(() => panel.boundingBox()).not.toBeNull();
      }
    });
  }

  test('keeps all Features content available with reduced motion', async ({ browser }) => {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
      viewport: viewports.desktopLarge,
    });
    const page = await context.newPage();
    await page.goto('/?variant=mint&lang=es');

    await expect(page.locator('[data-feature-panel]')).toHaveCount(5);
    await expect(page.locator('.features-sticky')).toHaveCSS('position', 'relative');
    await context.close();
  });
});
