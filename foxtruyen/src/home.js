load('config.js');

function execute() {
    return Response.success([
        { title: "Đang Hot", input: BASE_URL, script: "hot.js" },
        { title: "Mới Cập Nhật", input: BASE_URL + "/truyen-moi-cap-nhat.html", script: "list.js" },
        { title: "Truyện Mới", input: BASE_URL + "/truyen-moi.html", script: "list.js" },
        { title: "Top Ngày", input: BASE_URL + "/top-ngay.html", script: "list.js" },
        { title: "Top Tuần", input: BASE_URL + "/top-tuan.html", script: "list.js" },
        { title: "Top Tháng", input: BASE_URL + "/top-thang.html", script: "list.js" },
        { title: "Truyện Full", input: BASE_URL + "/truyen-hoan-thanh.html", script: "list.js" }
    ]);
}
