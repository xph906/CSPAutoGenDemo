/*Those scripts extracted from Function's arguments will be stored as automated generated functions.*/
var CSPAutoGenGeneratedFunction = function(lineVar, username, age) {
	var baseMsg = "Get out ";
	var mj = "Biology";
	var magicNumber = age % 2;
	document.getElementById("welcomeMsg").innerHTML = baseMsg+username+"!<br>";
	var specialChar = ["HG",343]; 
	var profile = { 
		major: mj,  
		userKey: age+username.replace(/\s/g, specialChar[magicNumber])+"8364",
		hobby: ["Nothing"]};
	var balance = 1;
	(function(){ 
		var balance = 0;
		var contents = "Name:"+username+"<br>Major:"+profile.major+"<br>Hobby:"+profile.hobby[0]+"<br>"+lineVar+"<br>Password:"+profile.userKey+"<br>"+lineVar+"<br>";
		document.getElementById("welcomeMsg").innerHTML += contents;
		eval("document.getElementById(\"welcomeMsg\").innerHTML+=\"Your balance is $\"+balance+\'.\'");
	})();
};
