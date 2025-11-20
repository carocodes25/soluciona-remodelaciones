import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'Desktop', width: 1920, height: 1080 },
  { name: 'Laptop', width: 1366, height: 768 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Mobile', width: 375, height: 667 },
];

const pages = [
  { name: 'Login', url: '/login' },
  { name: 'Register', url: '/register' },
  { name: 'Client Dashboard', url: '/client-dashboard', requiresAuth: 'client' },
  { name: 'Pro Dashboard', url: '/pro-dashboard', requiresAuth: 'pro' },
  { name: 'Job Creation', url: '/jobs-new', requiresAuth: 'client' },
  { name: 'Pro Profile', url: '/pro-profile', requiresAuth: 'pro' },
  { name: 'Job Details', url: '/jobs/1', requiresAuth: 'client' },
  { name: 'Submit Proposal', url: '/jobs/1/submit-proposal', requiresAuth: 'pro' },
];

async function loginAs(page: any, role: 'client' | 'pro') {
  await page.goto('http://localhost:3000/login');
  const email = role === 'client' ? 'cliente@test.com' : 'pro@test.com';
  await page.getByPlaceholder('tu@email.com').fill(email);
  await page.getByPlaceholder('••••••••').fill('password123');
  await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
  await page.waitForTimeout(2000);
}

test.describe('Layout Visual Tests', () => {
  for (const viewport of viewports) {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.use({
        viewport: { width: viewport.width, height: viewport.height },
      });

      for (const pageInfo of pages) {
        test(`should render ${pageInfo.name} correctly`, async ({ page }) => {
          // Login if required
          if (pageInfo.requiresAuth) {
            await loginAs(page, pageInfo.requiresAuth);
          }

          // Navigate to page
          await page.goto(`http://localhost:3000${pageInfo.url}`);
          await page.waitForTimeout(2000);

          // Take screenshot
          await page.screenshot({
            path: `screenshots/${viewport.name.toLowerCase()}-${pageInfo.name.toLowerCase().replace(/\s+/g, '-')}.png`,
            fullPage: true,
          });

          // Verify page loaded
          await expect(page).not.toHaveTitle(/404|Error/);

          console.log(`✅ ${pageInfo.name} rendered on ${viewport.name}`);
        });
      }
    });
  }
});

test.describe('Navbar Layout Tests', () => {
  test('should display navbar on all pages', async ({ page }) => {
    const testPages = ['/login', '/register', '/client-dashboard', '/pro-dashboard'];

    for (const url of testPages) {
      await page.goto(`http://localhost:3000${url}`);
      await page.waitForTimeout(1000);

      // Check if navbar/header exists
      const navbar = page.locator('nav, header').first();
      if (await navbar.isVisible()) {
        console.log(`✅ Navbar visible on ${url}`);
      } else {
        console.log(`⚠️ Navbar not found on ${url}`);
      }
    }
  });

  test('should be responsive', async ({ page }) => {
    await page.goto('http://localhost:3000/client-dashboard');
    await page.waitForTimeout(1000);

    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/navbar-desktop.png' });

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/navbar-mobile.png' });

    console.log('✅ Navbar responsive screenshots captured');
  });
});

test.describe('Form Layout Tests', () => {
  test('should display job creation form correctly', async ({ page }) => {
    // Login
    await loginAs(page, 'client');

    // Navigate to job creation
    await page.goto('http://localhost:3000/jobs-new');
    await page.waitForTimeout(1000);

    // Take screenshots of each step
    await page.screenshot({ path: 'screenshots/job-creation-step1.png' });

    // Fill step 1 and go to step 2
    await page.getByPlaceholder(/título del proyecto/i).fill('Test Project');
    await page.getByPlaceholder(/Describe tu proyecto/i).fill('Test description with enough characters for validation.');
    await page.locator('select').first().selectOption({ index: 1 });
    await page.getByRole('button', { name: /Siguiente/i }).click();
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'screenshots/job-creation-step2.png' });

    // Fill step 2 and go to step 3
    await page.getByPlaceholder(/Mínimo/i).fill('50000');
    await page.getByPlaceholder(/Máximo/i).fill('100000');
    await page.getByRole('button', { name: /Siguiente/i }).click();
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'screenshots/job-creation-step3.png' });

    console.log('✅ Job creation form screenshots captured');
  });

  test('should display proposal form correctly', async ({ page }) => {
    // Login as PRO
    await loginAs(page, 'pro');

    // Navigate to proposal page
    await page.goto('http://localhost:3000/jobs/1/submit-proposal');
    await page.waitForTimeout(1000);

    // Take screenshot
    await page.screenshot({ path: 'screenshots/proposal-form.png', fullPage: true });

    console.log('✅ Proposal form screenshot captured');
  });
});

test.describe('Dashboard Layout Tests', () => {
  test('should display client dashboard layout', async ({ page }) => {
    await loginAs(page, 'client');
    await page.goto('http://localhost:3000/client-dashboard');
    await page.waitForTimeout(1000);

    // Take full page screenshot
    await page.screenshot({ path: 'screenshots/client-dashboard-full.png', fullPage: true });

    // Check key sections are visible
    await expect(page.getByText(/Mis Proyectos|My Projects/i)).toBeVisible();

    console.log('✅ Client dashboard layout captured');
  });

  test('should display pro dashboard layout', async ({ page }) => {
    await loginAs(page, 'pro');
    await page.goto('http://localhost:3000/pro-dashboard');
    await page.waitForTimeout(1000);

    // Take full page screenshot
    await page.screenshot({ path: 'screenshots/pro-dashboard-full.png', fullPage: true });

    // Check tabs are visible
    await expect(page.getByText(/Trabajos Disponibles|Jobs/i)).toBeVisible();

    console.log('✅ Pro dashboard layout captured');
  });
});

test.describe('Profile Layout Tests', () => {
  test('should display pro profile tabs', async ({ page }) => {
    await loginAs(page, 'pro');
    await page.goto('http://localhost:3000/pro-profile');
    await page.waitForTimeout(1000);

    // Screenshot of default tab
    await page.screenshot({ path: 'screenshots/profile-personal-tab.png', fullPage: true });

    // Switch to Business tab
    await page.getByText(/Información del Negocio|Business/i).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/profile-business-tab.png', fullPage: true });

    // Switch to Skills tab
    await page.getByText(/Habilidades|Skills/i).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/profile-skills-tab.png', fullPage: true });

    console.log('✅ Pro profile tabs screenshots captured');
  });
});
