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
        doc = fetch(url).html();
    } catch (e) {
        return Response.success([{
            name: "Lỗi Fetch/Bị Chặn: " + String(e),
            url: url,
            host: BASE_URL
        }]);
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

    if (list.length === 0) return null;
    return Response.success(list);
}
