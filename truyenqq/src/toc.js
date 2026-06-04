load('config.js');

function execute(url) {
    url = String(url);
    if (url.indexOf('http') !== 0) {
        if (url.indexOf('//') === 0) {
            url = 'https:' + url;
        } else if (url.indexOf('/') === 0) {
            url = BASE_URL + url;
        } else {
            url = BASE_URL + '/' + url;
        }
    }
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/i, BASE_URL);

    var doc = null;
    try {
        doc = Http.get(url).html();
    } catch (e) {}

    if (!doc || doc.select('title').text().indexOf('Just a moment') !== -1 || !doc.select('.works-chapter-list').first()) {
        try {
            var browser = Engine.newBrowser();
            doc = browser.launch(url, 5000);
            browser.close();
        } catch (e) {}
    }

    if (!doc) return null;

    var list = [];
    var el = doc.select('.works-chapter-list a');
    // Reverse order (oldest first)
    for (var i = el.size() - 1; i >= 0; i--) {
        var e = el.get(i);
        list.push({
            name: e.text(),
            url: e.attr('href'),
            host: BASE_URL
        });
    }

    if (list.length === 0) {
        return Response.success([{
            name: "Cloudflare / Không tìm thấy chương",
            url: url,
            host: BASE_URL
        }]);
    }
    return Response.success(list);
}
