load('config.js');

function execute(key, page) {
    if (!page) page = '1';

    let url = BASE_URL + "/tim-kiem.html?q=" + encodeURIComponent(key);
    if (page !== '1') {
        url = BASE_URL + "/tim-kiem/trang-" + page + ".html?q=" + encodeURIComponent(key);
    }

    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        let list = [];

        doc.select(".item_home").forEach(function(e) {
            let a = e.select("a.book_name").first();
            let img = e.select(".thumbblock img").first();
            let chap = e.select(".fs14.cl99").first();

            if (a) {
                let cover = "";
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
                    description: chap ? chap.text() : ""
                });
            }
        });

        let next = null;
        let pageNum = parseInt(page);
        let nextLink = doc.select(".pagination a[rel=next]").first();
        if (nextLink) {
            next = String(pageNum + 1);
        }

        return Response.success(list, next);
    }
    return null;
}
