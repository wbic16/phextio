# host on aws
1. clone this repo
2. enable php
3. profit

the phextio web site is an experiment in hosting a web site without a database.

phext provides all of the complexity you need!

- examples.html: real-world examples and links to more code
- research.html: Research as a Phext - an academic take on phext
- chapters.html: an early visualization for a 20 MB slice of phext

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

### indexing format

Each cartridge may contain any number of nodes of varying size, provided that they pack into the data space.
The header contains lookup tables to speed parsing, helping the parser identify which part(s) of the file to read.

#### example

