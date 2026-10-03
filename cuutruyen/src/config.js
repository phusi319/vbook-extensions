const BASE_URL = "https://cuutruyen.net";
const API_URL = "https://cuutruyen.net/api/v2";

function fetchApi(url) {
    var rawText = null;
    try {
        var res = fetch(url);
        if (res.ok) {
            rawText = res.text();
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
        return JSON.parse(rawText);
    }
    
    return null;
}
