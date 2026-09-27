# VBook Extension — Agent Workflow
# =================================
# Tài liệu này là hướng dẫn step-by-step HOÀN CHỈNH để tạo 1 VBook extension
# cho bất kỳ trang truyện nào. Agent chỉ cần follow từ đầu đến cuối.
#
# REPO ROOT: C:\Users\sion\Documents\antigravity\elegant-pascal
# TEMPLATE:  _template/

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 0: HIỂU CẤU TRÚC
# ═══════════════════════════════════════════════════════════════════════════════

## Cấu trúc thư mục chuẩn (BẮT BUỘC)

```
<tên_extension>/
├── icon.png              # Icon 96x96 (tải từ favicon/logo của trang)
├── plugin.json           # Metadata extension
├── plugin.zip            # Output build (tạo bởi make_zip.py)
└── src/
    ├── config.js         # BASE_URL + helper functions
    ├── home.js           # Menu categories trang chủ
    ├── genre.js          # Danh sách thể loại
    ├── gen.js            # Listing truyện + phân trang
    ├── search.js         # Tìm kiếm truyện
    ├── detail.js         # Chi tiết truyện
    ├── toc.js            # Danh sách chương
    └── chap.js           # Ảnh chương
```

## Ràng buộc kỹ thuật (PHẢI NHỚ)

| Rule | Mô tả |
|------|--------|
| JS Engine | Rhino (Java) — KHÔNG phải V8/Chrome |
| Biến | Dùng `var` — KHÔNG `const`, `let` |
| Hàm | Dùng `function(){}` — KHÔNG arrow `=>` |
| DOM | JSoup wrapper: `doc.select()`, `.first()`, `.size()`, `.get(i)`, `.text()`, `.attr()` |
| Traversal | KHÔNG `nextElementSibling()`, `previousElementSibling()` |
| HTTP | `Http.get(url).html()` hoặc `fetch(url).html()` |
| Browser | `Engine.newBrowser().launch(url, timeout)` cho Cloudflare bypass |
| Return | `Response.success(data)` hoặc `Response.success(data, nextPage)` |
| Encoding | KHÔNG so sánh chuỗi UTF-8 cứng. Dùng CSS selector hoặc `.indexOf()` |
| Chapters | toc.js phải trả chương CŨ NHẤT ĐẦU TIÊN (duyệt ngược) |
| Host | Mọi item trả về phải có `host: BASE_URL` |
| ZIP | Dùng Python `make_zip.py` — KHÔNG PowerShell `Compress-Archive` |
| plugin.json script | PHẢI có đủ 6 key: home, genre, detail, search, toc, chap |

## Các API có sẵn trong runtime

```javascript
// HTTP
Http.get(url).html()           // → JSoup Document
Http.get(url).string()         // → string
fetch(url).html()              // → JSoup Document
fetch(url).json()              // → object
fetch(url, {method: "POST", headers: {...}, body: "..."})

// Browser (Cloudflare bypass)
var browser = Engine.newBrowser();
var doc = browser.launch(url, 5000);  // timeout ms
browser.close();

// JSoup DOM
doc.select("css selector")    // → Elements list
els.first()                   // → Element hoặc null
els.last()                    // → Element hoặc null
els.size()                    // → number
els.get(i)                    // → Element tại index i
el.text()                     // → inner text
el.html()                     // → inner HTML
el.attr("href")               // → attribute value
el.select("sub-selector")     // → child Elements

// Response
Response.success(data)                  // 1 tham số
Response.success(data, nextPage)        // 2 tham số (cho gen.js, search.js)

// Other
load('config.js')             // Load file JS khác
encodeURIComponent(str)       // Encode URL param
JSON.parse(str)               // Parse JSON
JSON.stringify(obj)           // Stringify JSON
```

## Return format cho từng file

```
home.js   → Response.success([{title, input, script: "gen.js"}])
genre.js  → Response.success([{title, input, script: "gen.js"}])
gen.js    → Response.success([{name, link, cover, description, host}], nextPage)
search.js → Response.success([{name, link, cover, description, host}], nextPage)
detail.js → Response.success({name, cover, host, author, description, detail, ongoing, genres})
            genres = [{title, input, script: "gen.js"}]
toc.js    → Response.success([{name, url, host}])
chap.js   → Response.success([{link, fallback: [url]}])
```


# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 1: KHẢO SÁT TRANG WEB
# ═══════════════════════════════════════════════════════════════════════════════

## Bước 1.1 — Tải và phân tích trang chủ
- Dùng `read_url_content` để tải trang chủ
- Tìm: menu thể loại, danh sách truyện mới, URL pattern

## Bước 1.2 — Phân tích trang chi tiết truyện
- Tìm 1 link truyện từ trang chủ → tải trang đó
- Ghi chú CSS selector cho: tên truyện, ảnh bìa, tác giả, mô tả, trạng thái, thể loại
- Ghi chú URL pattern cho trang chi tiết (dùng cho `regexp` trong plugin.json)

## Bước 1.3 — Phân tích trang đọc chương
- Tìm 1 link chapter từ trang chi tiết → tải trang đó
- Ghi chú CSS selector cho ảnh: `img` nằm trong container nào
- Xác định thuộc tính ảnh: `src`, `data-src`, `data-original`, `data-cdn`?

## Bước 1.4 — Phân tích tìm kiếm
- Tìm URL search (thường là `/search?keyword=` hoặc `/tim-kiem?q=`)
- Kiểm tra HTML source cho `<form action=...>` hoặc schema.org `SearchAction`
- Ghi chú URL pattern tìm kiếm + selector kết quả (thường giống listing)

## Bước 1.5 — Phân tích phân trang
- Xem pagination element: `.pagination`, `.page-item`, `.paging`
- Xác định cách trang web đánh số trang: `?page=2`, `/trang-2`, `/2/`

## Output Phase 1:
Ghi lại thành bảng:
```
| Thành phần         | CSS Selector / URL Pattern                          |
|--------------------|-----------------------------------------------------|
| BASE_URL           | https://...                                         |
| regexp (detail)    | domain\.com/truyen/.*                               |
| Listing container  | .items .row .item                                   |
| Manga name         | figcaption h3 a                                     |
| Manga cover        | figure img [data-original]                          |
| Manga link         | figcaption h3 a [href]                              |
| Detail name        | h1.title-detail                                     |
| Detail cover       | .detail-info .col-image img                         |
| Detail author      | .list-info .author .col-xs-8                        |
| Detail status      | .list-info li.status .col-xs-8                      |
| Detail description | .detail-content p                                   |
| Detail genres      | .list-info li.kind .col-xs-8 a                      |
| Chapter list       | #nt_listchapter ul li .chapter a                    |
| Chapter images     | .reading-detail .page-chapter img [data-original]   |
| Genre menu         | .megamenu .nav a[href*=/the-loai/]                  |
| Search URL         | /search?keyword={key}&page={page}                   |
| Pagination         | .pagination li.active → next sibling text match     |
| Cloudflare?        | Có / Không                                          |
```


# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 2: TẠO EXTENSION
# ═══════════════════════════════════════════════════════════════════════════════

## Bước 2.1 — Copy template
Từ repo root, copy thư mục `_template` thành tên extension mới:
```powershell
Copy-Item -Recurse _template <tên_extension>
```

## Bước 2.2 — Sửa config.js
- Đổi `BASE_URL` thành domain thực
- Quyết định dùng `fetchHtml()` (có Cloudflare) hay `fetch(url).html()` (không CF)

## Bước 2.3 — Sửa plugin.json
- Đổi `name`, `source`, `regexp`, `description`
- `version` bắt đầu từ `1`

## Bước 2.4 — Sửa home.js
- Liệt kê các tab/category cần hiển thị
- Mỗi item: `{title: "Tên tab", input: "/path", script: "gen.js"}`

## Bước 2.5 — Sửa genre.js
- Đổi selector parse thể loại từ trang web
- Hoặc hardcode danh sách nếu ít thay đổi

## Bước 2.6 — Sửa gen.js
- Đổi selector cho: container, name, cover, link, description
- Đổi logic pagination cho phù hợp
- Đổi cách ghép page number vào URL

## Bước 2.7 — Sửa search.js
- Đổi URL tìm kiếm
- Selector thường giống gen.js (copy)
- Đổi pagination nếu khác

## Bước 2.8 — Sửa detail.js
- Đổi selector cho: name, cover, author, description, status, genres, detail info
- Giữ nguyên URL normalization block
- Giữ nguyên error handling

## Bước 2.9 — Sửa toc.js
- Đổi selector lấy link chương
- ⚠️ ĐẢM BẢO duyệt ngược (chương cũ nhất đầu tiên)

## Bước 2.10 — Sửa chap.js
- Đổi selector lấy ảnh
- Đổi thứ tự ưu tiên thuộc tính (data-original / data-src / src)
- Thêm filter loại bỏ ảnh rác nếu cần

## Bước 2.11 — Tải icon
- Tìm favicon/logo từ trang web
- Tải về bằng Python urllib hoặc curl
- Lưu thành `<tên_extension>/icon.png`
- Nên dùng ảnh vuông, ≥ 96x96 pixels

```python
# Script mẫu tải icon
import urllib.request
url = "https://domain.com/favicon.png"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=10) as r:
    with open('icon.png', 'wb') as f:
        f.write(r.read())
```


# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 3: BUILD & ĐĂNG KÝ
# ═══════════════════════════════════════════════════════════════════════════════

## Bước 3.1 — Build ZIP
```powershell
# Từ repo root
python make_zip.py <tên_extension> <tên_extension>/plugin.zip
```
⚠️ KHÔNG dùng PowerShell Compress-Archive

## Bước 3.2 — Kiểm tra ZIP
```powershell
python -c "import zipfile; print(zipfile.ZipFile('<tên>/plugin.zip').namelist())"
```
Output phải có: `['plugin.json', 'icon.png', 'src/chap.js', 'src/config.js', ...]`

## Bước 3.3 — Đăng ký vào root plugin.json
Thêm entry mới vào mảng `data` trong file `plugin.json` ở repo root:
```json
{
  "name": "Tên Extension",
  "author": "phusi319",
  "path": "https://raw.githubusercontent.com/phusi319/vbook-extensions/main/<tên>/plugin.zip?v=1",
  "version": 1,
  "source": "https://domain.com",
  "icon": "https://raw.githubusercontent.com/phusi319/vbook-extensions/main/<tên>/icon.png",
  "description": "Đọc truyện tranh trên Tên Extension",
  "type": "comic",
  "locale": "vi_VN"
}
```

## Bước 3.4 — Git commit & push
```powershell
git add <tên_extension>/ plugin.json
git commit -m "feat: add <Tên Extension> extension"
git push origin main
```


# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 4: KIỂM TRA & SỬA LỖI (nếu user báo lỗi)
# ═══════════════════════════════════════════════════════════════════════════════

## Lỗi thường gặp & cách sửa

| Triệu chứng | Nguyên nhân | Cách sửa |
|--------------|-------------|----------|
| VBook treo khi cài extension | ZIP tạo bởi PowerShell | Build lại bằng `python make_zip.py` |
| Extension không hiện | Thiếu key trong plugin.json script block | Đảm bảo đủ 6 key: home, genre, detail, search, toc, chap |
| SyntaxError khi load | Dùng `const`, `let`, arrow function | Đổi thành `var`, `function(){}` |
| TypeError: Cannot find function | Dùng `nextElementSibling()` | Dùng vòng lặp + text match thay thế |
| Không tải được trang (Cloudflare) | Cần browser fallback | Thêm `fetchHtml()` với `Engine.newBrowser()` |
| Ảnh không hiển thị | Sai attribute (src thay vì data-original) | Kiểm tra lazy-load attributes |
| Chương sắp xếp sai | Không đảo ngược trong toc.js | Duyệt ngược: `for (i = size-1; i >= 0; i--)` |
| Thiếu host | Không có `host: BASE_URL` trong item | Thêm `host: BASE_URL` vào mọi object trả về |

## Quy trình cập nhật domain (khi trang đổi tên miền)

1. Sửa `BASE_URL` trong `src/config.js`
2. Sửa `source` + tăng `version` trong `<tên>/plugin.json`
3. Sửa `source` + `version` + `path?v=` trong root `plugin.json`
4. Build lại ZIP: `python make_zip.py <tên> <tên>/plugin.zip`
5. Git commit + push

Hoặc nếu đã có script tự động (như `update_nettruyen.ps1`), chạy script đó.


# ═══════════════════════════════════════════════════════════════════════════════
# CHECKLIST CUỐI CÙNG
# ═══════════════════════════════════════════════════════════════════════════════

Trước khi push, kiểm tra:

- [ ] `var` everywhere (không const/let)
- [ ] `function(){}` everywhere (không arrow)
- [ ] `load('config.js')` ở đầu mọi file (trừ home.js nếu không cần BASE_URL)
- [ ] `host: BASE_URL` trong mọi item trả về (gen, search, detail, toc)
- [ ] toc.js trả chương cũ nhất đầu tiên
- [ ] plugin.json có đủ 6 script keys
- [ ] plugin.json version là số nguyên (1, 2, 3...) không phải semver
- [ ] ZIP build bằng Python
- [ ] root plugin.json đã đăng ký entry mới
- [ ] icon.png có trong thư mục extension
- [ ] root plugin.json version + path?v= khớp với extension plugin.json version
