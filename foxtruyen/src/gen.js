load('config.js');

function execute(url, page) {
    var requestUrl = BASE_URL + url;
    if (page && page.length > 0) {
        requestUrl = page;
    }

    var doc = fetch(requestUrl).html();
    if (doc) {
        var list = [];

        doc.select(".item_home").forEach(function(e) {
            var a = e.select("a.book_name").first();
            var img = e.select(".thumbblock img").first();
            var chap = e.select(".fs14.cl99").first();

            if (a) {
                var cover = "";
                if (img) {
                    cover = img.attr("data-src");
                    if (!cover || cover.length === 0) {
                        cover = img.attr("src");
                    }
                }
                if (cover && cover.indexOf("loading.jpg") !== -1) {
                    cover = img.attr("data-src") || "";
                }

                list.push({
                    name: a.text(),
                    link: a.attr("href"),
                    cover: cover,
                    description: chap ? chap.text() : "",
                    host: BASE_URL
                });
            }
        });

        // Find next page
        var next = null;
        var nextLink = doc.select(".pagination a[rel=next]").first();
        if (nextLink) {
            next = nextLink.attr("href");
        }

        return Response.success(list, next);
    }

    return null;
}
