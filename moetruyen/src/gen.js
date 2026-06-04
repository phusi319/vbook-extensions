load('config.js');

function execute(url, page) {
    if (!page) page = "1";
    
    // Determine limit
    var limit = 20;
    
    var requestPath = url;
    if (requestPath.indexOf('?') !== -1) {
        requestPath += "&page=" + page + "&limit=" + limit;
    } else {
        requestPath += "?page=" + page + "&limit=" + limit;
    }
    
    var data = fetchApi(requestPath);
    if (data && data.success && data.data) {
        var results = [];
        data.data.forEach(function(item) {
            var coverUrl = item.coverUrl || (item.cover ? "https://u.truyen.moe/uploads/covers/" + item.cover : "");
            
            var description = "";
            // Handle ranking/views if available
            if (item.ranking && item.ranking.value) {
                var val = item.ranking.value;
                if (item.ranking.sortBy === 'views') {
                    description = (val >= 1000 ? (val/1000).toFixed(1) + "k" : val) + " views";
                } else if (item.ranking.sortBy === 'bookmarks') {
                    description = (val >= 1000 ? (val/1000).toFixed(1) + "k" : val) + " bookmarks";
                }
            } else if (item.latestChapterNumberText) {
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
