param(
  [int64] $value
)
function toBase88($value) {
   $temp = $value
   $lookup = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ,./?:[]|{}=-+_)(*&^%$#@!~"
   $result = @()
   if ($temp -eq 0) { return "0" }
   while ($temp -ne 0) {
     $remainder = $temp % 88
     $temp = ($temp - $remainder)/88
     $result = $lookup[$remainder] + "$result"
   }
   return $result
}

toBase88($value)