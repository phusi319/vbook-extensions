// ============================================================================
// DETAIL — Trang chi tiết truyện
// ============================================================================

load('config.js');

/**
 * Parse thông tin chi tiết truyện.
 * ⚠️ Script quan trọng nhất — ảnh hưởng trực tiếp đến Add Bookshelf.
 *
 * ln.hako.vn detail page structure:
 * - Series name: span.series-name > a
 * - Cover: .content.img-in-ratio (data-bg or style background-image)
 * - Author: .info-item .info-value a (first info-item contains author)
 * - Status: .info-item containing "Tình trạng"
 * - Genres: a.series-gerne-item (note: site has typo "gerne")
 * - Summary: .summary-content
 */
function execute(url) {
    url = normalizeUrl(url);

    var doc = fetchHtml(url);
    if (!doc) return null;

    // ─── Parse tên truyện ──────────────────────────────────────────────
    var nameEl = doc.select('.series-name a').first();
    if (!nameEl) {
        nameEl = doc.select('.series-name').first();
    }
    var name = nameEl ? nameEl.text().trim() : '';
    if (!name) return null;

    // ─── Parse ảnh bìa ────────────────────────────────────────────────
    var cover = '';
    var coverDiv = doc.select('.series-cover .content.img-in-ratio').first();
    if (!coverDiv) {
        coverDiv = doc.select('.a6-ratio .content.img-in-ratio').first();
    }
    if (coverDiv) {
        cover = coverDiv.attr('data-bg');
        if (!cover) {
            cover = extractBgUrl(coverDiv.attr('style'));
        }
    }

    // ─── Parse tác giả ────────────────────────────────────────────────
    var author = '';
    var infoItems = doc.select('.series-information .info-item');
    if (infoItems && infoItems.size() > 0) {
        for (var i = 0; i < infoItems.size(); i++) {
            var infoItem = infoItems.get(i);
            var infoName = infoItem.select('.info-name').first();
            if (infoName) {
                var labelText = infoName.text().trim().toLowerCase();
                if (labelText.indexOf('c gi') >= 0) {
                    // "Tác giả:" — dùng indexOf vì tránh so sánh UTF-8
                    var infoValue = infoItem.select('.info-value').first();
                    if (infoValue) {
                        author = infoValue.text().trim();
                    }
                    break;
                }
            }
        }
    }

    // ─── Parse mô tả ──────────────────────────────────────────────────
    var descEl = doc.select('.summary-content').first();
    var description = descEl ? descEl.text().trim() : '';

    // ─── Parse trạng thái ──────────────────────────────────────────────
    var ongoing = true;
    if (infoItems && infoItems.size() > 0) {
        for (var j = 0; j < infoItems.size(); j++) {
            var statusItem = infoItems.get(j);
            var statusLabel = statusItem.select('.info-name').first();
            if (statusLabel) {
                var statusLabelText = statusLabel.text().trim().toLowerCase();
                if (statusLabelText.indexOf('nh tr') >= 0) {
                    // "Tình trạng:"
                    var statusValue = statusItem.select('.info-value').first();
                    if (statusValue) {
                        var statusText = statusValue.text().trim().toLowerCase();
                        if (statusText.indexOf('n th') >= 0) {
                            // "Hoàn thành"
                            ongoing = false;
                        }
                    }
                    break;
                }
            }
        }
    }

    // ─── Parse thể loại ───────────────────────────────────────────────
    var genreEls = doc.select('a.series-gerne-item');
    var genres = [];
    if (genreEls && genreEls.size() > 0) {
        for (var k = 0; k < genreEls.size(); k++) {
            var g = genreEls.get(k);
            var title = g.text().trim();
            var href = g.attr('href');
            if (title && href) {
                genres.push({
                    title: title,
                    input: normalizeUrl(href),
                    script: "gen.js"
                });
            }
        }
    }

    // ─── Build detail info ─────────────────────────────────────────────
    var detail = '';
    if (author) detail += 'Tác giả: ' + author + '\n';
    detail += 'Trạng thái: ' + (ongoing ? 'Đang tiến hành' : 'Hoàn thành') + '\n';

    // Thêm thông tin phụ: họa sĩ
    if (infoItems && infoItems.size() > 0) {
        for (var m = 0; m < infoItems.size(); m++) {
            var extraItem = infoItems.get(m);
            var extraLabel = extraItem.select('.info-name').first();
            if (extraLabel) {
                var extraLabelText = extraLabel.text().trim().toLowerCase();
                if (extraLabelText.indexOf('a s') >= 0) {
                    // "Họa sĩ:"
                    var extraValue = extraItem.select('.info-value').first();
                    if (extraValue) {
                        detail += 'Họa sĩ: ' + extraValue.text().trim() + '\n';
                    }
                }
            }
        }
    }

    if (!detail) detail = name;

    // ─── Return ────────────────────────────────────────────────────────
    return Response.success({
        name: String(name),
        cover: String(cover),
        host: BASE_URL,
        author: String(author),
        description: String(description),
        detail: String(detail),
        ongoing: ongoing,
        genres: genres
    });
}
