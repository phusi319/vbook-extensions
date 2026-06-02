load('config.js');

function execute(url) {
    return Response.success({
        name: "Test Manga",
        cover: "",
        author: "Test Author",
        description: "Test description",
        detail: "Test detail",
        host: BASE_URL,
        ongoing: true
    });
}
