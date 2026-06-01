load('config.js');

function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        let chapters = [];

        doc.select(".fx-chap-list .fx-chap-item__name").forEach(function(e) {
            let name = e.text().trim();
            let link = e.attr("href");

            if (name && name.length > 0 && link && link.length > 0) {
                chapters.push({
                    name: name,
                    url: link
                });
            }
        });

        if (chapters.length === 0) {
            doc.select(".fx-chap-item a").forEach(function(e) {
                let name = e.text().trim();
                let link = e.attr("href");

                if (name && name.length > 0 && link && link.length > 0) {
                    chapters.push({
                        name: name,
                        url: link
                    });
                }
            });
        }

        return Response.success(chapters);
    }
    return null;
}
