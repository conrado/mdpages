# `md2html` - Convert Markdown to HTML pages

This package produces HTML pages from Markdown input.  CSS/JS is inlined, so every page is self-contained.

## Usage

```javascript
var md2html = require('md2html');

// File usage
md2html.convert(['README.md'], function (error, htmlFiles) {...});

// String usage
var htmlString = md2html.convertString(md);
```

## Config

### Conversion and highlighting

This package uses [marked](https://npmjs.org/package/marked) to perform the Markdown conversion, and [Prism](https://github.com/leaverou/prism/) (modified for use with Node) to perform syntax highlighting.

Both modules are made available, as `md2html.marked` and `md2html.prism` respectively.

### Additional styling

Additional styling can be specified using `md2html.style`:

```json
{
	"htmlHeader": "",
	"htmlFooter": "",
	"css": ...,
	"js": ...
}
```

### Added HTML (content sections)

This package infers sections from the various title depths, and inserts `<div class="section section1">` elements.

The whole content is wrapped inside a `<div class="content">` tag.