load('config.js');

function execute() {
    return Response.success([
        {title: "Mới cập nhật", input: API_URL + "/mangas/recently_updated", script: "gen.js"},
        {title: "Nổi bật tuần", input: API_URL + "/mangas/top?duration=week", script: "gen.js"},
        {title: "Nổi bật tháng", input: API_URL + "/mangas/top?duration=month", script: "gen.js"},
        {title: "Nổi bật mọi thời đại", input: API_URL + "/mangas/top?duration=all", script: "gen.js"},
        {title: "Truyện Full", input: API_URL + "/mangas/recently_updated?status=completed", script: "gen.js"}
    ]);
}
