$path = "c:/Users/ASUS/Desktop/website/mertcihanbayir.github.io/belfu/secret.html"
$lines = Get-Content $path

# 1. Insert script tag after firebase-config.js
$insertIdx = -1
for ($i=0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "firebase-config.js") { $insertIdx = $i; break }
}

if ($insertIdx -ge 0) {
    # arrays are 0-based. insert after index i means sliced 0..i + new + i+1..end
    $lines = $lines[0..$insertIdx] + '    <script src="positions_data.js"></script>' + $lines[($insertIdx+1)..($lines.Count-1)]
    Write-Host "Inserted script tag at line $($insertIdx+2)"
}

# 2. Remove LOCAL_POSITIONS block
$startIdx = -1
$endIdx = -1

for ($i=0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "const LOCAL_POSITIONS = \[") { $startIdx = $i; break }
}

if ($startIdx -ge 0) {
    for ($i=$startIdx; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match "^\];") { $endIdx = $i; break }
    }
}

if ($startIdx -ge 0 -and $endIdx -gt $startIdx) {
    # Keep lines before start and after end
    # startIdx-1 is the last line to keep before block
    # endIdx+1 is the first line to keep after block
    $lines = $lines[0..($startIdx-1)] + $lines[($endIdx+1)..($lines.Count-1)]
    $lines | Set-Content $path -Encoding UTF8
    Write-Host "Removed LOCAL_POSITIONS block (lines $($startIdx+1) to $($endIdx+1))"
} else {
    Write-Warning "Could not find LOCAL_POSITIONS block to remove."
}
