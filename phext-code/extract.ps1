# phextv1.file: extract.ps1
# Copyright: (c) 2024 Will Bickford
# License: MIT
# Purpose: extracts scripts from phext research documents
param(
  [string] $file,
  [switch] $force
)
if (-not (Test-Path $file)) {
    Write-Error "Unable to locate $file."
    exit(1)
}
$SCROLL_BREAK = [char]0x17
$scrolls = (Get-Content -raw $file) -split $SCROLL_BREAK
if ($scrolls.Count -ne 3) {
  Write-Error "Invalid phext research file"
  exit 1
}
$scroll1 = $scrolls[1] -split '\n'
$lines = $scroll1.Count
Write-Host "Scanning $lines for code..."

if ($lines -gt 1000000) {
  Write-Error "refusing to parse your spew"
  exit 1
}

$parsing = $false
$script = ""
$output = @{}
foreach ($line in $scroll1) {
  if ($line -match "^phextv1.code$") {
    $parsing = $true
  }
  if ($line -match "^phextv1.results$") {
    $parsing = $false
  }

  if ($line -match "^# phextv1.file: ") {
    $script = $line -replace "^# phextv1\.file: ",""    
    $output[$script] = @()    
    continue
  }

  if ($parsing) {
    $output[$script] += $line
    continue
  }
}

if ($output.Keys.Count -gt 0) {
  foreach ($script in $output.Keys|Sort-Object) {    
    $data = $output[$script]
    if ($force -or (-not (Test-Path $script))) {
      $data |Out-File -Encoding utf8 $script
      Write-Host "Wrote $($data.Count) lines to $script."
    } else {
      if (-not $force) {
        Write-Host "Warning: $script already exists. Use -force to overwrite."
      }
    }
  }
}