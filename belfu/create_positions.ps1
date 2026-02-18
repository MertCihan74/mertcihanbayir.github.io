$path1 = "C:/Users/ASUS/.gemini/antigravity/brain/0287530b-0eca-43e0-b507-9f699963df88/300_positions_part1.js"
$path2 = "C:/Users/ASUS/.gemini/antigravity/brain/0287530b-0eca-43e0-b507-9f699963df88/300_positions_part2.js"
$dest = "c:/Users/ASUS/Desktop/website/mertcihanbayir.github.io/belfu/positions_data.js"

if (!(Test-Path $path1) -or !(Test-Path $path2)) {
    Write-Error "Source files not found."
    exit 1
}

$t1 = Get-Content $path1 -Raw
$t2 = Get-Content $path2 -Raw

# Remove wrappers (regex for [ ... ])
$t1 = $t1 -replace 'const POSITIONS_1_150 = \[\s*', '' -replace '\s*\];\s*$', ''
$t2 = $t2 -replace 'const POSITIONS_151_300 = \[\s*', '' -replace '\s*\];\s*$', ''

$final = "window.LOCAL_POSITIONS = [" + $t1 + "," + $t2 + "];"
$final | Set-Content $dest -Encoding UTF8
Write-Host "Positions data created successfully at $dest"
