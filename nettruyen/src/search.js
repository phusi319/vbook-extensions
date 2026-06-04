load('config.js');

function execute(key, page) {
    if (!page) page = '1';
    var url = BASE_URL + "/search?keyword=" + encodeURIComponent(key) + "&page=" + page;

    var doc = fetchHtml(url);

    if (doc) {
        var novelList = [];
        var next = "";

        // Pagination
        var pagination = doc.select("ul.pagination li");
        if (pagination.size() > 0) {
            var activeFound = false;
            for (var i = 0; i < pagination.size(); i++) {
                var li = pagination.get(i);
                if (li.select("a.active").size() > 0 || li.attr("class").indexOf("active") !== -1) {
                    activeFound = true;
                } else if (activeFound && li.select("a").size() > 0) {
                    next = String(parseInt(page) + 1);
                    break;
                }
            }
        }

        doc.select(".items .row .item").forEach(function(e) {
            var coverEl = e.select("figure .image a img").first();
            var cover = "";
            if (coverEl) {
                cover = coverEl.attr("data-original");
                if (!cover) cover = coverEl.attr("src");
            }
            if (cover && cover.indexOf("//") === 0) {
                cover = "https:" + cover;
            } else if (cover && cover.indexOf("/") === 0) {
                cover = BASE_URL + cover;
            }

            var linkEl = e.select("figcaption h3 a").first();
            var name = "";
            var link = "";
            if (linkEl) {
                name = linkEl.text();
                link = linkEl.attr("href");
            }
            if (link && link.indexOf('http') === 0) {
                // keep absolute URL
            } else if (link && link.indexOf('/') === 0) {
                link = BASE_URL + link;
            }

            var desc = "";
            var chapEl = e.select("figcaption ul li.chapter a").first();
            if (chapEl) desc = chapEl.text();

            if (name) {
                novelList.push({
                    name: name,
                    link: link,
                    description: desc,
                    cover: cover,
                    host: BASE_URL
                });
            }
        });

        return Response.success(novelList, next);
    }

    return null;
}
