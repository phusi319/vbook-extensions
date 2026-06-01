load('config.js');

function execute(url, page) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        let list = [];

        doc.select(".trending-scroll .item_home").forEach(function(e) {
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

                list.push({
                    name: a.text(),
                    link: a.attr("href"),
                    cover: cover,
                    description: chap ? chap.text() : ""
                });
            }
        });

        return Response.success(list, null);
    }
    return null;
}
