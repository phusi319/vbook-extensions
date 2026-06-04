load('config.js');

function execute(key, page) {
    if (!page) page = '1';
    key = String(key);

    var url = BASE_URL + '/tim-kiem/trang-' + page + '?q=' + encodeURIComponent(key);
    var doc = fetch(url).html();
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
        if (link && link.indexOf('http') !== 0) {
            link = BASE_URL + link;
        }
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
