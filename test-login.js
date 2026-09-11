const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => consoleErrors.push(err.message));

  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Check login form exists
  const form = await page.locator('form').count();
  console.log('Forms found:', form);

  await page.fill('#username', 'customer');
  await page.fill('#password', 'Test123!@');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  await page.waitForLoadState('networkidle');

  console.log('URL after submit:', page.url());
  await page.screenshot({ path: '/tmp/test-login-result.png', fullPage: true });

  if (consoleErrors.length > 0) {
    console.log('Console errors:');
    consoleErrors.forEach(e => console.log('  -', e.substring(0, 200)));
  }

  // Check for error messages on page
  const alertText = await page.locator('[role="alert"], .text-red-500, .bg-red-50').allTextContents();
  console.log('Alert/error text:', alertText);

  // If we got to dashboard, check transactions
  if (page.url().includes('dashboard')) {
    console.log('SUCCESS: On dashboard!');
    const txDivs = await page.locator('[class*="cursor-pointer"]').allTextContents();
    console.log('Clickable elements:', txDivs.length);
    if (txDivs.length > 0) {
      console.log('First clickable text:', txDivs[0].substring(0, 100));
    }
  } else {
    console.log('FAIL: Not on dashboard');
  }

  await browser.close();
})();
