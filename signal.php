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
    font-size: 0.8em;
    font-weight: bold;
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
    min-width: 175px;
    min-height: 175px;
    float: left;
}
div.celebrate {
    background: white;
    color: black;
    border-color: orange;
}
div.celebrate a,
div.celebrate a:visited {
    color: black;
    display: block;
    text-decoration: none;
    border: 1px solid black;
    border-top: 0;
    padding-bottom: 4px;
}
div.celebrate a:hover,
div.celebrate a:visited:hover {
    background: grey;
}
</style>
<style type="text/css" media="print">
body, table, th, td, a, a:visited {
  font-size: 0.8em;
}
</style>
</head>
<body>

<a href="index.html">Back to Homepage</a>

<div id="matrix">
<?php
require_once("render-phext-hashtag.php");
?>
</div>

</body>
</html>