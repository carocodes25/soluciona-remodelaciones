import { test, expect, Page } from '@playwright/test';

// Console message types
type ConsoleType = 'log' | 'error' | 'warn' | 'info' | 'debug';

interface ConsoleMessage {
  type: ConsoleType;
  text: string;
  timestamp: string;
  url: string;
}

interface PageAlert {
  message: string;
  timestamp: string;
  url: string;
}

class ErrorMonitor {
  private consoleMessages: ConsoleMessage[] = [];
  private alerts: PageAlert[] = [];
  private errors: Error[] = [];

  setupMonitoring(page: Page) {
    // Capture console messages
    page.on('console', (msg) => {
      const type = msg.type() as ConsoleType;
      this.consoleMessages.push({
        type,
        text: msg.text(),
        timestamp: new Date().toISOString(),
        url: page.url(),
      });

      // Log to terminal in real-time
      const prefix = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : 'ℹ️';
      console.log(`${prefix} [${type.toUpperCase()}] ${msg.text()}`);
    });

    // Capture page errors
    page.on('pageerror', (error) => {
      this.errors.push(error);
      console.log(`❌ [PAGE ERROR] ${error.message}`);
      console.log(`   Stack: ${error.stack}`);
    });

    // Capture dialogs (alerts, confirms, prompts)
    page.on('dialog', async (dialog) => {
      const alert: PageAlert = {
        message: dialog.message(),
        timestamp: new Date().toISOString(),
        url: page.url(),
      };
      this.alerts.push(alert);
      console.log(`🔔 [ALERT] ${dialog.type()}: ${dialog.message()}`);
      await dialog.accept();
    });

    // Capture network errors
    page.on('requestfailed', (request) => {
      console.log(`🌐 [NETWORK ERROR] ${request.url()}`);
      console.log(`   Failure: ${request.failure()?.errorText}`);
    });
  }

  getConsoleLogs(): ConsoleMessage[] {
    return this.consoleMessages.filter((msg) => msg.type === 'log');
  }

  getConsoleErrors(): ConsoleMessage[] {
    return this.consoleMessages.filter((msg) => msg.type === 'error');
  }

  getConsoleWarnings(): ConsoleMessage[] {
    return this.consoleMessages.filter((msg) => msg.type === 'warn');
  }

  getAlerts(): PageAlert[] {
    return this.alerts;
  }

  getPageErrors(): Error[] {
    return this.errors;
  }

  getAllMessages(): ConsoleMessage[] {
    return this.consoleMessages;
  }

  printSummary() {
    console.log('\n📊 ===== ERROR MONITORING SUMMARY =====');
    console.log(`Total Console Messages: ${this.consoleMessages.length}`);
    console.log(`  - Logs: ${this.getConsoleLogs().length}`);
    console.log(`  - Errors: ${this.getConsoleErrors().length}`);
    console.log(`  - Warnings: ${this.getConsoleWarnings().length}`);
    console.log(`Total Alerts: ${this.alerts.length}`);
    console.log(`Total Page Errors: ${this.errors.length}`);

    if (this.getConsoleErrors().length > 0) {
      console.log('\n❌ CONSOLE ERRORS:');
      this.getConsoleErrors().forEach((err, i) => {
        console.log(`${i + 1}. [${err.timestamp}] ${err.url}`);
        console.log(`   ${err.text}`);
      });
    }

    if (this.getConsoleWarnings().length > 0) {
      console.log('\n⚠️  CONSOLE WARNINGS:');
      this.getConsoleWarnings().forEach((warn, i) => {
        console.log(`${i + 1}. [${warn.timestamp}] ${warn.url}`);
        console.log(`   ${warn.text}`);
      });
    }

    if (this.alerts.length > 0) {
      console.log('\n🔔 ALERTS:');
      this.alerts.forEach((alert, i) => {
        console.log(`${i + 1}. [${alert.timestamp}] ${alert.url}`);
        console.log(`   ${alert.message}`);
      });
    }

    if (this.errors.length > 0) {
      console.log('\n💥 PAGE ERRORS:');
      this.errors.forEach((err, i) => {
        console.log(`${i + 1}. ${err.message}`);
        console.log(`   ${err.stack}`);
      });
    }

    console.log('\n======================================\n');
  }

  saveReport(filename: string) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalMessages: this.consoleMessages.length,
        logs: this.getConsoleLogs().length,
        errors: this.getConsoleErrors().length,
        warnings: this.getConsoleWarnings().length,
        alerts: this.alerts.length,
        pageErrors: this.errors.length,
      },
      consoleMessages: this.consoleMessages,
      alerts: this.alerts,
      pageErrors: this.errors.map((err) => ({
        message: err.message,
        stack: err.stack,
      })),
    };

    const fs = require('fs');
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`📝 Report saved to ${filename}`);
  }
}

test.describe('Error Monitoring - Authentication Flow', () => {
  let monitor: ErrorMonitor;

  test.beforeEach(async ({ page }) => {
    monitor = new ErrorMonitor();
    monitor.setupMonitoring(page);
  });

  test.afterEach(() => {
    monitor.printSummary();
    monitor.saveReport(`test-results/error-report-auth-${Date.now()}.json`);
  });

  test('should monitor login page', async ({ page }) => {
    console.log('\n🔍 Monitoring Login Page...');
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);

    // Interact with page
    await page.getByPlaceholder('tu@email.com').click();
    await page.getByPlaceholder('••••••••').click();

    console.log('✅ Login page monitoring completed');
  });

  test('should monitor login process', async ({ page }) => {
    console.log('\n🔍 Monitoring Login Process...');
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(1000);

    await page.getByPlaceholder('tu@email.com').fill('cliente@test.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();

    await page.waitForTimeout(3000);

    console.log('✅ Login process monitoring completed');
  });

  test('should monitor invalid login attempt', async ({ page }) => {
    console.log('\n🔍 Monitoring Invalid Login...');
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(1000);

    await page.getByPlaceholder('tu@email.com').fill('invalid@test.com');
    await page.getByPlaceholder('••••••••').fill('wrongpassword');
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();

    await page.waitForTimeout(2000);

    console.log('✅ Invalid login monitoring completed');
  });
});

test.describe('Error Monitoring - Job Creation Flow', () => {
  let monitor: ErrorMonitor;

  test.beforeEach(async ({ page }) => {
    monitor = new ErrorMonitor();
    monitor.setupMonitoring(page);

    // Login first
    await page.goto('http://localhost:3000/login');
    await page.getByPlaceholder('tu@email.com').fill('cliente@test.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    await page.waitForTimeout(2000);
  });

  test.afterEach(() => {
    monitor.printSummary();
    monitor.saveReport(`test-results/error-report-job-${Date.now()}.json`);
  });

  test('should monitor job creation page load', async ({ page }) => {
    console.log('\n🔍 Monitoring Job Creation Page...');
    await page.goto('http://localhost:3000/jobs-new');
    await page.waitForTimeout(2000);

    console.log('✅ Job creation page monitoring completed');
  });

  test('should monitor job creation form submission', async ({ page }) => {
    console.log('\n🔍 Monitoring Job Creation Submission...');
    await page.goto('http://localhost:3000/jobs-new');
    await page.waitForTimeout(1000);

    // Fill step 1
    await page.getByPlaceholder(/título del proyecto/i).fill('Test Job');
    await page.getByPlaceholder(/Describe tu proyecto/i).fill('Test description with enough characters for validation to pass.');
    await page.locator('select').first().selectOption({ index: 1 });
    await page.getByRole('button', { name: /Siguiente/i }).click();
    await page.waitForTimeout(1000);

    // Fill step 2
    await page.getByPlaceholder(/Mínimo/i).fill('50000');
    await page.getByPlaceholder(/Máximo/i).fill('100000');
    await page.getByRole('button', { name: /Siguiente/i }).click();
    await page.waitForTimeout(1000);

    // Fill step 3
    await page.getByPlaceholder(/dirección/i).fill('Test Address 123');
    await page.getByRole('button', { name: /Publicar/i }).click();
    await page.waitForTimeout(2000);

    console.log('✅ Job creation submission monitoring completed');
  });
});

test.describe('Error Monitoring - Pro Dashboard', () => {
  let monitor: ErrorMonitor;

  test.beforeEach(async ({ page }) => {
    monitor = new ErrorMonitor();
    monitor.setupMonitoring(page);

    // Login as PRO
    await page.goto('http://localhost:3000/login');
    await page.getByPlaceholder('tu@email.com').fill('pro@test.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    await page.waitForTimeout(2000);
  });

  test.afterEach(() => {
    monitor.printSummary();
    monitor.saveReport(`test-results/error-report-pro-${Date.now()}.json`);
  });

  test('should monitor pro dashboard', async ({ page }) => {
    console.log('\n🔍 Monitoring Pro Dashboard...');
    await page.goto('http://localhost:3000/pro-dashboard');
    await page.waitForTimeout(2000);

    // Click through tabs if they exist
    const tabs = page.locator('[role="tab"], button[class*="tab"]');
    const tabCount = await tabs.count();

    for (let i = 0; i < tabCount; i++) {
      await tabs.nth(i).click();
      await page.waitForTimeout(500);
    }

    console.log('✅ Pro dashboard monitoring completed');
  });

  test('should monitor proposal submission', async ({ page }) => {
    console.log('\n🔍 Monitoring Proposal Submission...');
    await page.goto('http://localhost:3000/jobs/1/submit-proposal');
    await page.waitForTimeout(2000);

    // Fill form
    await page.getByPlaceholder(/monto|amount/i).fill('75000');
    await page.getByPlaceholder(/días|days/i).fill('10');
    await page.getByPlaceholder(/carta de presentación|cover letter/i).fill('This is a test cover letter with more than 100 characters to pass validation. I am very interested in this project.');

    // Submit
    await page.getByRole('button', { name: /Enviar Propuesta/i }).click();
    await page.waitForTimeout(3000);

    console.log('✅ Proposal submission monitoring completed');
  });

  test('should monitor profile page', async ({ page }) => {
    console.log('\n🔍 Monitoring Profile Page...');
    await page.goto('http://localhost:3000/pro-profile');
    await page.waitForTimeout(2000);

    // Click through tabs
    await page.getByText(/Información del Negocio|Business/i).click();
    await page.waitForTimeout(500);

    await page.getByText(/Habilidades|Skills/i).click();
    await page.waitForTimeout(500);

    console.log('✅ Profile page monitoring completed');
  });
});

test.describe('Error Monitoring - Navigation', () => {
  let monitor: ErrorMonitor;

  test.beforeEach(async ({ page }) => {
    monitor = new ErrorMonitor();
    monitor.setupMonitoring(page);
  });

  test.afterEach(() => {
    monitor.printSummary();
    monitor.saveReport(`test-results/error-report-nav-${Date.now()}.json`);
  });

  test('should monitor all public pages', async ({ page }) => {
    console.log('\n🔍 Monitoring Public Pages...');

    const pages = ['/login', '/register'];

    for (const url of pages) {
      console.log(`  Visiting ${url}...`);
      await page.goto(`http://localhost:3000${url}`);
      await page.waitForTimeout(1000);
    }

    console.log('✅ Public pages monitoring completed');
  });

  test('should monitor button clicks', async ({ page }) => {
    console.log('\n🔍 Monitoring Button Clicks...');

    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(1000);

    // Click all visible buttons
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    console.log(`  Found ${buttonCount} buttons`);

    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      console.log(`  Clicking: ${text}`);

      try {
        await button.click();
        await page.waitForTimeout(500);
      } catch (e) {
        console.log(`  ⚠️ Could not click button: ${e}`);
      }
    }

    console.log('✅ Button clicks monitoring completed');
  });
});
