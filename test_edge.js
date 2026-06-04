const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
    console.log("Connecting to Edge...");
    let browser;
    try {
        browser = await puppeteer.connect({
            browserURL: 'http://127.0.0.1:9222',
            defaultViewport: null
        });
    } catch (e) {
        console.error("Failed to connect. Make sure Edge is running with --remote-debugging-port=9222");
        process.exit(1);
    }

    const page = await browser.newPage();
    console.log("Navigating to truyenqqko.com...");
    await page.goto('https://truyenqqko.com', { waitUntil: 'networkidle2', timeout: 30000 });
    
    const html = await page.content();
    fs.writeFileSync('truyenqq_dump.html', html);
    console.log("Dumped HTML length: " + html.length);
    
    await page.close();
    browser.disconnect();
    console.log("Done.");
})();
