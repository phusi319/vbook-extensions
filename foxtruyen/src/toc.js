load('config.js');

function execute(url) {
    var doc = fetch(url).html();
    if (doc) {
        var list = [];

        var el = doc.select(".fx-chap-list .fx-chap-item__name");
        if (el.size() === 0) {
            el = doc.select(".fx-chap-item a");
        }

        for (var i = el.size() - 1; i >= 0; i--) {
            var e = el.get(i);
            var name = e.text().trim();
            var link = e.attr("href");

            if (name && name.length > 0 && link && link.length > 0) {
                list.push({
                    name: name,
                    url: link,
                    host: BASE_URL
                });
            }
        }

        return Response.success(list);
    }

    return null;
}
