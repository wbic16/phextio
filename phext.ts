// phext.ts
// this monstrosity of an implementation is basically Will's stream of consciousness
// if you want to refactor it for clarity, please submit a pr
// (c) 2023-2024 Will Bickford
// License: MIT

function dgid(id) {
  return document.getElementById(id);
}

var upstream = 'https://github.com/wbic16/phextio';

var raw = "";
var phexts = {};
if (localStorage.raw && localStorage.raw.length > 0) {
  raw = localStorage.raw;
} else {
  raw = "<html>\n<head>\n<title>Reference Phext Document</title>\n</head>\n<body>\n\nYou are currently at 1.1.1/1.1.1/1.1.1.\nWe are aware of the following nodes:\n\n<a href='phext://1.1.1/1.1.1/1.1.2'>Scroll #2</a>\n<a href='phext://1.1.1/1.1.1/1.1.3'>Scroll #3</a>\n<a href='phext://1.1.1/1.1.1/1.1.4'>Scroll #4</a>\n\n</body>\n</html>Scroll #2\n---------\nThis happens to be a MarkDown file.\n\nScroll #3: Just a line of text.<html>\n<head>\n<title>Scroll #4</title>\n</head>\n<body>\n<a href='phext://1.1.1/1.1.1/1.1.1'>Return Home</a>\n\n<h1>Scroll #4</h1>\n</body>\n</html>";
  localStorage.raw = raw;
}

var phextMode = 'n'; // newbie

const LINE_BREAK       = '\n';   // 2nd (Newline)
const SCROLL_BREAK     = '\x17'; // 3rd
const SECTION_BREAK    = '\x18'; // 4th
const CHAPTER_BREAK    = '\x19'; // 5th
const BOOK_BREAK       = '\x1A'; // 6th
const VOLUME_BREAK     = '\x1C'; // 7th
const COLLECTION_BREAK = '\x1D'; // 8th
const SERIES_BREAK     = '\x1E'; // 9th
const SHELF_BREAK      = '\x1F'; // 10th
const LIBRARY_BREAK    = '\x01'; // 11th

const F1_KEY = 112;
const F2_KEY = 113;
const F3_KEY = 114;
const F4_KEY = 115;
const F5_KEY = 116;
const F6_KEY = 117;
const F7_KEY = 118;
const F8_KEY = 119;
const F9_KEY = 120;
const F10_KEY = 121;
const F11_KEY = 122;
const F12_KEY = 123;

var enterKey = LINE_BREAK;
var replacementDescription = "ENTER";
var priorButton = false;

var DimensionBreaks = new Array(
  SCROLL_BREAK,
  SECTION_BREAK,
  CHAPTER_BREAK,
  BOOK_BREAK,
  VOLUME_BREAK,
  COLLECTION_BREAK,
  SERIES_BREAK,
  SHELF_BREAK,
  LIBRARY_BREAK
);

// -----------------------------------------------------------------------------------------------------------
function defaultCoordinates() {
  var coordinates = new Array();
  coordinates[LINE_BREAK] = 1;
  coordinates[SCROLL_BREAK] = 1;
  coordinates[SECTION_BREAK] = 1;
  coordinates[CHAPTER_BREAK] = 1;
  coordinates[BOOK_BREAK] = 1;
  coordinates[VOLUME_BREAK] = 1;
  coordinates[COLLECTION_BREAK] = 1;
  coordinates[SERIES_BREAK] = 1;
  coordinates[SHELF_BREAK] = 1;
  coordinates[LIBRARY_BREAK] = 1;
  return coordinates;
}

var gl = false;
var ns = false;
var ta = false;
var cs = false;
var ls = false;
var cx = false;
var cy = false;
var cz = false;
var wr = false;
var st = false;
var lk = false;
var cp = false;
var ha = false;
var sa = false;
var vr = false;
var qr = false;
var lt = false;
var sd = false;
var se = false;
var lts = false;
var qrui = false;
var qrd = false;
var qrl = false;
var qt = false;
var nodes = Array();
var qurl = "";

var phextCoordinate = "1.1.1/1.1.1/1.1.1";

// -----------------------------------------------------------------------------------------------------------
function loadVars() {
  if (!gl) { gl = dgid("goal"); }
  if (!ns) { ns = dgid("nodes"); }
  if (!ta) { ta = dgid("scroll"); }
  if (!cs) { cs = dgid("coords"); }
  if (!ls) { ls = dgid("subspace"); }
  if (!cx) { cx = dgid("coordsX"); }
  if (!cy) { cy = dgid("coordsY"); }
  if (!cz) { cz = dgid("coordsZ"); }
  if (!wr) { wr = dgid("whiterabbit"); }
  if (!st) { st = dgid("subspaceTitle"); }
  if (!cp) { cp = dgid("coordinatePlate"); }
  if (!ha) { ha = dgid("helparea"); }
  if (!sa) { sa = dgid("subspaceArea"); }
  if (!lt) { lt = dgid("linkerText"); }
  if (!sd) { sd = dgid("seed"); }
  if (!se) { se = dgid("seeds"); }
  if (!lts) { lts = dgid("linkerStatus"); }
  if (!qrui) { qrui = dgid("qrcode"); }
  if (!qrl) { qrl = dgid("qrlabel"); }
  if (!qt) { qt = dgid("quest"); }

  if (localStorage.seed) {
    sd.value = localStorage.seed;
  }
}

// -----------------------------------------------------------------------------------------------------------
function updateCoordinate() {
  phextCoordinate = cx.value + "/" + cy.value + "/" + cz.value;
}

var coords = defaultCoordinates();
var target = defaultCoordinates();
var scrollFound = false;

// -----------------------------------------------------------------------------------------------------------
function loadPhext() {
  raw = ls.value;
  coords = defaultCoordinates();
  var gz = cz.value.split('.');
  var gy = cy.value.split('.');
  var gx = cx.value.split('.');
  if (gz.length >= 1) { target[LIBRARY_BREAK] = gz[0]; }
  if (gz.length >= 2) { target[SHELF_BREAK] = gz[1]; }
  if (gz.length >= 3) { target[SERIES_BREAK] = gz[2]; }
  if (gy.length >= 1) { target[COLLECTION_BREAK] = gy[0]; }
  if (gy.length >= 2) { target[VOLUME_BREAK] = gy[1]; }
  if (gy.length >= 3) { target[BOOK_BREAK] = gy[2]; }
  if (gx.length >= 1) { target[CHAPTER_BREAK] = gx[0]; }
  if (gx.length >= 2) { target[SECTION_BREAK] = gx[1]; }
  if (gx.length >= 3) { target[SCROLL_BREAK] = gx[2]; }

  scrollFound = false;
  qt.innerHTML = "";
  nodes = Array();
  totalScrolls = 1;
  var libs = raw.split(LIBRARY_BREAK);  
  libs.forEach((library) => processLibrary(library));
  if (!scrollFound) {
    ta.value = "";
  }
  qt.innerHTML = nodes.join("\n");
}

// -----------------------------------------------------------------------------------------------------------
// @fn dimensionBreak
// -----------------------------------------------------------------------------------------------------------
function dimensionBreak(type) {
  if (type == LIBRARY_BREAK) {
    ++coords[LIBRARY_BREAK];
    coords[SHELF_BREAK] = 1;
    coords[SERIES_BREAK] = 1;
    coords[COLLECTION_BREAK] = 1;
    coords[VOLUME_BREAK] = 1;
    coords[BOOK_BREAK] = 1;
    coords[CHAPTER_BREAK] = 1;
    coords[SECTION_BREAK] = 1;
    coords[SCROLL_BREAK] = 1;
  }

  if (type == SHELF_BREAK) {
    ++coords[SHELF_BREAK];
    coords[SERIES_BREAK] = 1;
    coords[COLLECTION_BREAK] = 1;
    coords[VOLUME_BREAK] = 1;
    coords[BOOK_BREAK] = 1;
    coords[CHAPTER_BREAK] = 1;
    coords[SECTION_BREAK] = 1;
    coords[SCROLL_BREAK] = 1;
  }

  if (type == SERIES_BREAK) {
    ++coords[SERIES_BREAK];
    coords[COLLECTION_BREAK] = 1;
    coords[VOLUME_BREAK] = 1;
    coords[BOOK_BREAK] = 1;
    coords[CHAPTER_BREAK] = 1;
    coords[SECTION_BREAK] = 1;
    coords[SCROLL_BREAK] = 1;
  }

  if (type == COLLECTION_BREAK) {
    ++coords[COLLECTION_BREAK];
    coords[VOLUME_BREAK] = 1;
    coords[BOOK_BREAK] = 1;
    coords[CHAPTER_BREAK] = 1;
    coords[SECTION_BREAK] = 1;
    coords[SCROLL_BREAK] = 1;
  }

  if (type == VOLUME_BREAK) {
    ++coords[VOLUME_BREAK];
    coords[BOOK_BREAK] = 1;
    coords[CHAPTER_BREAK] = 1;
    coords[SECTION_BREAK] = 1;
    coords[SCROLL_BREAK] = 1;
  }

  if (type == BOOK_BREAK) {
    ++coords[BOOK_BREAK];
    coords[CHAPTER_BREAK] = 1;
    coords[SECTION_BREAK] = 1;
    coords[SCROLL_BREAK] = 1;
  }

  if (type == CHAPTER_BREAK) {
    ++coords[CHAPTER_BREAK];
    coords[SECTION_BREAK] = 1;
    coords[SCROLL_BREAK] = 1;
  }

  if (type == SECTION_BREAK) {
    ++coords[SECTION_BREAK];
    coords[SCROLL_BREAK] = 1;
  }

  if (type == SCROLL_BREAK) {
    ++coords[SCROLL_BREAK];
  }
}

// -----------------------------------------------------------------------------------------------------------
function processLibrary(library) {
  var shelves = library.split(SHELF_BREAK);
  shelves.forEach((shelf) => processShelf(shelf));
  dimensionBreak(LIBRARY_BREAK);
}

// -----------------------------------------------------------------------------------------------------------
function processShelf(shelf) {
  var series = shelf.split(SERIES_BREAK);
  series.forEach((seri) => processSeries(seri));
  dimensionBreak(SHELF_BREAK);
}

// -----------------------------------------------------------------------------------------------------------
function processSeries(seri) {
  var collections = seri.split(COLLECTION_BREAK);
  collections.forEach((collection) => processCollection(collection));
  dimensionBreak(SERIES_BREAK);
}

// -----------------------------------------------------------------------------------------------------------
function processCollection(collection) {
  var volumes = collection.split(VOLUME_BREAK);
  volumes.forEach((volume) => processVolume(volume));
  dimensionBreak(COLLECTION_BREAK);
}

// -----------------------------------------------------------------------------------------------------------
function processVolume(volume) {
  var books = volume.split(BOOK_BREAK);
  books.forEach((book) => processBook(book));
  dimensionBreak(VOLUME_BREAK);
}

// -----------------------------------------------------------------------------------------------------------
function processBook(book) {
  var chapters = book.split(CHAPTER_BREAK);
  chapters.forEach((chapter) => processChapter(chapter));
  dimensionBreak(BOOK_BREAK);
}

// -----------------------------------------------------------------------------------------------------------
function processChapter(chapter) {
  var sections = chapter.split(SECTION_BREAK);
  sections.forEach((section) => processSection(section));
  dimensionBreak(CHAPTER_BREAK);
}

// -----------------------------------------------------------------------------------------------------------
function processSection(section) {
  var sections = section.split(SCROLL_BREAK);
  sections.forEach((scroll) => processScroll(scroll));
  dimensionBreak(SECTION_BREAK);
}

// -----------------------------------------------------------------------------------------------------------
function coordinatesMatch(a, b) {
  return a[SCROLL_BREAK]     == b[SCROLL_BREAK] &&
         a[SECTION_BREAK]    == b[SECTION_BREAK] &&
         a[CHAPTER_BREAK]    == b[CHAPTER_BREAK] &&
         a[BOOK_BREAK]       == b[BOOK_BREAK] &&
         a[VOLUME_BREAK]     == b[VOLUME_BREAK] &&
         a[COLLECTION_BREAK] == b[COLLECTION_BREAK] &&
         a[SERIES_BREAK]     == b[SERIES_BREAK] &&
         a[SHELF_BREAK]      == b[SHELF_BREAK] &&
         a[LIBRARY_BREAK]    == b[LIBRARY_BREAK];
}

// -----------------------------------------------------------------------------------------------------------
function coordToString(coords) {
  var chz = coords[LIBRARY_BREAK] + "." + coords[SHELF_BREAK] + "." + coords[SERIES_BREAK];
  var chy = coords[COLLECTION_BREAK] + "." + coords[VOLUME_BREAK] + "." + coords[BOOK_BREAK];
  var chx = coords[CHAPTER_BREAK] + "." + coords[SECTION_BREAK] + "." + coords[SCROLL_BREAK];

  return chz + "/" + chy + "/" + chx;
}

// -----------------------------------------------------------------------------------------------------------
function coordinateHit(coords) {

  var chz = coords[LIBRARY_BREAK] + "." + coords[SHELF_BREAK] + "." + coords[SERIES_BREAK];
  var chy = coords[COLLECTION_BREAK] + "." + coords[VOLUME_BREAK] + "." + coords[BOOK_BREAK];
  var chx = coords[CHAPTER_BREAK] + "." + coords[SECTION_BREAK] + "." + coords[SCROLL_BREAK];

  return "<a href='" + getPhextUrl(chx, chy, chz) + "'>@" + chz + "/" + chy + "/" + chx + "</a>";
}

// -----------------------------------------------------------------------------------------------------------
function drawNode(coords, scroll) {
  var scrollID = coords[SCROLL_BREAK];

  var text = scroll;
  const sizeLimit = 250;
  if (scroll.length > sizeLimit)
  {
    text = scroll.substring(0, sizeLimit);
    text += "...";
  }
  
  var node = "<div class='node' onclick='loadNode(" + coordToString(coords) + ");'>" + coordinateHit(coords) + " <input type='button' onclick='editScroll(" + coords + ");' value='Edit' /><br />" + text + "</div>";

  return node;
}

// -----------------------------------------------------------------------------------------------------------
// @fn processScroll
// -----------------------------------------------------------------------------------------------------------
var totalScrolls = 1;
function processScroll(scroll) {  
  if (coordinatesMatch(target, coords)) {
    ta.value = scroll;
    scrollFound = true;
    var lineCount = scroll.split('\n').length;
    if (lineCount < 100) { ta.rows = lineCount; }
    else { ta.rows = 100; }
  }
  if (scroll.length > 0) {
    nodes[totalScrolls] = drawNode(coords, scroll);
    ++totalScrolls;
  }
  dimensionBreak(SCROLL_BREAK);
}

// -----------------------------------------------------------------------------------------------------------
function safeEncode(text) {
  if (!text || text.length < 1) { return ""; }
  return encodeURIComponent(text.replaceAll("'", "%27"));
}

function updateQR() {
  if (!qr) {
    qr = new QRCode(document.getElementById("qrcode"), {text: "https://phext.io/index.html", width: 640, height: 640});
    qrui.style.background = '#000';
  }  
  qr.clear();
  qr.makeCode(qurl);
}

// -----------------------------------------------------------------------------------------------------------
var timeoutDelay = 1000;
function getPhextUrl(x, y, z) {
  qurl = "https://phext.io/index.html?seed=" + safeEncode(sd.value) + "&cz=" + safeEncode(z) + "&cy=" + safeEncode(y) + "&cx=" + safeEncode(x) + "&" + phextMode + "=" + safeEncode(raw);
  lt.value = qurl;
  if (qrd) {
    clearTimeout(qrd);
  }
  qrd = setTimeout(updateQR, timeoutDelay);
  lts.innerHTML = "";
  return qurl;
}

// @fn greypill
function greypill() {
  gl.style.display = 'block';
  ns.style.display = 'block';
  wr.style.display = 'none';
  ta.style.display = 'none';
  cp.style.display = 'none';
  ha.style.display = 'none';
  sa.style.display = 'none';
  qrui.style.display = 'block';
  qrl.style.display = 'none';
  qt.style.display = 'none';
}

// -----------------------------------------------------------------------------------------------------------
// @fn redpill
// -----------------------------------------------------------------------------------------------------------
function redpill(store) {
  phextMode = 'r';
  st.innerHTML = "Follow the <a class='small' href='white-rabbit.html'>White Rabbit</a>.";
  gl.style.display = 'none';
  ns.style.display = 'none';
  wr.style.display = 'block';
  ta.style.display = 'block';
  cp.style.display = 'block';
  ha.style.display = 'block';
  sa.style.display = 'block';
  qrui.style.display = 'block';
  qrl.style.display = 'block';
  qt.style.display = 'block';

  updateCoordinate();
  loadPhext();
  var ignored = getPhextUrl(cx.value, cy.value, cz.value) + "#RedPill";

  if (store) {
    saveContent();
  }
}

// -----------------------------------------------------------------------------------------------------------
// @fn saveContent
// -----------------------------------------------------------------------------------------------------------
function saveContent() {
  localStorage.raw = ls.value;
  if (!sd.value || sd.value.trim().length == 0) {
    sd.value = "holiday";
  }
  if (!phexts[sd.value]) {
    var opt = document.createElement('option');
    opt.value = sd.value;
    opt.innerHTML = sd.value;
    opt.selected = true;
    se.appendChild(opt);
  }
  phexts[sd.value] = ls.value;
  localStorage.seed = sd.value;
  localStorage.phexts = JSON.stringify(phexts);
}

// -----------------------------------------------------------------------------------------------------------
// @fn bluepill
// -----------------------------------------------------------------------------------------------------------
function bluepill() {
  phextMode = 'b';
  gl.style.display = 'none';
  ns.style.display = 'none';
  wr.style.display = 'none';
  ta.style.display = 'none';
  cp.style.display = 'none';
  ha.style.display = 'none';
  sa.style.display = 'block';
  qrui.style.display = 'none';
  qrl.style.display = 'none';
  qt.style.display = 'none';

  ta.value = raw;
  ta.rows = raw.split('\n').length;

  st.innerHTML = "Believe";
  ta.value = raw;

  dgid("linker").href = getPhextUrl(cx.value, cy.value, cz.value) + "#BluePill";
}

// -----------------------------------------------------------------------------------------------------------
// @fn whitepill
// -----------------------------------------------------------------------------------------------------------
function whitepill() {
  window.open(upstream);
}

// -----------------------------------------------------------------------------------------------------------
// @fn copyUrl
// -----------------------------------------------------------------------------------------------------------
function copyUrl() {
  getPhextUrl();
  saveContent();
  navigator.clipboard.writeText(qurl);
  lts.innerHTML = "URL copied!";
}

// -----------------------------------------------------------------------------------------------------------
// @fn startup
// -----------------------------------------------------------------------------------------------------------
function startup() {
  dgid("pscrollbreak").value = SCROLL_BREAK;
  dgid("psectionbreak").value = SECTION_BREAK;
  dgid("pchapterbreak").value = CHAPTER_BREAK;
  dgid("pbookbreak").value = BOOK_BREAK;
  dgid("pvolumebreak").value = VOLUME_BREAK;
  dgid("pcollectionbreak").value = COLLECTION_BREAK;
  dgid("pseriesbreak").value = SERIES_BREAK;
  dgid("pshelfbreak").value = SHELF_BREAK;
  dgid("plibrarybreak").value = LIBRARY_BREAK;
  loadVars();

  var urlSearchParams = new URLSearchParams(window.location.search);
  var params = Object.fromEntries(urlSearchParams.entries());

  if (params.cz) {
    cz.value = params.cz;
  }
  if (params.cy) {
    cy.value = params.cy;
  }
  if (params.cx) {
    cx.value = params.cx;
  }

  if (params.seed) {
    localStorage.seed = params.seed;
    sd.value = params.seed;
  }

  if (localStorage.phexts) {
    phexts = JSON.parse(localStorage.phexts);
    Object.keys(phexts).forEach((key) => {
      var opt = document.createElement('option');
      opt.value = key;
      opt.innerHTML = key;
      if (key == sd.value) { opt.selected = true; }
      se.appendChild(opt);
    });
  }

  if (phexts && phexts[params.seed]) {
    localStorage.raw = localStorage.phexts[params.seed];
  }
  if (localStorage.raw) {
    raw = localStorage.raw;
  }

  ls.value = raw;

  if (params.r) {
    raw = params.r.replaceAll("%27", "'");
    ls.value = raw;
    redpill(false);
  }
  if (params.b) {
    raw = params.b.replaceAll("%27", "'");
    ls.value = raw;
    bluepill();
  }
}

// -----------------------------------------------------------------------------------------------------------
// @fn setEnterType
// -----------------------------------------------------------------------------------------------------------
function setEnterType(number, dimension, replacement) {
  enterKey = replacement;
  var handle = dgid("CB" + number + "_" + dimension);
  if (!handle) { return; }
  if (priorButton) {
    priorButton.style.borderStyle = '';
    priorButton.style.backgroundColor = '';
  }
  handle.style.borderStyle = 'inset';
  handle.style.backgroundColor = 'orange';
  replacementDescription = '&lt;' + handle.value + '&gt;';
  priorButton = handle;
}

// -----------------------------------------------------------------------------------------------------------
// @fn phextMods
// -----------------------------------------------------------------------------------------------------------
function phextMods(editor, e) {
  if (!remapFunctionKeys[editor]) {
    return;
  }
  for (var i = F1_KEY; i <= F10_KEY; ++i)
  {
    if (e.keyCode == i) {
      e.preventDefault();
      var button = dgid("CB" + editor + "_" + (e.keyCode - F1_KEY + 2));
      if (button) {
        button.click();
      }
      continue;
    }
  }
  if (!(e.key === "Enter")) {
    return;
  }
  e.preventDefault();
  var console = ls;
  var el = document.activeElement;

  const start = el.selectionStart;
  const before = el.value.substring(0, start);
  const after  = el.value.substring(el.selectionEnd, el.value.length);

  const sequence = (enterKey == LINE_BREAK) ? enterKey : enterKey + LINE_BREAK;
  el.value = (before + sequence + after);
  el.selectionStart = el.selectionEnd = start + 1;
  el.focus();
}

var remapFunctionKeys = new Array();
remapFunctionKeys[1] = true;
remapFunctionKeys[2] = true;

// -----------------------------------------------------------------------------------------------------------
// @fn toggle
// -----------------------------------------------------------------------------------------------------------
function toggle(editor) {
  var toggleButton = dgid("disabler" + editor);
  if (!toggleButton) { return; }
  const enabled = toggleButton.value === "Disable";
  toggleButton.value = enabled ? "Enable" : "Disable";
  remapFunctionKeys[editor] = enabled;
}

// -----------------------------------------------------------------------------------------------------------
// @fn chooseSeed
// -----------------------------------------------------------------------------------------------------------
function chooseSeed(seed) {
  sd.value = seed.value;
  ls.value = phexts[seed.value];
}

// -----------------------------------------------------------------------------------------------------------
// @fn removeSeed
// -----------------------------------------------------------------------------------------------------------
function removeSeed() {
  if (!phexts[sd.value]) {
    return;
  }
  delete phexts[sd.value];
  Object.keys(se.options).forEach((key) => {
    if (se.options[key] && se.options[key].value == sd.value) {
      se.options.remove(key);
    }
  });
  sd.value = se.options[se.selectedIndex].value;
  localStorage.seed = sd.value;
  localStorage.phexts = JSON.stringify(phexts);
}