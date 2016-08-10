var baseMsg = "Good Morning";
var username = "Aaren Lee";
var age = 40;
var mj = "Civil Engineering";
var magicNumber = age % 4;
document.getElementById("welcomeMsg").innerHTML = baseMsg+username+"!<br>";
var specialChar = ["ALA",132,50,"AA","UA"];
var profile = {
	major: mj, 
	userKey: age+username.replace(/\s/g, specialChar[magicNumber])+"944272e7bb0350",
	hobby: ["Programming", "Gaming", "Running", "Smoking"]};
var balance = 10;
(function(){
	var balance = 80;
	var contents = "Name:"+username+"<br>Major:"+profile.major+"<br>Hobby:"+profile.hobby[0]+"<br>"+globalLineVar+"<br>Password:"+profile.userKey+"<br>"+globalLineVar+"<br>";
	document.getElementById("welcomeMsg").innerHTML += contents;
	eval("document.getElementById(\"welcomeMsg\").innerHTML+=\"Your balance is $\"+balance+\'.\'");
})();
