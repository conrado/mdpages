var path = require('path');
var fs = require('fs');
var async = require('async');
var markdown = require('marked');
var prism = require('../vendor/prism');
var entities = require('entities');

markdown.setOptions({
	gfm: true,
	sanitize: false
});

prism.languages.html = prism.languages.markup;
prism.languages.json = prism.languages.javascript;

var api = module.exports = {
	style: {
		htmlHeader: '',
		htmlFooter: '',
		css: '',
		js: ''
	},
	markdown: markdown,
	prism: prism
};

api.style.css += fs.readFileSync(__dirname + '/assets/css/prism.css');
api.style.css += fs.readFileSync(__dirname + '/assets/css/main.css');

function getFileMap(files) {
	if (typeof files === 'string') {
		files = [files];
	}
	if (Array.isArray(files)) {
		var result = {};
		for (var i = 0; i < files.length; i++) {
			var mdFilename = files[i];
			result[mdFilename] = mdFilename.replace(/\.[^.]*$/, '.html');
		}
		return result;
	}
	return files;
}

var convertSync = api.convertSync = function (files) {
	var htmlFiles = getFileMap(files);
	return Object.keys(htmlFiles).map(function (mdFilename) {
		var mdString = fs.readFileSync(mdFilename, {encoding: 'utf8'});
		var htmlFilename = htmlFiles[mdFilename];
		var htmlString = api.convertString(mdString);
		fs.writeFileSync(htmlFilename, htmlString, {encoding: 'utf8'});
		return htmlFilename;
	});
};

var convert = api.convert = function (files, callback) {
	var htmlFiles = getFileMap(files);
	async.map(Object.keys(htmlFiles), function (mdFilename, callback) {
		fs.readFile(mdFilename, {encoding: 'utf8'}, function (error, mdString) {
			if (error) return callback(error);
			var htmlString = api.convertString(mdString);
			var htmlFilename = htmlFiles[mdFilename];
			fs.writeFile(htmlFilename, htmlString, {encoding: 'utf8'}, function (error) {
				if (error) return callback(error);
				callback(null, htmlFilename);
			});
		});
	}, callback);
};

var convertString = api.convertString = function (inputString) {
	var depth = 0;
	// Infer sections based on title depths
	var html = markdown(inputString).replace(/<h([1-6])[^\>]*>.*?<\/h[1-6]>/gi, function (text, amount) {
		var newDepth = parseInt(amount, 10);
		var result = text;
		while (depth >= newDepth) {
			depth--;
			result = '</div>' + result;
		}
		while (depth < newDepth) {
			depth++;
			result = result + '<div class="section section' + depth + '">';
		}
		return result;
	});
	while (depth > 0) {
		html += '</div>';
		depth--;
	}

	// Prism highlighting
	html = html.replace(/(<pre><code [^>]*class="lang-([^">]*)"[^>]*>)([^<]*)/g, function (text, tags, lang, code) {
		if (!prism.languages[lang]) {
			return text;
		}
		// Prism seems to expect opening tags to be escaped, but not closing ones
		code = entities.decode(code).replace(/</g, '&lt;');
		return tags.replace('<pre>', '<pre class="language-"' + lang + '">') + prism.highlight(code, prism.languages[lang], lang);
	});

	var titleMatch = html.match(/<h1[^\>]*>.*?<\/h1>/i);
	var titleHtml = titleMatch ? titleMatch[0] : '';
	var titleText = titleHtml.replace(/<[^\>]*>/g, '');
	var result = '<html><head><meta charset="utf-8"/><title>' + titleText.replace(/</g, '&lt;') + '</title>';
	result += '<style>' + api.style.css + '</style>';
	result += '</head><body>' + (api.style.htmlHeader || "")
	result += '<div class="content">' + html + '</div>';
	result += '<script>' + api.style.js + '</script>';
	result += api.style.htmlFooter;
	result += '</body></html>';
	return result;
}
