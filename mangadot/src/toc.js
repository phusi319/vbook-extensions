load('config.js');

function execute(url) {
    return Response.success([
        {
            name: "Chapter 1",
            url: BASE_URL + "/chapter/1",
            host: BASE_URL
        }
    ]);
}
