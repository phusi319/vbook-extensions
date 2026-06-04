load('config.js');

function execute(url) {
    var chapterId = parseChapterId(url);
    if (!chapterId) return null;

    var totalPages = 0;
    var pagesMatch = /[?&]pages=(\d+)/.exec(url);
    if (pagesMatch) totalPages = parseInt(pagesMatch[1]);
    if (totalPages <= 0) totalPages = 50;

    var images = [];
    var batchSize = 5;

    for (var start = 0; start < totalPages; start += batchSize) {
        var pageIndexes = [];
        for (var j = start; j < Math.min(start + batchSize, totalPages); j++) {
            pageIndexes.push(j);
        }

        var json = fetchPageAccess(chapterId, pageIndexes);
        if (!json || !json.data || !json.data.pages || json.data.pages.length === 0) break;

        var pages = json.data.pages;
        for (var i = 0; i < pages.length; i++) {
            var p = pages[i];
            var decodeData = JSON.stringify({
                grant: p.grant,
                storageKey: p.storageKey
            });
            images.push({
                link: p.downloadUrl + " " + decodeData,
                script: "image.js"
            });
        }
    }

    if (images.length > 0) {
        return Response.success(images);
    }
    return null;
}

function fetchPageAccess(chapterId, pageIndexes) {
    var apiUrl = API_URL + "/v2/chapters/" + chapterId + "/page-access";
    var bodyStr = JSON.stringify({ pageIndexes: pageIndexes });

    // Try fetch() with POST
    try {
        var resp = fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: bodyStr
        });
        if (resp.ok) {
            var text = resp.text();
            if (text) return JSON.parse(text);
        }
    } catch (e) {}

    // Try Http.post()
    try {
        var res = Http.post(apiUrl).headers({
            "Content-Type": "application/json"
        }).body(bodyStr);
        if (res.status() === 200) {
            return JSON.parse(res.string());
        }
    } catch (e) {}

    return null;
}
