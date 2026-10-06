import { test, expect } from '@playwright/test';
import path from 'path';

test('Landing -> Scan -> Dashboard smoke test', async ({ page }) => {
  // 1. Visit landing page
  await page.goto('/');
  await expect(page).toHaveTitle(/MediScript AI/);
  await expect(page.locator('h1')).toContainText('finally readable');

  // 2. Go to Scan page
  await page.click('text=Scan a prescription');
  await expect(page).toHaveURL(/.*scan/);
  await expect(page.locator('h1')).toContainText('Upload Prescription');

  // 3. Upload a mock file
  // Wait for file input to be ready
  const fileInput = page.locator('input[type="file"]');
  
  // We won't actually trigger the backend extraction in this UI smoke test unless we have a mock API,
  // but we can verify the upload UI responds to file selection.
  // Instead of a real file, we'll navigate to dashboard to verify auth guard behavior.

  // 4. Try navigating to Dashboard (should redirect to login if not authenticated)
  await page.goto('/dashboard');
  
  // DashboardLayout checks useUserStore.isAuthenticated, which is false by default.
  // Next.js router replaces to /login.
  await expect(page).toHaveURL(/.*login/);
  await expect(page.locator('h2')).toContainText('Sign in');
  
  // 5. Mock login
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // 6. Verify redirect to dashboard
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.locator('h1')).toContainText('Health Dashboard');
});
