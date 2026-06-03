load('config.js');

function execute() {
    var doc = fetch(BASE_URL).html();
    if (!doc) return null;

    var genres = [];
    var el = doc.select('.book_tags_content a[href^=/the-loai/]');
    for (var i = 0; i < el.size(); i++) {
        var e = el.get(i);
        genres.push({
            input: e.attr('href'),
            title: e.text(),
            script: 'gen.js'
        });
    }

    if (genres.length === 0) return null;
    return Response.success(genres);
}
