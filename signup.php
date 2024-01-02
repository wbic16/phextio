<?php
require_once("phext.inc.php");

$ready = array_key_exists("username", $_POST) && array_key_exists("token", $_POST) && !array_key_exists("retry", $_GET);
if ($ready) {
  $username = phext_sanitize_text($_POST["username"]);
  $token = phext_sanitize_text($_POST["token"]);
  $token_hash = password_hash($token, PASSWORD_DEFAULT);

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
    if (str_starts_with($test, $username)) {
      if (password_verify($token, $expected)) {
        header("Location: login.php?username=" . $username . "&validated=1");
        exit(0);
      }
      header("Location: signup.php?retry=" . $username . "&reason=mismatch");
      exit(0);
    }
  }

  $security .= "\n$username,$token_hash";
  file_put_contents($PHEXT_SECURITY_FILE, $security);
  header("Location: login.php?username=" . $username . "&added=1");
  exit(0);

} else {
?>
<!DOCTYPE html>
<html>
<head>
<title>phext.io - signup</title>
<link rel="stylesheet" href="phext.css?rev=1" />
<style type="text/css">
a, a:visited {
  font-size: 1.1em;
  font-weight: bold;
}
</style>
<script type="text/javascript" src="phext.ts"></script>

<script type="text/javascript">
function load()
{
}
</script>
</head>
<body onload="load();">

<a href="index.html">Back to Homepage</a>

<h1>Account Signup</h1>

<p>Q: Wait, why do I need to signup for an account? I thought phext was a distributed + decentralized system!</p>
<p>A: You need an account to share phexts using the web client. You can connect to the phetwork using linux and no login if you prefer.</p>

<p>Q: Do you store my token in plain text?</p>
<p>Q: No, your token is hashed and stored in the login database if your username is unique.</p>

<form method="post" action="signup.php">
<table>
<tr>
  <th>Username:</th>
  <td><input type="text" name="username" id="username" /></td>
</tr>
<tr>
  <th>Token:</th>
  <td><input type="text" name="token" id="token" /></td>
</tr>
</table>
<input type="submit" name="Create" id="Create" value="Sign Up" />
</form>

<img src="bridge-the-gap.jpg" />

</body>
</html>

<?php
}
?>