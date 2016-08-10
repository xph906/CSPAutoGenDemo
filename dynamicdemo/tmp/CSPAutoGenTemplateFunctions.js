var util = require('util');
var esprima = require('esprima');
var estraverse = require('estraverse');
var escodegen = require('escodegen');
var toolSet = require('./CSPAutoGenToolSet.js');
var templateType = require('./CSPAutoGenTypes.js');
var fs = require('fs');

/* PUBLIC Methods:
 *   buildTemplateFromGASTSet,
 *   generateSymbolicTemplateName,
 *   genSymTemplateStr,
 *   extractEvalLikeScripts,
 *   modifyGASTForEvalKeyword,
 *   buildTemplateFromDataList,
 *   matchGASTTypes
 */

//TODO: think of a way to re-organize `templates`.
//TODO: genSymTemplateNode and genSymTemplateStr will modify parameter.
//      make sure it won't cause trouble!
var CSPAutoGenTemplateFunctions = function(){
	var templates = null;
	
	/* 
	 * This function build template based on collected data.
	 * Parameters: 
	 * 1. gast: the gast of the template.
	 * 2. dataList: [[dataValue1, dataValue12, ..., ] ...] 
	 */
	var buildTemplateFromDataList = function(gast, dataList){
		if(gast===null || dataList===null || dataList.length==0)
			return null;
		//check dataList
		var size = -1;
		for(var i in dataList){
			if(size == -1)
				size = dataList[i].length;
			else{
				if(size != dataList[i].length){
					console.log("error: size inconsistent.");
					return null;
				}
			}
		}
		var template = { 
			hash : toolSet.generateGASTHash(gast),
			type : [],
			value : []
		};
		estraverse.traverse(gast, {
			enter: function(node){
			  switch(node.CSPTag){
			    case "string":
			    	var index = node['CSPIndex'];
			    	var data = [];
			    	for(var i in dataList)
			    		data.push(dataList[i][index]);
			    	var CSPType = templateType.inferType("string", data);
			    	node['CSPType'] = CSPType;
			    	template.type[index] = CSPType.type;
			    	template.value[index] = CSPType.value;
			    	break;
			    case "number":
			    	var index = node['CSPIndex'];
			    	var CSPType = templateType.inferType("number", null);
			    	//console.log("number Type "+CSPType['type']+" V:"+CSPType['value']);
			    	node['CSPType'] = CSPType;
			    	template.type[index] = CSPType.type;
			    	template.value[index] = CSPType.value;
			    	break;
			    case "boolean":
			    	var index = node['CSPIndex'];
			    	var CSPType = templateType.inferType("boolean", null);
			    	//console.log("boolean Type "+CSPType['type']+" V:"+CSPType['value']);
			    	node['CSPType'] = CSPType;
			    	template.type[index] = CSPType.type;
			    	template.value[index] = CSPType.value;
			    	break;
			    case "array":
			    	var index = node['CSPIndex'];
			    	var data = [];
			    	for(var i in dataList)
			    		data.push(dataList[i][index]);
			    	var CSPType = templateType.inferType("array", data);
			    	//console.log("array Type "+util.inspect(CSPType['type'])+" V:"+util.inspect(CSPType['value']) );
			    	node['CSPType'] = CSPType;
			    	template.type[index] = CSPType.type;
			    	template.value[index] = CSPType.value;
			    	break;
			    case "object":
			    	var index = node['CSPIndex'];
			    	var data = [];
			    	for(var i in dataList)
			    		data.push(dataList[i][index]);
			    	var CSPType = templateType.inferType("object", data);
			    	//console.log("object Type "+util.inspect(CSPType['type'])+" V:"+util.inspect(CSPType['value']) );
			    	node['CSPType'] = CSPType;
			    	template.type[index] = CSPType.type;
			    	template.value[index] = CSPType.value;
			    	break;
			    default:
			    	node['CSPType'] = null;
			    	break;
			  }
			  if(node.CSPTag==="object" || node.CSPTag==="array" )
			    return estraverse.VisitorOption.Skip;
			}
		});

		return template;
	};

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
					if(! templateType.matchType(
							{type:typeElem.type[k], value:typeElem.value[k]}, valueElem[k], script) ){
						return false;
					}
				}
			}
			else{
				count++;
				if(!templateType.matchType(typeElem, valueElem, script)){
					return false;
				}
			}
		}
		return true;
	};

	/* 
	 * For dynamic scripts demo purpose.
	 * TODO: Remove when the demo is ready.
	 */
	var buildTemplateFromGASTSet = function(gasts){
	  /* Note this function is for demo purpose,
	   * and it's NOT implemented.
	   * it only demonstrates the structure of templates.
	   */
		if (gasts.length === 0)
			return null;
		var template = gasts[0];
		// The basic idea is to generate type for 
		// data nodes: array, boolean, object, number, string.
		// for eval and eval-like functions, we need to generate
		// templates for them.
		estraverse.traverse(template, {
			enter: function(node){
			  switch(node.CSPTag){
			    case "string":
			    	node['CSPType'] = "bogusType";
			    	break;
			    case "number":
			    	node['CSPType'] = "bogusType";
			    	break;
			    case "boolean":
			    	node['CSPType'] = "bogusType";
			    	break;
			    case "array":
			    	node['CSPType'] = "bogusType";
			    	break;
			    case "object":
			    	node['CSPType'] = "bogusType";
			    	break;
			    case "evalcall":
			    	if(node['CSPValue']){
			    		//console.log("DDD:"+node.CSPValue +" - "+node.CSPValue.length+" - "+(typeof node.CSPValue) );
			    		var gast = toolSet.generateGAST(node.CSPValue.toString());
			    		node['CSPType'] = buildTemplateFromGASTSet([gast]);
			    	}
			    	else
			    		node['CSPType'] = null;
			    	break;
			    default:
			    	node['CSPType'] = null;
			    	break;
			  }
			  if(node.CSPTag==="object" || node.CSPTag==="array" || node.CSPTag==="evalcall")
			    return estraverse.VisitorOption.Skip;
			}
		});

	  return template;
	};

	/* 
	 * For dynamic scripts demo purpose.
	 * This function extracts eval and eval-like functions' arguments
	 * In CSPAutoGen, all dynamic scripts are extracted during crawling.
	 * TODO: remove when dynamic script demo is ready.
	 */
	var extractEvalLikeScripts = function(gasts, evalArr, timeoutArr, timeintervalArr, functionArr){
		for(var i in gasts){
			estraverse.traverse(gasts[i], {
				enter: function(node){
		  		switch(node.CSPTag){
		    		case "evalcall":
		    			evalArr.push(node.CSPValue.toString());
		    			break;
		    		case "settimeoutcall":
		    			timeoutArr.push(node.CSPValue.toString());
		    			break;
		    		case "setintervalcall":
		    			timeintervalArr.push(node.CSPValue.toString());
		    			break;
		    		case "functioncall":
		    			functionArr.push(node.CSPValue.toString());
		    			break;
		    		default:
		    			break;
		  		}
					if(node.CSPTag === "evalcall" || 
						 node.CSPTag === "settimeoutcall" || 
						 node.CSPTag === "setintervalcall" ||
						 node.CSPTag === "functioncall"){
						return estraverse.VisitorOption.Skip;
					}
			    		
				}
			});
		}	
	};

	/* 
	 * This function generates a template's symbolic template string,
	 * which is a JavaScript function string.
	 */
	var genSymTemplateStr = function(template, templatesArg, returnIdentifier){
		templates = templatesArg;
		var hash = toolSet.generateGASTHash(template);
		var argList = new Array();
		var obj = genSymTemplateNode(template, null, argList, templates, returnIdentifier);
		var results = {};
		for(var name in obj){
			results[hash] = escodegen.generate(obj[name]) + "\n"+name+";";
		}
		return results;
	};

	/* 
	 * This function generates the function name for 
	 * a GAST tree. It won't count the Program node. The hash 
	 * can be null.
	 */
	var generateSymbolicTemplateName = function(template, hash){
	  if(toolSet.isIdentifierNode(template)){
	    return 'getCSPTemplateIdentifier'+template.name;
	  }
	  else{
	    if(!hash)
	      hash = toolSet.generateGASTHash(template);
	    return "CSPFun"+hash;
	  }
	};

	/* This function generates arguments name for symbolic templates. */
	var generateNewVariable = function(type, index){
	  switch(type){
	    case "string":
	      return "CSPString"+index;
	    case "number":
	      return "CSPNumber"+index;
	    case "boolean":
	      return "CSPBoolean"+index;
	    case "array":
	      return "CSPArrayTree"+index;
	    case "object":
	      return "CSPObject"+index;
	    default:
	      console.log("error: creating unknown variable type: "+type);
	      return null;
	  }
	};

	/* 
	 * This function extracts those non-literal elemements from an array 
	 * node of a template and then generates their auxiliary functions, which are
	 * defined at the same scope chain and used for array elements resolving when 
	 * the symbolic templates are executed during runtime. 
	 * Specifically, it processes the following array node:
	 *   1. identifiers.
	 *   2. expressions.
	 *   3. recursively process object and array nodes
	 */
	var genSymTemplateStrArrayHelper = function(node){
	  var elems = {};
	  if(node.CSPTag === "array"){
	    if (node.type === esprima.Syntax.ArrayExpression){
	      for(var i in node.elements){
	        genSymTemplateStrArrayObjectHelperNodeHandler(
	          node.elements[i], elems);
	      }
	    }
	    else if(node.type === esprima.Syntax.NewExpression){
	      var elements = node.arguments;
	      if(elements.length > 1){
	        for(var i in elements){
	          genSymTemplateStrArrayObjectHelperNodeHandler(elements[i], elems);
	        }
	      }
	    }
	  }
	  else{
	    console.log("error: genSymTemplateStrArrayHelper this is not an array node. ");
	  }

	  return elems;
	};

	/* 
	 * This function extracts those non-literal elemements from an object 
	 * node of a template and then generates their auxiliary functions, which are
	 * defined at the same scope chain and used for array elements resolving when 
	 * the symbolic templates are executed during runtime. 
	 * Specifically, it processes the following array node:
	 *   1. identifiers.
	 *   2. expressions.
	 *   3. recursively process object and array nodes
	 */
	var genSymTemplateStrObjectHelper = function(node){
	  var elems = {};
	  if(node.CSPTag === "object"){
	  	for (var i in node.properties){
	  		genSymTemplateStrArrayObjectHelperNodeHandler(node.properties[i].value, elems);
	  	}
	  }
	  else{
	    console.log("error: genSymTemplateStrObjectHelper this is not an object node. ");
	  }

	  return elems;
	};	

	/* 
	 * This function will be only called by `genSymTemplateStrArrayHelper` and 'genSymTemplateStrObjectHelper'
	 * to deal with each type of array elements. 
	 */
	var genSymTemplateStrArrayObjectHelperNodeHandler = function(node, elems){
	  if(toolSet.isLiteralNode(node)){
			//do nothing.
	  }
	  else if(node.CSPTag === "array"){
	    if (node.type === esprima.Syntax.ArrayExpression){
	      for(var i in node.elements){
	        genSymTemplateStrArrayObjectHelperNodeHandler(
	          node.elements[i], elems);
	      }
	    }
	    else if(node.type === esprima.Syntax.NewExpression){
	      var elements = node.arguments;
	      if(elements.length > 1){
	        for(var i in elements){
	          genSymTemplateStrArrayObjectHelperNodeHandler(elements[i], elems);
	        }
	      }
	    }
	  }
	  else if(node.CSPTag === "object") {
			if(node.properties){for(i in node.properties){
				if(node.properties[i].type=="Property"){
	        genSymTemplateStrArrayObjectHelperNodeHandler(node.properties[i].value, elems);
				}
			}}
	  }
	  else if(toolSet.isIdentifierNode(node)){
	    var hash = toolSet.generateGASTHash(node);
	    var funName = generateSymbolicTemplateName(node);
	    var script =  "function "+funName +"(){ " +
	                  "return "+node.name+";}\n " +
	                  funName+";";
	    var tmpFunNode = esprima.parse(script);
	    estraverse.traverse(tmpFunNode, {
			  enter: function(node){
			    if(node.type ===esprima.Syntax.FunctionDeclaration){
			    	tmpFunNode = node;
			    	this.break();
			    }
			  }
			});
	    elems[funName] = tmpFunNode;
	    //console.log("DEBUG: generated auxiliary function "+funName+" for id "+node.name);
	  }
	  else {
	    var nodehash = toolSet.generateGASTHash(node);
	    var rs = genSymTemplateNode(node, nodehash, null, templates);
	    for(var funName in rs){
				console.log("DEBUG: generated auxiliary function "+funName+" for expression "+node.type);
	    	elems[funName] = rs[funName];
	    }
	  }
	};
	
	/* This function is used to convert keyword eval into a regular function call.
	 */
	var modifyGASTForEvalKeyword = function(gast, templates){
		console.log('modifyGASTForEvalKeyword.');
		var newVariables = [];
		estraverse.traverse(gast, {
	    	enter: function(node) {
	    		if(node.CSPTag === "evalcall"){
	    			var evalGAST = toolSet.generateGAST(node['CSPValue']);
	        		var evalTemplate = toolSet.findTemplate(evalGAST, templates);
	        		if(!evalTemplate){
	        			console.log("error: cannot find eval template. ");
	        			console.log("eval: "+escodegen.generate(evalGAST))
	        			
	        			return estraverse.VisitorOption.Skip;
	        		}
	        		evalTemplate = toolSet.cloneGAST(evalTemplate);
	        		var evalFunArgs = [];
	        		var hash = toolSet.generateGASTHash(evalTemplate);
	        		var newEvalFuns = genSymTemplateNode(evalTemplate, hash, evalFunArgs, templates);
	        		
	        		var evalMainFunName = generateSymbolicTemplateName(evalTemplate, hash);
	        		node['callee']['name'] = evalMainFunName;
	        		node['arguments'] = extractParametersForInnerEvalSymTem(evalGAST);
	        		node['newEvalFunArr'] = newEvalFuns;
	        		console.log('rewritten an eval function.');
	    		}

	    		if(node.CSPTag==="object" || node.CSPTag==="array" || node.CSPTag==="evalcall")
	    			return estraverse.VisitorOption.Skip;
	    	},

		    leave : function(node, parent){
		    	if(node['newEvalFunArr']){
		    		if(parent['body']){
	      				for(var k in parent['body']){
	          				if(parent['body'][k] === node){      	
            					for(var j in node['newEvalFunArr']){
            						parent['body'].splice(k+j, 0, node['newEvalFunArr'][j]);
            					}
	          				}
	       				}	
	       				delete node['newEvalFunArr'];
	      			}
	      			else if (parent){
	      				parent['newEvalFunArr'] = node['newEvalFunArr'];
	      			}
		    	}
		    }
		});
		return gast;
	};

	var extractParametersForInnerEvalSymTem = function(gast){
	  var count = 0;
	  var args = [];

	  estraverse.traverse(gast, {
	    enter: function(node){
	    	switch(node.CSPTag){
	    		case "string":
					args.push(node);
					break;
				case "number":
					args.push(node);
					break;
				case "boolean":
					args.push(node);
					break;
				case "evalcall":
					if(node['CSPValue']){
						var evalGAST = toolSet.generateGAST(node['CSPValue']);
						var evalArgs = extractParametersForInnerEvalSymTem(evalGAST);
						args = args.concat(evalArgs);
					}
					break;
				case "array":
					args.push(node);
					break;
				case "object":
					args.push(node);
					break;
				default:
					break;
	    	} 
	      
			//don't go any further for object and array nodes.
			if(node.CSPTag==="object" || node.CSPTag==="array" || node.CSPTag==="evalcall"){
				return estraverse.VisitorOption.Skip;
			} 
	    }
	  });
	  //console.log("DEBUG: extractParametersForSymbolicTemplate result: "+args);
	  return args;
	};

	/* 
	 * This function generates a template's symbolic template AST node,
	 * which can be easily converted back to script string.
	 * This function is the core function for generating symbolic
	 * templates. 
	 * This function replies on this.templates, so make sure it's set.
	 * Note that this function will MODIFY template parameter.
	 */
	var genSymTemplateNode = function(template, hash, params, templates, returnIdentifier){
		if(params==null || params==undefined)
			params = new Array();
	  var newVariables = params;
	  var results = {};
	  var stName = generateSymbolicTemplateName(template, hash);
	  var programNode = null;
	  estraverse.traverse(template, {
	    enter: function(node){
	      var subtype = toolSet.getLiteralNodeType(node);
	      switch(node.CSPTag){
	        case "string":
	          var newVariable = generateNewVariable("string",newVariables.length);
	          var newNode = toolSet.genIdentifierNode(newVariable);
	          node.newNode = newNode;
	          newVariables.push(newVariable);
	          break;
	        case "number":
	          var newVariable = generateNewVariable("number",newVariables.length);
	          var newNode = toolSet.genIdentifierNode(newVariable);
	          node.newNode = newNode;
	          newVariables.push(newVariable);
	          break;
	        case "boolean":
	          var newVariable = generateNewVariable("boolean",newVariables.length);
	          var newNode = toolSet.genIdentifierNode(newVariable);
	          node.newNode = newNode;
	          newVariables.push(newVariable);
	          break;
	        case "evalcall":
	        	var evalGAST = toolSet.generateGAST(node['CSPValue']);
	        	var evalTemplate = toolSet.findTemplate(evalGAST, templates);
	        	if(!evalTemplate){
	        		console.log("error: cannot find eval template.");
	        		break;
	        	}
	        	var evalFunArgs = [];
	        	var hash = toolSet.generateGASTHash(evalTemplate);
	        	//evalTemplate = toolSet.cloneGAST(evalTemplate);
	        	var newEvalFuns = genSymTemplateNode(evalTemplate, hash, evalFunArgs, templates);
	        	var evalMainFunName = generateSymbolicTemplateName(evalTemplate, hash);
	        	node['callee']['name'] = evalMainFunName;
	        	node['arguments'] = [];
	        	for(var i=0; i<evalFunArgs.length; i++){
	        		var firstDigit = evalFunArgs[i].match(/\d/);
	        		var firstDigitIndex = evalFunArgs[i].indexOf(firstDigit);
	        		var newVariable = evalFunArgs[i].substr(0, firstDigitIndex) + newVariables.length;
	        		node['arguments'].push(toolSet.genIdentifierNode(newVariable));
	        		newVariables.push(newVariable);
	        	}
	        	node['newEvalFunArr'] = newEvalFuns;
	        	break;
	        case "array":
	          var tmpSubFunNodes = genSymTemplateStrArrayHelper(node);
	          var tmpSubFunNodesCount = 0;
	          for(var k in tmpSubFunNodes){
	          	tmpSubFunNodesCount++;
	          }     	
	          var newVariable = generateNewVariable("array",newVariables.length);
	          var args = [newVariable];
	          var newNode = toolSet.genCSPAutoGenLibCallNode("methods", "evaluateArrayAST2JSValue", args);
	          node.newNode = newNode;
	          if(tmpSubFunNodesCount > 0)
	          	newNode['SFN'] = tmpSubFunNodes;
	          newVariables.push(newVariable);
	          break;
	        case "object":
	          var tmpSubFunNodes = genSymTemplateStrObjectHelper(node);
	          var tmpSubFunNodesCount = 0;
	          for(var k in tmpSubFunNodes){
	          	tmpSubFunNodesCount++;
	          }     	
	          var newVariable = generateNewVariable("object",newVariables.length);
	          var args = [newVariable];
	          var newNode = toolSet.genCSPAutoGenLibCallNode("methods", "evaluateObjectAST2JSValue", args);
	          node.newNode = newNode;
	          if(tmpSubFunNodesCount > 0)
	          	newNode['SFN'] = tmpSubFunNodes;
	          newVariables.push(newVariable);
	          break;
	        case "Program":
	          programNode = node;
	          break;
	        default:
	          break;
	      } 
	      
	      //don't go any further for object and array nodes.
	      if(node.CSPTag==="object" || node.CSPTag==="array" ){
	        //replace array or object nodes.
	        //only array or object has `parent` property
	        if(node.hasOwnProperty('newNode')){
	          var parent = node.parent;
	          for(var k in parent){
	            if(parent[k] === node){   
	              parent[k] = node.newNode;
	            }
	          } 
	        }
	        return estraverse.VisitorOption.Skip;
	      }
	      if(node.CSPTag==="evalcall" )
	      	return estraverse.VisitorOption.Skip;
	      if(toolSet.isNewRegExpNode(node))
	      	return estraverse.VisitorOption.Skip;
	    },

	    leave: function (node, parent) {
	      if(toolSet.isLiteralNode(node)){
	        var found = false;
	        for(var k in parent){
	          if(parent[k] === node){    
	            if (node.hasOwnProperty('newNode')){
	              parent[k] = node.newNode;
	              found = true;
	              //console.log("DEBUG: replaced "+node.type+" with "+node.newNode.type);
	            }
	            
	          }
	        }
	        if(!found && parent['arguments']){
	          var callArgs = parent['arguments'];
	          for(var k in callArgs){
	            if(callArgs[k] === node){    
	              if (node.hasOwnProperty('newNode')){
	                callArgs[k] = node.newNode;
	                found = true;
	              } 
	            }
	          }
	        }
	        if(!found){
	        	
	        	console.log("error: shouldn't be here: "+node.CSPTag+" || "+util.inspect(node)+"  === "+parent['arguments']+" "+node.CSPTag);
	        	//console.log("code: "+escodegen.generate(parent) );
	        	
		      //if code reaches here
		      //needs futher testing for those nodes with arguments,
		      //such as CallExpression.      
	       	}
	      }
	      else if(node['newEvalFunArr']){
	      	if(parent['body']){
	      		for(var k in parent['body']){
	          	if(parent['body'][k] === node){      	
            		for(var j in node['newEvalFunArr']){
            			parent['body'].splice(k+j, 0, node['newEvalFunArr'][j]);
            		}
	            	
	          	}
	       		}
	       		delete node['newEvalFunArr'];
	      	}
	      	else if (parent){
	      		parent['newEvalFunArr'] = node['newEvalFunArr'];
	      	}
	      }
	    }
	  });

	  //newVariables.push("CSPEnvironment");
	  var funDecNode = toolSet.genFunctionDeclarationNode(stName, newVariables);
	  if(funDecNode === null){
	    console.log("error: failed to generate FunctionDeclaration node");
	    results[stName] = template;
	    return results;;
	  }
	  
	  if(programNode === null) {
	    console.log("warning: cannot find program node. should be from a complex data node");
	    console.log("warning: generate scripts without program node and add return statement.");
	    //TODO: for such nodes, we don't add function assignment nodes.
	    // not sure if this is the right decision, needs further confirmation.
	    var returnNode = toolSet.genReturnNode(template);
	    funDecNode.body.body.push(returnNode);
	    
	    results[stName] = funDecNode;
	    return results;
	  }

	  //TODO: we do subFunNodes assignment only when it has Program node.
	  // needs to double check.

	  //add parent parameter for each node.
	  var nodesWithSubFuns = [];
	  estraverse.traverse(template, {
	  	enter: function(node){
		  	if(node.hasOwnProperty('SFN')){
		  		nodesWithSubFuns.push(node);
		  	}
		  },
		  leave: function(node, parent){
		  	if(parent !== null ){
		  		node['parent'] = parent;
		  		//console.log("DEBUG: Parent: "+node.type+" -> "+parent.type);
		  	}
		  }
		});

		//add auxiliary function for array or object elements resolving.
	  //console.log(escodegen.generate(template));
	  	var tmpParents = [];
		for(var i in nodesWithSubFuns){
			var SFNNode = nodesWithSubFuns[i];
			var curNode = SFNNode;
			var j = 0;
			var foundJ = false;
			var pb = null;
			while(curNode.hasOwnProperty('parent')){
				tmpParents.push(curNode);
				if(curNode['parent'].type===esprima.Syntax.Program){
					var pb = curNode['parent'].body;
					for(j in pb){
						if(pb[j] === curNode){
							foundJ = true;
							break;
						}	
					}
					break;
				}
				else if(curNode['parent'].type === esprima.Syntax.FunctionDeclaration ||
					curNode['parent'].type === esprima.Syntax.FunctionExpression){
					var pb = curNode['parent'].body.body;
					for(j in pb){
						if(pb[j] === curNode){
							foundJ = true;
							break;
						}	
					}
					break;
				}
				else if(curNode['parent'].type === esprima.Syntax.BlockStatement){
					//console.log("This is block statement: "+util.inspect(curNode['parent'].body));
					var pb = curNode['parent'].body;
					for(j in pb){
						if(pb[j] === curNode){
							foundJ = true;
							break;
						}	
					}
				}
				curNode = curNode['parent'];
			}

			if(!foundJ){
				console.log("error: cannot find the right insertion position for SFNParent");
				pb = programNode.body;
			}
			j=0;
			for(var subFunName in SFNNode['SFN']){
		  		pb.splice(j++, 0, SFNNode['SFN'][subFunName]);
		  		var assignNode = toolSet.genCSPVariableScopeNode(subFunName);
		  		pb.splice(j++, 0, assignNode);
	  		}
		}

	  funDecNode.body.body = programNode.body;
	  programNode.body = [funDecNode];

	  if(returnIdentifier){
	  	var returnNode = toolSet.genReturnNode(toolSet.genIdentifierNode(returnIdentifier));
	    funDecNode.body.body.push(returnNode);
	  }
	  results[stName] = template;
	  return results;
	};

	return {
		buildTemplateFromGASTSet : buildTemplateFromGASTSet,
		generateSymbolicTemplateName : generateSymbolicTemplateName,
		genSymTemplateStr : genSymTemplateStr,
		extractEvalLikeScripts : extractEvalLikeScripts,
		modifyGASTForEvalKeyword : modifyGASTForEvalKeyword,
		buildTemplateFromDataList : buildTemplateFromDataList,
		matchGASTTypes : matchGASTTypes
	};
};

var templateFunctions = CSPAutoGenTemplateFunctions();

module.exports = {
	buildTemplateFromGASTSet : templateFunctions.buildTemplateFromGASTSet,
	generateSymbolicTemplateName : templateFunctions.generateSymbolicTemplateName,
	genSymTemplateStr : templateFunctions.genSymTemplateStr,
	extractEvalLikeScripts : templateFunctions.extractEvalLikeScripts,
	modifyGASTForEvalKeyword : templateFunctions.modifyGASTForEvalKeyword,
	buildTemplateFromDataList : templateFunctions.buildTemplateFromDataList,
	matchGASTTypes : templateFunctions.matchGASTTypes
};