<?php
$LIMIT = 100 * 1024 * 1024;

$do_update = false;
if (array_key_exists("file", $_POST)) {
  if ($_SESSION["username"] == $_POST["seed"]) {
    $do_update = true;
  }
}

$seed = array_key_exists('seed', $_GET) ? $_GET['seed'] : "";
if (array_key_exists('s', $_GET)) {
  $seed = $_GET['s'];
}
if (!seed && array_key_exists("username", $_SESSION)) {
  $seed = $_SESSION["username"];
}
$coordinate = array_key_exists('coordinate', $_GET) ? $_GET['coordinate'] : "";
if (array_key_exists('c', $_GET)) {
  $coordinate = $_GET['c'];
}
$token = array_key_exists('token', $_GET) ? $_GET['token'] : "";
if (array_key_exists('t', $_GET)) {
  $token = $_GET['t'];
}

if ($coordinate) {
  header("Content-Type:application/json");
} else {
  ?><html>
<head>
<title>phext.io api server</title>
<head>
<link rel="stylesheet" href="phext.css?rev=1" />
<body>
<a href="/index.html">Back to Homepage</a>

<?php
  if ($do_update) {
    echo "Working on uploading your phext...";
  } else {
?>

<form method="POST" action="api.php">
<input type="hidden" name="seed" id="seed" value="<?php echo $seed; ?>" />
Phext Upload: <input type="file" name="phext" id="phext" />

You may update your own phext by clicking the browse button above.
<input type="submit" name="update" id="update" value="Update" />
</form>

<?php
  }
}
require_once("phext.inc.php");

function validate_triplet($name, $triplet) {
   if (! array_key_exists(0, $triplet)) {
    echo "$name Z Failure";
    return false;
  }
  if (! array_key_exists(1, $triplet)) {
    echo "$name Y Failure";
    return false;
  }
  if (! array_key_exists(2, $triplet)) {
    echo "$name X Failure";
    return false;
  }
  return true;
}
$TLB = 1;
$TSF = 1;
$TSR = 1;
$TCN = 1;
$TVM = 1;
$TBK = 1;
$TCH = 1;
$TSN = 1;
$TSC = 1;

$mode = "toc";
if ($coordinate) {
  $mode = "node";
  $parts = explode('/', $coordinate, 3);
  if (! validate_triplet("Cortical", $parts)) {
    exit(0);
  }
  $Z = $parts[0];
  $Y = $parts[1];
  $X = $parts[2];

  $zp = explode('.', $Z, 3);
  $yp = explode('.', $Y, 3);
  $xp = explode('.', $X, 3);
  if (! validate_triplet("Z", $zp)) {
    exit(0);
  }
  if (! validate_triplet("Y", $yp)) {
    exit(0);
  }
  if (! validate_triplet("X", $xp)) {
    exit(0);
  }
  $TLB = $zp[0];
  $TSF = $zp[1];
  $TSR = $zp[2];
  $TCN = $yp[0];
  $TVM = $yp[1];
  $TBK = $yp[2];
  $TCH = $xp[0];
  $TSN = $xp[1];
  $TSC = $xp[2];
}

$known_seeds = array(
  'phextio' => '180090540E71E6',
  'wbic16' => 'AD0683C8FA4DE8',
  'plan' => 'FFCD27C0444',
  '0x440x46' => '81124211D679D1E',
  'solutions' => 'twitter'
);

$authenticated = false;
$read_access = true;
$write_access = false;
$seed_ok = false;
foreach ($known_seeds as $k => $p) {
  if ($k == $seed) {
    if ($p == $token) {
      $authenticated = true;
      $seed_ok = true;
      $read_access = true;
    }
  }
}

if (array_key_exists("username", $_SESSION)) {
  if (strlen($seed) == 0 || !$seed_ok) {
    $seed = $_SESSION["username"];
    $seed_ok = true;
  }
  $write_access = true;
  $authenticated = true;
}

if (! $seed_ok) {
  echo "Unknown seed";
  exit(0);
}
if (! $authenticated) {
  echo "Unauthorized";
  exit (0);
}

function response($seed, $coordinate) {
  global $LIMIT;

  $seed_file = "/var/data/phextio/seeds/$seed.phext";
  if (! file_exists($seed_file)) {
    $your_scroll = "Blank Phext$SCROLL_BREAK\nSecond Scroll Here\n";
    file_put_contents($seed_file, $your_scroll);
  }
  $size = filesize($seed_file);
  $limit = $LIMIT;
  if ($size > $limit) {
    echo "Phext too large";
    return;
  }
  global $TLB, $TSF, $TSR, $TCN, $TVM, $TBK, $TCH, $TSN, $TSC;
  global $LIBRARY_BREAK, $SHELF_BREAK, $SERIES_BREAK;
  global $COLLECTION_BREAK, $VOLUME_BREAK, $BOOK_BREAK;
  global $CHAPTER_BREAK, $SECTION_BREAK, $SCROLL_BREAK;
  global $mode, $token, $seed;

  $raw = file_get_contents($seed_file);
  $libs = explode($LIBRARY_BREAK, $raw);
  $LB = 1;
  if ($mode == "toc") { echo "<ul>\n"; }
  foreach ($libs as $lib) {
    $shelves = explode($SHELF_BREAK, $lib);
    $SF = 1;
    if ($mode == "toc") { echo "<ul>\n"; }
    foreach ($shelves as $shelf) {
      $series = explode($SERIES_BREAK, $shelf);
      $SR = 1;
      if ($mode == "toc") { echo "<ul>\n"; }
      foreach ($series as $seri) {
        $collections = explode($COLLECTION_BREAK, $seri);
        $CN = 1;
        if ($mode == "toc") { echo "<ul>\n"; }
        foreach ($collections as $collection) {
          $volumes = explode($VOLUME_BREAK, $collection);
          $VM = 1;
          if ($mode == "toc") { echo "<ul>\n"; }
          foreach ($volumes as $volume) {
            $books = explode($BOOK_BREAK, $volume);
            $BK = 1;
            if ($mode == "toc") { echo "<ul>\n"; }
            foreach ($books as $book) {
              $chapters = explode($CHAPTER_BREAK, $book);
              $CH = 1;
              if ($mode == "toc") { echo "<ul>\n"; }
              foreach ($chapters as $chapter) {
                $sections = explode($SECTION_BREAK, $chapter);
                $SN = 1;
                if ($mode == "toc") { echo "<ul>\n"; }
                foreach ($sections as $section) {
                  $SC = 1;
                  $scrolls = explode($SCROLL_BREAK, $section);
                  foreach ($scrolls as $scroll) {
                    if ($mode == "node") {
                      if ($TLB == $LB && $TSF == $SF && $TSR == $SR &&
                          $TCN == $CN && $TVM == $VM && $TBK == $BK &&
                          $TCH == $CH && $TSN == $SN && $TSC == $SC) {
                        echo $scroll;
                      }
                    }
                    if ($mode == "toc") {
                      $coordinate = "$LB.$SF.$SR/$CN.$VM.$BK/$CH.$SN.$SC";
                      $lines = explode("\n", $scroll);
                      if (count($lines) > 0) {
                        $line = substr($lines[0], 0, 100);
                        echo "<li>$coordinate: <a href=\"api.php?s=$seed&t=$token&c=$coordinate\">Scroll #$SC: $line</a></li>";
                      }
                    }
                    ++$SC;
                  }
                  if ($mode == "toc") { echo "</ul>\n"; } // scrolls
                  ++$SN;
                }
                if ($mode == "toc") { echo "</ul>\n"; } // sections
                ++$CH;
              }
              if ($mode == "toc") { echo "</ul>\n"; } // chapters
              ++$BK;
            }
            if ($mode == "toc") { echo "</ul>\n"; } // books
            ++$VM;
          }
          if ($mode == "toc") { echo "</ul>\n"; } // volumes
          ++$CN;
        }
        if ($mode == "toc") { echo "</ul>\n"; } // collections
        ++$SR;
      }
      if ($mode == "toc") { echo "</ul>"; } // series
      ++$SF;
    }
    if ($mode == "toc") { echo "</ul>\n"; } // shelves
    ++$LB;
  }
  if ($mode == "toc") { echo "</ul>\n"; } // libraries
}

response($seed, $coordinate);

if (!$coordinate) {
  echo "</body></html>";
}
?>