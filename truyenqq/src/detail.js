load('config.js');

function execute(url) {
    return Response.success({
        name: "Test Isolate 1",
        cover: "",
        host: "https://truyenqqko.com",
        author: "Tác giả test",
        description: "Đây là dữ liệu test isolate: " + String(url),
        detail: "Chi tiết test",
        ongoing: true,
        genres: []
    });
}
