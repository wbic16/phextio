<?php
$LINE_BREAK       = "\n";
$CARRIAGE_RETURN  = "\r";
$LIBRARY_BREAK    = "" . chr(0x01);
$SHELF_BREAK      = "" . chr(0x1F);
$SERIES_BREAK     = "" . chr(0x1E);
$COLLECTION_BREAK = "" . chr(0x1D);
$VOLUME_BREAK     = "" . chr(0x1C);
$BOOK_BREAK       = "" . chr(0x1A);
$CHAPTER_BREAK    = "" . chr(0x19);
$SECTION_BREAK    = "" . chr(0x18);
$SCROLL_BREAK     = "" . chr(0x17);

$PHEXT_SECURITY_FILE = "/var/logins/phextio.crp";

function phext_sanitize_text($text) {
  global $LIBRARY_BREAK;
  global $SHELF_BREAK;
  global $SERIES_BREAK;
  global $COLLECTION_BREAK;
  global $VOLUME_BREAK;
  global $BOOK_BREAK;
  global $CHAPTER_BREAK;
  global $SECTION_BREAK;
  global $SCROLL_BREAK;
  global $LINE_BREAK;
  global $CARRIAGE_RETURN;

  $output = $text;
  $output = str_replace($LINE_BREAK,       "", $output);
  $output = str_replace($CARRIAGE_RETURN,  "", $output);
  $output = str_replace($SCROLL_BREAK,     "", $output);
  $output = str_replace($SECTION_BREAK,    "", $output);
  $output = str_replace($CHAPTER_BREAK,    "", $output);
  $output = str_replace($BOOK_BREAK,       "", $output);
  $output = str_replace($VOLUME_BREAK,     "", $output);
  $output = str_replace($COLLECTION_BREAK, "", $output);
  $output = str_replace($SERIES_BREAK,     "", $output);
  $output = str_replace($SHELF_BREAK,      "", $output);
  $output = str_replace($LIBRARY_BREAK,    "", $output);
  return $output;
}

session_start();

function phext_authorize_user($username, $token) {
  $token_hash = password_hash($token, PASSWORD_DEFAULT);

  global $PHEXT_SECURITY_FILE;
  global $LINE_BREAK;
  $security = file_get_contents($PHEXT_SECURITY_FILE);
  $security = explode($LINE_BREAK, $security);

  foreach ($security as $line) {
    if (! str_contains($line, ",")) {
      continue;
    }
    $parts = explode(',', $line);
    if (count($parts) != 2) {
      continue;
    }
    $test = $parts[0];
    $expected = trim($parts[1]);
    if (str_starts_with($test, $username) && strlen($test) == strlen($username)) {
      if (password_verify($token, $expected)) {
        $_SESSION["username"] = $username;
        return true;
      }
    }
  }

  $_SESSION["username"] = "";
  return false;
}
?>