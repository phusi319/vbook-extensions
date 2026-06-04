load('config.js');

function execute(key, page) {
    if (!page) page = "1";
    
    // search API is light-weight, use /v2/manga for full filtering if pagination is needed, 
    // but /v2/search/manga is good for keyword search.
    var requestPath = "/search/manga?q=" + encodeURIComponent(key) + "&limit=20";
    
    // Suicaodex search endpoint doesn't support pagination, but we can fallback to /v2/manga if it supports q
    // Wait, API docs say: /v2/manga supports "q". So we use that for pagination!
    var fullPath = "/manga?q=" + encodeURIComponent(key) + "&page=" + page + "&limit=20";
    
    var data = fetchApi(fullPath);
    if (data && data.success && data.data) {
        var results = [];
        data.data.forEach(function(item) {
            var coverUrl = item.coverUrl || (item.cover ? "https://u.truyen.moe/uploads/covers/" + item.cover : "");
            
            var description = "";
            if (item.latestChapterNumberText) {
                description = "Chương " + item.latestChapterNumberText;
            } else if (item.chapterCount) {
                description = item.chapterCount + " chương";
            }
            
            results.push({
                name: item.title,
                link: BASE_URL + "/manga/" + item.id + "-" + item.slug,
                cover: coverUrl,
                description: description,
                host: BASE_URL
            });
        });
        
        var next = "";
        if (data.meta && data.meta.pagination) {
            var p = data.meta.pagination;
            if (p.page < p.totalPages) {
                next = (p.page + 1).toString();
            }
        }
        
        return Response.success(results, next);
    }
    
    return null;
}
