load('config.js');

function execute(url, page) {
    if (!page) page = '1';

    // For genre/category pages: /the-loai/action -> /the-loai/action/2
    // For list pages: /danh-sach-truyen/?sort=views -> /danh-sach-truyen/2/?sort=views
    var requestUrl;
    if (url.indexOf('?') !== -1) {
        var parts = url.split('?');
        var basePath = parts[0].replace(/\/+$/, "");
        requestUrl = BASE_URL + basePath + "/" + page + "/?" + parts[1];
    } else {
        requestUrl = BASE_URL + url.replace(/\/+$/, "") + "/" + page;
    }

    var doc = fetchHtml(requestUrl);

    if (doc) {
        var novelList = [];
        var next = "";

        // Pagination: check if there's a next page
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
