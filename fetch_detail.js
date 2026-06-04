const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    try {
        console.log("Connecting to Edge...");
        const browser = await puppeteer.connect({ browserURL: 'http://localhost:9222' });
        
        console.log("Opening new tab...");
        const page = await browser.newPage();
        
        console.log("Navigating to manga detail...");
        await page.goto('https://truyenqqko.com/truyen-tranh/hoa-son-tai-khoi-11376', { waitUntil: 'domcontentloaded' });
        
        console.log("Waiting for Cloudflare...");
        let passed = false;
        for (let i = 0; i < 15; i++) {
            const isCf = await page.evaluate(() => document.title.includes("Just a moment") || !!document.querySelector('#challenge-error-title'));
            if (!isCf) { passed = true; break; }
            await new Promise(r => setTimeout(r, 2000));
        }

        if (!passed) {
            console.log("Failed to bypass CF");
            await page.close();
            browser.disconnect();
            return;
        }

        console.log("Bypassed CF. Waiting for page to load fully...");
        await new Promise(r => setTimeout(r, 3000));

        const html = await page.content();
        fs.writeFileSync('truyenqq_detail_dump.html', html);
        console.log("Saved truyenqq_detail_dump.html (Size: " + html.length + ")");
        
        // Extract basic data to verify
        const data = await page.evaluate(() => {
            return {
                title: document.querySelector('h1[itemprop=name]')?.innerText,
                chapters: document.querySelectorAll('.works-chapter-list a').length,
                ads: document.querySelectorAll('iframe').length
            };
        });
        console.log("Extracted:", data);

        await page.close();
        browser.disconnect();
    } catch (e) {
        console.error(e);
    }
})();
