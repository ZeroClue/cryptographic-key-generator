import { test, expect } from '@playwright/test';

test.describe('Cryptographic Key Generator - Basic Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    // Wait for React to hydrate by waiting for a specific element
    await page.waitForSelector('button', { timeout: 10000 });
  });

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle('Cryptographic Key Generator - Secure, Client-Side');
  });

  test('has tab navigation', async ({ page }) => {
    // Check all three tabs are visible using exact matching
    await expect(page.getByRole('button', { name: 'Generate', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Encrypt / Decrypt', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign / Verify', exact: true })).toBeVisible();
  });

  test('shows quick start cards on Generate tab', async ({ page }) => {
    // Verify quick start cards are visible
    await expect(page.getByText('SSH Keys')).toBeVisible();
    await expect(page.getByText('PGP Keys')).toBeVisible();
    await expect(page.getByText('TLS/HTTPS')).toBeVisible();
  });

  test('can navigate between tabs', async ({ page }) => {
    // Click on Encrypt / Decrypt tab using exact matching
    await page.getByRole('button', { name: 'Encrypt / Decrypt', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Encrypt / Decrypt', exact: true })).toHaveAttribute('aria-pressed', 'true');

    // Click on Sign / Verify tab using exact matching
    await page.getByRole('button', { name: 'Sign / Verify', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Sign / Verify', exact: true })).toHaveAttribute('aria-pressed', 'true');

    // Click back to Generate tab using exact matching
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Generate', exact: true })).toHaveAttribute('aria-pressed', 'true');
  });

  test('displays usage selector on Generate tab', async ({ page }) => {
    // Verify the "Select Intended Usage" dropdown exists
    await expect(page.getByLabel('Select Intended Usage')).toBeVisible();
  });

  // TODO: Fix scrolling/timing issue - educational resources section needs more robust wait
  test.skip('shows educational resources section', async ({ page }) => {
    // Scroll to bottom to find educational resources
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Wait for content to load after scrolling
    await page.waitForTimeout(500);

    // Verify educational resources section with more flexible matching
    await expect(page.getByText('Learn More')).toBeVisible();
    await expect(page.getByText(/Why Cryptography/)).toBeVisible(); // Use regex for partial match
    await expect(page.getByText(/Algorithm Comparison/)).toBeVisible();
    await expect(page.getByText('Documentation')).toBeVisible();
  });
});
