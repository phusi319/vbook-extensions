// ============================================================================
// home.js — Menu danh mục trang chủ
// ============================================================================
// Trả về danh sách các category hiển thị trên trang chủ của extension.
// Mỗi item là 1 tab/mục mà người dùng có thể chọn.
//
// TODO: Đổi title và input cho phù hợp với trang của bạn.
//   - title: Tên hiển thị trên VBook
//   - input: URL hoặc path sẽ truyền cho gen.js
//   - script: Luôn là "gen.js"
//
// Tips:
//   - input có thể là relative path (vd: "/the-loai/action") hoặc full URL
//   - Thứ tự trong mảng = thứ tự hiển thị trên app
//   - Thường có: Mới Cập Nhật, Top, Yêu Thích, theo Giới tính...

function execute() {
    return Response.success([
        {title: "Mới Cập Nhật", input: "/", script: "gen.js"},
        {title: "Top All", input: "/top-truyen?sort=top-all", script: "gen.js"},
        {title: "Top Tháng", input: "/top-truyen?sort=top-thang", script: "gen.js"},
        {title: "Top Tuần", input: "/top-truyen?sort=top-tuan", script: "gen.js"},
        {title: "Top Ngày", input: "/top-truyen?sort=top-ngay", script: "gen.js"},
        {title: "Truyện Mới", input: "/truyen-moi", script: "gen.js"},
        {title: "Yêu Thích", input: "/yeu-thich", script: "gen.js"}
    ]);
}
