# vBook Extension Development Guide

Hướng dẫn phát triển extension cho vBook, đúc kết từ kinh nghiệm phát triển extension Mangadot và FoxTruyen.

## Mục lục

- [Cấu trúc Extension](#cấu-trúc-extension)
- [plugin.json - Cấu hình](#pluginjson---cấu-hình)
- [Scripts](#scripts)
- [API Reference](#api-reference)
- [Cloudflare & Network](#cloudflare--network)
- [Lỗi thường gặp & Cách debug](#lỗi-thường-gặp--cách-debug)
- [Checklist trước khi publish](#checklist-trước-khi-publish)

---

## Cấu trúc Extension

```
extension-name/
├── plugin.json      # Cấu hình extension (BẮT BUỘC)
├── icon.png         # Icon hiển thị trên app
├── plugin.zip       # File zip đóng gói (auto-generated)
└── src/
    ├── config.js    # Biến dùng chung (BASE_URL, helper functions)
    ├── home.js      # Trang chủ - danh sách menu
    ├── genre.js     # Danh sách thể loại
    ├── gen.js       # Danh sách truyện theo thể loại/trang
    ├── search.js    # Tìm kiếm truyện
    ├── detail.js    # Chi tiết truyện (⚠️ ảnh hưởng trực tiếp đến Bookshelf)
    ├── toc.js       # Danh sách chương
    └── chap.js      # Nội dung chương (ảnh/text)
```

---

## plugin.json - Cấu hình

### ⚠️ CRITICAL: Trường `regexp`

**Đây là nguyên nhân phổ biến nhất khiến Add Bookshelf không hoạt động.**

`regexp` phải match **URL trang chi tiết truyện**, KHÔNG PHẢI chỉ domain.

```json
// ❌ SAI - quá generic, gây lỗi Add Bookshelf
"regexp": "mangadot\\.net"

// ✅ ĐÚNG - match URL chi tiết manga cụ thể
"regexp": "(www.)?mangadot\\.net/manga/\\d+/?"
```

**Tại sao?** vBook dùng `regexp` để:
1. Xác định URL nào là trang chi tiết truyện
2. Associate bookmark với extension chính xác
3. Khi Add Bookshelf, vBook match URL hiện tại với regexp → nếu regexp quá generic hoặc sai format → **bookmark save thất bại**

**Tham khảo regexp của các extension hoạt động tốt:**

| Extension | regexp |
|-----------|--------|
| nettruyen | `(www.)?nettruyen[a-z]*.(com\|vn\|net)/truyen-tranh/[^/]+/?$` |
| truyenqq | `(www.)?truyenqq.*?/truyen-tranh/[0-9a-z-]+/?$` |
| cuutruyen | `(www.)?(cuutruyen\|...).net/mangas/\\d+/?` |
| mangadex | `mangadex.org/title/.*?` |
| foxtruyen | `(www.)?foxtruyen[0-9]*.com/truyen-tranh/[^/]+\\.html$` |
| **mangadot** | `(www.)?mangadot\\.net/manga/\\d+/?` |

### Template plugin.json đầy đủ

```json
{
  "metadata": {
    "name": "Tên Extension",
    "author": "tên tác giả",
    "version": 1,
    "source": "https://example.com",
    "regexp": "example\\.com/truyen/[^/]+/?$",
    "description": "Mô tả extension",
    "locale": "vi_VN",
    "language": "javascript",
    "type": "comic"
  },
  "script": {
    "home": "home.js",
    "genre": "genre.js",
    "detail": "detail.js",
    "toc": "toc.js",
    "chap": "chap.js",
    "search": "search.js"
  }
}
```

**Các trường bắt buộc trong metadata:**
- `name`, `author`, `version`, `source`, `type`
- Nếu `type` là `novel`, `comic`, hoặc `chinese_novel` → thêm `regexp`, `language`, `locale`

---

## Scripts

### detail.js - Chi tiết truyện

**Đây là script quan trọng nhất** — ảnh hưởng trực tiếp đến Add Bookshelf.

```javascript
load('config.js');

function execute(url) {
    var doc = fetch(url).html();
    if (!doc) return null;  // ⚠️ PHẢI return null khi fail

    var name = '';
    var h1 = doc.select('h1').first();
    if (h1) name = h1.text();

    if (!name) return null;  // ⚠️ PHẢI return null nếu không có name

    return Response.success({
        name: name,              // string - BẮT BUỘC
        cover: coverUrl,         // string - URL ảnh bìa
        author: authorName,      // string - Tên tác giả
        description: desc,       // string - Mô tả
        detail: detailHtml,      // string - BẮT BUỘC, info thêm (HTML OK)
        host: BASE_URL,          // string - BẮT BUỘC, domain gốc
        ongoing: true,           // boolean - Đang tiến hành?
        genres: [                // array - Danh sách thể loại
            {
                title: "Action",
                input: "/the-loai/action",
                script: "gen.js"
            }
        ]
    });
}
```

**Quy tắc:**
1. Return `null` khi fail — KHÔNG return `Response.success({})` hoặc `Response.success([])`
2. Trường `name` KHÔNG được rỗng
3. Trường `detail` BẮT BUỘC — thiếu trường này có thể gây lỗi
4. Tất cả string fields nên dùng `String(value)` để đảm bảo type safety

### toc.js - Danh sách chương

```javascript
load('config.js');

function execute(url) {
    // ... fetch chapters ...
    if (data.length === 0) return null;  // ⚠️ return null, không return Response.success([])

    return Response.success([
        {
            name: "Chapter 1",   // string - Tên chương
            url: chapterUrl,     // string - URL đọc chương
            host: BASE_URL       // string - Domain gốc
        }
    ]);
}
```

### gen.js - Danh sách truyện

```javascript
function execute(url, page) {
    // ... fetch manga list ...
    return Response.success(
        [                        // data: array of manga items
            {
                name: "Tên truyện",
                link: mangaDetailUrl,  // URL trang chi tiết (match với regexp!)
                cover: coverUrl,
                description: desc,
                host: BASE_URL
            }
        ],
        nextPage                 // data2: string page tiếp theo, "" nếu hết
    );
}
```

**⚠️ QUAN TRỌNG:** `link` trong gen.js phải trả URL match với `regexp` trong plugin.json.

---

## API Reference

### Network APIs

| API | Cloudflare | Trả về | Ghi chú |
|-----|-----------|--------|---------|
| `fetch(url)` | ✅ Bypass (share cookie WebView) | Response object | **Ưu tiên dùng** |
| `Http.get(url)` | ❌ Bị chặn | Response object | Chỉ dùng khi site không có CF |

```javascript
// ✅ ĐÚNG - dùng fetch() cho site có Cloudflare
var doc = fetch(url).html();
var resp = fetch(apiUrl);
var json = resp.json();
var text = resp.text();

// ❌ SAI - Http.get() bị Cloudflare chặn
var doc = Http.get(url).html();  // → trả về trang challenge CF
```

### Response object methods

```javascript
var resp = fetch(url);
resp.ok          // boolean - status 200-299?
resp.html()      // Document - JSoup Document object
resp.text()      // string - raw text
resp.json()      // object - parsed JSON
resp.string()    // string - alias of text()
```

### Response.success()

```javascript
Response.success(data)           // Trả kết quả thành công
Response.success(data, data2)    // data2 = next page cho gen.js
```

### Document/Element API (JSoup-style)

```javascript
doc.select('css-selector')       // Elements collection
elements.first()                 // Element hoặc null
elements.last()                  // Element hoặc null
elements.size()                  // int - số lượng
elements.get(index)              // Element tại index
elements.forEach(function(e){})  // Iterate

element.text()                   // string - text content
element.html()                   // string - inner HTML
element.attr('href')             // string - attribute value
element.select('sub-selector')   // Elements - tìm con
```

---

## Cloudflare & Network

### Vấn đề

Nhiều trang manga sử dụng Cloudflare Protection. Khi đó:
- `Http.get()` → bị chặn, trả về trang challenge HTML
- `fetch()` → bypass được nhờ chia sẻ cookie từ WebView

### Giải pháp

**Luôn dùng `fetch()` thay vì `Http.get()`** cho các trang có Cloudflare:

```javascript
// Fetch HTML page
var doc = fetch(url).html();

// Fetch JSON API
var resp = fetch(apiUrl);
if (resp.ok) {
    var data = resp.json();
}

// Fetch raw text
var text = fetch(url).text();
```

### Kiểm tra Cloudflare

Dấu hiệu site dùng CF:
- `Http.get(url).string()` trả về HTML chứa "Cloudflare", "challenge", "cf-"
- Status code 403 hoặc 503
- Response chứa `<title>Just a moment...</title>`

---

## Lỗi thường gặp & Cách debug

### 1. "Error happen when add xxx to bookshelf"

**Nguyên nhân phổ biến nhất:** `regexp` trong plugin.json sai.

**Cách fix:**
1. Kiểm tra `regexp` phải match URL trang chi tiết truyện
2. Test: `new RegExp(regexp).test(mangaDetailUrl)` phải trả `true`
3. Tham khảo bảng regexp ở trên

**Cách debug:**
1. Hardcode detail.js trả static data → nếu vẫn lỗi → lỗi ở plugin.json
2. So sánh plugin.json với extension đang hoạt động (vd: foxtruyen)

### 2. "Loading Error" trên trang chi tiết

**Nguyên nhân:** `Http.get()` bị Cloudflare chặn.

**Cách fix:** Chuyển sang `fetch()`:
```javascript
// ❌
var doc = Http.get(url).html();
// ✅
var doc = fetch(url).html();
```

### 3. Trang chi tiết load được nhưng không hiện data

**Nguyên nhân:** CSS selector sai hoặc site dùng SPA (React/Vue).

**Cách fix:**
- Dùng CDP (Chrome DevTools Protocol) để inspect HTML thực tế
- Với SPA: tìm turbo-stream/JSON data trong HTML hoặc dùng API endpoint

### 4. Danh sách chương rỗng

**Nguyên nhân:** API trả JSON nhưng `fetch().json()` có thể trả Java type.

**Cách fix:**
```javascript
var resp = fetch(apiUrl);
if (resp.ok) {
    var list = resp.json();
    // Dùng list.length thay vì Array.isArray(list)
    if (list && list.length) {
        for (var i = 0; i < list.length; i++) { ... }
    }
}
```

---

## Phương pháp Debug (Isolation Testing)

Khi gặp lỗi không rõ nguyên nhân, sử dụng **isolation testing**:

### Bước 1: Hardcode detail.js
```javascript
function execute(url) {
    return Response.success({
        name: "Test", cover: "", author: "Test",
        description: "Test", detail: "Test",
        host: BASE_URL, ongoing: true
    });
}
```
- Nếu vẫn lỗi → **lỗi KHÔNG phải ở detail.js** → kiểm tra plugin.json
- Nếu hết lỗi → lỗi ở data/logic của detail.js

### Bước 2: Hardcode toc.js
```javascript
function execute(url) {
    return Response.success([{name: "Ch 1", url: BASE_URL + "/ch/1", host: BASE_URL}]);
}
```
- Nếu vẫn lỗi → lỗi ở plugin.json config

### Bước 3: So sánh plugin.json
So sánh từng field với extension đang hoạt động. Chú ý đặc biệt:
- `regexp` — phải match URL chi tiết truyện
- `type`, `locale`, `language` — phải có đầy đủ

### Bước 4: CDP Testing
Dùng Chrome DevTools Protocol để test trực tiếp trong browser:
```bash
# Mở Chrome với remote debugging
chrome --remote-debugging-port=9222

# Chạy test script
node cdp_test.js
```

---

## Checklist trước khi publish

- [ ] `plugin.json` có đầy đủ: name, author, version, source, regexp, type, locale, language
- [ ] `regexp` match URL trang chi tiết truyện (KHÔNG chỉ match domain)
- [ ] `detail.js` return null khi fail
- [ ] `detail.js` có trường `detail` trong Response.success
- [ ] `toc.js` return null khi không có chapter
- [ ] Dùng `fetch()` thay `Http.get()` cho site có Cloudflare
- [ ] `gen.js` trả `link` URL match với `regexp`
- [ ] Test Add Bookshelf trước khi publish
- [ ] Version number tăng lên
- [ ] `plugin.zip` đã rebuild
- [ ] Root `plugin.json` đã update version

---

## Registry (plugin.json gốc)

File `plugin.json` ở root repo là registry cho vBook app. Format:

```json
{
  "metadata": {
    "author": "tên",
    "description": "mô tả"
  },
  "data": [
    {
      "name": "Tên Extension",
      "author": "tên",
      "path": "https://raw.githubusercontent.com/.../plugin.zip",
      "version": 1,
      "source": "https://example.com",
      "icon": "https://raw.githubusercontent.com/.../icon.png",
      "description": "Mô tả",
      "type": "comic",
      "locale": "vi_VN"
    }
  ]
}
```

**Lưu ý:** GitHub raw CDN cache 5-10 phút. Sau khi push, cần đợi cache expire hoặc dùng jsdelivr purge.

---

## Build & Deploy

```bash
# Build plugin.zip
python make_zip.py extension-name extension-name/plugin.zip

# Verify zip contents
python -c "import zipfile; z=zipfile.ZipFile('extension/plugin.zip'); print(z.namelist())"

# Push to GitHub
git add extension/ plugin.json
git commit -m "Extension vN: description"
git push
```
