load('config.js');

function execute(key, page) {
    if (!page) page = '1';

    var url = BASE_URL + "/tim-kiem/trang-" + page + ".html?q=" + key;

    var doc = fetch(url).html();
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

        // Pagination: check if there's a next page-item
        var next = null;
        var nextText = String(parseInt(page) + 1);
        doc.select(".page-item").forEach(function(e) {
            if (e.text() === nextText) {
                next = nextText;
            }
        });

        return Response.success(list, next);
    }

    return null;
}
