load('config.js');

function execute(url) {
    var mangaId = parseMangaId(url);
    if (!mangaId) return null;

    var json = fetchApi(API_URL + "/v2/manga/" + mangaId + "?include=stats,genres,groups");
    if (!json || !json.data) return null;

    var data = json.data;

    var author = data.author || "Đang cập nhật";
    var groupName = data.groupName || "";
    if (!groupName && data.groups && data.groups.length > 0) {
        groupName = data.groups.map(function(g) { return g.name; }).join(", ");
    }

    var altTitles = (data.altTitles && data.altTitles.length) ? data.altTitles.join(", ") : "";

    var detail = "Tác giả: " + author;
    detail += "<br>Trạng thái: " + statusText(data.status);
    if (groupName) detail += "<br>Nhóm dịch: " + groupName;
    if (altTitles) detail += "<br>Tên khác: " + altTitles;

    if (data.stats) {
        detail += "<br>Lượt xem: " + (data.stats.totalViews || 0);
        detail += " | Bookmark: " + (data.stats.bookmarkCount || 0);
    }

    var updated = data.updatedAt || "";
    if (updated) {
        detail += "<br>Cập nhật: " + formatDate(updated);
    }

    detail += "<br>" + (data.chapterCount || 0) + " Chương";

    var description = data.description || "";

    var genresArr = [];
    if (data.genres && data.genres.length) {
        for (var i = 0; i < data.genres.length; i++) {
            genresArr.push({
                title: data.genres[i].name,
                input: API_URL + "/v2/manga?genre=" + data.genres[i].id + "&sort=updated_at&limit=30",
                script: "gen.js"
            });
        }
    }

    var isOngoing = data.status === "ongoing" || data.status === "hiatus" || data.status === "unknown";

    return Response.success({
        name: data.title,
        cover: data.coverUrl || "",
        author: author,
        description: description,
        detail: detail,
        host: BASE_URL,
        ongoing: isOngoing,
        genres: genresArr
    });
}
