load('config.js');

function execute(url) {
    var chapterId = parseChapterId(url);
    if (!chapterId) return null;

    // Get total pages from URL param (embedded by toc.js)
    var totalPages = 0;
    var pagesMatch = /[?&]pages=(\d+)/.exec(url);
    if (pagesMatch) {
        totalPages = parseInt(pagesMatch[1]);
    }

    // If no pages param, try to get from API
    if (totalPages <= 0) {
        totalPages = 50; // fallback, request in batches and stop when done
    }

    var images = [];
    var batchSize = 5; // API maxWindow = 5

    for (var start = 0; start < totalPages; start += batchSize) {
        var pageIndexes = [];
        for (var j = start; j < Math.min(start + batchSize, totalPages); j++) {
            pageIndexes.push(j);
        }

        var json = postApi(API_URL + "/v2/chapters/" + chapterId + "/page-access", {
            pageIndexes: pageIndexes
        });

        if (!json || !json.data || !json.data.pages) break;

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

    return Response.success(images);
}
