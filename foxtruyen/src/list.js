load('config.js');

function execute(url, page) {
    let targetUrl = url;
    if (page && page.length > 0) {
        targetUrl = page;
    }

    let response = fetch(targetUrl);
    if (response.ok) {
        let doc = response.html();
        let list = [];

        doc.select(".list_item_home .item_home, .row .item_home").forEach(function(e) {
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
        let nextLink = doc.select(".pagination a[rel=next]").first();
        if (!nextLink) {
            let activePage = doc.select(".pagination .active").first();
            if (activePage) {
                let nextSibling = activePage.nextElementSibling();
                if (nextSibling) {
                    let nextA = nextSibling.select("a").first();
                    if (nextA) {
                        next = nextA.attr("href");
                    }
                }
            }
        } else {
            next = nextLink.attr("href");
        }

        return Response.success(list, next);
    }
    return null;
}
