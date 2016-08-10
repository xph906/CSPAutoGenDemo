if(!esprima) console.log("esprima not loaded!");
if(!estraverse) console.log("estraverse not loaded!");
if(!DeepDiff) console.log("diff not loaded!");
if(!toolSet) console.log('toolSet not loaded.');
if(!typeFuns) console.log("typeFuns not loaded");
if(!util) console.log("util not loaded!");

var CSPAutoGenTemplateFunctions = function(){
	var templates = null;
	

	/*
	 * This function determines if target script's values 
	 * match the types. 
	 * Parameters:
	 *  1. valuesArr: the data array extracted from target script.
	 *  2. typeArr  : the type array of the corresponding template.
	 *  3. script   : target script for debuging purpose.
	 */
	var matchGASTTypes = function(valuesArr, typeArr, script){
		if(script)
			var hash = toolSet.generateGASTHash(toolSet.generateGAST(script));
		else
			var hash = "null";
		var count = 0;
		var typedNodeArrLenth = typeArr.length;
		if(valuesArr.length != typeArr.length){
			console.log("error: matchGASTTypes length different. "+valuesArr.length+" "+typeArr.length)
			process.exit(1);
		}
		for(var i in valuesArr){
			var typeElem = typeArr[i];
			var valueElem = valuesArr[i];
			if(!typeElem ){
				console.log("error: "+index+" "+typedNodeArrLenth+"   "+util.inspect(typeArr));
				return false;
			}
			if( (typeof valueElem) === "object"){
				for(var k in valueElem){
					count++;
					if(! (k in typeElem.type)){
						console.log("NOTMATCHING: missing key: "+k+ " vs "+
							util.inspect(Object.keys(typeElem.type) ));
						return false;
					}
					if(! typeFuns.matchType(
							{type:typeElem.type[k], value:typeElem.value[k]}, valueElem[k], script) ){
						return false;
					}
				}
			}
			else{
				count++;
				if(!typeFuns.matchType(typeElem, valueElem, script)){
					return false;
				}
			}
		}
		return true;
	};

	var matchScript = function(targetScript, templateArrs){
		var values = [];
		var gast = toolSet.generateGAST(targetScript, values);
		var hash = toolSet.generateGASTHash(gast);
		if (hash in templateArrs){
  			var templateArr = templateArrs[hash];
  			if(values.length != templateArrs[hash].length){
    			console.log(" error: script "+hash+" two value arrs' size are not equal "+values.length+" "+templateArrs[hash].length);
  			}
  			if(matchGASTTypes(values, templateArrs[hash], targetScript )){
    			console.log("Match!");
    			return true;
  			}
  			else{
    			console.log("Nonmatch: type!");
    			return false;
  			}
		}
		else{
  			console.log("Nonmatch: tree!");
  			return false;
		}
		return true;
	};

	var matchScriptValues = function(hash, values, templateArrs){
		if (hash in templateArrs){
  			var templateArr = templateArrs[hash];
  			if(values.length != templateArrs[hash].length){
    			console.log(" error: script "+hash+" two value arrs' size are not equal "+values.length+" "+templateArrs[hash].length);
  			}
  			if(matchGASTTypes(values, templateArrs[hash], null )){
    			console.log("Match!");
    			return true;
  			}
  			else{
    			console.log("Nonmatch: type!");
    			return false;
  			}
		}
		else{
  			console.log("Nonmatch: tree!");
  			return false;
		}
		return true;
	};
	

	return {
		matchScriptValues : matchScriptValues,
		matchScript : matchScript
	};
};

var templateFunctions = CSPAutoGenTemplateFunctions();
