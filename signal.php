<!DOCTYPE html>
<html>
<head>
<title>the phext.io signal</title>
<link rel="stylesheet" href="phext.css?rev=4.2.4" />
<link rel="stylesheet" href="homepage.css?rev=4.2.4" />

<script type="text/javascript" src="phext.ts?rev=4.2.4"></script>
<style type="text/css">
body {
    margin: 0 auto;
    width: 95%;
    font-size: 0.75em;
}
a, a:visited {
    font-size: 1em;
    color: whitesmoke;
}
#matrix {
}
div.day {
    width: 150px;
    border-radius: 3px;
    border: 1px solid grey;
    padding: 10px;
    min-width: 120px;
    min-height: 100px;
}
div.celebrate {
    background: white;
    border-color: orange;
}
</style>
<style type="text/css" media="print">
body, table, th, td, a, a:visited {
  font-size: 0.8em;
}
</style>
</head>
<body>

<div id="matrix">
<?php
require_once("render-phext-hashtag.php");
?>
</div>

</body>
</html>