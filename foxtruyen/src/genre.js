load('config.js');

function execute() {
    let response = fetch(BASE_URL);
    if (response.ok) {
        let doc = response.html();
        let genres = [];

        doc.select(".dropdown-full .dropdown-item").forEach(function(e) {
            let title = e.text().trim();
            let link = e.attr("href");

            if (title && title.length > 0 && link && link.length > 0) {
                genres.push({
                    title: title,
                    input: link,
                    script: "gen.js"
                });
            }
        });

        return Response.success(genres);
    }
    return null;
}
