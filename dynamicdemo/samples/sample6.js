var baseMsg = "How are you";
var username = "Klay Thompson";
var age = 29;
var mj = "Law";
var magicNumber = age % 5;
document.getElementById("welcomeMsg").innerHTML = baseMsg+username+"!<br>";
var specialChar = ["AA",224,111,"MP","KV"];
var profile = {
	major: mj, 
	userKey: age+username.replace(/\s/g, specialChar[magicNumber])+"28732e2932ab9",
	hobby: ["Study", "Sleeping"]};
var balance = 10;
(function(){
	var balance = 23;
	var contents = "Name:"+username+"<br>Major:"+profile.major+"<br>Hobby:"+profile.hobby[0]+"<br>"+globalLineVar+"<br>Password:"+profile.userKey+"<br>"+globalLineVar+"<br>";
	document.getElementById("welcomeMsg").innerHTML += contents;
	eval("document.getElementById(\"welcomeMsg\").innerHTML+=\"Your balance is $\"+balance+\'.\'");
})();
