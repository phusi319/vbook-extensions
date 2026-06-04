const BASE_URL = "https://cuutruyen.net";
const API_URL = "https://cuutruyen.net/api/v2";

function fetchApi(url) {
    try {
        var res = Http.get(url).headers({
            "User-Agent": "Mozilla/5.0"
        });
        if (res.status() === 200) {
            return JSON.parse(res.string());
        }
    } catch (e) {}

    try {
        var browser = Engine.newBrowser();
        var doc = browser.launch(url, 5000);
        browser.close();
        if (doc) {
            var bodyText = doc.select('body').text();
            return JSON.parse(bodyText);
        }
    } catch (e) {}
    
    return null;
}
