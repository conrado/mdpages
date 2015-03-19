var md2html = require('./index.js');

md2html.convert({'README.md': 'index.html'}, function (error) {
	if (error) throw error;
	console.log("Done!");
});
