const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const viewports = {
    desktop: { width: 1440, height: 900 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 812 },
    small: { width: 320, height: 568 },
  };
  const pages = [
    ['home', '/'],
    ['login', '/login'],
    ['register', '/register'],
    ['dashboard', '/dashboard'],
    ['admin', '/admin'],
  ];
  const results = {};

  for (const [vpName, vp] of Object.entries(viewports)) {
    results[vpName] = {};
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: vpName.includes('mobile') ? 2 : 1, isMobile: vpName.includes('mobile') });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    for (const [pageName, path] of pages) {
      const url = `http://localhost:3000${path}`;
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
      } catch (e) {
        results[vpName][pageName] = { status: 'TIMEOUT', error: e.message.slice(0, 100) };
        continue;
      }
      await page.waitForTimeout(1500);

      // Screenshot
      await page.screenshot({ path: `C:/Users/hp/Desktop/springwellbk/audit/${vpName}_${pageName}.png`, fullPage: true });

      // Checks
      const overflow = await page.evaluate(() => ({
        scrollWidth: document.body.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasHScroll: document.body.scrollWidth > document.documentElement.clientWidth + 5,
      }));

      const tapTargets = await page.evaluate(() => {
        let small = 0, total = 0;
        document.querySelectorAll('a, button').forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) { total++; if (r.width < 44 || r.height < 44) small++; }
        });
        return { total, smallTargets: small };
      });

      const smallText = await page.evaluate(() => {
        let count = 0;
        document.querySelectorAll('*').forEach(el => {
          if (parseFloat(getComputedStyle(el).fontSize) < 12 && el.textContent.trim()) count++;
        });
        return count;
      });

      const perf = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0];
        return {
          ttfb: Math.round(nav?.responseStart || 0),
          domReady: Math.round(nav?.domContentLoadedEventEnd || 0),
          load: Math.round(nav?.loadEventEnd || 0),
        };
      });

      results[vpName][pageName] = { overflow, tapTargets, smallText, perf, consoleErrors: errors.length };
    }
    await ctx.close();
  }
  await browser.close();

  // Report
  console.log('\n=== MOBILE RESPONSIVENESS AUDIT ===\n');
  for (const [vp, pages] of Object.entries(results)) {
    console.log(`\n--- ${vp.toUpperCase()} ---`);
    for (const [pg, data] of Object.entries(pages)) {
      if (data.status === 'TIMEOUT') { console.log(`  ${pg}: TIMEOUT - ${data.error}`); continue; }
      const flags = [];
      if (data.overflow.hasHScroll) flags.push('H-OVERFLOW');
      if (data.tapTargets.smallTargets > 3) flags.push(`${data.tapTargets.smallTargets}/${data.tapTargets.total} small taps`);
      if (data.smallText > 5) flags.push(`${data.smallText} small text els`);
      if (data.perf.load > 5000) flags.push(`slow load ${data.perf.load}ms`);
      if (data.perf.ttfb > 2000) flags.push(`slow TTFB ${data.perf.ttfb}ms`);
      console.log(`  ${pg}: ${flags.length ? flags.join(' | ') : 'OK'} (load: ${data.perf.load}ms, TTFB: ${data.perf.ttfb}ms)`);
    }
  }
})();
