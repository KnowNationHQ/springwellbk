import asyncio, sys, io, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.async_api import async_playwright

BASE = "https://springwellbk.com"
R = []
def log(i, m):
    R.append(f"{i} {m}"); print(f"{i} {m}", flush=True)

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        # === 1. HOMEPAGE ===
        print("\n--- HOMEPAGE ---")
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        ce = []; page.on("console", lambda m: ce.append(m.text) if m.type == "error" else None)
        r = await page.goto(BASE, wait_until="networkidle")
        log("✅" if r.status == 200 else "❌", f"Status {r.status}")
        h1 = await page.query_selector("h1"); log("✅" if h1 else "❌", f"H1: {(await h1.inner_text())[:40] if h1 else 'missing'}")
        for s in ["services", "about", "contact"]:
            b = (await page.content()).lower(); log("✅" if s in b else "❌", f"Section '{s}'")
        log("✅" if await page.query_selector("footer") else "❌", "Footer")
        log("✅" if await page.evaluate("typeof window.smartsupp !== 'undefined'") else "⚠️", "Smartsupp")
        log("✅" if len([e for e in ce if "smartsupp" not in e.lower()]) == 0 else "⚠️", f"Console errors: {len(ce)}")
        await page.close()

        # === 2. SIGNUP ===
        print("\n--- SIGNUP ---")
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        await page.goto(f"{BASE}/register", wait_until="networkidle")
        inputs = await page.query_selector_all("input")
        vals = ["Jane", "Smith", f"janesmith{int(time.time())}", f"jane{int(time.time())}@test.com", "5559990000", "JanePass123!", "JanePass123!"]
        idx = 0
        for inp in inputs:
            t = await inp.get_attribute("type") or ""
            if t in ("submit", "checkbox"): continue
            if idx < len(vals) and vals[idx]: await inp.fill(vals[idx])
            idx += 1
        selects = await page.query_selector_all("[role='combobox']")
        for sel in selects:
            await sel.click(); await page.wait_for_timeout(400)
            opts = await page.query_selector_all("[role='option']")
            if opts: await opts[0].click(); await page.wait_for_timeout(300)
        btn = await page.query_selector("button[type='submit']")
        await btn.click(); await page.wait_for_timeout(6000)
        log("✅" if "/login" in page.url else "❌", f"Redirect to: {page.url.split('/')[-1]}")
        await page.close()

        # === 3. CUSTOMER LOGIN ===
        print("\n--- CUSTOMER LOGIN ---")
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        await page.goto(f"{BASE}/login", wait_until="networkidle")
        await page.fill("input#username", "customer")
        await page.fill("input#password", "Test123!@")
        await page.click("button[type='submit']")
        await page.wait_for_timeout(5000)
        log("✅" if "/dashboard" in page.url else "❌", f"Login URL: {page.url.split('/')[-1]}")
        if "/dashboard" in page.url:
            b = (await page.content()).lower()
            for t in ["balance", "transaction", "statement", "transfer", "profile"]:
                log("✅" if t in b else "❌", f"Has '{t}'")
        await page.close()

        # === 4. CUSTOMER PORTAL BUTTONS ===
        print("\n--- CUSTOMER PORTAL BUTTONS ---")
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        await page.goto(f"{BASE}/login", wait_until="networkidle")
        await page.fill("input#username", "customer")
        await page.fill("input#password", "Test123!@")
        await page.click("button[type='submit']")
        await page.wait_for_timeout(5000)
        if "/dashboard" in page.url:
            # Click activity buttons one by one
            btn_texts = ["Send Money", "Deposit", "Withdraw", "Pay Bills", "Request Loan", "Investments", "Statement", "Account Settings"]
            for txt in btn_texts:
                try:
                    btn = await page.query_selector(f"button:has-text('{txt}')")
                    if btn:
                        await btn.click()
                        await page.wait_for_timeout(1500)
                        modal = await page.query_selector("[role='dialog'], [class*='modal' i]")
                        log("✅" if modal else "⚠️", f"'{txt}' → modal: {modal is not None}")
                        if modal:
                            close = await modal.query_selector("button[aria-label*='close'], button:has-text('Close'), button:has-text('×')")
                            if close: await close.click()
                            else: await page.keyboard.press("Escape")
                            await page.wait_for_timeout(500)
                    else:
                        log("⚠️", f"'{txt}' button not found")
                except Exception as e:
                    log("⚠️", f"'{txt}' error: {str(e)[:50]}")
        await page.close()

        # === 5. ADMIN LOGIN ===
        print("\n--- ADMIN LOGIN ---")
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        await page.goto(f"{BASE}/login", wait_until="networkidle")
        await page.fill("input#username", "admin")
        await page.fill("input#password", "Admin123!@")
        await page.click("button[type='submit']")
        await page.wait_for_timeout(5000)
        log("✅" if "/admin" in page.url else "❌", f"Admin URL: {page.url.split('/')[-1]}")
        if "/admin" in page.url:
            b = (await page.content()).lower()
            for t in ["credit", "debit", "transfer", "transaction", "account", "balance"]:
                log("✅" if t in b else "❌", f"Has '{t}'")
        await page.close()

        # === 6. ADMIN MODALS ===
        print("\n--- ADMIN MODALS ---")
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        await page.goto(f"{BASE}/login", wait_until="networkidle")
        await page.fill("input#username", "admin")
        await page.fill("input#password", "Admin123!@")
        await page.click("button[type='submit']")
        await page.wait_for_timeout(5000)
        if "/admin" in page.url:
            for label in ["Credit/Debit", "Fund Transfer", "Activate", "Suspend", "Complete"]:
                try:
                    btn = await page.query_selector(f"button:has-text('{label}')")
                    if btn:
                        await btn.click()
                        await page.wait_for_timeout(1500)
                        modal = await page.query_selector("[role='dialog'], .admin-modal-overlay")
                        log("✅" if modal else "❌", f"'{label}' → modal: {modal is not None}")
                        if modal:
                            await page.keyboard.press("Escape")
                            await page.wait_for_timeout(500)
                            # Verify modal closed
                            still = await page.query_selector(".admin-modal-overlay")
                            log("✅" if not still else "❌", f"  Escape closes modal: {not still}")
                except Exception as e:
                    log("⚠️", f"'{label}' error: {str(e)[:60]}")
        await page.close()

        # === 7. MOBILE ===
        print("\n--- MOBILE (390x844) ---")
        page = await browser.new_page(viewport={"width": 390, "height": 844})
        await page.goto(BASE, wait_until="networkidle")
        h1 = await page.query_selector("h1"); log("✅" if h1 else "❌", f"Mobile h1 present")
        await page.close()

        # === SUMMARY ===
        print("\n" + "="*50)
        p = sum(1 for r in R if r.startswith("✅"))
        f = sum(1 for r in R if r.startswith("❌"))
        w = sum(1 for r in R if r.startswith("⚠️"))
        print(f"TOTAL: {p+f+w} | ✅ {p} | ❌ {f} | ⚠️ {w}")
        await browser.close()

asyncio.run(main())
