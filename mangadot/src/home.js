load('config.js');
function execute() {
    return Response.success([
        {title: "Cập nhật mới", input: "https://mangadot.net/view-all/latest-updates", script: "gen.js"},
        {title: "Manga", input: "https://mangadot.net/categories/manga", script: "gen.js"},
        {title: "Manhwa", input: "https://mangadot.net/categories/manhwa", script: "gen.js"}
    ]);
}
