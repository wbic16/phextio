<?php
header("Content-Type:application/json");
require_once("phext.inc.php");

$seed = array_key_exists('seed', $_GET) ? $_GET['seed'] : "";
if (array_key_exists('s', $_GET)) {
  $seed = $_GET['s'];
}
$coordinate = array_key_exists('coordinate', $_GET) ? $_GET['coordinate'] : "";
if (array_key_exists('c', $_GET)) {
  $coordinate = $_GET['c'];
}
$token = array_key_exists('token', $_GET) ? $_GET['token'] : "";
if (array_key_exists('t', $_GET)) {
  $token = $_GET['t'];
}

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
if ($coordinate) {
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
  if (strlen($seed) == 0) {
    $seed = $_SESSION["username"];
    $seed_ok = true;
    $write_access = true;
    $authenticated = true;
  }
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
  $seed_file = "/var/data/phextio/seeds/$seed.phext";
  if (! file_exists($seed_file)) {
    echo "Missing $seed";
    return;
  }
  $size = filesize($seed_file);
  $limit = 1024 * 1024;
  if ($size > $limit) {
    echo "Segment too large";
    return;
  }
  global $TLB, $TSF, $TSR, $TCN, $TVM, $TBK, $TCH, $TSN, $TSC;
  global $LIBRARY_BREAK, $SHELF_BREAK, $SERIES_BREAK;
  global $COLLECTION_BREAK, $VOLUME_BREAK, $BOOK_BREAK;
  global $CHAPTER_BREAK, $SECTION_BREAK, $SCROLL_BREAK;

  $raw = file_get_contents($seed_file);
  $libs = explode($LIBRARY_BREAK, $raw);
  $LB = 1;
  foreach ($libs as $lib) {
    $shelves = explode($SHELF_BREAK, $lib);
    $SF = 1;
    foreach ($shelves as $shelf) {
      $series = explode($SERIES_BREAK, $shelf);
      $SR = 1;
      foreach ($series as $seri) {
        $collections = explode($COLLECTION_BREAK, $seri);
        $CN = 1;
        foreach ($collections as $collection) {
          $volumes = explode($VOLUME_BREAK, $collection);
          $VM = 1;
          foreach ($volumes as $volume) {
            $books = explode($BOOK_BREAK, $volume);
            $BK = 1;
            foreach ($books as $book) {
              $chapters = explode($CHAPTER_BREAK, $book);
              $CH = 1;
              foreach ($chapters as $chapter) {
                $sections = explode($SECTION_BREAK, $chapter);
                $SN = 1;
                foreach ($sections as $section) {
                  $SC = 1;
                  $scrolls = explode($SCROLL_BREAK, $section);
                  foreach ($scrolls as $scroll) {
                    if ($TLB == $LB && $TSF == $SF && $TSR == $SR &&
                        $TCN == $CN && $TVM == $VM && $TBK == $BK &&
                        $TCH == $CH && $TSN == $SN && $TSC == $SC) {
                      echo $scroll;
                    }
                    ++$SC;
                  }
                  ++$SN;
                }
                ++$CH;
              }
              ++$BK;
            }
            ++$VM;
          }
          ++$CN;
        }
        ++$SR;
      }
      ++$SF;
    }
    ++$LB;
  }
}

response($seed, $coordinate);
?>
