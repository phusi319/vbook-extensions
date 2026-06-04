function execute() {
    return Response.success([
        { title: "Mới Cập Nhật", input: "/manga?sort=updated_at", script: "gen.js" },
        { title: "Top Ngày", input: "/manga/top?sort_by=views&time=24h", script: "gen.js" },
        { title: "Top Tuần", input: "/manga/top?sort_by=views&time=7d", script: "gen.js" },
        { title: "Top Tháng", input: "/manga/top?sort_by=views&time=30d", script: "gen.js" },
        { title: "Truyện Full", input: "/manga?status=completed&sort=updated_at", script: "gen.js" }
    ]);
}
