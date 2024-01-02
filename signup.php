<?php
require_once("phext.inc.php");

$ready = array_key_exists("username", $_POST) && array_key_exists("token", $_POST) && !array_key_exists("retry", $_GET);
if ($ready) {
  $username = phext_sanitize_text($_POST["username"]);
  $token = password_hash(phext_sanitize_text($_POST["token"]), PASSWORD_DEFAULT);

  $accounts = file_get_contents($PHEXT_SECURITY_FILE);
  $security = explode($SCROLL_BREAK, $accounts, 2);
  foreach ($security[0] as $line) {
    $parts = explode(',', $line);
    if ($parts[0] == $username) {
      header("Location: signup.php?retry=" + $username);
      exit(0);
    }
  }

  // still here, so insert the new entry
  $security[0] = $security[0].trim() + "\n$username,$token";
  $phext = implode($SCROLL_BREAK, $security);
  file_put_contents($PHEXT_SECURITY_FILE, $phext);
  header("Location: login.php?username=" + $username);
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