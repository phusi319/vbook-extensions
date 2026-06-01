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

        // Name
        var name = "";
        var h1 = doc.select(".fx-info__title").first();
        if (!h1) h1 = doc.select("h1").first();
        if (h1) name = h1.text();

        // Author - get from first .fx-meta__val which contains .org link
        var author = "";
        var authorEl = doc.select(".fx-meta__val a.org").first();
        if (authorEl) {
            author = authorEl.text();
        }

        // Status - check fx-status class
        var ongoing = true;
        var statusEl = doc.select(".fx-status").first();
        if (statusEl) {
            var statusText = statusEl.text().toLowerCase();
            if (statusText.indexOf("hoan") > -1 || statusText.indexOf("full") > -1) {
                ongoing = false;
            }
        }

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
            ongoing: ongoing,
            genres: getGenres(doc)
        });
    }

    return null;
}
