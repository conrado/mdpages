#!/usr/bin/env node
(function () {
  "use strict";

  var fs = require("fs")
    , md2html = require("mdpages")
    , nopt = require("nopt")
    , stream
    , opts
    , buffer = ""
    , styling = {
      "htmlHeader": "<!-- htmlHeader -->",
      "htmlFooter": "<!-- htmlFooter -->",
      "css": "<!-- css -->",
      "js": "<!-- js -->"
    }
    ;

  md2html.style.htmlHeader += styling.htmlHeader;
  md2html.style.htmlFooter += styling.htmlFooter;
  md2html.style.css += styling.css;
  md2html.style.js += styling.js;

  opts = nopt(
    { "dialect": [ "Gruber", "Maruku"]
    , "help": Boolean
    }
  );

  if (opts.help) {
    var name = process.argv[1].split("/").pop()
    console.warn( require("util").format(
      "usage: %s [--dialect=DIALECT] FILE\n\nValid dialects are Gruber (the default) or Maruku",
      name
    ) );
    process.exit(0);
  }

  var fullpath = opts.argv.remain[0];

  if (fullpath && fullpath !== "-") {
    stream = fs.createReadStream(fullpath);
  } else {
    stream = process.stdin;
  }
  stream.resume();
  stream.setEncoding("utf8");

  stream.on("error", function(error) {
    console.error(error.toString());
    process.exit(1);
  });

  stream.on("data", function(data) {
    buffer += data;
  });

  stream.on("end", function() {
    //var html = markdown.toHTML(buffer, opts.dialect);
    var html = md2html.convertString(buffer)
    console.log(html);
  });

}())
