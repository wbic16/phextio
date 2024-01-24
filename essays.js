var author = false;
var topic = false;
var title = false;
var essayCoordinate = false;

function load() {
  author = dgid("author");
  topic = dgid("topic");
  title = dgid("title");
  essayCoordinate = dgid("essayCoordinate");

  var loaded = false;
  if (localStorage.author) {
    author.value = localStorage.author;
    loaded = true;
  }
  if (localStorage.topic) {
    topic.value = localStorage.topic;
    loaded = true;
  }
  if (localStorage.title) {
    title.value = localStorage.title;
    loaded = true;
  }

  if (loaded) {
    calculate();
  }
}

var soundex_limit = 7;

function soundex(byte, lookup, increment) {

  for (var i = 0; i < lookup.length; ++i) {
    var test = lookup.charAt(i);
    if (byte == test) { return increment; }
  }
  return 0;
}

function phextySoundexV1(text) {
  if (!text) { return 1; }

  max = text.length
  if (max == 0) { return 1; }

  var lower = text.toLowerCase();
  var value = 1;
  var letter1 = "bpfv";
  var letter2 = "cskgjqxz";
  var letter3 = "dt";
  var letter4 = "l";
  var letter5 = "mn";
  var letter6 = "r";
  for (var i = 0; i < max; ++i) {
    byte = lower.charAt(i);
    value += soundex(byte, letter1, 1);
    value += soundex(byte, letter2, 2);
    value += soundex(byte, letter3, 3);
    value += soundex(byte, letter4, 4);
    value += soundex(byte, letter5, 5);
    value += soundex(byte, letter6, 6);
  }
  console.log("Sounded for " + lower + " => " + value);
  value = (value % soundex_limit) + 1;
  return value;
}

function calculate() {
  var chapter = phextySoundexV1(topic.value);
  var section = phextySoundexV1(title.value);
  var scroll = phextySoundexV1(author.value);
  localStorage.topic = topic.value;
  localStorage.title = title.value;
  localStorage.author = author.value;

  essayCoordinate.value = chapter + "." + section + "." + scroll;
}