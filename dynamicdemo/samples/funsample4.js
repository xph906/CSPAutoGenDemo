/*Those scripts extracted from Function's arguments will be stored as automated generated functions.*/
var CSPAutoGenGeneratedFunction = function(lineVar, username, age) {
	var baseMsg = "How are you";
	var mj = "Civil Engineering";
	var magicNumber = age % 4;
	document.getElementById("welcomeMsg").innerHTML = baseMsg+username+"!<br>";
	var specialChar = ["AK", 27, 47,"MM"]; 
	var profile = { 
		major: mj,  
		userKey: age+username.replace(/\s/g, specialChar[magicNumber])+"abc341wi",
		hobby: ["Study", "Watching Movies"]};
	var balance = 1;
	(function(){ 
		var balance = 300;
		var contents = "Name:"+username+"<br>Major:"+profile.major+"<br>Hobby:"+profile.hobby[0]+"<br>"+lineVar+"<br>Password:"+profile.userKey+"<br>"+lineVar+"<br>";
		document.getElementById("welcomeMsg").innerHTML += contents;
		eval("document.getElementById(\"welcomeMsg\").innerHTML+=\"Your balance is $\"+balance+\'.\'");
	})();
};
