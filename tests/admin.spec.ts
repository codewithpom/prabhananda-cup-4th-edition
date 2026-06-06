import { test, expect } from '@playwright/test';

test.describe('Admin panel login', () => {
  test('admin panel opens and login form is visible', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('pageerror', err => consoleErrors.push(`[pageerror] ${err.message}`));

    await page.goto('/');
    await page.waitForTimeout(1000);

    // Scroll to footer and click the gear icon
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const gearBtn = page.locator('button[title="Admin Access"]');
    await expect(gearBtn).toBeVisible({ timeout: 5000 });
    await gearBtn.click();

    // Login form should appear
    await expect(page.getByText('COMMAND CENTER')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input[placeholder="EMAIL"]')).toBeVisible();
    await expect(page.locator('input[placeholder="PASSWORD"]')).toBeVisible();

    await page.screenshot({ path: 'test-results/admin-login-form.png' });
    console.log('Console errors so far:', consoleErrors);
  });

  test('admin login with wrong credentials shows error message', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    await page.locator('button[title="Admin Access"]').click();
    await expect(page.locator('input[placeholder="EMAIL"]')).toBeVisible({ timeout: 5000 });

    // Attempt login with bad credentials to see what error Firebase returns
    await page.fill('input[placeholder="EMAIL"]', 'wrong@example.com');
    await page.fill('input[placeholder="PASSWORD"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Wait for error to appear (Firebase auth round-trip can take a second)
    await page.waitForTimeout(4000);

    const errorEl = page.locator('p.text-red-500');
    const errorText = await errorEl.textContent().catch(() => '(no error element found)');
    console.log('Auth error message:', errorText);

    await page.screenshot({ path: 'test-results/admin-login-error.png' });

    // Error should exist and never be the useless bare word "Error"
    await expect(errorEl).toBeVisible({ timeout: 5000 });
    expect(errorText?.trim()).not.toBe('Error');
  });

});
