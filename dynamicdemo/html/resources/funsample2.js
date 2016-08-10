/*Those scripts extracted from Function's arguments will be stored as automated generated functions.*/
var CSPAutoGenGeneratedFunction = function(lineVar, username, age) {
	var baseMsg = "Get out ";
	var mj = "Actor";
	var magicNumber = age % 2;
	document.getElementById("contents").innerHTML = baseMsg+username+"!<br>";
	var specialChar = ["MI",1]; 
	var profile = { 
		major: mj,  
		userKey: age+username.replace(/\s/g, specialChar[magicNumber])+"23312",
		hobby: ["Acting", "Running"]};
	var balance = 1;
	(function(){ 
		var balance = 0;
		var contents = "Name:"+username+"<br>Major:"+profile.major+"<br>Hobby:"+profile.hobby[0]+"<br>"+lineVar+"<br>Password:"+profile.userKey+"<br>"+lineVar+"<br>";
		document.getElementById("contents").innerHTML += contents;
		eval("document.getElementById(\"welcomeMsg\").innerHTML+=\"Your balance is $\"+balance+\'.\'");
	})();
};

