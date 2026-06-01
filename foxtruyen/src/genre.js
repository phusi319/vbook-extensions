load('config.js');

function execute() {
    var doc = fetch(BASE_URL).html();
    if (doc) {
        var genres = [];
        doc.select(".dropdown-full .dropdown-item").forEach(function(e) {
            var title = e.text().trim();
            var link = e.attr("href");
            if (title && title.length > 0 && link && link.length > 0) {
                genres.push({
                    input: link,
                    title: title,
                    script: "gen.js"
                });
            }
        });
        return Response.success(genres);
    }
    return null;
}
