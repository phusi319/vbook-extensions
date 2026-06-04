function execute() {
    return Response.success([
        {title: "Mới Cập Nhật", input: "/danh-sach-truyen/?sort=latest-updated", script: "gen.js"},
        {title: "Top All", input: "/danh-sach-truyen/?sort=views", script: "gen.js"},
        {title: "Top Tháng", input: "/danh-sach-truyen/?sort=views_month", script: "gen.js"},
        {title: "Top Tuần", input: "/danh-sach-truyen/?sort=views_week", script: "gen.js"},
        {title: "Top Ngày", input: "/danh-sach-truyen/?sort=views_day", script: "gen.js"},
        {title: "Yêu Thích", input: "/danh-sach-truyen/?sort=bookmarks", script: "gen.js"},
        {title: "Đánh Giá Cao", input: "/danh-sach-truyen/?sort=score", script: "gen.js"},
        {title: "Truyện Mới", input: "/danh-sach-truyen/?sort=release-date", script: "gen.js"},
        {title: "Con Gái", input: "/danh-sach-truyen/?sort=girl", script: "gen.js"},
        {title: "Con Trai", input: "/danh-sach-truyen/?sort=boy", script: "gen.js"}
    ]);
}
