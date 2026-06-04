load('config.js');

function execute(url) {
    var match = /mangas\/(\d+)\/?/.exec(url);
    if (!match) return null;
    var chapterId = match[1];

    var json = fetchApi(API_URL + "/mangas/" + chapterId);

    if (json && json.data) {
        var data = json.data;

        var author = data.author ? data.author.name : "Đang cập nhật";
        var team = data.team ? data.team.name : "";
        var titles = (data.titles && data.titles.length) ? data.titles.map(function(t) { return t.title; }).join(", ") : "";
        var genres = (data.tags && data.tags.length) ? data.tags.map(function(t) { return t.name; }).join(", ") : "";
        var isCompleted = false;
        if (data.tags) {
            for (var i = 0; i < data.tags.length; i++) {
                if (data.tags[i].slug === 'da-hoan-thanh') {
                    isCompleted = true;
                    break;
                }
            }
        }

        var detail = "Tác giả: " + author;
        if (team) detail += "<br>Nhóm dịch: " + team;
        if (titles) detail += "<br>Tên khác: " + titles;
        if (genres) detail += "<br>Thể loại: " + genres;
        
        var updated = data.newest_chapter_created_at || data.updated_at || "";
        if (updated) {
            var dateParts = updated.split("T")[0].split("-");
            if (dateParts.length === 3) {
                detail += "<br>Cập nhật: " + dateParts[2] + "/" + dateParts[1] + "/" + dateParts[0];
            }
        }
        
        detail += "<br>" + (data.chapters_count || 0) + " Chương";

        var description = data.full_description || data.description || "";

        var genresArr = [];
        if (data.tags && data.tags.length) {
            for (var i = 0; i < data.tags.length; i++) {
                genresArr.push({
                    title: data.tags[i].name,
                    input: API_URL + "/mangas/search?tags=\"" + data.tags[i].name + "\"",
                    script: "gen.js"
                });
            }
        }

        return Response.success({
            name: data.name,
            cover: data.cover_url,
            author: author,
            description: description,
            detail: detail,
            host: BASE_URL,
            ongoing: !isCompleted,
            genres: genresArr
        });
    }

    return null;
}
