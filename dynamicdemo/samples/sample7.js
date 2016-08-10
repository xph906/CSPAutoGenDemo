var baseMsg = "How are you ";
var username = "Hello Kitty";
var age = 7;
var mj = "Sleeping";
var magicNumber = age % 2;
document.getElementById("welcomeMsg").innerHTML = baseMsg+username+"!<br>";
var specialChar = ["QW","ZZ"];
var profile = {
	major: mj, 
	userKey: age+username.replace(/\s/g, specialChar[magicNumber])+"a5c5b9e3a515",
	hobby: ["Kill Monster", "Kill Animal"]};
var balance = 10;
(function(){
	var balance = 1;
	var contents = "Name:"+username+"<br>Major:"+profile.major+"<br>Hobby:"+profile.hobby[0]+"<br>"+globalLineVar+"<br>Password:"+profile.userKey+"<br>"+globalLineVar+"<br>";
	document.getElementById("welcomeMsg").innerHTML += contents;
	eval("document.getElementById(\'welcomeMsg\'').innerHTML+=\'Your balance is $\'+balance + \'.\'");
})();
