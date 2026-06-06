// ============================================================================
// CONFIG — Cấu hình chung cho extension LN Hako
// ============================================================================

var BASE_URL = 'https://ln.hako.vn';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Fetch HTML page — dùng fetch() vì site có Cloudflare
 * vBook's fetch() chia sẻ cookie với WebView → bypass CF
 */
function fetchHtml(url) {
    var resp = fetch(url);
    if (!resp.ok) return null;
    return resp.html();
}

/**
 * Normalize relative URL thành absolute URL
 */
function normalizeUrl(path) {
    if (!path) return '';
    path = path.trim();
    if (path.indexOf('http') === 0) return path;
    if (path.indexOf('//') === 0) return 'https:' + path;
    if (path.indexOf('/') === 0) return BASE_URL + path;
    return BASE_URL + '/' + path;
}

/**
 * Cắt text dài thành maxLen ký tự
 */
function truncate(text, maxLen) {
    if (!text) return '';
    text = text.trim();
    if (text.length <= maxLen) return text;
    return text.substring(0, maxLen) + '...';
}

/**
 * Extract cover URL từ style attribute
 * style="background-image: url('https://...')" → URL
 */
function extractBgUrl(styleStr) {
    if (!styleStr) return '';
    var match = styleStr.match(/url\(['"]?([^'")\s]+)['"]?\)/);
    if (match && match[1]) return match[1];
    return '';
}
