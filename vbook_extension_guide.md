# vBook Extension Development Guide & Template

Tài liệu này đúc kết toàn bộ kiến trúc, giới hạn kỹ thuật, và các sai lầm cần tránh khi xây dựng extension cho ứng dụng vBook, dựa trên kinh nghiệm thực tế khi phát triển extension FoxTruyen.

## 1. Kiến trúc thư mục chuẩn
Một extension vBook bắt buộc phải có cấu trúc như sau khi nén thành file `.zip`:

```text
plugin.zip
├── icon.png                 # Icon hiển thị trên vBook
├── plugin.json              # File cấu hình chính
└── src/                     # Thư mục chứa mã nguồn JS
    ├── config.js            # Khai báo BASE_URL
    ├── home.js              # Menu danh mục trang chủ
    ├── genre.js             # Danh sách thể loại
    ├── gen.js               # Load danh sách truyện (dùng cho home/genre)
    ├── search.js            # Load danh sách tìm kiếm
    ├── detail.js            # Thông tin chi tiết truyện
    ├── toc.js               # Danh sách chương
    └── chap.js              # Nội dung chương (ảnh)
```

> [!WARNING]
> **Lỗi thường gặp khi nén zip**: Phải chọn tất cả các file (`icon.png`, `plugin.json`, `src`) rồi nén lại. KHÔNG nén thư mục cha (ví dụ nén thư mục `foxtruyen` thành `foxtruyen.zip`), vBook sẽ không đọc được mã nguồn.

---

## 2. Giới hạn của môi trường thực thi (JS Rhino + JSoup)
vBook không chạy extension bằng trình duyệt thông thường (như Chrome V8) mà dùng Rhino engine kết hợp JSoup wrapper trên Java. Do đó, có những giới hạn cực kỳ nghiêm ngặt:

> [!CAUTION]
> - **KHÔNG DÙNG `nextElementSibling()` hoặc `previousElementSibling()`**: vBook JS wrapper không map các hàm DOM traversal này. Sẽ gây lỗi `TypeError: Cannot find function`.
> - **HẠN CHẾ Arrow Functions (`() => {}`) và `let`/`const`**: Để đảm bảo tương thích với các phiên bản Android/Rhino cũ, hãy luôn dùng `var` và `function() {}`.
> - **KHÔNG SO SÁNH CHUỖI UTF-8 CỨNG**: Hạn chế dùng `if (text === "Tác giả")` vì lỗi encoding có thể xảy ra. Nên dựa vào cấu trúc HTML (VD: `select("a.org")`).

### Cú pháp an toàn được hỗ trợ 100%:
- `doc.select(".class")` -> trả về danh sách Element.
- `el.first()` -> Lấy Element đầu tiên.
- `el.size()` hoặc `el.length` -> Lấy số lượng Element.
- `el.forEach(function(e) { ... })` -> Duyệt vòng lặp.
- `e.text()`, `e.html()`, `e.attr("href")` -> Lấy dữ liệu.

---

## 3. Template & Best Practices cho từng File

### 3.1. `plugin.json`
```json
{
  "metadata": {
    "name": "TenExtension",
    "author": "TenTacGia",
    "version": 1,
    "source": "https://domain.com",
    "regexp": "(www.)?domain[0-9]*.com/truyen-tranh/[^/]+\\.html$",
    "description": "Mô tả ngắn gọn",
    "locale": "vi_VN",
    "language": "javascript",
    "type": "comic"
  },
  "script": {
    "home": "home.js",
    "genre": "genre.js",
    "detail": "detail.js",
    "search": "search.js",
    "toc": "toc.js",
    "chap": "chap.js"
  }
}
```

### 3.2. Pagination an toàn (`gen.js` & `search.js`)
Tránh dùng DOM traversal để tìm trang tiếp theo. Thuật toán tốt nhất là lấy số trang hiện tại `+1` và duyệt toàn bộ `.page-item` để text match.

```javascript
// Thay vì dùng nextElementSibling, hãy dùng vòng lặp text match:
var next = null;
var activeItem = doc.select(".page-item.active").first();
if (activeItem) {
    var currentPage = parseInt(activeItem.text());
    var nextText = String(currentPage + 1);
    
    doc.select(".page-item").forEach(function(e) {
        if (e.text() === nextText) {
            next = e.attr("href"); // Với gen.js
            // next = nextText; // Với search.js (nếu URL tự build bằng chuỗi)
        }
    });
}
```

> [!TIP]
> **Xử lý Absolute vs Relative URLs**: Tham số `url` truyền vào `gen.js` có thể là absolute (`https://...`) hoặc relative (`/the-loai/...`). Luôn kiểm tra trước khi ghép chuỗi:
> ```javascript
> var requestUrl = url;
> if (url.indexOf("http") !== 0) requestUrl = BASE_URL + url;
> ```

### 3.3. Xử lý Trạng thái & Tác giả (`detail.js`)
```javascript
// Tác giả: Tránh so sánh chuỗi tiếng Việt. Hãy tận dụng CSS Selector độc nhất nếu có.
var author = "";
var authorEl = doc.select(".fx-meta__val a.org").first(); // Ví dụ dùng class a.org
if (authorEl) author = authorEl.text();

// Trạng thái: Quét chữ "hoan" hoặc "full" ở dạng chữ thường
var ongoing = true;
var statusEl = doc.select(".fx-status").first();
if (statusEl) {
    var statusText = statusEl.text().toLowerCase();
    if (statusText.indexOf("hoan") > -1 || statusText.indexOf("full") > -1) {
        ongoing = false;
    }
}
```
**Bắt buộc trả về**: `name`, `cover`, `host`, `author`, `description`, `detail`, `ongoing` (boolean), `genres` (array).

### 3.4. Loại bỏ ảnh "rác" cuối chương (`chap.js`)
Nhiều trang truyện lồng ghép "ảnh bìa truyện đề cử" ở ngay dưới danh sách ảnh của chapter (nằm chung trong `.content_detail_manga`).

```javascript
var data = [];
var imgs = doc.select(".content_detail_manga img");
for (var i = 0; i < imgs.size(); i++) {
    var e = imgs.get(i);
    var src = e.attr("data-src") || e.attr("src");
    
    if (src && src.length > 0) {
        // Lọc bỏ logo web và ảnh thumbnail (ví dụ thư mục /ebook/ chứa thumbnail)
        if (src.indexOf("/ebook/") === -1 && src.indexOf("logo") === -1) {
            data.push({ link: src, fallback: [src] });
        }
    }
}
```

### 3.5. Đảo ngược thứ tự chương (`toc.js`)
vBook yêu cầu **chương cũ nhất (Chương 1) xếp đầu mảng**. Các trang web thường xếp chương mới nhất lên đầu. Nhớ duyệt mảng ngược:
```javascript
var list = [];
var el = doc.select(".list-chapter li a");
for (var i = el.size() - 1; i >= 0; i--) { // Chạy từ dưới lên
    list.push({ ... });
}
```

---

## 4. Deployment Checklist
Trước khi commit và push lên repository, luôn thực hiện các bước sau:
- [ ] Tăng số `version` trong cả `plugin.json` (source file) VÀ `plugin.json` của repo registry (vbook-extensions).
- [ ] Bật/tắt console.log (nếu có dùng để debug thì nên bỏ đi cho sạch code).
- [ ] Xóa zip cũ, dùng script gom chính xác `plugin.json`, `icon.png`, và thư mục `src/` vào root của file zip mới.
- [ ] Thêm Host (`host: BASE_URL`) vào tất cả các đối tượng trong list (`gen.js`, `search.js`, `toc.js`, `detail.js`). vBook cần trường này để gọi ảnh hoặc nhận diện host.
