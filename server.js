var http = require("http");
var https = require("https");
var fs = require("fs");

var css = fs.readFileSync("voat.css");
var js = fs.readFileSync("voat.js");

var files = {
	"/": fs.readFileSync("index.html"),
	"/about": fs.readFileSync("about.html"),
	"/css/layout.css": fs.readFileSync("css/layout.css"),
	"/imgs/logo.png": fs.readFileSync("imgs/logo.png"),
	"/imgs/loading.gif": fs.readFileSync("imgs/loading.gif")
}

var cacheExpires = 1000 * 60 * 5;

function cache(path, time) {
	var deleteTimer = setTimeout(function() {
		delete request.cache[path];
		console.log("deleting caches for "+path);
	}, cacheExpires);

	return {
		content: "",
		time: time,
		write: function(data) { this.content += data }
	};
}

function isCachable(path) {
	return !/(\.png|\.jpg|\.jpeg)$/.test(path);
}

function request(path, res) {
	var c = request.cache[path]

	//If cache existst and is valid, return cache
	if (c) {
		console.log(path+" requested, serving cached page.");
		return res.end(request.cache[path].content);
	}

	console.log(path+" requested, no cache found. Fetching from voat.");

	//There's no valid cache for the page, so we make a request.
	https.request({
		host: "voat.co",
		path: path
	}, function(r) {
		var cachable = isCachable(path);

		if (cachable)
			var c = cache(path, new Date().getTime());

		r.on("data", function(data) {
			res.write(data);

			if (cachable)
				c.write(data);
		});

		r.on("end", function() {

			//Inject styles and scripts into /v/*
			if (path.indexOf("/v/") === 0) {
				var str =
					"<style>"+css+"</style>"+
					"<script>"+js+"</script>";

				res.write(str);

				if (cachable)
					c.write(str);
			}

			if (cachable)
				request.cache[path] = c;

			res.end();
		});
	}).end();
}
request.cache = {};

var port = 8084;

http.createServer(function(req, res) {
	if (req.url == '/' || req.url.indexOf("/_/") == 0)
		res.end(files[req.url.replace("/_", "")]);
	else
		request(req.url, res);
}).listen(port);

console.log("Server started on port "+port+".");
