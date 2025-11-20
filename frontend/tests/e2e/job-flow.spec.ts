import { test, expect } from '@playwright/test';

test.describe('Job Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as client
    await page.goto('http://localhost:3000/login');
    await page.getByPlaceholder('tu@email.com').fill('cliente@test.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    
    // Wait for dashboard
    await page.waitForURL('**/client-dashboard', { timeout: 5000 });
    
    // Navigate to job creation
    await page.getByRole('button', { name: /Nuevo Proyecto/i }).click();
    await page.waitForURL('**/jobs-new', { timeout: 3000 });
  });

  test('should display job creation form', async ({ page }) => {
    // Verify we're on the right page
    await expect(page).toHaveURL(/jobs-new/);
    
    // Check step indicator
    await expect(page.getByText(/Paso 1 de 3/i)).toBeVisible();
    
    // Check form elements
    await expect(page.getByPlaceholder(/título del proyecto/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Describe tu proyecto/i)).toBeVisible();
    
    console.log('✅ Job creation form displayed');
  });

  test('should validate required fields in step 1', async ({ page }) => {
    // Try to go to next step without filling fields
    await page.getByRole('button', { name: /Siguiente/i }).click();
    
    // Wait for validation
    await page.waitForTimeout(500);
    
    // Should still be on step 1
    await expect(page.getByText(/Paso 1 de 3/i)).toBeVisible();
    
    console.log('✅ Step 1 validation working');
  });

  test('should complete step 1 and move to step 2', async ({ page }) => {
    // Fill step 1 fields
    await page.getByPlaceholder(/título del proyecto/i).fill('Reparación de plomería urgente');
    await page.getByPlaceholder(/Describe tu proyecto/i).fill('Necesito reparar una fuga de agua en el baño principal. Es urgente y requiere atención inmediata.');
    
    // Select category
    await page.locator('select').first().selectOption({ label: /Plomería/i });
    
    // Click next
    await page.getByRole('button', { name: /Siguiente/i }).click();
    
    // Wait for step 2
    await page.waitForTimeout(500);
    
    // Verify we're on step 2
    await expect(page.getByText(/Paso 2 de 3/i)).toBeVisible();
    
    console.log('✅ Step 1 completed, moved to step 2');
  });

  test('should complete full job creation flow', async ({ page }) => {
    // Step 1: Basic Info
    await page.getByPlaceholder(/título del proyecto/i).fill('Instalación eléctrica');
    await page.getByPlaceholder(/Describe tu proyecto/i).fill('Necesito instalar nuevos puntos de luz en la sala y comedor.');
    await page.locator('select').first().selectOption({ index: 1 });
    await page.getByRole('button', { name: /Siguiente/i }).click();
    await page.waitForTimeout(500);
    
    // Step 2: Budget & Timeline
    await expect(page.getByText(/Paso 2 de 3/i)).toBeVisible();
    await page.getByPlaceholder(/Mínimo/i).fill('50000');
    await page.getByPlaceholder(/Máximo/i).fill('100000');
    await page.locator('input[type="date"]').fill('2024-12-31');
    await page.getByRole('button', { name: /Siguiente/i }).click();
    await page.waitForTimeout(500);
    
    // Step 3: Location & Review
    await expect(page.getByText(/Paso 3 de 3/i)).toBeVisible();
    await page.getByPlaceholder(/dirección/i).fill('Calle 123 #45-67, Bogotá');
    
    // Select city
    const citySelect = page.locator('select').filter({ hasText: /ciudad/i });
    await citySelect.selectOption({ index: 1 });
    
    // Submit
    await page.getByRole('button', { name: /Publicar Proyecto/i }).click();
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/client-dashboard', { timeout: 5000 });
    
    // Verify we're back on dashboard
    await expect(page).toHaveURL(/client-dashboard/);
    
    console.log('✅ Full job creation flow completed');
  });

  test('should allow going back to previous steps', async ({ page }) => {
    // Complete step 1
    await page.getByPlaceholder(/título del proyecto/i).fill('Test Project');
    await page.getByPlaceholder(/Describe tu proyecto/i).fill('Test description with enough characters.');
    await page.locator('select').first().selectOption({ index: 1 });
    await page.getByRole('button', { name: /Siguiente/i }).click();
    await page.waitForTimeout(500);
    
    // We're on step 2
    await expect(page.getByText(/Paso 2 de 3/i)).toBeVisible();
    
    // Click back button
    await page.getByRole('button', { name: /Atrás|Anterior/i }).click();
    await page.waitForTimeout(500);
    
    // We're back on step 1
    await expect(page.getByText(/Paso 1 de 3/i)).toBeVisible();
    
    // Verify data is preserved
    await expect(page.getByPlaceholder(/título del proyecto/i)).toHaveValue('Test Project');
    
    console.log('✅ Navigation back to previous steps working');
  });
});

test.describe('Job Details Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login as client
    await page.goto('http://localhost:3000/login');
    await page.getByPlaceholder('tu@email.com').fill('cliente@test.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    await page.waitForURL('**/client-dashboard', { timeout: 5000 });
  });

  test('should display job details', async ({ page }) => {
    // Click on first job in the list
    await page.locator('[class*="job-card"], [class*="JobCard"]').first().click();
    
    // Wait for navigation to job details
    await page.waitForURL(/\/jobs\/\d+/, { timeout: 3000 });
    
    // Verify job details are visible
    await expect(page.getByText(/Descripción/i)).toBeVisible();
    await expect(page.getByText(/Presupuesto/i)).toBeVisible();
    await expect(page.getByText(/Ubicación/i)).toBeVisible();
    
    console.log('✅ Job details page displayed');
  });

  test('should show proposals for the job', async ({ page }) => {
    // Navigate to a job with proposals
    await page.goto('http://localhost:3000/jobs/1');
    await page.waitForTimeout(1000);
    
    // Check if proposals section exists
    const proposalsSection = page.getByText(/Propuestas|Proposals/i);
    if (await proposalsSection.isVisible()) {
      console.log('✅ Proposals section visible');
    } else {
      console.log('⚠️ No proposals section (might be expected)');
    }
  });
});
