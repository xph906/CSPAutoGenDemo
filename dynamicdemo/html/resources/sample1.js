var baseMsg = "Welcome ";
var username = "Xiang Pan";
var age = 28;
var mj = "Computer Science";
var magicNumber = age % 2;
document.getElementById("welcomeMsg").innerHTML = baseMsg+username+"!<br>";
var specialChar = ["MI",224];
var profile = {
	major: mj, 
	userKey: age+username.replace(/\s/g, specialChar[magicNumber])+"944272e7bb0350",
	hobby: ["Basketball", "Football", "Music"]};
var balance = 10;
(function(){
	var balance = 0;
	var contents = "Name:"+username+"<br>Major:"+profile.major+"<br>Hobby:"+profile.hobby[0]+"<br>"+globalLineVar+"<br>Password:"+profile.userKey+"<br>"+globalLineVar+"<br>";
	document.getElementById("welcomeMsg").innerHTML += contents;
	eval("document.getElementById(\"welcomeMsg\").innerHTML+=\"Your balance is $\"+balance");
})();