# =============================================================
#  VBook Extension Creator
#  Tao extension moi tu template chi voi vai buoc nhap thong tin.
#
#  Chay: .\create_extension.ps1
#  Hoac double-click file TaoExtension.bat tren Desktop.
# =============================================================

$ErrorActionPreference = "Stop"
$repoRoot = $PSScriptRoot

# ---------- Header ----------
Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  VBook Extension Creator - Tao Extension Tu Template" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# ---------- 1. Nhap thong tin co ban ----------
$extName = Read-Host "Ten extension (vd: nettruyen, truyenqq)"
$extName = $extName.Trim().ToLower() -replace '[^a-z0-9]',''
if ([string]::IsNullOrWhiteSpace($extName)) {
    Write-Host "Ten extension khong duoc de trong!" -ForegroundColor Red
    exit 1
}

$extDir = Join-Path $repoRoot $extName
if (Test-Path $extDir) {
    Write-Host "Thu muc '$extName' da ton tai!" -ForegroundColor Red
    $overwrite = Read-Host "Ghi de? (y/N)"
    if ($overwrite -ne 'y') { exit 0 }
    Remove-Item $extDir -Recurse -Force
}

$displayName = Read-Host "Ten hien thi (vd: NetTruyen, FoxTruyen)"
$domain = Read-Host "Domain trang web (vd: nettruyen9s.com)"
$domain = $domain.Trim() -replace '^https?://','' -replace '/$',''

$description = Read-Host "Mo ta ngan (vd: Doc truyen tranh tren NetTruyen)"
if ([string]::IsNullOrWhiteSpace($description)) {
    $description = "Doc truyen tren $displayName"
}

# ---------- 2. Copy template ----------
Write-Host ""
Write-Host "[1/6] Copy template..." -ForegroundColor Cyan
$templateDir = Join-Path $repoRoot "_template"
if (-not (Test-Path $templateDir)) {
    Write-Host "Khong tim thay thu muc _template!" -ForegroundColor Red
    exit 1
}
Copy-Item $templateDir $extDir -Recurse
# Xoa README.md cua template (khong can trong extension thuc)
$readmePath = Join-Path $extDir "README.md"
if (Test-Path $readmePath) { Remove-Item $readmePath }
Write-Host "  OK - da copy _template -> $extName" -ForegroundColor Green

# ---------- 3. Cap nhat config.js ----------
Write-Host "[2/6] Cap nhat config.js..." -ForegroundColor Cyan
$configFile = Join-Path $extDir "src\config.js"
$configContent = Get-Content $configFile -Raw
$configContent = $configContent -replace 'https://TODO_DOMAIN\.com', "https://$domain"
Set-Content $configFile -Value $configContent -NoNewline -Encoding UTF8
Write-Host "  OK - BASE_URL = https://$domain" -ForegroundColor Green

# ---------- 4. Cap nhat plugin.json ----------
Write-Host "[3/6] Cap nhat plugin.json..." -ForegroundColor Cyan
$extPluginFile = Join-Path $extDir "plugin.json"

# Tao regexp tu domain: vd nettruyen9s.com -> nettruyen.*?\.com
$domainBase = ($domain -split '\.')[0]  # nettruyen9s -> nettruyen9s
$domainBase = $domainBase -replace '[0-9]+$',''  # nettruyen9s -> nettruyen
$regexp = "$domainBase.*?\\\.com/.*"

$extPluginContent = @"
{
  "metadata": {
    "name": "$displayName",
    "author": "phusi319",
    "version": 1,
    "source": "https://$domain",
    "regexp": "$regexp",
    "description": "$description",
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
"@
Set-Content $extPluginFile -Value $extPluginContent -Encoding UTF8
Write-Host "  OK - name=$displayName, regexp=$regexp" -ForegroundColor Green

# ---------- 5. Tai icon (thu tu dong) ----------
Write-Host "[4/6] Thu tai icon tu trang web..." -ForegroundColor Cyan
$iconDest = Join-Path $extDir "icon.png"
$iconUrls = @(
    "https://$domain/favicon.ico",
    "https://$domain/favicon.png",
    "https://$domain/uploads/images/favicon-$domainBase.png"
)
$iconFound = $false
foreach ($iconUrl in $iconUrls) {
    try {
        Write-Host "  Thu: $iconUrl" -ForegroundColor Gray
        python -c "
import urllib.request
req = urllib.request.Request('$iconUrl', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=5) as r:
    data = r.read()
    if len(data) > 100:
        with open(r'$iconDest', 'wb') as f:
            f.write(data)
        print('OK:' + str(len(data)))
    else:
        print('TOO_SMALL')
" 2>$null
        if ((Test-Path $iconDest) -and (Get-Item $iconDest).Length -gt 100) {
            $iconSize = (Get-Item $iconDest).Length
            Write-Host "  OK - icon.png ($iconSize bytes)" -ForegroundColor Green
            $iconFound = $true
            break
        }
    } catch {}
}
if (-not $iconFound) {
    Write-Host "  Khong tai duoc icon tu dong. Hay them icon.png thu cong vao $extName\" -ForegroundColor Yellow
}

# ---------- 6. Build zip ----------
Write-Host "[5/6] Build plugin.zip..." -ForegroundColor Cyan
$makeZip = Join-Path $repoRoot "make_zip.py"
$zipOutput = Join-Path $extDir "plugin.zip"
Push-Location $repoRoot
python $makeZip $extName $zipOutput
Pop-Location

if (Test-Path $zipOutput) {
    $zipSize = (Get-Item $zipOutput).Length
    Write-Host "  OK - plugin.zip ($zipSize bytes)" -ForegroundColor Green
} else {
    Write-Host "  LOI - Khong tao duoc plugin.zip!" -ForegroundColor Red
}

# ---------- 7. Dang ky vao root plugin.json ----------
Write-Host "[6/6] Dang ky vao root plugin.json..." -ForegroundColor Cyan
$rootPluginFile = Join-Path $repoRoot "plugin.json"
$rootContent = Get-Content $rootPluginFile -Raw

# Tao entry moi
$newEntry = @"
,
    {
      "name": "$displayName",
      "author": "phusi319",
      "path": "https://raw.githubusercontent.com/phusi319/vbook-extensions/main/$extName/plugin.zip?v=1",
      "version": 1,
      "source": "https://$domain",
      "icon": "https://raw.githubusercontent.com/phusi319/vbook-extensions/main/$extName/icon.png",
      "description": "$description",
      "type": "comic",
      "locale": "vi_VN"
    }
"@

# Chen truoc `]` cuoi cung
$rootContent = $rootContent -replace '(\s*}\s*)\n(\s*\]\s*)', "`$1$newEntry`n`$2"
# Fallback: replace the last } before ]
if ($rootContent -notmatch [regex]::Escape($displayName)) {
    $rootContent = $rootContent -replace '(\}\s*)\]', "`$1$newEntry`n  ]"
}
Set-Content $rootPluginFile -Value $rootContent -NoNewline -Encoding UTF8
Write-Host "  OK - da them $displayName vao plugin.json" -ForegroundColor Green

# ---------- Hoan tat ----------
Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  HOAN TAT TAO EXTENSION: $displayName" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Cau truc thu muc:" -ForegroundColor White
Write-Host "  $extName/" -ForegroundColor Yellow
Write-Host "  +-- plugin.json" -ForegroundColor Gray
Write-Host "  +-- plugin.zip" -ForegroundColor Gray
if ($iconFound) {
Write-Host "  +-- icon.png" -ForegroundColor Gray
}
Write-Host "  +-- src/" -ForegroundColor Gray
Write-Host "      +-- config.js    <- BASE_URL da set" -ForegroundColor Gray
Write-Host "      +-- home.js      <- TODO: doi category" -ForegroundColor Gray
Write-Host "      +-- genre.js     <- TODO: doi selector" -ForegroundColor Gray
Write-Host "      +-- gen.js       <- TODO: doi selector" -ForegroundColor Gray
Write-Host "      +-- search.js    <- TODO: doi selector" -ForegroundColor Gray
Write-Host "      +-- detail.js    <- TODO: doi selector" -ForegroundColor Gray
Write-Host "      +-- toc.js       <- TODO: doi selector" -ForegroundColor Gray
Write-Host "      +-- chap.js      <- TODO: doi selector" -ForegroundColor Gray
Write-Host ""
Write-Host "BUOC TIEP THEO:" -ForegroundColor Yellow
Write-Host "  1. Mo trang web https://$domain -> F12 -> tim CSS selectors" -ForegroundColor White
Write-Host "  2. Sua cac file TODO trong $extName\src\" -ForegroundColor White
Write-Host "  3. Chay: python make_zip.py $extName $extName/plugin.zip" -ForegroundColor White
Write-Host "  4. Chay: git add $extName/ plugin.json && git commit && git push" -ForegroundColor White
Write-Host ""
Write-Host "Hoac nho AI (Antigravity) sua selector giup ban!" -ForegroundColor Cyan
Write-Host ""
