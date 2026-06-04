// ============================================================================
// config.js — Cấu hình chung cho extension
// ============================================================================
// TODO: Đổi BASE_URL thành domain trang truyện của bạn
var BASE_URL = 'https://TODO_DOMAIN.com';

// Cho phép vBook override URL khi cần (giữ nguyên, không đổi)
try {
    if (CONFIG_URL) {
        BASE_URL = CONFIG_URL;
    }
} catch (e) {}

// ============================================================================
// fetchHtml(url) — Helper tải HTML với fallback qua browser khi bị Cloudflare
// ============================================================================
// Nếu trang KHÔNG có Cloudflare → xóa hàm này, dùng fetch(url).html() trực tiếp
// Nếu trang CÓ Cloudflare → giữ nguyên hàm này
function fetchHtml(url) {
    var doc = null;
    try {
        doc = Http.get(url).html();
    } catch (e) {}

    // Kiểm tra nếu bị Cloudflare chặn → dùng headless browser
    if (!doc || doc.select('title').text().indexOf('Just a moment') !== -1 || doc.select('title').text().indexOf('Cloudflare') !== -1) {
        try {
            var browser = Engine.newBrowser();
            doc = browser.launch(url, 5000);
            browser.close();
        } catch (e) {}
    }
    return doc;
}

// ============================================================================
// [API] fetchApi(url) — Dùng thay fetchHtml nếu trang trả JSON API
// ============================================================================
// Bỏ comment nếu trang dùng REST API:
//
// function fetchApi(url) {
//     var result = null;
//     try {
//         result = fetch(url).json();
//     } catch (e) {}
//     if (!result) {
//         try {
//             var browser = Engine.newBrowser();
//             var doc = browser.launch(url, 5000);
//             browser.close();
//             if (doc) result = JSON.parse(doc.text());
//         } catch (e) {}
//     }
//     return result;
// }
