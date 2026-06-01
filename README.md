# VBook Extensions

Extension đọc truyện tranh cho ứng dụng vBook.

## Extensions

| Extension | Nguồn | Loại |
|---|---|---|
| FoxTruyen | [foxtruyen2.com](https://foxtruyen2.com) | Comic (Manga/Manhwa/Manhua) |

## Cài đặt

1. Mở vBook → **Cài đặt** → **Extension** → **Thêm nguồn**
2. Dán URL: `https://raw.githubusercontent.com/phusi319/vbook-extensions/main/plugin.json`
3. Chọn extension muốn cài

## Cấu trúc

```
├── plugin.json              # Registry (danh sách extensions)
└── foxtruyen/               # Extension FoxTruyen
    ├── plugin.json           # Metadata
    └── src/                  # Script files
```
