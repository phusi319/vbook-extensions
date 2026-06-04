var BASE_URL = 'https://nettruyen9s.com';
try {
    if (CONFIG_URL) {
        BASE_URL = CONFIG_URL;
    }
} catch (e) {}

function fetchHtml(url) {
    var doc = null;
    try {
        doc = Http.get(url).html();
    } catch (e) {}

    if (!doc || doc.select('title').text().indexOf('Just a moment') !== -1 || doc.select('title').text().indexOf('Cloudflare') !== -1) {
        try {
            var browser = Engine.newBrowser();
            doc = browser.launch(url, 5000);
            browser.close();
        } catch (e) {}
    }
    return doc;
}
