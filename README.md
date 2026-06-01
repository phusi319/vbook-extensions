# VBook Extension - FoxTruyen

Extension đọc truyện tranh từ [FoxTruyen](https://foxtruyen2.com) cho ứng dụng vBook.

## Cấu trúc

```
foxtruyen/
├── icon.png          # Icon (cần tạo/thêm)
├── plugin.json       # Metadata extension
├── plugin.zip        # File đóng gói (tạo bởi ExtensionMaker.jar)
└── src/
    ├── config.js     # Cấu hình BASE_URL
    ├── home.js       # Trang khám phá (7 tabs)
    ├── hot.js        # Danh sách truyện hot
    ├── list.js       # Parser danh sách chung (có phân trang)
    ├── search.js     # Tìm kiếm truyện
    ├── detail.js     # Thông tin chi tiết truyện
    ├── toc.js        # Mục lục chương
    ├── chap.js       # Nội dung chương (ảnh manga)
    ├── genre.js      # Danh sách thể loại
    └── gen.js        # Duyệt truyện theo thể loại
```

## Tính năng

- ✅ **Khám phá**: Hot, Mới Cập Nhật, Truyện Mới, Top Ngày/Tuần/Tháng, Truyện Full
- ✅ **Tìm kiếm**: Hỗ trợ phân trang
- ✅ **Chi tiết truyện**: Tên, ảnh bìa, tác giả, trạng thái, mô tả, thể loại
- ✅ **Mục lục**: Danh sách tất cả chương
- ✅ **Đọc chương**: Hiển thị ảnh manga (comic reader)
- ✅ **Thể loại**: Duyệt theo 40+ thể loại

## Cách sử dụng

### Cách 1: Dùng ExtensionMaker.jar (Khuyến nghị)

1. Clone repo `Darkrai9x/vbook-extensions`
2. Copy thư mục `foxtruyen` vào repo
3. Chạy `run.bat` (Windows) hoặc `run.sh` (macOS)
4. Tool sẽ tạo file `plugin.zip` trong thư mục `foxtruyen`
5. Upload lên GitHub và cập nhật `plugin.json` registry

### Cách 2: Tự đóng gói

1. Zip toàn bộ nội dung thư mục `foxtruyen` (bao gồm `plugin.json`, `icon.png`, thư mục `src`)
2. Đổi tên thành `plugin.zip`
3. Upload lên GitHub

### Cách 3: Test trực tiếp

Sử dụng API endpoint `POST /extension/test` của vBook để test từng script mà không cần cài đặt.

## Thêm vào vBook

1. Host file lên GitHub
2. Tạo `plugin.json` registry (xem file `plugin.json` ở root)
3. Trong vBook, vào **Cài đặt > Extension > Thêm nguồn**
4. Dán URL của `plugin.json` registry

## Lưu ý

- Cần thêm file `icon.png` (kích thước khuyến nghị: 96x96 hoặc 128x128)
- Thay `<YOUR_USERNAME>` trong `plugin.json` registry bằng username GitHub của bạn
- Extension hiện hỗ trợ **truyện tranh (comic)** — nếu FoxTruyen có truyện chữ, cần thêm xử lý riêng trong `chap.js`
