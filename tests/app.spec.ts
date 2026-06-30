import { test, expect, Page } from '@playwright/test';

async function collectErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(`[pageerror] ${err.message}`));
  return errors;
}

function isExternalResourceError(msg: string): boolean {
  // External image/font/map CDN requests fail in sandboxed headless environments — not app errors.
  return (
    msg.includes('ERR_CERT_AUTHORITY_INVALID') ||
    msg.includes('ERR_BLOCKED_BY_CLIENT') ||
    msg.includes('ERR_NAME_NOT_RESOLVED') ||
    msg.includes('favicon')
  );
}

test.describe('No-Firebase demo mode', () => {
  test('page renders content — not a blank/black screen', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Loading tournament data...')).not.toBeVisible({ timeout: 5000 });
    await expect(page.locator('#root > *')).toBeVisible();
  });

  test('no application JavaScript errors on load', async ({ page }) => {
    const errors = await collectErrors(page);
    await page.goto('/');
    await page.waitForTimeout(2000);
    const appErrors = errors.filter(e => !isExternalResourceError(e));
    expect(appErrors, `App JS errors:\n${appErrors.join('\n')}`).toEqual([]);
  });

  test('hero section shows tournament title', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('section').first();
    await expect(hero).toBeVisible({ timeout: 5000 });
    const text = await hero.innerText();
    expect(text).toContain('PRABHA');
    expect(text).toContain('NANDA');
    expect(text).toContain('CUP 4TH ED');
  });

  test('live match section renders with fixture data', async ({ page }) => {
    await page.goto('/');
    const liveSection = page.locator('#live');
    await expect(liveSection).toBeVisible({ timeout: 5000 });
    const text = await liveSection.innerText();
    expect(text).toMatch(/MATCH\s+01/i);
  });

  test('fixtures section renders match data', async ({ page }) => {
    await page.goto('/');
    await page.locator('#fixtures').scrollIntoViewIfNeeded();
    const fixturesSection = page.locator('#fixtures');
    await expect(fixturesSection).toBeVisible({ timeout: 5000 });
    const text = await fixturesSection.innerText();
    // Fixtures renders team names in uppercase
    expect(text).toContain('RKMV NARENDRAPUR');
    expect(text).toContain('RKMV DEOGHAR');
    expect(text).toContain('2026-05-23');
  });

  test('teams section renders team names', async ({ page }) => {
    await page.goto('/');
    await page.locator('#teams').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const teamsSection = page.locator('#teams');
    await expect(teamsSection).toBeVisible({ timeout: 5000 });
    const text = await teamsSection.innerText();
    expect(text).toContain('RKMV Narendrapur');
    expect(text).toContain('RKMV Deoghar');
    expect(text).toContain('Baranagore RKM');
  });

  test('sponsors section renders sponsor names', async ({ page }) => {
    await page.goto('/');
    await page.locator('#sponsors').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const sponsorsSection = page.locator('#sponsors');
    await expect(sponsorsSection).toBeVisible({ timeout: 5000 });
    const text = await sponsorsSection.innerText();
    expect(text).toContain('EduSports India');
    expect(text).toContain('Kolkata Athletics');
    expect(text).toContain('Bengal Youth');
  });

  test('match details modal shows configurable broadcast metadata', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Detailed Match Center/i }).first().click();
    await expect(page.getByText('Hindi / Bengali / English')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Official Sports Partner/i)).toBeVisible({ timeout: 5000 });
  });

  test('full page screenshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/full-page.png', fullPage: true });
  });
});
