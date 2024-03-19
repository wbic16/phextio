# phext.io web site

the phext.io web site is an experiment in hosting a web site without a database: phext provides all of the complexity you need!

- examples.html: real-world examples and links to more code
- research.html: Research as a Phext - an academic take on phext
- chapters.html: an early visualization for a 20 MB slice of phext
- white-rabbit.html: games to help your brain absorb phext fundamentals

## nova fox

Alpha Class Cartridge
---------------------
- max size: 5 MiB
- efficiency: 99.4%
- header: 32 KB
- data: 5,088 KiB

Beta Class Cartridge
--------------------
- max size: 32 MiB
- efficiency: 99.9%
- header: 32 KB
- data: 32,736 KiB

### Base-88

We use base-88 to ensure that numbers are presented in printable ASCII. The values are encoded as the character offset from the string given below (without quotes).

Reference: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ,./?:[]|{}=-+_)(*&^%$#@!~"
Position:   1       10        20        30        40        50        60        70        80      88

See base88.ps1 for a PowerShell implementation.

### indexing format

Each cartridge may contain any number of nodes of varying size, provided that they pack into the data space. The header contains lookup tables to speed parsing, helping the parser identify which part(s) of the file to read.

The header is composed of a series of offset pointers encoded with phext. Magic bytes at the beginning and end of the header reduce the size from 32,768 bytes to 32,700 bytes.

We use base-88 to encode 64-bit offsets in plain text, with a one-byte phext delimiter. We thus need up to 25 bytes per offset. We expect to store an average of 1,308 offsets in our header.

#### Class A Example

This cartridge stores a total of ten reference points within the phext address space. Each offset is encoded in phext as well, resulting in a very compact reference structure. Since we know our coordinate at each offset, we can resume parsing without reading data prior to the checkpoint.

Header information is rooted at library 1. Data appears at libraries 2+.

#### Class A Data Map

By recording offsets at coordinates of interest, we can quickly jump back into our data volume with fewer seeks. Since the lookup table is fractal in nature, we can easily encode whatever waypoints we need. You don't need to figure out how large your pages need to be be - you just yeet text out the window and record as you go!

* 1.1.1/1.1.1/1.1.1 offset 0
* 1.1.1/1.1.1/1.1.2 offset 142
* 1.1.1/1.1.1/1.2.1 offset 218
* 1.1.1/1.1.1/2.1.1 offset 276
* 1.1.1/1.1.2/1.1.1 offset 331
* 1.1.1/1.2.1/1.1.1 offset 518
* 1.1.1/2.1.1/1.1.1 offset 561
* 1.1.2/1.1.1/1.1.1 offset 608
* 1.2.1/1.1.1/1.1.1 offset 649
* 2.1.1/1.1.1/1.1.1 offset 689

#### Class A Encoded Detail

NovaFox Cartridge Format: 1 -------\n
1S2G3c3:5(6x6&7x7=
------- Nova Fox Cartridge Data
This is an example nova fox cartridge. The contents of this RAM are encoded in phext. This first scroll is at 1.1.1/1.1.1/1.1.1 and offset 0.After a single scroll break, we are now at byte position 142 in the buffer.After a single section break, we are now at position 218.Following a chapter break, we are now at position 276.A book break brought us to offset 331. Notice that we must re-calculate the header whenever we insert or remove data. This is fine, as our files are designed to fit within a 1 ms packet.A volume break brought us to position 518.A collection break brought us to position 561.A series break brought us to offset 608.A shelf break brought us to offset 649.A library break brought us to 689.
