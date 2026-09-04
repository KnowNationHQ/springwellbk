import asyncio, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.async_api import async_playwright

BASE = "https://springwellbk.com"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        
        errors = []
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: errors.append(str(e)))
        
        await page.goto(f"{BASE}/register", wait_until="networkidle")
        await page.wait_for_timeout(3000)
        
        # Fill all fields
        inputs = await page.query_selector_all("input")
        vals = ["Test", "User", "testsignup999", "testsignup999@test.com", "5551112222", "TestPass123!", "TestPass123!"]
        for i, inp in enumerate(inputs):
            t = await inp.get_attribute("type") or ""
            if t in ("submit", "checkbox"): continue
            if i < len(vals) and vals[i]: await inp.fill(vals[i])
        
        selects = await page.query_selector_all("[role='combobox']")
        for sel in selects:
            await sel.click(); await page.wait_for_timeout(500)
            opts = await page.query_selector_all("[role='option']")
            if opts: await opts[0].click(); await page.wait_for_timeout(300)
        
        # Click submit
        btn = await page.query_selector("button[type='submit']")
        print(f"Button text: {await btn.inner_text()}")
        print(f"Button disabled: {await btn.get_attribute('disabled')}")
        
        await btn.click()
        
        # Monitor URL changes
        for i in range(15):
            await page.wait_for_timeout(1000)
            print(f"  t={i+1}s URL: {page.url}")
            if "/login" in page.url:
                print("  REDIRECTED TO LOGIN!")
                break
        
        # Check for error message
        error_el = await page.query_selector("div:has-text('Error'), div:has-text('error'), div:has-text('failed'), div:has-text('already')")
        if error_el:
            text = await error_el.inner_text()
            if len(text) < 200:
                print(f"ERROR FOUND: {text}")
        
        # Check all visible text for errors
        visible_text = await page.evaluate("document.body.innerText")
        for keyword in ["error", "failed", "already", "taken", "invalid"]:
            if keyword in visible_text.lower():
                idx = visible_text.lower().index(keyword)
                print(f"Found '{keyword}' in page: ...{visible_text[max(0,idx-30):idx+50]}...")
        
        print(f"\nConsole errors: {len(errors)}")
        for e in errors[:5]:
            print(f"  {e[:200]}")
        
        await page.close()
        await browser.close()

asyncio.run(main())
