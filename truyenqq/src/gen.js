load('config.js');

function execute(url, page) {
    if (!page) page = '1';
    url = String(url);

    var requestUrl = url;
    if (url.indexOf('http') !== 0) {
        requestUrl = BASE_URL + url;
    }
    requestUrl = requestUrl.replace(/\/$/, '') + '/trang-' + page;

    var doc = fetch(requestUrl).html();
    if (!doc) return null;

    var data = [];
    var el = doc.select('#main_homepage .list_grid li');

    for (var i = 0; i < el.size(); i++) {
        var e = el.get(i);
        var cover = e.select('.book_avatar img').attr('src');
        if (cover && cover.indexOf('//') === 0) {
            cover = 'https:' + cover;
        }
        var name = e.select('.book_name').text();
        var linkEl = e.select('.book_name a').first();
        var link = linkEl ? linkEl.attr('href') : '';
        var desc = e.select('.last_chapter').text();

        if (name && link) {
            data.push({
                name: name,
                link: link,
                description: desc,
                cover: cover,
                host: BASE_URL
            });
        }
    }

    var next = '';
    var nextEl = doc.select('.page_redirect').select('a:has(p.active) + a').last();
    if (nextEl) {
        next = nextEl.text();
    }

    if (data.length === 0) return null;
    return Response.success(data, next);
}
