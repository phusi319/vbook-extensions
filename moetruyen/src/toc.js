load('config.js');

function execute(url) {
    var mangaId = parseMangaId(url);
    if (!mangaId) return null;

    var chapters = [];
    var page = 1;

    while (true) {
        var json = fetchApi(API_URL + "/v2/manga/" + mangaId + "/chapters?page=" + page + "&limit=100");
        if (!json || !json.data || !json.data.chapters || json.data.chapters.length === 0) break;

        json.data.chapters.forEach(function(ch) {
            var chapterName = "Chapter " + ch.numberText;
            if (ch.title) {
                chapterName += " - " + ch.title;
            }
            if (ch.groupName) {
                chapterName += " [" + ch.groupName + "]";
            }

            chapters.push({
                name: chapterName,
                url: BASE_URL + "/chapter/" + ch.id + "?pages=" + ch.pages,
                host: BASE_URL
            });
        });

        var pag = json.meta && json.meta.pagination;
        if (pag && pag.page < pag.totalPages) {
            page++;
        } else {
            break;
        }
    }

    // API returns newest first, vBook expects oldest first
    if (chapters.length > 1) {
        var firstMatch = chapters[0].name.match(/Chapter ([\d\.]+)/);
        var lastMatch = chapters[chapters.length - 1].name.match(/Chapter ([\d\.]+)/);
        if (firstMatch && lastMatch) {
            var firstNum = parseFloat(firstMatch[1]);
            var lastNum = parseFloat(lastMatch[1]);
            if (firstNum > lastNum) {
                chapters.reverse();
            }
        }
    }

    if (chapters.length > 0) {
        return Response.success(chapters);
    }
    return null;
}
