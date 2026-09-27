# VBook Extension Template

Template mẫu chuẩn để tạo extension VBook cho bất kỳ trang truyện nào.

## Cấu trúc thư mục

```
_template/
├── WORKFLOW.md       ← 📋 Quy trình chi tiết từ A→Z cho agent/dev follow
├── README.md         ← 📖 File này
├── make_zip.py       ← 🔧 Script build ZIP tương thích VBook
├── plugin.json       ← ⚙️ Metadata extension (TODO placeholders)
└── src/
    ├── config.js     ← 🔗 BASE_URL + fetchHtml helper
    ├── home.js       ← 🏠 Menu categories trang chủ
    ├── genre.js      ← 📚 Danh sách thể loại
    ├── gen.js        ← 📋 Listing truyện + phân trang
    ├── search.js     ← 🔍 Tìm kiếm
    ├── detail.js     ← 📄 Chi tiết truyện
    ├── toc.js        ← 📑 Danh sách chương
    └── chap.js       ← 🖼️ Ảnh chương
```

## Cách dùng nhanh

```powershell
# 1. Copy template
Copy-Item -Recurse _template tentrang

# 2. Sửa code (xem WORKFLOW.md cho chi tiết)
#    - config.js: đổi BASE_URL
#    - plugin.json: đổi metadata
#    - src/*.js: đổi CSS selectors (tìm TODO ★)

# 3. Thêm icon
#    Tải favicon/logo từ trang web → lưu thành tentrang/icon.png

# 4. Build ZIP
python make_zip.py tentrang tentrang/plugin.zip

# 5. Đăng ký vào root plugin.json

# 6. Push
git add tentrang/ plugin.json
git commit -m "feat: add TenTrang extension"
git push origin main
```

## Tài liệu

| File | Nội dung |
|------|----------|
| [WORKFLOW.md](WORKFLOW.md) | **Quy trình đầy đủ từ A→Z** — agent đọc file này là đủ |
| [vbook_extension_guide.md](../vbook_extension_guide.md) | Kiến trúc, giới hạn kỹ thuật, best practices |

## Hai kiểu extension

| Kiểu | Dùng khi | Ví dụ trong repo |
|------|----------|-------------------|
| **HTML Scraping** | Trang web thường | foxtruyen, truyenqq, nettruyen |
| **JSON API** | Trang có REST API | cuutruyen, moetruyen, mangadot |

Template mặc định dùng kiểu **HTML Scraping** (phổ biến nhất).
Xem comment `[API]` trong `config.js` để chuyển sang kiểu JSON API.

## Quy ước đánh dấu trong code

- `TODO` — Chỗ cần sửa
- `TODO ★` — Chỗ BẮT BUỘC phải sửa (selector, URL)
- `[API]` — Code thay thế cho kiểu JSON API (commented)
