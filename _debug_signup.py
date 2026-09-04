import asyncio, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.async_api import async_playwright

BASE = "https://springwellbk.com"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        
        logs = []
        page.on("console", lambda m: logs.append(f"[{m.type}] {m.text}"))
        page.on("pageerror", lambda e: logs.append(f"[PAGE_ERROR] {e}"))
        
        await page.goto(f"{BASE}/register", wait_until="networkidle")
        
        # Fill all fields properly
        inputs = await page.query_selector_all("input")
        # 0: first name, 1: last name, 2: username, 3: email, 4: phone, 5: password, 6: confirm
        fills = ["TestFirst", "TestLast", "newtestuser888", "newtest888@test.com", "5551234567", "TestPass123!", "TestPass123!"]
        for i, inp in enumerate(inputs):
            typ = await inp.get_attribute("type") or ""
            if typ in ("submit", "checkbox"):
                continue
            if i < len(fills) and fills[i]:
                await inp.fill(fills[i])
        
        # Select dropdowns
        selects = await page.query_selector_all("[role='combobox']")
        for sel in selects:
            await sel.click()
            await page.wait_for_timeout(500)
            options = await page.query_selector_all("[role='option']")
            if options:
                await options[0].click()
                await page.wait_for_timeout(300)
        
        # Click submit and wait
        btn = await page.query_selector("button[type='submit']")
        await btn.click()
        
        # Wait and capture everything
        await page.wait_for_timeout(8000)
        
        url = page.url
        print(f"URL after submit: {url}")
        
        # Check for error
        error_divs = await page.query_selector_all("div")
        for div in error_divs:
            text = await div.inner_text()
            cls = await div.get_attribute("class") or ""
            if ("red" in cls or "error" in cls or "Error" in text) and text.strip() and len(text) < 200:
                print(f"Error div: '{text.strip()}'")
        
        # Check for success
        success_divs = await page.query_selector_all("div")
        for div in success_divs:
            text = await div.inner_text()
            cls = await div.get_attribute("class") or ""
            if ("blue" in cls or "success" in cls or "created" in text.lower() or "redirecting" in text.lower()) and text.strip():
                print(f"Success div: '{text.strip()}'")
        
        # Print ALL console logs
        print(f"\n--- Console logs ({len(logs)}) ---")
        for l in logs:
            print(f"  {l[:200]}")
        
        await page.close()
        await browser.close()

asyncio.run(main())
