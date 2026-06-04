load('config.js');

function execute(key, page) {
    if (!page) page = '1';
    var url = BASE_URL +"/tim-kiem/trang-" + page + "?q=" + key;
    
    var doc = fetchHtml(url);

    if (doc) {
        var novelList = [];
        var next = "";
        
        var nextEl = doc.select(".page_redirect").select("a:has(p.active) + a").last();
        if (nextEl) next = nextEl.text();

        doc.select("#main_homepage .list_grid li").forEach(e => {
            var cover = e.select(".book_avatar img").attr("src");
            if (cover && cover.startsWith("//")) {
                cover = "https:" + cover;
            } else if (cover && cover.startsWith("/")) {
                cover = BASE_URL + cover;
            }

            var link = e.select(".book_name a").first().attr("href");
            if (link && link.indexOf('http') !== 0) {
                if (link.indexOf('/') === 0) link = BASE_URL + link;
                else link = BASE_URL + '/' + link;
            }

            novelList.push({
                name: e.select(".book_name").text(),
                link: link,
                description: e.select(".last_chapter").text(),
                cover: cover,
                host: BASE_URL 
            });
        });
        return Response.success(novelList, next)
    }

    return null;
}
