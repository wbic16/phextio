<?php
$source_filename = "/var/data/phextio/twitter/phext-hashtag.txt";
$data = file_get_contents($source_filename);
$data = explode("\n", $data);
$max = count($data);
$year = 2024;
$month = 1;
$day = 28;
$date = "$year-$month-$day";
$output = array();
$users = array();
$user_count = 0;

for ($i = 0; $i < $max; ++$i) {
  $line = $data[$i];
  $line = trim($line);
  if (strlen($line) == 0 || $line == "·") {
    continue;
  }
  if (preg_match('/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/', $line)) {
    $parts = explode(' ', $line);
    if (count($parts) >= 2) {
      $month = $parts[0];
      $day = $parts[1];
      $date = "$year-$month-$day";
    }
  } else {
    if (preg_match('/@/', $line)) {
      $user = explode('@', $line)[1];
      if (!array_key_exists($user, $users)) {
        ++$user_count;
        $users[$user] = 1;
      }
      if (!array_key_exists($date, $output)) {
        $output[$date] = array();
      }
      if (!array_key_exists($user, $output[$date])) {
        $output[$date][$user] = 1;        
      }
    }
  }
}

// Score Board
// A matrix of days - one per week, 52 per year
$annual = array();
for ($i = 0; $i < 52; ++$i) {
  $annual[$i] = array();
}

function normalize_date($date) {
  $result = $date;
  $result = str_replace("Jan", "1", $result);
  $result = str_replace("Feb", "2", $result);
  $result = str_replace("Mar", "3", $result);
  $result = str_replace("Apr", "4", $result);
  $result = str_replace("May", "5", $result);
  $result = str_replace("Jun", "6", $result);
  $result = str_replace("Jul", "7", $result);
  $result = str_replace("Aug", "8", $result);
  $result = str_replace("Sep", "9", $result);
  $result = str_replace("Oct", "10", $result);
  $result = str_replace("Nov", "11", $result);
  $result = str_replace("Dec", "12", $result);
  $start = strtotime("2024-01-01");
  $end = strtotime($result);

  // Seconds x Minutes x Hours = Days
  $result = round(($end - $start) / (60 * 60 * 24));
  return $result;
}

$matrix = array();
foreach ($output as $date => $userlist) {
  $date = normalize_date($date);
  if (!array_key_exists($date, $matrix)) {
    $matrix[$date] = array();
  }
  $temp = "";
  foreach ($userlist as $user => $found) {
    $temp .= "<a href='https://twitter.com/$user'>@$user</a>\n";
  }
  $matrix[$date] = $temp;
}

$date = filemtime($source_filename);
$date = date("Y-m-d", $date);

echo "<h2>#phext activity on twitter: $user_count</h2>";
echo "<p>To contribute to the phext signal that you want to see in the world, tag your posts on twitter with the <a href='https://twitter.com/search?q=%23phext&src=phext.io'>#phext</a> hashtag. Reach out to <a href='https://twitter.com/wbic16'>@wbic16</a> to make sure that this page is updated once your tweet(s) are visible!</p>";
echo "<p>I've arbitrarily set Day 0 at 2024-01-01</p>";
echo "<p>Last Updated: $date</p>";

for ($i = 0; $i < 52; ++$i) {
  for ($j = 0; $j < 7; ++$j) {
    $k = ($i*7) + $j + 1;
    if (array_key_exists($k, $matrix)) {
      // signal today! <o^
      echo "<div class='day celebrate'>Day #$k 💡\n";
      echo $matrix[$k];
      echo "&lt;o^</div>\n";
    } else {
      // no signal today :(
      echo "<div class='day'>Day #$k 🔎</div>\n";
    }    
  }
}

?>
