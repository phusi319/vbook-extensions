load('config.js');

function execute(url, page) {
    if (!page) page = '1';
    var requestUrl = url;
    if (page !== '1') {
        requestUrl = url + "?page=" + page;
    }

    var doc = fetch(requestUrl).html();
    if (!doc) return null;

    var el = doc.select(".grid.grid-cols-2 > div");
    if (el.length === 0) {
        // sometimes the grid has a different class, let's select based on link
        el = doc.select("a[href^='/doc-truyen/']").parent().parent(); // need to be careful with parent
    }
    
    var data = [];
    var links = doc.select("a[href^='/doc-truyen/']");
    var handled = {};

    for (var i = 0; i < links.size(); i++) {
        var e = links.get(i);
        var link = e.attr("href");
        if (link.indexOf('/cv/') !== -1 || link.indexOf('/chuong-') !== -1) continue;
        if (handled[link]) continue;
        
        var imgEl = e.select("img").first();
        if (!imgEl) continue;
        var cover = imgEl.attr("src") || imgEl.attr("data-src") || imgEl.attr("srcset");
        if (cover && cover.indexOf('http') !== 0) cover = BASE_URL + cover;
        
        var name = imgEl.attr("alt") || e.text();
        
        // try to find chapter count or author from parent
        var parent = e.parent();
        var desc = "";
        if (parent) {
             var h3 = parent.select("h3");
             if (h3.size() > 0) name = h3.text();
             
             // find something like 'Chuong'
             var spans = parent.select("span");
             for (var j = 0; j < spans.size(); j++) {
                 var t = spans.get(j).text();
                 if (t.toLowerCase().indexOf('chương') !== -1) {
                     desc = t;
                     break;
                 }
             }
        }

        handled[link] = true;
        data.push({
            name: name,
            link: BASE_URL + link,
            cover: cover,
            description: desc,
            host: BASE_URL
        });
    }

    var next = "";
    // VBook Extensions usually allow finding the next page from pagination
    // But since this is Next.js, maybe pagination is rendered as links.
    // Let's just increment page if data.length >= 24 (which is the page size).
    if (data.length >= 24) {
        next = parseInt(page) + 1 + "";
    }

    return Response.success(data, next);
}
