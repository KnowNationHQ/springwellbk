import asyncio, sys, io, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.async_api import async_playwright

BASE = "https://springwellbk.com"
R = []
def log(i, m): R.append(f"{i} {m}"); print(f"{i} {m}", flush=True)

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        # 1. HOMEPAGE
        print("\n--- HOMEPAGE ---")
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        ce = []; page.on("console", lambda m: ce.append(m.text) if m.type == "error" else None)
        r = await page.goto(BASE, wait_until="domcontentloaded")
        await page.wait_for_timeout(3000)
        log("✅" if r.status == 200 else "❌", f"Status {r.status}")
        h1 = await page.query_selector("h1")
        log("✅" if h1 else "❌", f"H1 present")
        for s in ["services", "about", "contact"]:
            b = (await page.content()).lower(); log("✅" if s in b else "❌", f"Section '{s}'")
        log("✅" if await page.query_selector("footer") else "❌", "Footer")
        log("✅" if await page.evaluate("typeof window.smartsupp !== 'undefined'") else "⚠️", "Smartsupp")
        errs = [e for e in ce if "smartsupp" not in e.lower() and "third-party" not in e.lower()]
        log("✅" if len(errs) == 0 else "⚠️", f"Console errors: {len(errs)}")
        await page.close()

        # 2. SIGNUP
        print("\n--- SIGNUP ---")
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        logs = []; page.on("console", lambda m: logs.append(f"[{m.type}] {m.text}"))
        await page.goto(f"{BASE}/register", wait_until="domcontentloaded")
        await page.wait_for_timeout(2000)
        ts = int(time.time())
        inputs = await page.query_selector_all("input")
        fills = ["Jane", "Smith", f"jane{ts}", f"jane{ts}@test.com", "5559990000", "JanePass123!", "JanePass123!"]
        for i, inp in enumerate(inputs):
            t = await inp.get_attribute("type") or ""
            if t in ("submit", "checkbox"): continue
            if i < len(fills) and fills[i]: await inp.fill(fills[i])
        selects = await page.query_selector_all("[role='combobox']")
        for sel in selects:
            await sel.click(); await page.wait_for_timeout(400)
            opts = await page.query_selector_all("[role='option']")
            if opts: await opts[0].click(); await page.wait_for_timeout(300)
        btn = await page.query_selector("button[type='submit']")
        await btn.click(); await page.wait_for_timeout(6000)
        url_ok = "/login" in page.url
        log("✅" if url_ok else "❌", f"Signup → {page.url.split('springwellbk.com')[-1]}")
        if not url_ok:
            for l in logs:
                if "error" in l.lower(): print(f"  LOG: {l[:150]}")
        await page.close()

        # 3. CUSTOMER LOGIN + PORTAL
        print("\n--- CUSTOMER PORTAL ---")
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        await page.goto(f"{BASE}/login", wait_until="domcontentloaded")
        await page.wait_for_timeout(2000)
        await page.fill("input#username", "customer")
        await page.fill("input#password", "Test123!@")
        await page.click("button[type='submit']")
        await page.wait_for_timeout(5000)
        log("✅" if "/dashboard" in page.url else "❌", f"Login OK")
        if "/dashboard" in page.url:
            for txt in ["Transfer Funds", "Transactions", "Bill Pay", "Update profile"]:
                try:
                    btn = await page.query_selector(f"button:has-text('{txt}')")
                    if btn:
                        await btn.click(); await page.wait_for_timeout(1500)
                        modal = await page.query_selector(".modal-overlay")
                        log("✅" if modal else "⚠️", f"'{txt}' modal: {modal is not None}")
                        if modal:
                            await page.keyboard.press("Escape")
                            await page.wait_for_timeout(500)
                            gone = not await page.query_selector(".modal-overlay")
                            log("✅" if gone else "❌", f"  Escape closes: {gone}")
                except Exception as e:
                    log("⚠️", f"'{txt}' err: {str(e)[:50]}")
        await page.close()

        # 4. ADMIN PORTAL
        print("\n--- ADMIN PORTAL ---")
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        await page.goto(f"{BASE}/login", wait_until="domcontentloaded")
        await page.wait_for_timeout(2000)
        await page.fill("input#username", "admin")
        await page.fill("input#password", "Admin123!@")
        await page.click("button[type='submit']")
        await page.wait_for_timeout(5000)
        log("✅" if "/admin" in page.url else "❌", f"Admin login OK")
        if "/admin" in page.url:
            for label in ["Credit/Debit", "Fund Transfer"]:
                try:
                    btn = await page.query_selector(f"button:has-text('{label}')")
                    if btn:
                        await btn.click(); await page.wait_for_timeout(1500)
                        modal = await page.query_selector(".admin-modal-overlay")
                        log("✅" if modal else "❌", f"'{label}' modal: {modal is not None}")
                        if modal:
                            await page.keyboard.press("Escape")
                            await page.wait_for_timeout(500)
                            still = await page.query_selector(".admin-modal-overlay")
                            log("✅" if not still else "❌", f"  Escape closes: {not still}")
                except Exception as e:
                    log("⚠️", f"'{label}' err: {str(e)[:50]}")
        await page.close()

        # 5. MOBILE
        print("\n--- MOBILE ---")
        page = await browser.new_page(viewport={"width": 390, "height": 844})
        r = await page.goto(BASE, wait_until="domcontentloaded")
        await page.wait_for_timeout(3000)
        log("✅" if r.status == 200 else "❌", f"Mobile loads")
        log("✅" if await page.query_selector("h1") else "❌", "H1 present")
        await page.close()

        # SUMMARY
        print("\n" + "="*50)
        p = sum(1 for r in R if r.startswith("✅"))
        f = sum(1 for r in R if r.startswith("❌"))
        w = sum(1 for r in R if r.startswith("⚠️"))
        print(f"TOTAL: {p+f+w} | ✅ {p} | ❌ {f} | ⚠️ {w}")
        await browser.close()

asyncio.run(main())
