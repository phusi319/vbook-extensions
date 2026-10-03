const BASE_URL = "https://cuutruyen.net";
const API_URL = "https://cuutruyen.net/api/v2";

function fetchApi(url) {
    var rawText = null;
    try {
        var res = Http.get(url).headers({
            "User-Agent": "Mozilla/5.0"
        });
        if (res.status() === 200) {
            rawText = res.string();
        }
    } catch (e) {}

    if (!rawText) {
        try {
            var browser = Engine.newBrowser();
            var doc = browser.launch(url, 5000);
            browser.close();
            if (doc) {
                rawText = doc.select('body').text();
            }
        } catch (e) {}
    }
    
    if (rawText) {
        rawText = String(rawText);
        rawText = rawText.replace(/storage-ct\.lrclib\.net/g, "storage-bravo.cuutruyen.net");
        rawText = rawText.replace(/storage-ct-riften\.site/g, "storage-charlie.cuutruyen.net");
        rawText = rawText.replace(/"cover_url"\s*:\s*"(https?:\/\/[^"]+)"/g, '"cover_url":"https://images.weserv.nl/?url=$1"');
        return JSON.parse(rawText);
    }
    
    return null;
}
