var baseMsg = "Welcome ";
var username = "Xiang Pan";
var age = 28;
var mj = "Computer Science";
var magicNumber = age % 2;
document.getElementById("welcomeMsg").innerHTML = baseMsg+username+"!<br>";
var specialChar = ["MI",224];
var profile = {
	major: mj, 
	userKey: age+username.replace(/\s/g, specialChar[magicNumber])+"2332ea12332",
	hobby: ["Basketball", "Football", "Music", "Watching Movies"]};
var balance = 10;
(function(){
	var balance = 79;
	var contents = "Name:"+username+"<br>Major:"+profile.major+"<br>Hobby:"+profile.hobby[0]+"<br>"+globalLineVar+"<br>Password:"+profile.userKey+"<br>"+globalLineVar+"<br>";
	document.getElementById("welcomeMsg").innerHTML += contents;
	eval("document.getElementById(\"welcomeMsg\").innerHTML+=\"Your balance is $\"+balance+\'.\'");
})();
