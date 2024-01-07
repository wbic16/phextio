Greetings, Traveler
-------------------

This document is a journey into the intrafractal known as phext. Phext is the natural extension of text. The key innovation is the introduction of 9 additional dimension breaks. These breaks allow you to apply successively larger amounts of structure in a sparse document hierarchy.

Unlike other formats, phext is designed from the ground up for serialization and editing. The subspace layer of phext is the same as it always has been - a 1-dimensional stream of characters with a null terminated byte to indicate the end of the sequence.

When viewed in text editors written prior to 2024, phext looks like a wall of text. Line breaks are still here, so you can get some sense of the structure ... but you are projecting an 11D object into 2 dimensions - so much will be lost in translation.

The visual browser on phext.io is perhaps the simplest way to understand what is going on, so you should probably head over there to read this doc: https://phext.io/intrafractal.html.

Definitions
-----------
Phext is composed of normal utf8/ascii text. Nine historic ASCII control codes have been re-purposed to introduce a new type of multiple-document interface.

## Dimension Breaks

Phext introduces a hierarchy of delimiters, allowing you to gracefully navigate very large (petabyte) volumes of text.

### Scroll: 3D Text

Delimiter: SCROLL_BREAK (0x17)

A scroll is what you're used to. Every text file you've ever used was just one scroll. All data in a phext file is content. You can build novel document structures on top of phext, but the basic file format is a hierarchical byte stream.

### Section: 4D Text

Delimiter: SECTION_BREAK (0x18)

Sections allow you to bind a collection of scrolls together into a cohesive whole. 

* Chapter
* Book
* Volume
* Collection
* Series
* Shelf
* LibraryScroll #2: Your First Step
--------------------------
Scroll #3: Breaking It Down
----------------------------
You've just encountered the first hint that something different is happening. Between the intrafractal link and this scroll, there was a SCROLL_BREAK (0x17) character. This byte triggered several changes to the document.

1. It reset the column counter to 1.
2. It reset the line counter to 1.
3. It advanced the scroll counter by 1.

We are now looking at text located at coordinate 1.1.1/1.1.1/1.1.2.