load('config.js');

function execute() {
    var doc = fetchHtml(BASE_URL);
    if (!doc) return null;

    var genres = [];
    doc.select(".book_tags_content a[href^=/the-loai/]").forEach(function(e) {
        genres.push({
            input: e.attr("href"),
            title: e.text(),
            script: "gen.js"
        });
    });

    return Response.success(genres);
}
