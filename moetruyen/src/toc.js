load('config.js');

function execute(url) {
    var mangaId = "";
    var match = url.match(/\/manga\/(\d+)-/);
    if (match) {
        mangaId = match[1];
    } else {
        match = url.match(/\/manga\/(\d+)/);
        if (match) mangaId = match[1];
    }
    
    if (!mangaId) return null;
    
    var chapters = [];
    var page = 1;
    var limit = 100;
    
    while (true) {
        var requestPath = "/manga/" + mangaId + "/chapters?page=" + page + "&limit=" + limit;
        var data = fetchApi(requestPath);
        
        if (data && data.success && data.data && data.data.chapters) {
            var chaps = data.data.chapters;
            if (chaps.length === 0) break;
            
            // API returns chapters sorted by default (usually descending or ascending)
            // Let's add them as they come
            for (var i = 0; i < chaps.length; i++) {
                var c = chaps[i];
                chapters.push({
                    name: "Chương " + (c.numberText || c.number) + (c.title ? " - " + c.title : ""),
                    url: BASE_URL + "/chapter/" + c.id,
                    host: BASE_URL
                });
            }
            
            // Check pagination
            if (data.meta && data.meta.pagination) {
                var p = data.meta.pagination;
                if (p.page >= p.totalPages) break;
            } else {
                break;
            }
            
            page++;
        } else {
            break;
        }
    }
    
    // vBook expects descending order usually, but let's reverse if they are ascending
    if (chapters.length > 1) {
        // Extract numbers to check direction
        var firstMatch = chapters[0].name.match(/Chương ([\d\.]+)/);
        var lastMatch = chapters[chapters.length - 1].name.match(/Chương ([\d\.]+)/);
        if (firstMatch && lastMatch) {
            var firstNum = parseFloat(firstMatch[1]);
            var lastNum = parseFloat(lastMatch[1]);
            if (firstNum < lastNum) {
                // Ascending -> Reverse to Descending
                chapters.reverse();
            }
        }
    }
    
    return Response.success(chapters);
}
