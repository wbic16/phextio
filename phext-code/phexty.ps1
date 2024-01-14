# phextv1.file: phexty.ps1
# ----------
# Copyright: (c) 2024 Will Bickford
# License: MIT
# Purpose: assists with calculating phext research addresses
#
# the phext address space for research is rooted at library=1, shelf=1, and series=1 (1.1.1/yyy.xxx).
#
# Dimensions: 1.1.1/A.B.C/D.E.F
#   A: phext-soundex(title)
#   B: phext-soundex(abstract)
#   C: phext-soundex(methods)
#   D: phext-soundex(code)
#   E: phext-soundex(results)
#   F: phext-soundex(resources)

param(
  [string] $file,
  [switch] $verbose
)
$raap = "1.1.2" # reserved by @wbic16
$SCROLL_BREAK = [char]0x17

if (-not (Test-Path $file)) {
    Write-Error "Unable to locate $file."
    exit(1)
}

# inspired by https://sites.rootsweb.com/~nedodge/transfer/soundexlist.htm
function soundex($byte, $lookup, $increment) {
  for ($i = 0; $i -lt $lookup.Length; ++$i)
  {
    if ($byte -eq $lookup[$i]) { return $increment }
  }
  return 0
}

# computes a phext sub-coordinate (recursive soundex modulo 100)
function phexty-soundex-v1($text) {
  if (-not $text) { return 1 }

  $trim = $text.trim()
  $max = $trim.Length
  if ($max -eq 0) { return 1 }

  $lower = $trim.ToLower()
  $value = 0
  $letter1 = "bpfv"
  $letter2 = "cskgjqxz"
  $letter3 = "dt"
  $letter4 = "l"
  $letter5 = "mn"
  $letter6 = "r"
  for ($i = 0; $i -lt $max; ++$i) {
    $byte = $lower[$i]
    $value += soundex $byte $letter1 1
    $value += soundex $byte $letter2 2
    $value += soundex $byte $letter3 3
    $value += soundex $byte $letter4 4
    $value += soundex $byte $letter5 5
    $value += soundex $byte $letter6 6
  }
  $value = $value % 100
  return $value
}

$scrolls = (Get-Content -raw $file) -split $SCROLL_BREAK
$scroll_count = $scrolls.Count

if ($scroll_count -ne 3) {
    Write-Error "Invalid phext research stream - you must provide exactly 3 scrolls (found: $($scroll.Count))."
    exit 1;
}

# ------------------------------------------------------------------------------------------------------------

Write-Host "input: $file"
Write-Host "scrolls: $scroll_count"

$have_title = $false
$have_abstract = $false
$have_methods = $false
$have_code = $false
$have_results = $false
$have_resources = $false

# ------------------------------------------------------------------------------------------------------------

$title = ""
$abstract = @()
$methods = @()

$parsing_abstract = 0
$parsing_intro = 0
$parsing_methods = 0
$BLOB_HEADER = "^----"

$scroll0 = $scrolls[0] -split '\n'

foreach ($line in $scroll0) {
  $trim = $line.trim()
  if ($trim.Length -eq 0) { continue }

  # parse title
  if (-not $have_title -and $line -match "^phextv1\.title:") {
    $have_title = $true
    $title = $line -replace "^.*title:","" -split '\n'
    $title = $title[0]
    continue
  }

  # parse abstract
  if (-not $have_abstract) {
    if ($line -match "^phextv1\.abstract") {
      $parsing_abstract = 1
      continue
    }
    if ($line -match $BLOB_HEADER) {
      $parsing_abstract = 2
      continue
    }

    if ($line -match "^phextv1\.intro") {
        $have_abstract = $true
        $parsing_intro = 1
        continue
    }

    if ($parsing_abstract -eq 2) {
        $abstract += $line
        continue
    }
  }

  # parse methods
  if (-not $have_methods) {
    if ($line -match "^phextv1\.methods") {
        $parsing_methods = 1
        continue
    }
    if ($line -match $BLOB_HEADER) {
      $parsing_methods = 2
      continue
    }

    if ($parsing_methods -eq 2) {
        $methods += $line
        continue
    }
  }
}
$have_methods = $methods.Count -gt 0

# ------------------------------------------------------------------------------------------------------------
$parsing_code = 0
$parsing_results = 0
$parsing_resources = 0

$code = @()
$results = @()
$resources = @()

$scroll1 = $scrolls[1] -split '\n'
foreach ($line in $scroll1) {
  $trim = $line.trim()
  if ($trim.Length -eq 0) { continue }

  if (-not $have_code) {
    if ($line -match "^phextv1\.code") {
      $parsing_code = 1
      continue
    }

    if ($parsing_code -eq 1 -and $line -match $BLOB_HEADER) {
      $parsing_code = 2
      continue
    }

    if ($line -match "^phextv1\.results$") {
      $have_code = $true
      $parsing_results = 1
      continue
    }

    if ($parsing_code -eq 2) {
      $code += $line
      continue
    }
  }

  if (-not $have_results) {
    if ($parsing_results -and $line -match $BLOB_HEADER) {
      $parsing_results = 2
      continue
    }

    if ($line -match "^phextv1\.resources$") {
      $have_results = $true
      $parsing_resources = 1
      continue
    }

    if ($parsing_results -eq 2) {
      $results += $line
    }
  }

  if (-not $have_resources) {
    if ($parsing_resources -eq 1 -and $line -match $BLOB_HEADER) {
        $parsing_resources = 2
        continue
    }

    if ($parsing_resources -eq 2) {
      $resources += $line
    }
  }
}
$have_results = $results.Count -gt 0
$have_resources = $resources.Count -gt 0

# phext research addresses are of the form:
# 1.1.2/collection.volume.book/chapter.section.scroll
# cn.vm.bk/ch.sn.sc
$ok = $true
if (-not $have_title) {
  Write-Error "missing title"
  $ok = $false
}
if (-not $have_abstract) {
  Write-Error "missing abstract"
  $ok = $false
}
if (-not $have_methods) {
  Write-Error "missing methods"
  $ok = $false
}
if (-not $have_code) {
  Write-Error "missing code"
  $ok = $false
}
if (-not $have_results) {
  Write-Error "missing results"
  $ok = $false
}
if (-not $have_resources) {
  Write-Host "warning: no resources found"
}
if (-not $ok) {
  exit 1
}

$cn = phexty-soundex-v1 $title

$abstract_text = $abstract -join '\n'
$vm = phexty-soundex-v1 $abstract_text

$book_text = $methods -join '\n'
$bk = phexty-soundex-v1 $book_text

$code_text = $code -join '\n'
$ch = phexty-soundex-v1 $code_text

$results_text = $results -join '\n'
$sn = phexty-soundex-v1 $results_text

$resources_text = $resources -join '\n'
$sc = phexty-soundex-v1 $resources_text

Write-Host "title: $title"
Write-Host "phext address: $raap/$cn.$vm.$bk/$ch.$sn.$sc"

if ($verbose) {
  Write-Host $abstract
}