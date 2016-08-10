var globalLineVar = "##################################";
var doEval = function(){
	var username = document.getElementById('username').value;
	var age = document.getElementById('age').value;
	var major = document.getElementById('major').value;
	var wm = document.getElementById('wmsg').value;
	var rs = document.getElementById('welcomeMsg');

	var evalContents = 
		'var baseMsg = "'+wm+' ";\n' +
		'var username = "'+username+'";\n' +
		'var age = '+age+';\n' +
		'var mj = "'+major+'";\n' +
		'var magicNumber = age % 4;\n' +
		'document.getElementById("welcomeMsg").innerHTML = baseMsg+username+"!<br>";\n' +
		'var specialChar = ["MW","AA",847,"UA"];\n' +
		'var profile = {\n' +
		'  major: mj, \n' +
		'  userKey: age+username.replace(/\\s/g, specialChar[magicNumber])+"randomString1",\n' +
		'  hobby: ["Reading Papers", "Writting Papers", "Reviewing Papers"]};\n' +
		'var balance = 10;\n' +
		'(function(){ \n' +
		'  var balance = 200;\n' +
		'  var contents = "Name:"+username+"<br>Major:"+profile.major+'+
		   '"<br>Hobby:"+profile.hobby[0]+"<br>"+globalLineVar+"<br>Password:"+profile.userKey+'+
		   '"<br>"+globalLineVar+"<br>";\n'+
		'  document.getElementById("welcomeMsg").innerHTML += contents;\n'+
		'  eval("document.getElementById(\'welcomeMsg\').innerHTML+='+
		   '\'Your balance is $\'+balance +\'.\'");})();'
	//console.log(evalContents);
	
	var newInlineScriptNode = document.createElement('script');
	newInlineScriptNode.innerHTML = evalContents;
	document.getElementsByTagName('body')[0].appendChild(newInlineScriptNode);

	//For demo only!
	if(document.getElementById('evalcode')){
		var addElemScript = 'var newInlineScriptNode = document.createElement("script");\n';
		addElemScript += 'newInlineScriptNode.innerHTML = evalContents;\n';
		addElemScript += 'document.getElementsByTagName("body")[0].appendChild(newInlineScriptNode);\n';
		var script = evalContents + addElemScript;
		var scriptDemo = script.replace(/<br>/g, "&lt;br&gt;");
		var gastDemo = toolSet.generateGAST(scriptDemo);
		var option = {
    		comment: false,
    		format: {
        		indent: {
            		style: '&nbsp;&nbsp;'
        		},
        		quotes: 'double',
        		newline: '<br>&nbsp;&nbsp;'
    		}
		};
		var newScript = escodegen.generate(gastDemo, option);
		document.getElementById('evalcode').innerHTML = newScript;
	}
	
	var sampletitle = $("#sampletitle").clone();
	$("#samplegroup").empty();
	$("#samplegroup").append(sampletitle);
	$("#sampletitle").after("<span id='sampletext'>&nbsp;&nbsp;(trained with </span>");
	$("#sampletext").after("<a href='resources/sample1.js' id='sample1'>sample1.js</a>");
	$("#sample1").after("<span id='samplespace'>&nbsp; and </span>");
	$("#samplespace").after("<a href='resources/sample2.js' id='sample2'>sample2.js</a>");
	$("#sample2").after("<span id='samplespace2'>)</span>");
	$("#symtemplatecode").html("NA");
};

document.getElementById('runtimeincludedbutton').addEventListener('click', doEval);