const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  // Login
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.fill('#username', 'customer');
  await page.fill('#password', 'Test123!@');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);
  await page.waitForLoadState('networkidle');
  console.log('1. On dashboard:', page.url().includes('dashboard'));

  // Click WALMART transaction (first in list)
  const walmart = page.locator('text=WALMART').first();
  await walmart.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/tmp/test-receipt-01.png' });
  console.log('2. Clicked WALMART transaction');

  // Check receipt modal
  const receiptVisible = await page.locator('text=Transaction Receipt').count();
  console.log('3. Receipt modal visible:', receiptVisible > 0);

  const downloadBtn = await page.locator('text=Download Receipt').count();
  console.log('4. Download button visible:', downloadBtn > 0);

  // Check logo in receipt
  const logo = await page.locator('img[alt="SpringWell Bank"]').count();
  console.log('5. Logo images on page:', logo);

  // Check modal container width
  const modal = await page.locator('div.max-w-\\[400px\\]').first();
  const modalBox = await modal.boundingBox();
  console.log('6. Modal width:', modalBox?.width, 'px');

  // Test download
  if (downloadBtn > 0) {
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 10000 }).catch(() => null),
      page.locator('text=Download Receipt').click(),
    ]);
    if (download) {
      console.log('7. Download triggered! File:', download.suggestedFilename());
      await download.saveAs('/tmp/test-receipt-download.png');
      console.log('8. Saved to /tmp/test-receipt-download.png');
    } else {
      console.log('7. Download not triggered (blob download)');
    }
  }

  await page.screenshot({ path: '/tmp/test-receipt-02.png' });
  await browser.close();
  console.log('\nDone!');
})();
