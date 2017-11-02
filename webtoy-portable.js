(function(){
function load(N, T){
	if (T=="js"){
		var F=document.createElement('script');
		F.setAttribute("type","text/javascript");
		F.setAttribute("src", N);
	}
	else if (T=="css"){
		var F=document.createElement("link");
		F.setAttribute("rel", "stylesheet");
		F.setAttribute("type", "text/css");
		F.setAttribute("href", N);
	}
	if (typeof F!="undefined")
		document.getElementsByTagName("head")[0].appendChild(F);
}
load("https://code.jquery.com/jquery-2.2.3.min.js", "js");
load("https://kaynato.github.io/RagdollWebtoy/webtoy.css", "css");
function create(){
	var F = document.createElement('div');
	F.setAttribute("id", "figure");
	F.setAttribute("class", "mass");
	F.setAttribute("ondragstart", "return false;");
	F.setAttribute("ondrop", "return false;");
	var body = document.querySelector("body")
	body.insertBefore(F, body.firstChild);
};
function wait(){
	if(!window.jQuery) 
		window.setTimeout(wait,100); 
	else {
		create();
		load("https://kaynato.github.io/RagdollWebtoy/webtoy-mini.js", "js");
	} 
}
wait();
})();