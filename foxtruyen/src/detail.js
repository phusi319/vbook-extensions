load('config.js');

function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();

        let name = "";
        let h1 = doc.select(".fx-info__title").first();
        if (!h1) h1 = doc.select("h1").first();
        if (h1) {
            name = h1.text();
        }

        let cover = "";
        let coverImg = doc.select(".fx-cover__img, .fx-cover img").first();
        if (coverImg) {
            cover = coverImg.attr("src");
            if (!cover || cover.length === 0) {
                cover = coverImg.attr("data-src");
            }
        }

        let author = "";
        doc.select(".fx-meta__row").forEach(function(e) {
            let label = e.select(".fx-meta__label").first();
            if (label && label.text().indexOf("Tác giả") !== -1) {
                let val = e.select(".fx-meta__val").first();
                if (val) {
                    author = val.text();
                }
            }
        });

        let status = "";
        let statusEl = doc.select(".fx-status").first();
        if (statusEl) {
            status = statusEl.text();
        }

        let description = "";
        let descEl = doc.select(".fx-synopsis__text").first();
        if (descEl) {
            description = descEl.html();
        }

        let genres = [];
        doc.select(".fx-genres .fx-genre").forEach(function(e) {
            genres.push({
                title: e.text(),
                input: e.attr("href"),
                script: "gen.js"
            });
        });

        return Response.success({
            name: name,
            cover: cover,
            author: author,
            status: status,
            description: description,
            genres: genres
        });
    }
    return null;
}
