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

    var imgs = doc.select(".reading-detail .page-chapter img");
    var data = [];
    for (var i = 0; i < imgs.size(); i++) {
        var e = imgs.get(i);
        var link = e.attr("data-original");
        if (!link || link === '') {
            link = e.attr("src");
        }
        if (!link || link === '') continue;

        if (link.indexOf("//") === 0) {
            link = "https:" + link;
        }

        var src = e.attr("src");
        if (!src || src === '') src = link;
        if (src.indexOf("//") === 0) {
            src = "https:" + src;
        }

        data.push({
            link: src,
            fallback: link !== src ? [link] : []
        });
    }

    if (data.length === 0) return null;
    return Response.success(data);
}
