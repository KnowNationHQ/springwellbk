from playwright.sync_api import sync_playwright
import json

VIEWPORTS = {
    "desktop": {"width": 1440, "height": 900},
    "tablet": {"width": 768, "height": 1024},
    "mobile": {"width": 375, "height": 812},
    "small_mobile": {"width": 320, "height": 568},
}

PAGES = [
    ("home", "/"),
    ("login", "/login"),
    ("register", "/register"),
    ("dashboard", "/dashboard"),
    ("admin", "/admin"),
]

def audit():
    results = {}
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        for vp_name, vp in VIEWPORTS.items():
            results[vp_name] = {}
            context = browser.new_context(
                viewport=vp,
                device_scale_factor=2 if "mobile" in vp_name else 1,
                is_mobile="mobile" in vp_name,
            )
            page = context.new_page()

            errors = []
            page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)

            for page_name, path in PAGES:
                url = f"http://localhost:3000{path}"
                try:
                    page.goto(url, wait_until="networkidle", timeout=15000)
                except Exception as e:
                    results[vp_name][page_name] = {"status": "TIMEOUT", "errors": [str(e)]}
                    continue

                page.wait_for_timeout(1000)

                # Screenshot
                page.screenshot(path=f"C:/Users/hp/Desktop/springwellbk/audit/{vp_name}_{page_name}.png", full_page=True)

                # Check for horizontal overflow
                overflow = page.evaluate("""() => {
                    const body = document.body;
                    const doc = document.documentElement;
                    return {
                        bodyScrollWidth: body.scrollWidth,
                        bodyClientWidth: body.clientWidth,
                        docScrollWidth: doc.scrollWidth,
                        hasHorizontalScroll: body.scrollWidth > doc.clientWidth + 5,
                    }
                }""")

                # Check for overlapping elements / clickability
                tap_targets = page.evaluate("""() => {
                    const links = document.querySelectorAll('a, button');
                    let smallTargets = 0;
                    links.forEach(el => {
                        const rect = el.getBoundingClientRect();
                        if ((rect.width < 44 || rect.height < 44) && rect.width > 0) smallTargets++;
                    });
                    return { total: links.length, smallTargets };
                }""")

                # Check text readability (font size < 12px)
                small_text = page.evaluate("""() => {
                    const all = document.querySelectorAll('*');
                    let small = 0;
                    all.forEach(el => {
                        const fs = parseFloat(getComputedStyle(el).fontSize);
                        if (fs < 12 && el.textContent.trim()) small++;
                    });
                    return small;
                }""")

                # Check for elements clipped by viewport
                clipped = page.evaluate("""() => {
                    const vw = window.innerWidth;
                    const els = document.querySelectorAll('*');
                    let clippedCount = 0;
                    els.forEach(el => {
                        const r = el.getBoundingClientRect();
                        if (r.right > vw + 10 || r.left < -10) clippedCount++;
                    });
                    return clippedCount;
                }""")

                # Largest Contentful Paint approximation
                perf = page.evaluate("""() => {
                    const nav = performance.getEntriesByType('navigation')[0];
                    return {
                        domContentLoaded: Math.round(nav?.domContentLoadedEventEnd || 0),
                        loadComplete: Math.round(nav?.loadEventEnd || 0),
                        ttfb: Math.round(nav?.responseStart || 0),
                    }
                }""")

                results[vp_name][page_name] = {
                    "overflow": overflow,
                    "tap_targets": tap_targets,
                    "small_text_count": small_text,
                    "clipped_elements": clipped,
                    "perf": perf,
                    "console_errors": len(errors),
                }

            context.close()
        browser.close()

    return results

if __name__ == "__main__":
    import os
    os.makedirs("C:/Users/hp/Desktop/springwellbk/audit", exist_ok=True)
    results = audit()
    print(json.dumps(results, indent=2))
