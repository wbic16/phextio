<?php
if ($argc < 2) {
  echo "Usage: sql.phext.php <command> <args>\n";
  exit(1);
}
$command = strtolower($argv[1]);

switch ($command)
{
    case "create":
        echo "CREATE\n";
        break;
    case "drop":
        echo "DROP\n";
        break;
    case "select":
        echo "SELECT\n";
        break;
    case "insert":
        echo "INSERT\n";
        break;
    case "update":
        echo "UPDATE\n";
        break;
    case "delete":
        echo "DELETE\n";
        break;
    default:
        echo "Unknown command: $command";
        break;
}

echo "\n";
?>