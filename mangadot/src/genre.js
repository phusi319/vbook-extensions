load('config.js');

function execute() {
    return Response.success([
        {title: "Manga", input: "https://mangadot.net/categories/manga", script: "gen.js"},
        {title: "Manhwa", input: "https://mangadot.net/categories/manhwa", script: "gen.js"},
        {title: "Manhua", input: "https://mangadot.net/categories/manhua", script: "gen.js"}
    ]);
}
