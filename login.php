<?php
require_once("phext.inc.php");

$ready = array_key_exists("username", $_POST) &&
         !array_key_exists("retry", $_GET) &&
         !array_key_exists("username", $_GET);

if ($ready) {
  $username = phext_sanitize_text($_POST["username"]);
  if (! array_key_exists("token", $_POST)) {
    header("Location: /login.php?retry=" + $username);
    exit(0);
  }
  $token = phext_sanitize_text($_POST["token"]);
  if (phext_authorize_user($username, $token)) {
    header("Location: /api.php");
    exit(0);
  }

  $url = "Location: /index.html?seed=login-failure&cz=1.1.1&cy=1.1.1&cx=1.1.1&r=Auth+Failure+for+$username";
  header($url);
  exit(0);
}
else
{

  $username = "";
  if (array_key_exists("username", $_GET)) {
    $username = $_GET["username"];
  }
  $validated = false;
  if (array_key_exists("validated", $_GET)) {
    $validated = true;
  }

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

<?php
if ($validated) {
  echo "<p>Your login is currently active. You may proceed to the <a href='api.php?seed=$username&coordinate=1.1.1/1.1.1/1.1.1'>api</a>.";
}
?>

<h1>Welcome, Phexter</h1>
<form action="login.php" method="POST">

<div id="loginform">
<table>
  <tr>
    <th>Username</th>
    <td><input type="text" name="username" id="username" value="<?php echo $username; ?>" />
    <br /><label><input type="checkbox" checked name="remember" id="remember" /> Remember Me</label>
    </td>
  </tr>
  <tr>
    <th>Login Token</th>
    <td><input type="text" name="token" id="token" /></td>
  </tr>
</table>

<input type="submit" name="whitepill" id="whitepill" value="Login" />
<input type="button" name="sortinghat" id="sortinghat" value="Sorting Hat" onclick="window.open('/sortinghat.html');" />
<input type="button" name="signup" id="signup" value="Sign Up" onclick="window.open('/signup.php');" />
</div>

</form>
</body>
</html>

<?php
} // ! posting
?>