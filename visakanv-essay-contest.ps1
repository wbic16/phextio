param(
  [string] $user,
  [string] $topic,
  [string] $title
)
$MAX = 7

function soundex($byte, $lookup, $increment) {
  for ($i = 0; $i -lt $lookup.Length; ++$i)
  {
    if ($byte -eq $lookup[$i]) { return $increment }
  }
  return 0
}

# computes a phext sub-coordinate (recursive soundex modulo $MAX)
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
  $value = $value % $MAX
  return $value
}

$chapter = phexty-soundex-v1 $user
$section = phexty-soundex-v1 $topic
$scroll = phexty-soundex-v1 $title

Write-Host "Your essay contest number: $chapter.$section.$scroll"