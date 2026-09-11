const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.fill('#username', 'customer');
  await page.fill('#password', 'Test123!@');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);
  await page.waitForLoadState('networkidle');
  console.log('1. Dashboard loaded');

  // Screenshot dashboard - check badge alignment
  await page.screenshot({ path: '/tmp/test-fixed-dashboard.png', fullPage: false });
  console.log('2. Dashboard screenshot taken');

  // Click WALMART transaction
  await page.locator('text=WALMART').first().click();
  await page.waitForTimeout(1000);

  // Check modal width
  const modal = await page.locator('div[style*="max-width"]').first();
  const box = await modal.boundingBox();
  console.log('3. Modal width:', box?.width, 'px (should be 400)');

  await page.screenshot({ path: '/tmp/test-fixed-modal.png' });
  console.log('4. Modal screenshot taken');

  // Download receipt
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 10000 }).catch(() => null),
    page.locator('text=Download Receipt').click(),
  ]);
  if (download) {
    await download.saveAs('/tmp/test-fixed-receipt.png');
    console.log('5. Receipt downloaded');
  }

  await browser.close();
  console.log('\nDone!');
})();
