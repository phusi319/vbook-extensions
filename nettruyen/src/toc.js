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

    var doc = fetchHtml(url);
    if (!doc) return null;

    var list = [];
    var el = doc.select('#nt_listchapter ul li .chapter a');

    // Reverse order (oldest first)
    for (var i = el.size() - 1; i >= 0; i--) {
        var e = el.get(i);
        var chapUrl = e.attr('href');
        if (chapUrl && chapUrl.indexOf('http') !== 0) {
            if (chapUrl.indexOf('/') === 0) chapUrl = BASE_URL + chapUrl;
            else chapUrl = BASE_URL + '/' + chapUrl;
        }
        list.push({
            name: e.text(),
            url: chapUrl,
            host: BASE_URL
        });
    }

    if (list.length === 0) {
        return Response.success([{
            name: "Lỗi tải chương (v1)",
            url: url,
            host: BASE_URL
        }]);
    }
    return Response.success(list);
}
