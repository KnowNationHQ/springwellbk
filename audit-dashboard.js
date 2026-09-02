const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });

  // Login as customer first
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 15000 });
  await page.fill('input#username', 'customer');
  await page.fill('input[type=password]', 'Test123!@');
  await page.click('button[type=submit]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  await page.waitForTimeout(2000);

  // Screenshot mobile dashboard
  await page.screenshot({ path: 'C:/Users/hp/Desktop/springwellbk/audit/mobile_dashboard.png', fullPage: true });

  // Check for issues
  const checks = await page.evaluate(() => {
    const vw = window.innerWidth;
    const body = document.body;
    const results = {};

    // Horizontal overflow
    results.hasHScroll = body.scrollWidth > vw + 5;
    results.bodyScrollWidth = body.scrollWidth;
    results.viewportWidth = vw;

    // Profile header check
    const profileHeader = document.querySelector('.bg-gradient-to-br');
    results.hasProfileHeader = !!profileHeader;

    // Avatar check
    const avatar = document.querySelector('.rounded-full');
    results.hasAvatar = !!avatar;
    if (avatar) {
      const r = avatar.getBoundingClientRect();
      results.avatarSize = `${Math.round(r.width)}x${Math.round(r.height)}`;
    }

    // Full name check
    const h1 = document.querySelector('h1');
    results.fullName = h1?.textContent || 'none';

    // Balance check
    results.balanceVisible = document.body.innerText.includes('$50,000');

    // Tap targets
    let small = 0, total = 0;
    document.querySelectorAll('a, button').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) { total++; if (r.width < 44 || r.height < 44) small++; }
    });
    results.tapTargets = { total, small };

    // Font sizes
    let smallText = 0;
    document.querySelectorAll('*').forEach(el => {
      if (parseFloat(getComputedStyle(el).fontSize) < 12 && el.textContent.trim()) smallText++;
    });
    results.smallTextCount = smallText;

    // Performance
    const nav = performance.getEntriesByType('navigation')[0];
    results.ttfb = Math.round(nav?.responseStart || 0);
    results.loadTime = Math.round(nav?.loadEventEnd || 0);

    return results;
  });

  console.log('\n=== MOBILE DASHBOARD AUDIT (375x812) ===');
  console.log(`Profile Header: ${checks.hasProfileHeader ? 'YES' : 'MISSING'}`);
  console.log(`Avatar: ${checks.hasAvatar ? checks.avatarSize : 'MISSING'}`);
  console.log(`Full Name: ${checks.fullName}`);
  console.log(`Balance Visible: ${checks.balanceVisible}`);
  console.log(`H-Overflow: ${checks.hasHScroll ? 'YES (' + checks.bodyScrollWidth + 'px)' : 'NONE'}`);
  console.log(`Tap Targets: ${checks.tapTargets.small}/${checks.tapTargets.total} small`);
  console.log(`Small Text: ${checks.smallTextCount} elements`);
  console.log(`TTFB: ${checks.ttfb}ms | Load: ${checks.loadTime}ms`);
  console.log(`Console Errors: ${errors.length}`);
  errors.forEach(e => console.log(`  - ${e.slice(0, 120)}`));

  // Now test tablet
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'C:/Users/hp/Desktop/springwellbk/audit/tablet_dashboard.png', fullPage: false });

  // Desktop
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'C:/Users/hp/Desktop/springwellbk/audit/desktop_dashboard.png', fullPage: false });

  await ctx.close();
  await browser.close();
  console.log('\nScreenshots saved.');
})();
