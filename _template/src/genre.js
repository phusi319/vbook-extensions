// ============================================================================
// genre.js — Danh sách thể loại
// ============================================================================
// Parse danh sách thể loại từ trang web.
// Trả về mảng [{title, input, script}] giống home.js.
//
// TODO: Đổi selector và URL cho phù hợp trang của bạn.
//
// Có 2 cách:
//   1. Parse từ HTML (trang có menu thể loại)
//   2. Hardcode danh sách (nếu trang ít thay đổi thể loại)

load('config.js');

function execute() {
    var list = [];

    // --- Cách 1: Parse từ HTML (khuyên dùng) ---
    try {
        var doc = fetchHtml(BASE_URL);
        if (doc) {
            // TODO: Đổi selector phù hợp trang của bạn
            // Ví dụ: menu thể loại thường nằm trong nav, .megamenu, .genre-list, ...
            var genres = doc.select('.megamenu .nav a[href*=/the-loai/]');
            for (var i = 0; i < genres.size(); i++) {
                var el = genres.get(i);
                var title = el.text().trim();
                var href = el.attr('href');

                if (title && href) {
                    // Chuyển absolute URL thành relative path
                    if (href.indexOf('http') === 0) {
                        href = href.replace(/^https?:\/\/[^\/]+/, '');
                    }
                    list.push({
                        title: title,
                        input: href,
                        script: 'gen.js'
                    });
                }
            }
        }
    } catch (e) {}

    // --- Cách 2: Hardcode (backup nếu parse lỗi) ---
    if (list.length === 0) {
        list = [
            {title: "Action", input: "/the-loai/action", script: "gen.js"},
            {title: "Comedy", input: "/the-loai/comedy", script: "gen.js"},
            {title: "Drama", input: "/the-loai/drama", script: "gen.js"},
            {title: "Fantasy", input: "/the-loai/fantasy", script: "gen.js"},
            {title: "Romance", input: "/the-loai/romance", script: "gen.js"}
        ];
    }

    return Response.success(list);
}
