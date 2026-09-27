import zipfile
import os
import sys

"""
VBook Extension ZIP Builder
============================
Tạo file plugin.zip tương thích với VBook (Android Java ZipInputStream).

Cách dùng:
    python make_zip.py <thư_mục_extension> <output_zip>

Ví dụ:
    python make_zip.py nettruyen nettruyen/plugin.zip
    python make_zip.py foxtruyen foxtruyen/plugin.zip

⚠️ KHÔNG dùng PowerShell Compress-Archive — tạo ZIP không tương thích,
   khiến VBook treo khi cài extension!

Thứ tự entry trong ZIP (bắt buộc):
    1. plugin.json
    2. icon.png (nếu có)
    3. src/*.js (sorted alphabetically)
"""

def make_plugin_zip(ext_dir, output_zip):
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
        # 1. plugin.json (bắt buộc)
        zf.write(os.path.join(ext_dir, 'plugin.json'), 'plugin.json')

        # 2. icon.png (tùy chọn)
        icon = os.path.join(ext_dir, 'icon.png')
        if os.path.exists(icon):
            zf.write(icon, 'icon.png')

        # 3. src/*.js (bắt buộc, sorted)
        src_dir = os.path.join(ext_dir, 'src')
        for f in sorted(os.listdir(src_dir)):
            zf.write(os.path.join(src_dir, f), 'src/' + f)

    # Hiển thị kết quả
    size = os.path.getsize(output_zip)
    with zipfile.ZipFile(output_zip, 'r') as zf:
        entries = zf.namelist()
    print(f"Created {output_zip} ({size} bytes)")
    print(f"Entries: {entries}")

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python make_zip.py <extension_dir> <output_zip>")
        print("Example: python make_zip.py nettruyen nettruyen/plugin.zip")
        sys.exit(1)
    make_plugin_zip(sys.argv[1], sys.argv[2])
