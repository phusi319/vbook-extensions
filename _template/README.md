# VBook Extension Template

Template mẫu để tạo extension VBook nhanh chóng cho bất kỳ trang truyện nào.

## Cách dùng

1. Copy toàn bộ thư mục `_template` thành tên extension mới (vd: `cp -r _template tentrang`)
2. Mở `src/config.js` → đổi `BASE_URL`
3. Mở từng file `src/*.js` → đổi CSS selector / URL pattern cho phù hợp với trang mới
4. Mở `plugin.json` → đổi metadata (name, source, regexp)
5. Thêm `icon.png` (96x96)
6. Build zip: `python make_zip.py tentrang tentrang/plugin.zip`
7. Đăng ký vào root `plugin.json`

## Hai kiểu extension

| Kiểu | Dùng cho | Ví dụ |
|------|----------|-------|
| **HTML Scraping** | Trang web thường, parse HTML bằng selector | foxtruyen, truyenqq, nettruyen |
| **JSON API** | Trang có REST API trả JSON | cuutruyen, moetruyen, mangadot |

Template này cung cấp mẫu cho kiểu **HTML Scraping** (phổ biến nhất).
Xem comment `[API]` trong code để biết cách chuyển sang kiểu JSON API.

## File cần chỉnh sửa

| File | Cần đổi gì |
|------|------------|
| `config.js` | `BASE_URL`, tuỳ chọn thêm helper |
| `home.js` | Danh sách category (title + URL) |
| `genre.js` | Selector parse thể loại |
| `gen.js` | Selector parse danh sách truyện + pagination |
| `search.js` | URL tìm kiếm + selector |
| `detail.js` | Selector cho tên, bìa, tác giả, mô tả, trạng thái, thể loại |
| `toc.js` | Selector danh sách chương |
| `chap.js` | Selector ảnh chương |
