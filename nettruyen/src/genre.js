load('config.js');

function execute() {
    var doc = fetchHtml(BASE_URL);
    if (!doc) return null;

    var genres = [];
    doc.select(".megamenu .nav a[href*=/the-loai/]").forEach(function(e) {
        var href = e.attr("href");
        if (href.indexOf('http') === 0) {
            href = href.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/i, "");
        }
        genres.push({
            input: href,
            title: e.text(),
            script: "gen.js"
        });
    });

    return Response.success(genres);
}
