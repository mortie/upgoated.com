var links = document.querySelectorAll("a");

function addListener(link) {
	link.addEventListener("click", function(evt) {
		if (link.getAttribute("href").indexOf("javascript:") === 0)
			return;

		if (link.getAttribute("href")[0] === '/')
			return;

		evt.preventDefault();
		window.open(link.href);
	});
}

for (var i = 0; i < links.length; ++i) {
	addListener(links[i]);
}

var customCss = document.getElementById("custom_css");
if (customCss)
	customCss.parentNode.removeChild(customCss);
