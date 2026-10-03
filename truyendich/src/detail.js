load('config.js');

function execute(url) {
    var slug = url.split('/').pop();
    if (!slug) return null;

    var apiUrl = BASE_URL + "/api/novels/" + slug;
    var response = fetch(apiUrl);

    if (response.ok) {
        var json = response.json();
        if (json && json.title) {
            var name = json.title;
            var cover = json.image_url;
            if (cover && cover.indexOf('http') !== 0) cover = BASE_URL + cover;
            var author = json.author || (json.author_rel ? json.author_rel.name : "");
            var desc = json.description || "";
            var ongoing = json.status === "ongoing";

            var genres = [];
            if (json.categories) {
                for (var i = 0; i < json.categories.length; i++) {
                    var g = json.categories[i];
                    genres.push({
                        title: g.name,
                        input: BASE_URL + "/the-loai/" + g.slug,
                        script: "gen.js"
                    });
                }
            }

            var detail = "";
            if (author) detail += "Tác giả: " + author + "<br>";
            if (json.latest_chapter_number) detail += "Số chương: " + json.latest_chapter_number + "<br>";
            if (json.updated_at) {
                var date = json.updated_at.split('T')[0];
                var parts = date.split('-');
                if (parts.length === 3) {
                    detail += "Cập nhật: " + parts[2] + "/" + parts[1] + "/" + parts[0];
                }
            }

            return Response.success({
                name: name,
                cover: cover,
                author: author,
                description: desc,
                detail: detail,
                host: BASE_URL,
                ongoing: ongoing,
                genres: genres
            });
        }
    }

    return null;
}
