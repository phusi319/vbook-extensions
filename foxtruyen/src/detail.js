load('config.js');

function buildDetail(doc) {
    var lines = [];
    doc.select(".fx-meta__row").forEach(function(e) {
        var label = e.select(".fx-meta__label").first();
        var val = e.select(".fx-meta__val").first();
        if (label && val) {
            var labelText = label.text().replace(/\s+/g, " ").trim();
            var valText = val.html().replace(/\s+/g, " ").trim();
            if (labelText && valText) {
                lines.push("<b>" + labelText + "</b> " + valText);
            }
        }
    });
    return lines.join("<br>");
}

function getGenres(doc) {
    var genres = [];
    doc.select(".fx-genres .fx-genre").forEach(function(e) {
        genres.push({
            title: e.text(),
            input: e.attr("href"),
            script: "gen.js"
        });
    });
    return genres;
}

function execute(url) {
    var doc = fetch(url).html();
    if (doc) {
        // Cover
        var cover = "";
        var coverImg = doc.select(".fx-cover__img, .fx-cover img").first();
        if (coverImg) {
            cover = coverImg.attr("src");
            if (!cover || cover.length === 0) {
                cover = coverImg.attr("data-src");
            }
        }

        // Status
        var status = "";
        var statusEl = doc.select(".fx-status").first();
        if (statusEl) {
            status = statusEl.text();
        }

        // Name
        var name = "";
        var h1 = doc.select(".fx-info__title").first();
        if (!h1) h1 = doc.select("h1").first();
        if (h1) name = h1.text();

        // Author
        var author = "";
        doc.select(".fx-meta__row").forEach(function(e) {
            var label = e.select(".fx-meta__label").first();
            if (label && label.text().indexOf("Tac gia") !== -1) {
                var val = e.select(".fx-meta__val").first();
                if (val) author = val.text();
            }
        });

        // Description
        var description = "";
        var descEl = doc.select(".fx-synopsis__text").first();
        if (descEl) description = descEl.html();

        return Response.success({
            name: name,
            cover: cover,
            host: BASE_URL,
            author: author,
            description: description,
            detail: buildDetail(doc),
            ongoing: status.indexOf("Hoan Thanh") === -1,
            genres: getGenres(doc)
        });
    }

    return null;
}
