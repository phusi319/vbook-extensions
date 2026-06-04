# VBook Extension Template

Template mẫu để tạo extension VBook nhanh chóng cho bất kỳ trang truyện nào.

---

## Cách nhanh nhất: Dùng script tự động

Double-click file **TaoExtension.bat** trên Desktop, nhập thông tin → script tự động:

1. Copy template thành extension mới
2. Điền BASE_URL, metadata vào config.js + plugin.json
3. Tự tải icon từ trang web
4. Build plugin.zip bằng Python (chuẩn Java ZipInputStream)
5. Đăng ký extension vào root plugin.json

Sau đó bạn chỉ cần sửa CSS selector trong `src/*.js` rồi push.

---

## Cách thủ công (từng bước)

```text
1. Copy thư mục:   cp -r _template tentrang
2. Sửa config.js:  đổi BASE_URL
3. Sửa plugin.json: đổi name, source, regexp, description
4. Sửa src/*.js:   đổi CSS selector (tìm TODO ★)
5. Thêm icon.png   (96x96)
6. Build zip:      python make_zip.py tentrang tentrang/plugin.zip
7. Đăng ký:        thêm entry vào root plugin.json
8. Push:           git add . && git commit && git push
```

---

## Cấu trúc chuẩn của 1 extension

```text
tentrang/
├── icon.png          # Icon 96x96 hiển thị trên VBook
├── plugin.json       # Metadata: name, author, version, regexp, script mapping
├── plugin.zip        # File zip build bằng Python (KHÔNG dùng PowerShell!)
└── src/
    ├── config.js     # BASE_URL + helper (fetchHtml / fetchApi)
    ├── home.js       # Menu category trang chủ
    ├── genre.js      # Danh sách thể loại
    ├── gen.js        # Danh sách truyện + phân trang
    ├── search.js     # Tìm kiếm truyện
    ├── detail.js     # Chi tiết truyện (tên, bìa, tác giả, mô tả, trạng thái)
    ├── toc.js        # Danh sách chương (chương cũ nhất lên đầu!)
    └── chap.js       # Ảnh trong chương
```

---

## Hai kiểu extension

| Kiểu | Dùng cho | Ví dụ |
|------|----------|-------|
| **HTML Scraping** | Trang web thường, parse HTML bằng selector | foxtruyen, truyenqq, nettruyen |
| **JSON API** | Trang có REST API trả JSON | cuutruyen, moetruyen, mangadot |

Template mặc định là kiểu **HTML Scraping** (phổ biến nhất).
Xem comment `[API]` trong config.js để chuyển sang JSON API.

---

## File cần chỉnh sửa (tìm TODO ★)

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

---

## Ràng buộc kỹ thuật (QUAN TRỌNG)

- **Dùng `var`** — KHÔNG `const`/`let` (Rhino engine Android cũ)
- **Dùng `function(){}`** — KHÔNG arrow `=>`
- **Chương sắp xếp cũ → mới** trong toc.js
- **`host: BASE_URL`** bắt buộc trong mọi item trả về
- **Nén zip bằng Python** — TUYỆT ĐỐI KHÔNG dùng PowerShell Compress-Archive

---

## Build zip chuẩn

```bash
python make_zip.py tentrang tentrang/plugin.zip
```

Script `make_zip.py` (ở thư mục gốc repo) sẽ nén theo đúng thứ tự:
`plugin.json` → `icon.png` → `src/*.js`

---

## Scripts tiện ích trên Desktop

| File | Chức năng |
|------|-----------|
| `TaoExtension.bat` | Tạo extension mới từ template |
| `UpdateNetTruyen.bat` | Cập nhật domain NetTruyen khi bị đổi |
