<?php
require_once("phext.inc.php");

$ready = array_key_exists("username", $_POST) && !array_key_exists("retry", $_GET);
if ($ready) {
  $username = $_POST["username"];
  if (! array_key_exists("token", $_POST)) {
    header("Location: /login.php?retry=" + $username);
    exit(0);
  }
  $token = password_hash($_POST["token"].trim());
  $creds = file_get_contents($PHEXT_SECURITY_FILE);
  $scrolls = explode($SCROLL_BREAK, $creds);
  $authorized = $scrolls[0];
  foreach ($authorized as $line) {
    $parts = explode(',', $line 2);
    $test = $parts[0];
    $expected = $parts[1].trim();
    if ($username == $test) {
      if ($expected == $token) {
        header("Location: /api.php");
      }
    }
  }

  $message = "Unable to Authenticate " + $username;
  $url = "Location: /index.html?seed=login-failure&cz=1.1.1&cy=1.1.1&cx=1.1.1&r=" + urlencode($message);
  header($url);
}
else
{
?>
<!DOCTYPE html>
<html>
<head>
<title>phext.io - login</title>
<link rel="stylesheet" href="phext.css?rev=1" />
<style type="text/css">
th {
  vertical-align: top;
  padding-right: 10px;
  margin-bottom: 10px;
}
#loginform {
  margin-left: 100px;
  
}
</style>
<script type="text/javascript" src="phext.ts"></script>

<script type="text/javascript">
function load()
{
  if (localStorage.username) {
    dgid('username').value = localStorage.username;
  }
}
</script>
</head>
<body onload="load();">

<a href="index.html">Back to Homepage</a>

<h1>Welcome, Phexter</h1>
<form action="login.php" method="POST">

<div id="loginform">
<table>
  <tr>
    <th>Username</th>
    <td><input type="text" name="username" id="username" />
    <br /><label><input type="checkbox" checked name="remember" id="remember" /> Remember Me</label>
    </td>
  </tr>
  <tr>
    <th>Login Token</th>
    <td><input type="text" name="token" id="token" /></td>
  </tr>
</table>

<input type="submit" name="whitepill" id="whitepill" value="Login" />
<input type="button" name="sortinghat" id="sortinghat" value="Sorting Hat" onclick="window.load('/sortinghat.html');" />
<input type="button" name="signup" id="signup" value="Sign Up" onclick="window.load('/signup.html');" />
</div>

</form>
</body>
</html>

<?php
} // ! posting
?>