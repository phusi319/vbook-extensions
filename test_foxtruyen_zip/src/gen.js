load('config.js');

function execute(url, page) {
    var requestUrl = url;
    // If url is relative, prepend BASE_URL
    if (url.indexOf("http") !== 0) {
        requestUrl = BASE_URL + url;
    }
    if (page && page.length > 0) {
        requestUrl = page;
        if (page.indexOf("http") !== 0) {
            requestUrl = BASE_URL + page;
        }
    }

    var doc = fetch(requestUrl).html();
    if (doc) {
        var list = [];
        var next = null;
        var activeItem = doc.select(".page-item.active").first();
        if (activeItem) {
            var currentPage = parseInt(activeItem.text());
            var nextText = String(currentPage + 1);
            doc.select(".page-item").forEach(function(e) {
                if (e.text() === nextText) {
                    next = e.attr("href");
                }
            });
        }

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

        return Response.success(list, next);
    }

    return null;
}
