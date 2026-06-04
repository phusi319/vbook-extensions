load('config.js');

function execute(url) {
    var match = /mangas\/(\d+)\/?/.exec(url);
    if (!match) return null;
    var chapterId = match[1];

    var json = fetchApi(API_URL + "/mangas/" + chapterId);

    if (json && json.data) {
        var data = json.data;

        return Response.success({
            name: data.name,
            cover: data.cover_url,
            author: data.author ? data.author.name : "Đang cập nhật",
            description: data.description || "",
            detail: (data.author ? data.author.name : "") + "<br>" + (data.chapters_count || 0) + " Chương",
            host: BASE_URL,
            ongoing: data.status !== "completed"
        });
    }

    return null;
}
