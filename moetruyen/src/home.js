load('config.js');

function execute() {
    return Response.success([
        {title: "Mới cập nhật", input: API_URL + "/v2/manga?sort=updated_at&limit=30", script: "gen.js"},
        {title: "Top ngày", input: API_URL + "/v2/manga/top?sort_by=views&time=24h&limit=30", script: "gen.js"},
        {title: "Top tuần", input: API_URL + "/v2/manga/top?sort_by=views&time=7d&limit=30", script: "gen.js"},
        {title: "Top tháng", input: API_URL + "/v2/manga/top?sort_by=views&time=30d&limit=30", script: "gen.js"},
        {title: "Truyện Full", input: API_URL + "/v2/manga?status=completed&sort=updated_at&limit=30", script: "gen.js"},
        {title: "Phổ biến nhất", input: API_URL + "/v2/manga?sort=popular&limit=30", script: "gen.js"}
    ]);
}
