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

export class Phext {
	COORDINATE_MINIMUM: number;
	COORDINATE_MAXIMUM: number;
	LIBRARY_BREAK: string;
	MORE_COWBELL: string;
	LINE_BREAK: string;
	SCROLL_BREAK: string;
	SECTION_BREAK: string;
	CHAPTER_BREAK: string;
	BOOK_BREAK: string;
	VOLUME_BREAK: string;
	COLLECTION_BREAK: string;
	SERIES_BREAK: string;
	SHELF_BREAK: string;
	ADDRESS_MICRO_BREAK: string;
	ADDRESS_MACRO_BREAK: string;
	ADDRESS_MACRO_ALT: string;
	constructor() {
		this.COORDINATE_MINIMUM = 1;
		this.COORDINATE_MAXIMUM = 100;
        this.LIBRARY_BREAK       = '\x01'; // 11D Break - replaces start of header
        this.MORE_COWBELL        = '\x07'; // i've got a fever, and the only prescription...is more cowbell!
        this.LINE_BREAK          = '\x0A'; // same as plain text \o/
        this.SCROLL_BREAK        = '\x17'; // 3D Break - replaces End Transmission Block
        this.SECTION_BREAK       = '\x18'; // 4D Break - replaces Cancel Block
        this.CHAPTER_BREAK       = '\x19'; // 5D Break - replaces End of Tape
        this.BOOK_BREAK          = '\x1A'; // 6D Break - replaces Substitute
        this.VOLUME_BREAK        = '\x1C'; // 7D Break - replaces file separator
        this.COLLECTION_BREAK    = '\x1D'; // 8D Break - replaces group separator
        this.SERIES_BREAK        = '\x1E'; // 9D Break - replaces record separator
        this.SHELF_BREAK         = '\x1F'; // 10D Break - replaces unit separator
        this.ADDRESS_MICRO_BREAK = '.'; // delimiter for micro-coordinates
        this.ADDRESS_MACRO_BREAK = '/'; // delimiter for macro-coordinates
        this.ADDRESS_MACRO_ALT   = ';';   // also allow ';' for url encoding
	}

	create_range = (start: Coordinate, end: Coordinate): Range => {
		return new Range(start, end);
	};

	default_coordinate = (): Coordinate => {
		return new Coordinate();
	}

	create_positioned_scroll = (coord: Coordinate, scroll: string, next: string = "", remaining: string = ""): PositionedScroll => {
		return new PositionedScroll(coord, scroll, new Coordinate(next), remaining);
	}

	check_for_cowbell = (phext: string): boolean => {
		for (var i = 0; i < phext.length; ++i) {
			if (phext[i] == this.MORE_COWBELL) {
				return true;
			}
		}
	
	  	return false;
	};

	get_subspace_coordinates = (subspace: string, target: Coordinate): OffsetsAndCoordinate => {
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
					fallback = this.to_coordinate(walker.to_string());
					insertion = this.to_coordinate(walker.to_string());
      			}
      			if (walker.less_than(target)) {
					fallback = this.to_coordinate(walker.to_string());
					insertion = this.to_coordinate(walker.to_string());
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

    		if (this.is_phext_break(next)) {
      			if (next == this.SCROLL_BREAK)     { walker.scroll_break();     }
      			if (next == this.SECTION_BREAK)    { walker.section_break();    }
      			if (next == this.CHAPTER_BREAK)    { walker.chapter_break();    }
      			if (next == this.BOOK_BREAK)       { walker.book_break();       }
      			if (next == this.VOLUME_BREAK)     { walker.volume_break();     }
      			if (next == this.COLLECTION_BREAK) { walker.collection_break(); }
      			if (next == this.SERIES_BREAK)     { walker.series_break();     }
      			if (next == this.SHELF_BREAK)      { walker.shelf_break();      }
      			if (next == this.LIBRARY_BREAK)    { walker.library_break();    }
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

	remove = (phext: string, location: Coordinate): string => {
		var phase1 = this.replace(phext, location, "");
  		return this.normalize(phase1);
	};

	create_summary = (phext: string): string => {
  		var limit = 32;
		if (phext.length == 0) { return "No Summary"; }

		const parts = this.phokenize(phext);
		const text = parts[0].scroll.split('\n')[0];
		if (text.length < 32) { limit = text.length; }
		var result = text.substring(0, limit);
		if (result.length < phext.length) {
			result += "...";
		}
		return result;
	};

	navmap = (urlbase: string, phext: string): string => {
		const phokens = this.phokenize(phext);
		var result = "";
		const max = phokens.length;
		if (max > 0) {
			result += "<ul>\n";
	   	}
		for (var i = 0; i < max; ++i) {
			const phoken = phokens[i];
			const urle = phoken.coord.to_urlencoded();
			const address = phoken.coord.to_string();
			const summary = this.create_summary(phoken.scroll);
			result += `<li><a href=\"${urlbase}${urle}\">${address} ${summary}</a></li>\n`;
		}
  		if (max > 0) {
    		result += "</ul>\n";
  		}

  		return result;
	};

	textmap = (phext: string): string => {
		var phokens = this.phokenize(phext);
  		var result = '';
  		for (var i = 0; i < phokens.length; ++i) {
			var phoken = phokens[i];
    		result += `* ${phoken.coord.to_string()}: ${this.create_summary(phoken.scroll)}\n`;
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

	soundex_internal = (buffer: string): number => {
		var letter1 = "bpfv";
		var letter2 = "cskgjqxz";
		var letter3 = "dt";
		var letter4 = "l";
		var letter5 = "mn";
		var letter6 = "r";

		var value = 1; // 1-100
		for (var i = 0; i < buffer.length; ++i) {
		  var c = buffer[i];
		  if (letter1.indexOf(c) >= 0) { value += 1; continue; }
		  if (letter2.indexOf(c) >= 0) { value += 2; continue; }
		  if (letter3.indexOf(c) >= 0) { value += 3; continue; }
		  if (letter4.indexOf(c) >= 0) { value += 4; continue; }
		  if (letter5.indexOf(c) >= 0) { value += 5; continue; }
		  if (letter6.indexOf(c) >= 0) { value += 6; continue; }
		}

		return value % 99;
	};

	soundex_v1 = (phext: string): string => {
		var phokens = this.phokenize(phext);

		var result = "";
		var coord = new Coordinate();
		for (var i = 0; i < phokens.length; ++i) {
			const soundex = this.soundex_internal(phokens[i].scroll);
			result += coord.advance_to(phokens[i].coord);
			result += soundex;
		}

		return result;
	};

	index_phokens = (phext: string): Array<PositionedScroll> => {
		var phokens = this.phokenize(phext);
		var offset = 0;
		var coord = new Coordinate();
		var output = new Array();
		for (var i = 0; i < phokens.length; ++i) {
		  const delims = coord.advance_to(phokens[i].coord);
		  offset += delims.length;
		  const new_coord = new Coordinate(coord.to_string());
		  output.push(new PositionedScroll(new_coord, `${offset}`, new_coord, ""));
		  offset += phokens[i].scroll.length;
		}

		return output;
	};

	index = (phext: string): string => {
		var output = this.index_phokens(phext);
		return this.dephokenize(output);
	};

	offset = (phext: string, coord: Coordinate): number => {
		var output = this.index_phokens(phext);

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
		let index = this.dephokenize(output);

		return parseInt(this.fetch(index, fetch_coord));
	};

	replace = (phext: string, location: Coordinate, scroll: string): string => {
		const phokens = this.phokenize(phext);
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
			} else {
				if (inserted == false && ith.coord.greater_than(location))
				{
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
		
		if (inserted == false)
		{
			result += coord.advance_to(location);
			result += scroll;
			inserted = true;
		}

		return result;
	};

	range_replace = (phext: string, location: Range, scroll: string): string => {
  		var parts_start = this.get_subspace_coordinates(phext, location.start);
  		var parts_end = this.get_subspace_coordinates(phext, location.end);
  		var start = parts_start.start;
  		var end = parts_end.end;
		const max = phext.length;
		if (end > max) { end = max; }
		const left = phext.substring(0, start);
		const right = phext.substring(end);
		const result = left + scroll + right;
		return result;
	};

	insert = (buffer: string, location: Coordinate, scroll: string): string => {
  		var parts = this.get_subspace_coordinates(buffer, location);
  		const end = parts.end;
  		var fixup = "";
  		var subspace_coordinate = parts.coord;

		fixup += subspace_coordinate.advance_to(location);

  		const left = buffer.substring(0, end);
  		const right = buffer.substring(end);
		const result = left + fixup + scroll + right;
		return result;
	};

	next_scroll = (phext: string, start: Coordinate): PositionedScroll => {
		var location = start;
  		var output = "";
  		var remaining = "";
		var pi = 0;
		var begin = start;
  		var pmax = phext.length;
  		while (pi < pmax) {
    		var test = phext[pi];
    		var dimension_break = false;
    		if (test == this.SCROLL_BREAK)     { location.scroll_break();     dimension_break = true; }
    		if (test == this.SECTION_BREAK)    { location.section_break();    dimension_break = true; }
    		if (test == this.CHAPTER_BREAK)    { location.chapter_break();    dimension_break = true; }
    		if (test == this.BOOK_BREAK)       { location.book_break();       dimension_break = true; }
    		if (test == this.VOLUME_BREAK)     { location.volume_break();     dimension_break = true; }
    		if (test == this.COLLECTION_BREAK) { location.collection_break(); dimension_break = true; }
    		if (test == this.SERIES_BREAK)     { location.series_break();     dimension_break = true; }
    		if (test == this.SHELF_BREAK)      { location.shelf_break();      dimension_break = true; }
    		if (test == this.LIBRARY_BREAK)    { location.library_break();    dimension_break = true; }

    		if (dimension_break) {
      			if (output.length > 0) {
        			pi += 1;
        			break;
      			}
    		} else {
      			begin = new Coordinate(location.to_string());
      			output += phext[pi];
    		}
    		++pi;
  		}

		if (pi < pmax) {
			remaining = phext.substring(pi);
		}

  		const out_scroll = new PositionedScroll(begin, output, location, remaining);
  		return out_scroll;
	};

	phokenize = (phext: string): Array<PositionedScroll> => {
		var result = Array();
  		var coord = new Coordinate();
		
		var temp = phext;
		while (true) {
			var ith_result = this.next_scroll(temp, coord);
			if (ith_result.scroll.length == 0)
			{
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

	merge = (left: string, right: string): string => {
		const tl = this.phokenize(left);
		const tr = this.phokenize(right);
		var tli = 0;
		var tri = 0;
 		const maxtl = tl.length;
  		const maxtr = tr.length;
  		var result = "";
  		var coord = new Coordinate();

  		while (true) {
    		const have_left = tli < maxtl;
    		const have_right = tri < maxtr;
    
			const tl_lte = have_left && have_right && (tl[tli].coord.less_than(tr[tri].coord) ||
			               tl[tli].coord.equals(tr[tri].coord));
			const tr_lte = have_left && have_right && (tr[tri].coord.less_than(tl[tli].coord) ||
			               tr[tri].coord.equals(tl[tli].coord));

    		const pick_left = have_left && (have_right == false || tl_lte);
    		const pick_right = have_right && (have_left == false || tr_lte);

    		if (pick_left) {
      			result += this.append_scroll(tl[tli], coord);
      			coord = new Coordinate(tl[tli].coord.to_string());
      			++tli;
    		}
    		if (pick_right) {
      			result += this.append_scroll(tr[tri], coord);				
      			coord = new Coordinate(tr[tri].coord.to_string());
    			++tri;
    		}

    		if (pick_left == false && pick_right == false) {
    			break;
    		}
  		}

  		return result;
	};

	fetch = (phext: string, target: Coordinate): string => {
  		var parts = this.get_subspace_coordinates(phext, target);
  		var start = parts.start;
  		var end = parts.end;

  		if (end > start)
  		{
			var result = phext.substring(start, end);
			return result;
  		}

  		return "";
	};

	expand = (phext: string): string => {
		var result = "";
		for (var i = 0; i < phext.length; ++i) {
			var next = phext[i];
			switch (next) {
				case this.LINE_BREAK: result += this.SCROLL_BREAK; break;
				case this.SCROLL_BREAK: result += this.SECTION_BREAK; break;
				case this.SECTION_BREAK: result += this.CHAPTER_BREAK; break;
				case this.CHAPTER_BREAK: result += this.BOOK_BREAK; break;
				case this.BOOK_BREAK: result += this.VOLUME_BREAK; break;
				case this.VOLUME_BREAK: result += this.COLLECTION_BREAK; break;
				case this.COLLECTION_BREAK: result += this.SERIES_BREAK; break;
				case this.SERIES_BREAK: result += this.SHELF_BREAK; break;
				case this.SHELF_BREAK: result += this.LIBRARY_BREAK; break;
				default: result += phext[i]; break;
				// nop: phext.LIBRARY_BREAK
			}
		}		
		return result;
	};

	contract = (phext: string): string => {
		var result = "";
		for (var i = 0; i < phext.length; ++i) {
			var next = phext[i];
			switch (next)
			{
				// nop: case phext.LINE_BREAK
				case this.SCROLL_BREAK: result += this.LINE_BREAK; break;
				case this.SECTION_BREAK: result += this.SCROLL_BREAK; break;
				case this.CHAPTER_BREAK: result += this.SECTION_BREAK; break;
				case this.BOOK_BREAK: result += this.CHAPTER_BREAK; break;
				case this.VOLUME_BREAK: result += this.BOOK_BREAK; break;
				case this.COLLECTION_BREAK: result += this.VOLUME_BREAK; break;
				case this.SERIES_BREAK: result += this.COLLECTION_BREAK; break;
				case this.SHELF_BREAK: result += this.SERIES_BREAK; break;
				case this.LIBRARY_BREAK: result += this.SHELF_BREAK; break;
				default: result += phext[i]; break;
			}
		}
		
		return result;
	};

	dephokenize = (phokens: Array<PositionedScroll>): string => {
		var result = "";
  		var coord = new Coordinate();
		for (var i = 0; i < phokens.length; ++i)
		{
			var ph = phokens[i];
			if (ph.scroll && ph.scroll.length > 0) {
				result += coord.advance_to(ph.coord);
				result += ph.scroll;
			}
		}
  		return result;
	};

	append_scroll = (token: PositionedScroll, coord: Coordinate): string => {
		var output = coord.advance_to(token.coord);
		output += token.scroll;
  		return output;
	};

	subtract = (left: string, right: string): string => {
		const pl = this.phokenize(left);
  		const pr = this.phokenize(right);
  		var result = "";
  		var pri = 0;
  		const max = pr.length;
		var coord = new Coordinate();
  		for (var i = 0; i < pl.length; ++i) {
			var token = pl[i];
    		var do_append = false;
    		if (pri == max) {
      			do_append = true;
    		}

    		if (pri < max) {
      			let compare = pr[pri];
      			if (token.coord.less_than(compare.coord)) {
        			do_append = true;
      			} else if (token.coord.equals(compare.coord)) {
        			++pri;
      			}
    		}

    		if (do_append) {
      			result += this.append_scroll(token, coord);
      			coord.advance_to(token.coord);
    		}
  		}

  		return result;
	};

	is_phext_break = (byte: string): boolean => {
		return byte == this.LINE_BREAK ||
				byte == this.SCROLL_BREAK ||
				byte == this.SECTION_BREAK ||
				byte == this.CHAPTER_BREAK ||
				byte == this.BOOK_BREAK ||
				byte == this.VOLUME_BREAK ||
				byte == this.COLLECTION_BREAK ||
				byte == this.SERIES_BREAK ||
				byte == this.SHELF_BREAK ||
				byte == this.LIBRARY_BREAK;
	};

	normalize = (phext: string): string => {
		var arr = this.phokenize(phext);
		return this.dephokenize(arr);
	};

	to_coordinate = (address: string): Coordinate => {
		var result = new Coordinate();
		var index = 0;
		var value = 0;
		var exp = 10;
		for (var i = 0; i < address.length; ++i) {
			var byte = address[i];

			if (byte == this.ADDRESS_MICRO_BREAK ||
				byte == this.ADDRESS_MACRO_BREAK ||
				byte == this.ADDRESS_MACRO_ALT) {
				switch (index) {
				  case 1: result.z.library = value; index += 1; break;
				  case 2: result.z.shelf = value; index += 1; break;
				  case 3: result.z.series = value; index += 1; break;
				  case 4: result.y.collection = value; index += 1; break;
				  case 5: result.y.volume = value; index += 1; break;
				  case 6: result.y.book = value; index += 1; break;
				  case 7: result.x.chapter = value; index += 1; break;
				  case 8: result.x.section = value; index += 1; break;
				}
				value = 0;
			}

			if (byte >= '0' && byte <= '9')
			{
				value = exp * value + parseInt(byte);
				if (index == 0) { index = 1; }
			}
		}

  		if (index > 0) {
    		result.x.scroll = value;
  		}

  		return result;
	};
}

export class Coordinate {
	z: ZCoordinate;
	y: YCoordinate;
	x: XCoordinate;
	constructor(value: string = "") {
		this.z = new ZCoordinate(1,1,1);
		this.y = new YCoordinate(1,1,1);
		this.x = new XCoordinate(1,1,1);
		if (value.length > 0) {
			var parts = value.replace(/\//g, '.').split('.');
			if (parts.length >= 1) { this.z.library = parseInt(parts[0]); if (this.z.library < 1) { this.z.library = 1; }}
			if (parts.length >= 2) { this.z.shelf = parseInt(parts[1]); if (this.z.shelf < 1) { this.z.shelf = 1; }}
			if (parts.length >= 3) { this.z.series = parseInt(parts[2]); if (this.z.series < 1) { this.z.series = 1; }}
			if (parts.length >= 4) { this.y.collection = parseInt(parts[3]); if (this.y.collection < 1) { this.y.collection = 1; }}
			if (parts.length >= 5) { this.y.volume = parseInt(parts[4]); if (this.y.volume < 1) { this.y.volume = 1; }}
			if (parts.length >= 6) { this.y.book = parseInt(parts[5]); if (this.y.book < 1) { this.y.book = 1; }}
			if (parts.length >= 7) { this.x.chapter = parseInt(parts[6]); if (this.x.chapter < 1) { this.x.chapter = 1; }}
			if (parts.length >= 8) { this.x.section = parseInt(parts[7]); if (this.x.section < 1) { this.x.section = 1; }}
			if (parts.length >= 9) { this.x.scroll = parseInt(parts[8]); if (this.x.scroll < 1) { this.x.scroll = 1; }}
		}
	}

	equals = (other: Coordinate): boolean => {
		return this.z.library == other.z.library &&
		       this.z.shelf == other.z.shelf &&
			   this.z.series == other.z.series &&
			   this.y.collection == other.y.collection &&
			   this.y.volume == other.y.volume &&
			   this.y.book == other.y.book &&
			   this.x.chapter == other.x.chapter &&
			   this.x.section == other.x.section &&
			   this.x.scroll == other.x.scroll;
	};

	less_than = (other: Coordinate): boolean => {
		if (this.z.library < other.z.library) { return true; }
		if (this.z.library > other.z.library) { return false; }
		if (this.z.shelf < other.z.shelf) { return true; }
		if (this.z.shelf > other.z.shelf) { return false; }
		if (this.z.series < other.z.series) { return true; }
		if (this.z.series > other.z.series) { return false; }
		if (this.y.collection < other.y.collection) { return true; }
		if (this.y.collection > other.y.collection) { return false; }
		if (this.y.volume < other.y.volume) { return true; }
		if (this.y.volume > other.y.volume) { return false; }
		if (this.y.book < other.y.book) { return true; }
		if (this.y.book > other.y.book) { return false; }
		if (this.x.chapter < other.x.chapter) { return true; }
		if (this.x.chapter > other.x.chapter) { return false; }
		if (this.x.section < other.x.section) { return true; }
		if (this.x.section > other.x.section) { return false; }
		if (this.x.scroll < other.x.scroll) { return true; }
		return false;
	};

	greater_than = (other: Coordinate): boolean => {
		if (this.z.library > other.z.library) { return true; }
		if (this.z.library < other.z.library) { return false; }
		if (this.z.shelf > other.z.shelf) { return true; }
		if (this.z.shelf < other.z.shelf) { return false; }
		if (this.z.series > other.z.series) { return true; }
		if (this.z.series < other.z.series) { return false; }
		if (this.y.collection > other.y.collection) { return true; }
		if (this.y.collection < other.y.collection) { return false; }
		if (this.y.volume > other.y.volume) { return true; }
		if (this.y.volume < other.y.volume) { return false; }
		if (this.y.book > other.y.book) { return true; }
		if (this.y.book < other.y.book) { return false; }
		if (this.x.chapter > other.x.chapter) { return true; }
		if (this.x.chapter < other.x.chapter) { return false; }
		if (this.x.section > other.x.section) { return true; }
		if (this.x.section < other.x.section) { return false; }
		if (this.x.scroll > other.x.scroll) { return true; }
		return false;
	};

	advance_to = (other: Coordinate): string => {
		var output = "";
		while (this.less_than(other)) {
			if (this.z.library < other.z.library)       { output += __internal_phext.LIBRARY_BREAK;    this.library_break();    continue; }
			if (this.z.shelf < other.z.shelf)           { output += __internal_phext.SHELF_BREAK;      this.shelf_break();      continue; }
			if (this.z.series < other.z.series)         { output += __internal_phext.SERIES_BREAK;     this.series_break();     continue; }
			if (this.y.collection < other.y.collection) { output += __internal_phext.COLLECTION_BREAK; this.collection_break(); continue; }
			if (this.y.volume < other.y.volume)         { output += __internal_phext.VOLUME_BREAK;     this.volume_break();     continue; }
			if (this.y.book < other.y.book)             { output += __internal_phext.BOOK_BREAK;       this.book_break();       continue; }
			if (this.x.chapter < other.x.chapter)       { output += __internal_phext.CHAPTER_BREAK;    this.chapter_break();    continue; }
			if (this.x.section < other.x.section)       { output += __internal_phext.SECTION_BREAK;    this.section_break();    continue; }
			if (this.x.scroll < other.x.scroll)         { output += __internal_phext.SCROLL_BREAK;     this.scroll_break();     continue; }
		}
		return output;
	};

	validate_index = (index: number): boolean => {
		return index >= __internal_phext.COORDINATE_MINIMUM && index <= __internal_phext.COORDINATE_MAXIMUM;
  	};

	validate_coordinate = (): boolean => {
		let ok = this.validate_index(this.z.library) &&
				 this.validate_index(this.z.shelf) &&
			     this.validate_index(this.z.series) &&
			     this.validate_index(this.y.collection) &&
			     this.validate_index(this.y.volume) &&
			     this.validate_index(this.y.book) &&
			     this.validate_index(this.x.chapter) &&
			     this.validate_index(this.x.section) &&
			     this.validate_index(this.x.scroll);
		return ok;
	};

	to_string = (): string => {
		return `${this.z.library}.${this.z.shelf}.${this.z.series}/${this.y.collection}.${this.y.volume}.${this.y.book}/${this.x.chapter}.${this.x.section}.${this.x.scroll}`;
	};

	to_urlencoded = (): string => {
		return this.to_string().replace(/\//g, ';');
	}

	advance_coordinate = (index: number): number => {
		var next = index + 1;
		if (next < __internal_phext.COORDINATE_MAXIMUM) {
			return next;
		}

		return index;
	};

	library_break = (): void => {
		this.z.library = this.advance_coordinate(this.z.library);
		this.z.shelf = 1;
		this.z.series = 1;
		this.y = new YCoordinate();
		this.x = new XCoordinate();
	};
	shelf_break = (): void => {
		this.z.shelf = this.advance_coordinate(this.z.shelf);
		this.z.series = 1;
		this.y = new YCoordinate();
		this.x = new XCoordinate();
	};
	series_break = (): void => {
		this.z.series = this.advance_coordinate(this.z.series);
		this.y = new YCoordinate();
		this.x = new XCoordinate();
	};
	collection_break = (): void => {
		this.y.collection = this.advance_coordinate(this.y.collection);
		this.y.volume = 1;
		this.y.book = 1;
		this.x = new XCoordinate();
	};
	volume_break = (): void => {
		this.y.volume = this.advance_coordinate(this.y.volume);
		this.y.book = 1;
		this.x = new XCoordinate();
	};
	book_break = (): void => {
		this.y.book = this.advance_coordinate(this.y.book);
		this.x = new XCoordinate();
	};
	chapter_break = (): void => {
		this.x.chapter = this.advance_coordinate(this.x.chapter);
		this.x.section = 1;
		this.x.scroll = 1;
	};
	section_break = (): void => {
		this.x.section = this.advance_coordinate(this.x.section);
		this.x.scroll = 1;
	};
	scroll_break = (): void => {
		this.x.scroll = this.advance_coordinate(this.x.scroll);
	};
}

// internal static data
var __internal_phext = new Phext(); // for constants

// internal classes

class OffsetsAndCoordinate {
	start: number;
	end: number;
	coord: Coordinate;
	fallback: Coordinate;
	constructor(start: number, end: number, coord: Coordinate, fallback: Coordinate) {
		this.start = start;
		this.end = end;
		this.coord = coord;
		this.fallback = fallback;
	}
}

class PositionedScroll {
	coord: Coordinate;
	scroll: string;
	next: Coordinate;
	remaining: string;
	constructor(coord: Coordinate, scroll: string, next: Coordinate, remaining: string) {
		this.coord = coord;
		this.scroll = scroll;
		this.next = next;
		this.remaining = remaining;
	}
}

class Range {
	start: Coordinate;
	end: Coordinate;
	constructor(start: Coordinate, end: Coordinate) {
		this.start = start;
		this.end = end;
	}
}

class ZCoordinate {
	library: number;
	shelf: number;
	series: number;
	constructor(library: number = 1, shelf: number = 1, series: number = 1) {
		this.library = library;
		this.shelf = shelf;
		this.series = series;
	}
}

class YCoordinate {
	collection: number;
	volume: number;
	book: number;
	constructor(collection: number = 1, volume: number = 1, book: number = 1) {
		this.collection = collection;
		this.volume = volume;
		this.book = book;
	}
}

class XCoordinate {
	chapter: number;
	section: number;
	scroll: number;
	constructor(chapter: number = 1, section: number = 1, scroll: number = 1) {
		this.chapter = chapter;
		this.section = section;
		this.scroll = scroll;
	}
}