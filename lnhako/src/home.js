// ============================================================================
// HOME — Trang chủ / Menu chính
// ============================================================================

/**
 * Trả về danh sách tab/category hiển thị trên trang chủ extension.
 */
function execute() {
    return Response.success([
        { title: "Mới Cập Nhật", input: "https://ln.hako.vn/danh-sach?sapxep=capnhat", script: "gen.js" },
        { title: "Truyện Mới", input: "https://ln.hako.vn/danh-sach?sapxep=truyenmoi", script: "gen.js" },
        { title: "Top Tháng", input: "https://ln.hako.vn/danh-sach?sapxep=topthang", script: "gen.js" },
        { title: "Top Toàn Thời Gian", input: "https://ln.hako.vn/danh-sach?sapxep=top", script: "gen.js" },
        { title: "Theo Dõi Nhiều", input: "https://ln.hako.vn/danh-sach?sapxep=theodoi", script: "gen.js" }
    ]);
}
