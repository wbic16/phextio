"use strict";
// -----
// Phext
// -----
// (c) 2024 Phext, Inc.
// Licensed under the MIT License
//
// This project was ported from https://github.com/wbic16/libphext-rs/blob/master/src/phext.rs.
// Web Site: https://phext.io/
// -----------------------------------------------------------------------------------------------------------
// A slightly-modified variant of https://github.com/wbic16/libphext-node/blob/master/src/index.ts
var exports = new Array();
exports.Coordinate = exports.Phext = void 0;
var Phext = /** @class */ (function () {
    function Phext() {
        var _this = this;
        this.create_range = function (start, end) {
            return new Range(start, end);
        };
        this.default_coordinate = function () {
            return new Coordinate();
        };
        this.create_positioned_scroll = function (coord, scroll, next, remaining) {
            if (next === void 0) { next = ""; }
            if (remaining === void 0) { remaining = ""; }
            return new PositionedScroll(coord, scroll, new Coordinate(next), remaining);
        };
        this.check_for_cowbell = function (phext) {
            for (var i = 0; i < phext.length; ++i) {
                if (phext[i] == _this.MORE_COWBELL) {
                    return true;
                }
            }
            return false;
        };
        this.get_subspace_coordinates = function (subspace, target) {
            var walker = new Coordinate();
            var fallback = new Coordinate();
            var insertion = new Coordinate();
            var subspace_index = 0;
            var start = 0;
            var end = 0;
            var stage = 0;
            var max = subspace.length;
            while (subspace_index < max) {
                var next = subspace[subspace_index];
                if (stage == 0) {
                    if (walker.equals(target)) {
                        stage = 1;
                        start = subspace_index;
                        fallback = _this.to_coordinate(walker.to_string());
                        insertion = _this.to_coordinate(walker.to_string());
                    }
                    if (walker.less_than(target)) {
                        fallback = _this.to_coordinate(walker.to_string());
                        insertion = _this.to_coordinate(walker.to_string());
                    }
                }
                if (stage < 2 && walker.greater_than(target)) {
                    if (stage == 0) {
                        start = subspace_index - 1;
                    }
                    end = subspace_index - 1;
                    insertion = fallback;
                    stage = 2;
                }
                if (_this.is_phext_break(next)) {
                    if (next == _this.SCROLL_BREAK) {
                        walker.scroll_break();
                    }
                    if (next == _this.SECTION_BREAK) {
                        walker.section_break();
                    }
                    if (next == _this.CHAPTER_BREAK) {
                        walker.chapter_break();
                    }
                    if (next == _this.BOOK_BREAK) {
                        walker.book_break();
                    }
                    if (next == _this.VOLUME_BREAK) {
                        walker.volume_break();
                    }
                    if (next == _this.COLLECTION_BREAK) {
                        walker.collection_break();
                    }
                    if (next == _this.SERIES_BREAK) {
                        walker.series_break();
                    }
                    if (next == _this.SHELF_BREAK) {
                        walker.shelf_break();
                    }
                    if (next == _this.LIBRARY_BREAK) {
                        walker.library_break();
                    }
                }
                ++subspace_index;
            }
            if (stage == 1 && walker.equals(target)) {
                end = max;
                insertion = walker;
                stage = 2;
            }
            if (stage == 0) {
                start = max;
                end = max;
                insertion = walker;
            }
            var result = new OffsetsAndCoordinate(start, end, insertion, fallback);
            return result;
        };
        this.remove = function (phext, location) {
            var phase1 = _this.replace(phext, location, "");
            return _this.normalize(phase1);
        };
        this.create_summary = function (phext) {
            var limit = 32;
            if (phext.length == 0) {
                return "No Summary";
            }
            var parts = _this.phokenize(phext);
            var text = parts[0].scroll.split('\n')[0];
            if (text.length < 32) {
                limit = text.length;
            }
            var result = text.substring(0, limit);
            if (result.length < phext.length) {
                result += "...";
            }
            return result;
        };
        this.navmap = function (urlbase, phext) {
            var phokens = _this.phokenize(phext);
            var result = "";
            var max = phokens.length;
            if (max > 0) {
                result += "<ul>\n";
            }
            for (var i = 0; i < max; ++i) {
                var phoken = phokens[i];
                var urle = phoken.coord.to_urlencoded();
                var address = phoken.coord.to_string();
                var summary = _this.create_summary(phoken.scroll);
                result += "<li><a href=\"".concat(urlbase).concat(urle, "\">").concat(address, " ").concat(summary, "</a></li>\n");
            }
            if (max > 0) {
                result += "</ul>\n";
            }
            return result;
        };
        this.submap = function (urlbase, phext) {
            var phokens = _this.phokenize(phext);
            var result = "";
            var max = phokens.length;
            if (max > 0) {
                result += "<ul><li><a href=\"sub.html?restart=true\">Restart</a></li>\n";
            }
            for (var i = 0; i < max; ++i) {
                var phoken = phokens[i];
                var urle = phoken.coord.to_urlencoded();
                var address = phoken.coord.to_string();
                result += "<li><a href=\"".concat(urlbase).concat(urle, "\">").concat(address, "</a></li>\n");
            }
            if (max > 0) {
                result += "</ul>\n";
            }
            return result;
        };
        this.textmap = function (phext) {
            var phokens = _this.phokenize(phext);
            var result = '';
            for (var i = 0; i < phokens.length; ++i) {
                var phoken = phokens[i];
                result += "* ".concat(phoken.coord.to_string(), ": ").concat(_this.create_summary(phoken.scroll), "\n");
            }
            return result;
        };
        // disabled for now - xxh3-ts needs to be patched for the 0.8.2 release
        // xxhash-addon works, but fails in frontends like vite
        /*
        checksum = (phext: string): string => {
            const buffer = Buffer.from(phext);
            const hash = xxhash.XXH3_128(buffer);
            return hash.toString(16).padStart(32, '0');
        };
    
        manifest = (phext: string): string => {
            var phokens = this.phokenize(phext);
            for (var i = 0; i < phokens.length; ++i) {
                phokens[i].scroll = this.checksum(phokens[i].scroll);
            }
    
            return this.dephokenize(phokens);
        };*/
        this.soundex_internal = function (buffer) {
            var letter1 = "bpfv";
            var letter2 = "cskgjqxz";
            var letter3 = "dt";
            var letter4 = "l";
            var letter5 = "mn";
            var letter6 = "r";
            var value = 1; // 1-100
            for (var i = 0; i < buffer.length; ++i) {
                var c = buffer[i];
                if (letter1.indexOf(c) >= 0) {
                    value += 1;
                    continue;
                }
                if (letter2.indexOf(c) >= 0) {
                    value += 2;
                    continue;
                }
                if (letter3.indexOf(c) >= 0) {
                    value += 3;
                    continue;
                }
                if (letter4.indexOf(c) >= 0) {
                    value += 4;
                    continue;
                }
                if (letter5.indexOf(c) >= 0) {
                    value += 5;
                    continue;
                }
                if (letter6.indexOf(c) >= 0) {
                    value += 6;
                    continue;
                }
            }
            return value % 99;
        };
        this.soundex_v1 = function (phext) {
            var phokens = _this.phokenize(phext);
            var result = "";
            var coord = new Coordinate();
            for (var i = 0; i < phokens.length; ++i) {
                var soundex = _this.soundex_internal(phokens[i].scroll);
                result += coord.advance_to(phokens[i].coord);
                result += soundex;
            }
            return result;
        };
        this.index_phokens = function (phext) {
            var phokens = _this.phokenize(phext);
            var offset = 0;
            var coord = new Coordinate();
            var output = new Array();
            for (var i = 0; i < phokens.length; ++i) {
                var delims = coord.advance_to(phokens[i].coord);
                offset += delims.length;
                var new_coord = new Coordinate(coord.to_string());
                output.push(new PositionedScroll(new_coord, "".concat(offset), new_coord, ""));
                offset += phokens[i].scroll.length;
            }
            return output;
        };
        this.index = function (phext) {
            var output = _this.index_phokens(phext);
            return _this.dephokenize(output);
        };
        this.offset = function (phext, coord) {
            var output = _this.index_phokens(phext);
            var best = new Coordinate();
            var matched = false;
            var fetch_coord = coord;
            for (var i = 0; i < output.length; ++i) {
                var phoken = output[i];
                if (phoken.coord.less_than(coord) || phoken.coord.equals(coord)) {
                    best = phoken.coord;
                }
                if (phoken.coord == coord) {
                    matched = true;
                }
            }
            if (matched == false) {
                fetch_coord = best;
            }
            var index = _this.dephokenize(output);
            return parseInt(_this.fetch(index, fetch_coord));
        };
        this.replace = function (phext, location, scroll) {
            var phokens = _this.phokenize(phext);
            var coord = new Coordinate();
            var result = "";
            var inserted = scroll.length == 0;
            for (var i = 0; i < phokens.length; ++i) {
                var ith = phokens[i];
                if (ith.coord.equals(location)) {
                    if (!inserted) {
                        result += coord.advance_to(location);
                        result += scroll;
                        inserted = true;
                    }
                }
                else {
                    if (inserted == false && ith.coord.greater_than(location)) {
                        result += coord.advance_to(location);
                        result += scroll;
                        inserted = true;
                    }
                    if (ith.scroll.length > 0) {
                        result += coord.advance_to(ith.coord);
                        result += ith.scroll;
                    }
                }
            }
            if (inserted == false) {
                result += coord.advance_to(location);
                result += scroll;
                inserted = true;
            }
            return result;
        };
        this.range_replace = function (phext, location, scroll) {
            var parts_start = _this.get_subspace_coordinates(phext, location.start);
            var parts_end = _this.get_subspace_coordinates(phext, location.end);
            var start = parts_start.start;
            var end = parts_end.end;
            var max = phext.length;
            if (end > max) {
                end = max;
            }
            var left = phext.substring(0, start);
            var right = phext.substring(end);
            var result = left + scroll + right;
            return result;
        };
        this.insert = function (buffer, location, scroll) {
            var parts = _this.get_subspace_coordinates(buffer, location);
            var end = parts.end;
            var fixup = "";
            var subspace_coordinate = parts.coord;
            fixup += subspace_coordinate.advance_to(location);
            var left = buffer.substring(0, end);
            var right = buffer.substring(end);
            var result = left + fixup + scroll + right;
            return result;
        };
        this.next_scroll = function (phext, start) {
            var location = start;
            var output = "";
            var remaining = "";
            var pi = 0;
            var begin = start;
            var pmax = phext.length;
            while (pi < pmax) {
                var test = phext[pi];
                var dimension_break = false;
                if (test == _this.SCROLL_BREAK) {
                    location.scroll_break();
                    dimension_break = true;
                }
                if (test == _this.SECTION_BREAK) {
                    location.section_break();
                    dimension_break = true;
                }
                if (test == _this.CHAPTER_BREAK) {
                    location.chapter_break();
                    dimension_break = true;
                }
                if (test == _this.BOOK_BREAK) {
                    location.book_break();
                    dimension_break = true;
                }
                if (test == _this.VOLUME_BREAK) {
                    location.volume_break();
                    dimension_break = true;
                }
                if (test == _this.COLLECTION_BREAK) {
                    location.collection_break();
                    dimension_break = true;
                }
                if (test == _this.SERIES_BREAK) {
                    location.series_break();
                    dimension_break = true;
                }
                if (test == _this.SHELF_BREAK) {
                    location.shelf_break();
                    dimension_break = true;
                }
                if (test == _this.LIBRARY_BREAK) {
                    location.library_break();
                    dimension_break = true;
                }
                if (dimension_break) {
                    if (output.length > 0) {
                        pi += 1;
                        break;
                    }
                }
                else {
                    begin = new Coordinate(location.to_string());
                    output += phext[pi];
                }
                ++pi;
            }
            if (pi < pmax) {
                remaining = phext.substring(pi);
            }
            var out_scroll = new PositionedScroll(begin, output, location, remaining);
            return out_scroll;
        };
        this.phokenize = function (phext) {
            var result = Array();
            var coord = new Coordinate();
            var temp = phext;
            while (true) {
                var ith_result = _this.next_scroll(temp, coord);
                if (ith_result.scroll.length == 0) {
                    break;
                }
                result.push(ith_result);
                coord = ith_result.next;
                temp = ith_result.remaining;
                if (ith_result.remaining.length == 0) {
                    break;
                }
            }
            return result;
        };
        this.merge = function (left, right) {
            var tl = _this.phokenize(left);
            var tr = _this.phokenize(right);
            var tli = 0;
            var tri = 0;
            var maxtl = tl.length;
            var maxtr = tr.length;
            var result = "";
            var coord = new Coordinate();
            while (true) {
                var have_left = tli < maxtl;
                var have_right = tri < maxtr;
                var tl_lte = have_left && have_right && (tl[tli].coord.less_than(tr[tri].coord) ||
                    tl[tli].coord.equals(tr[tri].coord));
                var tr_lte = have_left && have_right && (tr[tri].coord.less_than(tl[tli].coord) ||
                    tr[tri].coord.equals(tl[tli].coord));
                var pick_left = have_left && (have_right == false || tl_lte);
                var pick_right = have_right && (have_left == false || tr_lte);
                if (pick_left) {
                    result += _this.append_scroll(tl[tli], coord);
                    coord = new Coordinate(tl[tli].coord.to_string());
                    ++tli;
                }
                if (pick_right) {
                    result += _this.append_scroll(tr[tri], coord);
                    coord = new Coordinate(tr[tri].coord.to_string());
                    ++tri;
                }
                if (pick_left == false && pick_right == false) {
                    break;
                }
            }
            return result;
        };
        this.fetch = function (phext, target) {
            var parts = _this.get_subspace_coordinates(phext, target);
            var start = parts.start;
            var end = parts.end;
            if (end > start) {
                var result = phext.substring(start, end);
                return result;
            }
            return "";
        };
        this.expand = function (phext) {
            var result = "";
            for (var i = 0; i < phext.length; ++i) {
                var next = phext[i];
                switch (next) {
                    case _this.LINE_BREAK:
                        result += _this.SCROLL_BREAK;
                        break;
                    case _this.SCROLL_BREAK:
                        result += _this.SECTION_BREAK;
                        break;
                    case _this.SECTION_BREAK:
                        result += _this.CHAPTER_BREAK;
                        break;
                    case _this.CHAPTER_BREAK:
                        result += _this.BOOK_BREAK;
                        break;
                    case _this.BOOK_BREAK:
                        result += _this.VOLUME_BREAK;
                        break;
                    case _this.VOLUME_BREAK:
                        result += _this.COLLECTION_BREAK;
                        break;
                    case _this.COLLECTION_BREAK:
                        result += _this.SERIES_BREAK;
                        break;
                    case _this.SERIES_BREAK:
                        result += _this.SHELF_BREAK;
                        break;
                    case _this.SHELF_BREAK:
                        result += _this.LIBRARY_BREAK;
                        break;
                    default:
                        result += phext[i];
                        break;
                    // nop: phext.LIBRARY_BREAK
                }
            }
            return result;
        };
        this.contract = function (phext) {
            var result = "";
            for (var i = 0; i < phext.length; ++i) {
                var next = phext[i];
                switch (next) {
                    // nop: case phext.LINE_BREAK
                    case _this.SCROLL_BREAK:
                        result += _this.LINE_BREAK;
                        break;
                    case _this.SECTION_BREAK:
                        result += _this.SCROLL_BREAK;
                        break;
                    case _this.CHAPTER_BREAK:
                        result += _this.SECTION_BREAK;
                        break;
                    case _this.BOOK_BREAK:
                        result += _this.CHAPTER_BREAK;
                        break;
                    case _this.VOLUME_BREAK:
                        result += _this.BOOK_BREAK;
                        break;
                    case _this.COLLECTION_BREAK:
                        result += _this.VOLUME_BREAK;
                        break;
                    case _this.SERIES_BREAK:
                        result += _this.COLLECTION_BREAK;
                        break;
                    case _this.SHELF_BREAK:
                        result += _this.SERIES_BREAK;
                        break;
                    case _this.LIBRARY_BREAK:
                        result += _this.SHELF_BREAK;
                        break;
                    default:
                        result += phext[i];
                        break;
                }
            }
            return result;
        };
        this.dephokenize = function (phokens) {
            var result = "";
            var coord = new Coordinate();
            for (var i = 0; i < phokens.length; ++i) {
                var ph = phokens[i];
                if (ph.scroll && ph.scroll.length > 0) {
                    result += coord.advance_to(ph.coord);
                    result += ph.scroll;
                }
            }
            return result;
        };
        this.append_scroll = function (token, coord) {
            var output = coord.advance_to(token.coord);
            output += token.scroll;
            return output;
        };
        this.subtract = function (left, right) {
            var pl = _this.phokenize(left);
            var pr = _this.phokenize(right);
            var result = "";
            var pri = 0;
            var max = pr.length;
            var coord = new Coordinate();
            for (var i = 0; i < pl.length; ++i) {
                var token = pl[i];
                var do_append = false;
                if (pri == max) {
                    do_append = true;
                }
                if (pri < max) {
                    var compare = pr[pri];
                    if (token.coord.less_than(compare.coord)) {
                        do_append = true;
                    }
                    else if (token.coord.equals(compare.coord)) {
                        ++pri;
                    }
                }
                if (do_append) {
                    result += _this.append_scroll(token, coord);
                    coord.advance_to(token.coord);
                }
            }
            return result;
        };
        this.is_phext_break = function (byte) {
            return byte == _this.LINE_BREAK ||
                byte == _this.SCROLL_BREAK ||
                byte == _this.SECTION_BREAK ||
                byte == _this.CHAPTER_BREAK ||
                byte == _this.BOOK_BREAK ||
                byte == _this.VOLUME_BREAK ||
                byte == _this.COLLECTION_BREAK ||
                byte == _this.SERIES_BREAK ||
                byte == _this.SHELF_BREAK ||
                byte == _this.LIBRARY_BREAK;
        };
        this.normalize = function (phext) {
            var arr = _this.phokenize(phext);
            return _this.dephokenize(arr);
        };
        this.to_coordinate = function (address) {
            var result = new Coordinate();
            var index = 0;
            var value = 0;
            var exp = 10;
            for (var i = 0; i < address.length; ++i) {
                var byte = address[i];
                if (byte == _this.ADDRESS_MICRO_BREAK ||
                    byte == _this.ADDRESS_MACRO_BREAK ||
                    byte == _this.ADDRESS_MACRO_ALT) {
                    switch (index) {
                        case 1:
                            result.z.library = value;
                            index += 1;
                            break;
                        case 2:
                            result.z.shelf = value;
                            index += 1;
                            break;
                        case 3:
                            result.z.series = value;
                            index += 1;
                            break;
                        case 4:
                            result.y.collection = value;
                            index += 1;
                            break;
                        case 5:
                            result.y.volume = value;
                            index += 1;
                            break;
                        case 6:
                            result.y.book = value;
                            index += 1;
                            break;
                        case 7:
                            result.x.chapter = value;
                            index += 1;
                            break;
                        case 8:
                            result.x.section = value;
                            index += 1;
                            break;
                    }
                    value = 0;
                }
                if (byte >= '0' && byte <= '9') {
                    value = exp * value + parseInt(byte);
                    if (index == 0) {
                        index = 1;
                    }
                }
            }
            if (index > 0) {
                result.x.scroll = value;
            }
            return result;
        };
        this.COORDINATE_MINIMUM = 1;
        this.COORDINATE_MAXIMUM = 100;
        this.LIBRARY_BREAK = '\x01'; // 11D Break - replaces start of header
        this.MORE_COWBELL = '\x07'; // i've got a fever, and the only prescription...is more cowbell!
        this.LINE_BREAK = '\x0A'; // same as plain text \o/
        this.SCROLL_BREAK = '\x17'; // 3D Break - replaces End Transmission Block
        this.SECTION_BREAK = '\x18'; // 4D Break - replaces Cancel Block
        this.CHAPTER_BREAK = '\x19'; // 5D Break - replaces End of Tape
        this.BOOK_BREAK = '\x1A'; // 6D Break - replaces Substitute
        this.VOLUME_BREAK = '\x1C'; // 7D Break - replaces file separator
        this.COLLECTION_BREAK = '\x1D'; // 8D Break - replaces group separator
        this.SERIES_BREAK = '\x1E'; // 9D Break - replaces record separator
        this.SHELF_BREAK = '\x1F'; // 10D Break - replaces unit separator
        this.ADDRESS_MICRO_BREAK = '.'; // delimiter for micro-coordinates
        this.ADDRESS_MACRO_BREAK = '/'; // delimiter for macro-coordinates
        this.ADDRESS_MACRO_ALT = ';'; // also allow ';' for url encoding
    }
    return Phext;
}());
exports.Phext = Phext;
var Coordinate = /** @class */ (function () {
    function Coordinate(value) {
        if (value === void 0) { value = ""; }
        var _this = this;
        this.equals = function (other) {
            return _this.z.library == other.z.library &&
                _this.z.shelf == other.z.shelf &&
                _this.z.series == other.z.series &&
                _this.y.collection == other.y.collection &&
                _this.y.volume == other.y.volume &&
                _this.y.book == other.y.book &&
                _this.x.chapter == other.x.chapter &&
                _this.x.section == other.x.section &&
                _this.x.scroll == other.x.scroll;
        };
        this.less_than = function (other) {
            if (_this.z.library < other.z.library) {
                return true;
            }
            if (_this.z.library > other.z.library) {
                return false;
            }
            if (_this.z.shelf < other.z.shelf) {
                return true;
            }
            if (_this.z.shelf > other.z.shelf) {
                return false;
            }
            if (_this.z.series < other.z.series) {
                return true;
            }
            if (_this.z.series > other.z.series) {
                return false;
            }
            if (_this.y.collection < other.y.collection) {
                return true;
            }
            if (_this.y.collection > other.y.collection) {
                return false;
            }
            if (_this.y.volume < other.y.volume) {
                return true;
            }
            if (_this.y.volume > other.y.volume) {
                return false;
            }
            if (_this.y.book < other.y.book) {
                return true;
            }
            if (_this.y.book > other.y.book) {
                return false;
            }
            if (_this.x.chapter < other.x.chapter) {
                return true;
            }
            if (_this.x.chapter > other.x.chapter) {
                return false;
            }
            if (_this.x.section < other.x.section) {
                return true;
            }
            if (_this.x.section > other.x.section) {
                return false;
            }
            if (_this.x.scroll < other.x.scroll) {
                return true;
            }
            return false;
        };
        this.greater_than = function (other) {
            if (_this.z.library > other.z.library) {
                return true;
            }
            if (_this.z.library < other.z.library) {
                return false;
            }
            if (_this.z.shelf > other.z.shelf) {
                return true;
            }
            if (_this.z.shelf < other.z.shelf) {
                return false;
            }
            if (_this.z.series > other.z.series) {
                return true;
            }
            if (_this.z.series < other.z.series) {
                return false;
            }
            if (_this.y.collection > other.y.collection) {
                return true;
            }
            if (_this.y.collection < other.y.collection) {
                return false;
            }
            if (_this.y.volume > other.y.volume) {
                return true;
            }
            if (_this.y.volume < other.y.volume) {
                return false;
            }
            if (_this.y.book > other.y.book) {
                return true;
            }
            if (_this.y.book < other.y.book) {
                return false;
            }
            if (_this.x.chapter > other.x.chapter) {
                return true;
            }
            if (_this.x.chapter < other.x.chapter) {
                return false;
            }
            if (_this.x.section > other.x.section) {
                return true;
            }
            if (_this.x.section < other.x.section) {
                return false;
            }
            if (_this.x.scroll > other.x.scroll) {
                return true;
            }
            return false;
        };
        this.advance_to = function (other) {
            var output = "";
            while (_this.less_than(other)) {
                if (_this.z.library < other.z.library) {
                    output += __internal_phext.LIBRARY_BREAK;
                    _this.library_break();
                    continue;
                }
                if (_this.z.shelf < other.z.shelf) {
                    output += __internal_phext.SHELF_BREAK;
                    _this.shelf_break();
                    continue;
                }
                if (_this.z.series < other.z.series) {
                    output += __internal_phext.SERIES_BREAK;
                    _this.series_break();
                    continue;
                }
                if (_this.y.collection < other.y.collection) {
                    output += __internal_phext.COLLECTION_BREAK;
                    _this.collection_break();
                    continue;
                }
                if (_this.y.volume < other.y.volume) {
                    output += __internal_phext.VOLUME_BREAK;
                    _this.volume_break();
                    continue;
                }
                if (_this.y.book < other.y.book) {
                    output += __internal_phext.BOOK_BREAK;
                    _this.book_break();
                    continue;
                }
                if (_this.x.chapter < other.x.chapter) {
                    output += __internal_phext.CHAPTER_BREAK;
                    _this.chapter_break();
                    continue;
                }
                if (_this.x.section < other.x.section) {
                    output += __internal_phext.SECTION_BREAK;
                    _this.section_break();
                    continue;
                }
                if (_this.x.scroll < other.x.scroll) {
                    output += __internal_phext.SCROLL_BREAK;
                    _this.scroll_break();
                    continue;
                }
            }
            return output;
        };
        this.validate_index = function (index) {
            return index >= __internal_phext.COORDINATE_MINIMUM && index <= __internal_phext.COORDINATE_MAXIMUM;
        };
        this.validate_coordinate = function () {
            var ok = _this.validate_index(_this.z.library) &&
                _this.validate_index(_this.z.shelf) &&
                _this.validate_index(_this.z.series) &&
                _this.validate_index(_this.y.collection) &&
                _this.validate_index(_this.y.volume) &&
                _this.validate_index(_this.y.book) &&
                _this.validate_index(_this.x.chapter) &&
                _this.validate_index(_this.x.section) &&
                _this.validate_index(_this.x.scroll);
            return ok;
        };
        this.to_string = function () {
            return "".concat(_this.z.library, ".").concat(_this.z.shelf, ".").concat(_this.z.series, "/").concat(_this.y.collection, ".").concat(_this.y.volume, ".").concat(_this.y.book, "/").concat(_this.x.chapter, ".").concat(_this.x.section, ".").concat(_this.x.scroll);
        };
        this.to_urlencoded = function () {
            return _this.to_string().replace(/\//g, ';');
        };
        this.advance_coordinate = function (index) {
            var next = index + 1;
            if (next < __internal_phext.COORDINATE_MAXIMUM) {
                return next;
            }
            return index;
        };
        this.library_break = function () {
            _this.z.library = _this.advance_coordinate(_this.z.library);
            _this.z.shelf = 1;
            _this.z.series = 1;
            _this.y = new YCoordinate();
            _this.x = new XCoordinate();
        };
        this.shelf_break = function () {
            _this.z.shelf = _this.advance_coordinate(_this.z.shelf);
            _this.z.series = 1;
            _this.y = new YCoordinate();
            _this.x = new XCoordinate();
        };
        this.series_break = function () {
            _this.z.series = _this.advance_coordinate(_this.z.series);
            _this.y = new YCoordinate();
            _this.x = new XCoordinate();
        };
        this.collection_break = function () {
            _this.y.collection = _this.advance_coordinate(_this.y.collection);
            _this.y.volume = 1;
            _this.y.book = 1;
            _this.x = new XCoordinate();
        };
        this.volume_break = function () {
            _this.y.volume = _this.advance_coordinate(_this.y.volume);
            _this.y.book = 1;
            _this.x = new XCoordinate();
        };
        this.book_break = function () {
            _this.y.book = _this.advance_coordinate(_this.y.book);
            _this.x = new XCoordinate();
        };
        this.chapter_break = function () {
            _this.x.chapter = _this.advance_coordinate(_this.x.chapter);
            _this.x.section = 1;
            _this.x.scroll = 1;
        };
        this.section_break = function () {
            _this.x.section = _this.advance_coordinate(_this.x.section);
            _this.x.scroll = 1;
        };
        this.scroll_break = function () {
            _this.x.scroll = _this.advance_coordinate(_this.x.scroll);
        };
        this.z = new ZCoordinate(1, 1, 1);
        this.y = new YCoordinate(1, 1, 1);
        this.x = new XCoordinate(1, 1, 1);
        if (value.length > 0) {
            var parts = value.replace(/\//g, '.').split('.');
            if (parts.length >= 1) {
                this.z.library = parseInt(parts[0]);
                if (this.z.library < 1) {
                    this.z.library = 1;
                }
            }
            if (parts.length >= 2) {
                this.z.shelf = parseInt(parts[1]);
                if (this.z.shelf < 1) {
                    this.z.shelf = 1;
                }
            }
            if (parts.length >= 3) {
                this.z.series = parseInt(parts[2]);
                if (this.z.series < 1) {
                    this.z.series = 1;
                }
            }
            if (parts.length >= 4) {
                this.y.collection = parseInt(parts[3]);
                if (this.y.collection < 1) {
                    this.y.collection = 1;
                }
            }
            if (parts.length >= 5) {
                this.y.volume = parseInt(parts[4]);
                if (this.y.volume < 1) {
                    this.y.volume = 1;
                }
            }
            if (parts.length >= 6) {
                this.y.book = parseInt(parts[5]);
                if (this.y.book < 1) {
                    this.y.book = 1;
                }
            }
            if (parts.length >= 7) {
                this.x.chapter = parseInt(parts[6]);
                if (this.x.chapter < 1) {
                    this.x.chapter = 1;
                }
            }
            if (parts.length >= 8) {
                this.x.section = parseInt(parts[7]);
                if (this.x.section < 1) {
                    this.x.section = 1;
                }
            }
            if (parts.length >= 9) {
                this.x.scroll = parseInt(parts[8]);
                if (this.x.scroll < 1) {
                    this.x.scroll = 1;
                }
            }
        }
    }
    return Coordinate;
}());
exports.Coordinate = Coordinate;
// internal static data
var __internal_phext = new Phext(); // for constants
// internal classes
var OffsetsAndCoordinate = /** @class */ (function () {
    function OffsetsAndCoordinate(start, end, coord, fallback) {
        this.start = start;
        this.end = end;
        this.coord = coord;
        this.fallback = fallback;
    }
    return OffsetsAndCoordinate;
}());
var PositionedScroll = /** @class */ (function () {
    function PositionedScroll(coord, scroll, next, remaining) {
        this.coord = coord;
        this.scroll = scroll;
        this.next = next;
        this.remaining = remaining;
    }
    return PositionedScroll;
}());
var Range = /** @class */ (function () {
    function Range(start, end) {
        this.start = start;
        this.end = end;
    }
    return Range;
}());
var ZCoordinate = /** @class */ (function () {
    function ZCoordinate(library, shelf, series) {
        if (library === void 0) { library = 1; }
        if (shelf === void 0) { shelf = 1; }
        if (series === void 0) { series = 1; }
        this.library = library;
        this.shelf = shelf;
        this.series = series;
    }
    return ZCoordinate;
}());
var YCoordinate = /** @class */ (function () {
    function YCoordinate(collection, volume, book) {
        if (collection === void 0) { collection = 1; }
        if (volume === void 0) { volume = 1; }
        if (book === void 0) { book = 1; }
        this.collection = collection;
        this.volume = volume;
        this.book = book;
    }
    return YCoordinate;
}());
var XCoordinate = /** @class */ (function () {
    function XCoordinate(chapter, section, scroll) {
        if (chapter === void 0) { chapter = 1; }
        if (section === void 0) { section = 1; }
        if (scroll === void 0) { scroll = 1; }
        this.chapter = chapter;
        this.section = section;
        this.scroll = scroll;
    }
    return XCoordinate;
}());
