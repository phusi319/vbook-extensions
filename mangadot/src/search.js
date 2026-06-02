load('config.js');
function execute(key, page) {
    if (!page) page = '1';
    var url = BASE_URL + '/search?search=' + encodeURIComponent(key) + '&page=' + page;
    var doc = Http.get(url).html();

    var el = doc.select('a.group[href^=/manga/]');
    var data = [];
    for (var i = 0; i < el.size(); i++) {
        var e = el.get(i);
        var link = e.attr('href');
        var title = e.select('.line-clamp-2').text();
        var coverEl = e.select('img').first();
        var cover = '';
        if (coverEl) {
            cover = coverEl.attr('src');
            if (cover && cover.indexOf('http') !== 0) {
                cover = BASE_URL + cover;
            }
        }
        var desc = e.select('span.absolute.bottom-1\\.5.right-1\\.5').text();

        if (title && link) {
            data.push({
                name: title,
                link: BASE_URL + link,
                cover: cover,
                description: desc,
                host: BASE_URL
            });
        }
    }

    var next = '';
    if (data.length > 0) {
        next = String(parseInt(page) + 1);
    }

    return Response.success(data, next);
}
