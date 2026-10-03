load('config.js');

function execute() {
    return Response.success([
        { title: "Truyện Hot", input: BASE_URL + "/danh-sach/truyen-hot", script: "gen.js" },
        { title: "Truyện Mới", input: BASE_URL + "/danh-sach/truyen-moi", script: "gen.js" },
        { title: "Truyện Full", input: BASE_URL + "/danh-sach/truyen-full", script: "gen.js" },
        { title: "Truyện Convert", input: BASE_URL + "/danh-sach/truyen-convert", script: "gen.js" },
        { title: "Truyện Dịch AI", input: BASE_URL + "/danh-sach/truyen-dich-ai", script: "gen.js" }
    ]);
}
