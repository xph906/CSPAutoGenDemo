var util = require('util');
var esprima = require('esprima');
var escodegen = require('escodegen');
var estraverse = require('estraverse');
var diff = require('deep-diff').diff;

var CSPAutoGenToolSet = function(){
	/*******************************************************************/
	/************************** GAST  Methods **************************/
	/*******************************************************************/
	/* 
	 * This function accepts a script string and returns GAST. 
	 * Note that the nodes of GAST are exactly the same with those of 
	 * the corresponding AST, with the exception that each node has 
	 * two more properties: CSPTag and CSPValue. 
	 * Please keep in mind that the GAST returned by this function doesn't lose
	 * any information, so it can convert back to original script.
	 */
	var generateGAST = function(script, values){
	  var ast = esprima.parse(script);
	  return generateGASTFromAST(ast, values);
	};
	var generateGASTFromAST = function(ast, values){
		// All `debugX` data can be removed without affecting program.
		var debugCount = 0;
		var debugLevel = 0;
		var debugSpace = "";
 		var dataCount = 0;

		// add CSPTag and CSPValue properties
		// please read paper for details.
		estraverse.traverse(ast, {
			enter: function(node){
				debugCount++;
				debugLevel++;
				debugSpace = Array(debugLevel).join("  ");
	      
				if(isLiteralNode(node)){
					// subtype of LiteralNode would be one of the following:
					//  "string"
					//  "number"
					//  "boolean"
					//  "null"
					//  "regexp"
					var subtype = getLiteralNodeType(node);
					node['CSPTag'] = subtype;
					node['CSPValue'] = node.value;
					if(subtype === "string" || subtype==="number" || subtype==="boolean"){
						node['CSPIndex'] = dataCount;
						if(values) 
							values[dataCount] = node['CSPValue'];
						dataCount++;
					
						//console.log("DEBUG typeof: "+(typeof node['CSPValue']));
					}
					
					//console.log(debugSpace+ "Literal:"+subtype+" "+node.value);      
				}
				else if(isIdentifierNode(node)){
					node['CSPTag'] = '_'+node.name;
					node['CSPValue'] = null;
					//console.log(debugSpace+ "Identifier:"+node.type);
				}
				else if(isArrayNode(node)){
					node['CSPTag'] = "array";
					node['CSPValue'] = getNonNestedObject(node);
					node['CSPIndex'] = dataCount;
					if(values) 
						values[dataCount] = node['CSPValue'];
					dataCount++
					
					//var cc = 0;
					//for(var i in node['CSPValue'])
					//	cc++;
					//console.log("NNO: array value keys "+cc);
					//console.log(debugSpace+ "Array:"+node.type);
				}
				else if(isObjectNode(node)){
					node['CSPTag'] = "object";
					node['CSPValue'] = getNonNestedObject(node);
					node['CSPIndex'] = dataCount;
					if(values) 
						values[dataCount] = node['CSPValue'];
					dataCount++;
					
					//var cc = 0;
					//for(var i in node['CSPValue'])
					//	cc++;
					//console.log("NNO: array value keys "+cc);
				}
				else if(isEvalCallNode(node)){
					node['CSPTag'] = "evalcall";
					if(node.arguments.length > 0)
						node['CSPValue'] = node.arguments[0].value.toString();
				}
				else {
					node['CSPTag'] = node.type;
					node['CSPValue'] = null;
				}
				if(node.CSPTag==="object" || node.CSPTag==="array")
	        		return estraverse.VisitorOption.Skip;
	    },

	    leave: function (node, parent) {
	      debugLevel--;
	      // for array and object node, add
	      // parent property for generating 
	      // symbolic function.
	      if(isArrayNode(node) || isObjectNode(node) ){
	        node['parent'] = parent;
	      }
	      if(node.CSPTag === "regexp"){
	      	var found = false;
	      	var raw = node.raw;
	      	var firstArg = raw.substr(1,raw.lastIndexOf('/')-1);
	      	var secondArg = raw.substr(raw.lastIndexOf('/')+1);
	      	for(var k in parent){
	      		if(parent[k]===node){
	      			found = true;
	      			parent[k] = genNewRegExpNode(firstArg, secondArg);
	      			parent[k].CSPTag == "regexp";
	      			//console.log("ReplacedRegExpNode: "+util.inspect(parent[k]));
	      		}
	      	}
	      	if(!found && parent['arguments']){
	      		var callArgs = parent['arguments'];
	      		for(var k in callArgs){
		            if(callArgs[k] === node){    
		              found = true; 
		              callArgs[k] = genNewRegExpNode(firstArg, secondArg);
		              callArgs[k].CSPTag == "regexp";
		              //console.log("ReplacedRegExpNode: "+util.inspect(callArgs[k]));
		            }
	        	}
	      	}
	      	else if(!found){
	      		console.log("error: cannot find RegExp's parent node.");
	      	}

	      }
	    }
	  });
	  
	  return ast;
	};

	var addParentPropertyToGAST = function(gast){
		estraverse.traverse(gast, {
	    	enter: function(node){

	    	},
	    	leave: function (node, parent){
	    		if(isArrayNode(node) || isObjectNode(node) ){
	        		node['parent'] = parent;
	      		}
	    	}
	    });
	};

	/* 
	 * TODO: update this function.
	 * This script is used to group GASTs during training phase.
	 * The parameters are two GASTs generated by `generateGAST` function.
	 * If this function returns true, the two GASTs would be put
	 * in the same group and then used to generate template using function
	 * `buildTemplateFromGASTSet`; otherwise, two two GASTs will not be
	 * put into the same group.
	 * ATTENTION: this function is for demonstration. We definetely need to  
	 * optimize it for performance. 
	 */
	var compareTwoGAST = function(gast1, gast2){
	  /* 
	   * When comparing two GASTs, we only compare the CSPTag property.
	   * For Array and Object nodes, we don't further compare their children nodes.
	   */
	  var gastArray1 = new Array();
	  estraverse.traverse(gast1, {
	    enter: function(node){
	      gastArray1.push(node.CSPTag);
	      if(node.CSPTag==="object" || node.CSPTag==="array")
	        return estraverse.VisitorOption.Skip;
	    }
	  });
	  var gastArray2 = new Array();
	  estraverse.traverse(gast2, {
	    enter: function(node){
	      gastArray2.push(node.CSPTag);
	      if(node.CSPTag==="object" || node.CSPTag==="array")
	        return estraverse.VisitorOption.Skip;
	    }
	  });
	  if(gastArray1.length !== gastArray2.length)
	    return false;
	  for(var i in gastArray1){
	    if(gastArray1[i] !== gastArray2[i])
	      return false;
	  }
	  return true;
	};

	/* 
	 * Clone GAST. Some operations might modify GAST in space. 
	 * In that case, we need to clone the GAST first.
	 * TODO: cloneGAST cannot clone regexp /something/. That node
	 * would be replace by {}.
	 */
	var cloneGAST = function(gast){
	  function censor(key, value) {
	    if (key === "parent") {
	      return undefined;
	    }
	    else if(key === "NNOParent"){
	    	return undefined;
	    }
	    return value;
	  }
	  return JSON.parse(JSON.stringify(gast, censor));
	};

	/* 
	 * Generate Template's hash.
	 * 1. if this gast is an Identifier node, returns its name.
	 * 2. otherwise, returns the hash of the template traversal.
	 */
	var generateGASTHash = function(gast){
	  if(isIdentifierNode(gast)){
	    return gast.name;
	  }

	  var array = new Array();
	  estraverse.traverse(gast, {
	    enter: function(node){
	    	if(isRegExpNode(node)){
	    		return estraverse.VisitorOption.Skip;
	    	}

	      if (node.CSPTag !== "Program" ){
	        array.push(node.CSPTag);
	      }
	      
	      if(node.CSPTag==="object" || node.CSPTag==="array"){
	      	/*if(node.CSPValue)
	      	Object.keys(node.CSPValue).sort().forEach(
	      		function(k){
	      			array.push(node.CSPTag+'_'+k);
	      		});*/
	      	return estraverse.VisitorOption.Skip;
	      }
	        
	    }
	  });
	  
	  var originalString = array.join(' ');
	  var hash = 0, i, chr, len;
	  if (originalString.length === 0) return hash;
	  for (i = 0, len = originalString.length; i < len; i++) {
	    chr   = originalString.charCodeAt(i);
	    hash  = ((hash << 5) - hash) + chr;
	    hash |= 0; 
	  }
	  hash = Math.abs(hash);
	  return hash;
	};

	/************************ End GAST Methods ************************/

	/*******************************************************************/
	/******************** Tempalte Related Methods *********************/
	/*******************************************************************/

	/* 
	 * PUBLIC: Store template to persistent storage.
	 * For demo purpose, here we would only store template on external file.
	 * CSPAutoGen will send it to MongoDB.
	 * Note that the template shouldn't have parent parameter.
	 */
	var storeTemplate = function(template, filename){	
		var fs = require('fs');
		try{
			//cloneGASTtemplate = cloneGAST(template);
			estraverse.traverse(template, {
				enter: function(node){
					if(node.CSPType && node.CSPType.type==="regexp"){
						//console.log("storeTemplate: converted a regexp:"+ (node.CSPType.value instanceof RegExp)+" "+
						//	node.CSPType.value.toString());
						var tmp = node.CSPType.value.toString();
						if (tmp.length >= 2){
							node.CSPType.value = tmp.substr(1, tmp.length-2);
						}
						else {
							console.log("error regexp: "+util.inspect(node.CSPType.value));
						}
						
					}
					else if(node.CSPType && node.CSPType.type !=null &&
						(typeof node.CSPType.type)==="object"){
						for(var k in node.CSPType.type){
							if(node.CSPType.type[k] === "regexp"){
								var tmp = node.CSPType.value[k].toString();
								//console.log("storeTemplate: converted a regexp[object]:"+tmp);
								if (tmp.length >= 2){
									node.CSPType.value[k] = tmp.substr(1, tmp.length-2);
								}
								else {
									console.log("error regexp: "+util.inspect(node.CSPType.value[k]));
								}
							}
						}
					}

				}
			});

			//var logStream = fs.createWriteStream(filename);
			fs.writeFileSync(filename, JSON.stringify(template, null, 4), 'utf8');

			//recover back.
			estraverse.traverse(template, {
				enter: function(node){
					if(node.CSPType && node.CSPType.type==="regexp"){
						var tmp = node.CSPType.value.toString();
						node.CSPType.value = new RegExp(node.CSPType.value);
					}
				}
			});
		}
		catch(e){
			console.log("error: failed to storeTemplate to "+filename+": "+e);
		}
	};

	//modify original arr.
	var processTemplateArrsToRecoverRegExp = function(templateArrs){
		for(var hash in templateArrs){
		  var template = templateArrs[hash];
		  for (var i in template){
		    if (typeof template[i].type === "string"){
		      if(template[i].type === "regexp"){
		    	var tmp = template[i].value.toString();
		    	template[i].value = new RegExp(template[i].value);
		    	//console.log("DEBUG recover regexp1: "+ template[i].value+" VS "+tmp);
		      }
		    }
		    else if(typeof template[i].type === "object"){
		      for(k in template[i].type){
		        if (template[i].type[k] === "regexp"){
		          var tmp = template[i].value[k].toString();
		          template[i].value[k] = new RegExp(template[i].value[k]);
		          //console.log("DEBUG recover regexp2: "+ template[i].value[k]+" VS "+tmp);
		        }
		      }
		    }
		  }//for
		}//for
	};

	var storeTemplateArrsAsJSFile = function(templateArrs, filename){
		//var fs = require('fs');
		for(var hash in templateArrs){
		  var template = templateArrs[hash];
		  for (var i in template){
		    if (typeof template[i].type === "string"){
		      if(template[i].type === "regexp"){
		    	
		    	var tmp = template[i].value.toString();
		    	template[i].value = tmp.substr(1,tmp.length-2);
		    	//console.log("DEBUG regexp1: "+ template[i].value+" "+(typeof template[i].value ));
		      }
		    }
		    else if(typeof template[i].type === "object"){
		      for(k in template[i].type){
		        if (template[i].type[k] === "regexp"){
		          
		          var tmp = template[i].value[k].toString();
		          template[i].value[k] = tmp.substr(1,tmp.length-2);
		          //console.log("DEBUG regexp2: "+ template[i].value[k]+" "+(typeof template[i].value[k]));
		        }
		      }
		    }
		  }//for
		}//for
		storeTemplatesAsJSFile(templateArrs, filename);
	};

	var storeTemplatesAsJSFile = function(templates, filename){	
		var fs = require('fs');
		var str = "var CSPAutoGenTemplates = " + JSON.stringify(templates, null, 4);
		try{
			var logStream = fs.createWriteStream(filename);
			fs.writeFileSync(filename, str, 'utf8');
			console.log("storeTemplatesAsJSFile "+str.length+" bytes.");
		}
		catch(e){
			console.log("error: failed to storeTemplatesAsJSFile to "+filename+": "+e);
		}
	};

	var storeSymbolicTemplatesAsJSFile = function(symTemplateStrDict, filename){	
		var fs = require('fs');
		var contents = "";
		for(var hash in symTemplateStrDict){
  			var jsString = symTemplateStrDict[hash];
  			contents += jsString;
  			contents += "\n";
  		}

  		try{
  			var logStream = fs.createWriteStream(filename);
			fs.writeFileSync(filename, contents, 'utf8');
			console.log("storeSymbolicTemplatesAsJSFile: "+contents.length+" bytes.");
		}
		catch(e){
			console.log("error: storeSymbolicTemplatesAsJSFile failed.");
		}
	};

	/* 
	 * PUBLIC: Load templates from directory.
	 * The results will be stored at templates and symTemplates.
	 * templates stored template without parent;
	 * symTemplates stored template with parent.
	 */
	var loadTemplatesFromDirectory = function(dirName, templates, symTemplates, typeArrs){
		var fs = require('fs');
		var walk = function(dir) {
			var results = [];
			var list = fs.readdirSync(dir);
			list.forEach(function(file) {
				file = dir + '/' + file;
				var stat = fs.statSync(file);
				if (stat && !stat.isDirectory()) {
					results.push(file);
					//console.log("filename: "+file+" "+util.inspect(stat) );
				}
			});
			return results;
    	}
		var files = walk(dirName);
		for(var i in files){
			var template = loadTemplate(files[i]);
			if(template){
				console.log("succeed loading template "+
					files[i]+ " with "+ template.template.arr.length +
					" types.");
				var hash = template.hash;
				if(templates){
					templates[hash] = template.template.tree;
				}
				if(symTemplates){
					//TODO: add regexp
					var templateWithParent = cloneGAST(template.template.tree);
					addParentPropertyToGAST(templateWithParent);
					symTemplates[hash] = templateWithParent;
					estraverse.traverse(templateWithParent, {
						enter: function(node){

						},
						leave: function(node, parent){
							if(node.regex){
								var found = false;
	      						//console.log("LoadTemplates RGEXP: ==="+util.inspect(node.regex));
	      						var firstArg = node.regex.pattern.toString();
	      						var secondArg = node.regex.flags.toString();
	      						for(var k in parent){
	      							if(parent[k]===node){
	      								found = true;
	      								parent[k] = genNewRegExpNode(firstArg, secondArg);
	      								parent[k].CSPTag == "regexp";
	      								//console.log("ReplacedRegExpNode: "+util.inspect(parent[k]));
	      							}
	      							if(!found && parent['arguments']){
	      								var callArgs = parent['arguments'];
							      		for(var k in callArgs){
								            if(callArgs[k] === node){    
								              found = true; 
								              callArgs[k] = genNewRegExpNode(firstArg, secondArg);
								              callArgs[k].CSPTag == "regexp";
								              //console.log("ReplacedRegExpNode: "+util.inspect(callArgs[k]));
								            }
							        	}
	      							}
		      						else if(!found){
		      							console.log("error: cannot find RegExp's parent node.");
		      						}
	      						}
							}//if regex
						}//leave
					});
				}
				if(typeArrs){
					typeArrs[hash] = template.template.arr;
				}
			}
		}

	};

	/* 
	 * PUBLIC: Load template from file.
	 * For demo purpose, here we would only store template on external file.
	 * CSPAutoGen will send it to MongoDB.
	 * Note that the template shouldn't have parent parameter.
	 * Return: {hash : hash, template : {tree:tree, arr:arr}}
	 */
	var loadTemplate = function(filename){	
		var fs = require('fs');	

		try{
			if(!fs.existsSync(filename)){
				console.log("error: file "+filename+" does not exist.");
				return null;
			}
			var contents = fs.readFileSync(filename).toString();
			//console.log("Read template "+contents.length+" bytes.");

			var templateTree = JSON.parse(contents);
			var typeArr = [];
			estraverse.traverse(templateTree, {
				enter: function(node){
					if(node.CSPType && node.CSPType.type==="regexp"){
						node.CSPType.value = new RegExp(node.CSPType.value);
					}
					else if(node.CSPType && node.CSPType.type !=null && 
						(typeof node.CSPType.type)==="object"){
						for(var k in node.CSPType.type){
							if(node.CSPType.type[k] === "regexp"){
								var tmp = node.CSPType.value[k].toString();
								node.CSPType.value[k] = new RegExp(node.CSPType.value[k]);
								//console.log("loadTemplate: converted a regexp[object]:"+node.CSPType.value[k]);
							}
						}
					}

					if(node.CSPIndex != undefined){
						typeArr[node.CSPIndex] = node.CSPType;
					}
				}
			});
			return {
				hash : generateGASTHash(templateTree), 
				template : {
					tree : templateTree, 
					arr : typeArr } };
		}
		catch(e){
			console.log("error: failed to load tempalte from "+filename+": "+e);
			return null;
		}
		
	};

	var checkTemplate = function(gast, templateArrs){
		
	}
	/* 
	 * PUBLIC: Find template from DB for target script. If cannot find any,
	 * return null.
	 * The argument templates is a dictionary: hash -> template 
	 */
	var findTemplate = function(gast, templates){
	  var hash = generateGASTHash(gast);
	  // check if hash matches any
	  if(hash in templates){
	  	return templates[hash];
	  }
	  return null;
	};

	/* 
	 * PRIVATE function to check if nodes in gast and template
	 * have matching types
	 * INPUT: gast, template
	 * OUTPUT: boolean true/false
	 */
	var checkGastTemplateTypes = function(gast, template){
		// get all differences
		var differences = diff(gast, template);
		// see if any of the types are different (or if one does not exist)
		// check the path of each difference, if last key is type then a type is different
		for (i in differences){
			path = differences[i].path;
			lastkey = path[path.length-1];
			if (lastkey == "type"){
				return false;
			}
		}
		return true;
	};
	/******************** END Tempalte Related Methods ******************/	


	/*******************************************************************/
	/********************* Node Generation Methods *********************/
	/*******************************************************************/
	
	/* 
	 * Those xxxScript variables are used to extract different types
	 * of esprima nodes (e.g., Identifier node). If there are ways
	 * to directly create these nodes, we will replace this approach. 
	 * The node generation functions include:
	 *  1. genIdentifierNode
	 *  2. genFunctionDeclarationNode
	 *  3. genFunCallNode
	 *  4. genReturnNode
	 *  5. genCSPVariableScopeNode
	 *  6. genCSPAutoGenLibCallNode
	 */
	var identifierScript = "varX;";
	var identifierAST = esprima.parse(identifierScript);
	var identifierNode = null;
	var genIdentifierNode = function(idName){
		if(identifierNode !== null){
			var newIdentifierNode = JSON.parse(JSON.stringify(identifierNode));
			newIdentifierNode.name = idName;
			return newIdentifierNode;
		}
		
		estraverse.traverse(identifierAST, {
			enter: function(node){
				if (node.type === esprima.Syntax.Identifier){
					identifierNode = node;
					this.break();
				}
			}
		});
		if(identifierNode === null){
			console.log("error: failed to extract Identifier node");
			return null;
		}
		var newIdentifierNode = JSON.parse(JSON.stringify(identifierNode));
		newIdentifierNode.name = idName;	
		//console.log("IDNODE:"+util.inspect(newIdentifierNode));
		return newIdentifierNode;
	}

	var functionScript = "function X(){};";
	var functionAST = esprima.parse(functionScript);
	var functionNode = null;
	var genFunctionDeclarationNode = function(funName, args){
		var newNode = null;
		if(functionNode !== null){
			newNode = JSON.parse(JSON.stringify(functionNode));
			newNode.id.name = funName;
			newNode.params = [];

			for(var i in args){
				newNode.params.push(genIdentifierNode(args[i]));
			}
			return newNode;
		}
		
		estraverse.traverse(functionAST, {
			enter: function(node){
				if (node.type === esprima.Syntax.FunctionDeclaration){
					functionNode = node;
					this.break();
				}
			}
		});

		if(functionNode === null){
			console.log("error: failed to extract FunctionDeclaration node");
			return null;
		}
		newNode = JSON.parse(JSON.stringify(functionNode));
		newNode.id.name = funName;
		newNode.params = [];

		for(var i in args){
			newNode.params.push(genIdentifierNode(args[i]));
		}
		return newNode;
	};

	var funCallScript = "funName();";
	var funCallAST = esprima.parse(funCallScript);
	var funCallNode = null;
	var genFunCallNode = function(funName, args){
		var newNode = null;
		if(functionNode !== null){
			newNode = JSON.parse(JSON.stringify(funCallNode));
			newNode.callee.name = funName;
			newNode.arguments = [];

			for(var i in args)
				newNode.arguments.push(genIdentifierNode(args[i]));
			return newNode;
		}
		
		estraverse.traverse(funCallAST, {
			enter: function(node){
				if (node.type === esprima.Syntax.CallExpression){
					funCallNode = node;
					this.break();
				}
			}
		});

		if(funCallNode === null){
			console.log("error: failed to extract CallExpression node");
			return null;
		}
		newNode = JSON.parse(JSON.stringify(funCallNode));
		newNode.callee.name = funName;
		newNode.arguments = [];

		for(var i in args)
			newNode.arguments.push(genIdentifierNode(args[i]));
		return newNode;
	};

	var funReturnScript = "function x(){return m};";
	var funReturnAST = esprima.parse(funReturnScript);
	var funReturnNode = null;
	var genReturnNode = function(node){		
		if(funReturnNode === null){
			estraverse.traverse(funReturnAST, {
				enter: function(node){
					if (node.type === esprima.Syntax.ReturnStatement){
						funReturnNode = JSON.parse(JSON.stringify(node));
						this.break();
					}
				}
			});
		}
		
		var newNode = JSON.parse(JSON.stringify(funReturnNode));
		newNode.argument = node;
		return newNode;
	};

	var newRegExpScript = "new RegExp('\s','g')";
	var newRegExpAST = esprima.parse(newRegExpScript);
	var newRegExpNode = null;
	var genNewRegExpNode = function(firstArg, secondArg){		
		if(newRegExpNode === null){
			estraverse.traverse(newRegExpAST, {
				enter: function(node){
					if (node.type === esprima.Syntax.NewExpression){
						newRegExpNode = JSON.parse(JSON.stringify(node));
						//console.log("genNewRegExpNode: "+util.inspect(newRegExpNode));
						this.break();
					}
				}
			});
		}
		
		var newNode = JSON.parse(JSON.stringify(newRegExpNode));
		if(firstArg != null){
			newNode.arguments[0].value = firstArg;
			newNode.arguments[0].raw = "'"+firstArg+"'";
		}
		if(secondArg != null && secondArg != ""){
			newNode.arguments[1].value = secondArg;
			newNode.arguments[1].raw = "'"+secondArg+"'";
		}
		else{
			newNode.arguments.pop();
		}

		return newNode;
	};

	var CSPVariableScopeScript = "CSPClientLibrary['methods']['vx'] = vx;";
	var CSPVariableScopeAST = esprima.parse(CSPVariableScopeScript);
	var CSPVariableScopeNode = null;
	var genCSPVariableScopeNode = function(variableName){		
		if(CSPVariableScopeNode === null){
			estraverse.traverse(CSPVariableScopeAST, {
				enter: function(node){
					if (node.type === esprima.Syntax.ExpressionStatement){
						CSPVariableScopeNode = node;
						this.break();
					}
				}
			});
		}
		
		var newNode = JSON.parse(JSON.stringify(CSPVariableScopeNode));
		
		
		newNode.expression.left.property.value = variableName;
		newNode.expression.left.property.raw = "'"+variableName+"'";
		newNode.expression.right.name = variableName;
		//console.log(escodegen.generate(CSPVariableScopeNode));
		//console.log(util.inspect(CSPVariableScopeNode.expression.right));
		return newNode;
	}

	var CSPAutoGenLibMethods = "CSPClientLibrary['methods']";
	var CSPAutoGenLibMethodsAST = esprima.parse(CSPAutoGenLibMethods);
	var CSPAutoGenLibMethodsNode = null;
	var CSPAutoGenLibSymTemplates = "CSPClientLibrary['symbolicTemplates']";
	var CSPAutoGenLibSymTemplatesAST = esprima.parse(CSPAutoGenLibSymTemplates);
	var CSPAutoGenLibSymTemplatesNode = null;
	var CSPAutoGenLibMethodCall = 
		"CSPClientLibrary['methods'].methodName(a);";
	var CSPAutoGenLibMethodCallAST = esprima.parse(CSPAutoGenLibMethodCall);
	var CSPAutoGenLibMethodCallNode = null;
	// Note all the arguments in `args` are identifiers.
	// genCSPAutoGenLibCallNode will automatically append 
	//   1. CSPClientLibrary['methods'] and
	//   2. CSPClientLibrary['symbolicTemplates']
	// at the end of the generated function call argument list.
	var genCSPAutoGenLibCallNode = function(propertyName, methodName, args){
		if(CSPAutoGenLibMethodCallNode === null){
			estraverse.traverse(CSPAutoGenLibMethodCallAST, {
				enter: function(node){
					if (node.type === esprima.Syntax.ExpressionStatement){
						CSPAutoGenLibMethodCallNode = node;
						this.break();
					}
				}
			});	
		}
		if(CSPAutoGenLibMethodCallNode === null)
			return null;

		if(CSPAutoGenLibMethodsNode === null){
			estraverse.traverse(CSPAutoGenLibMethodsAST, {
				enter: function(node){
					if (node.type === esprima.Syntax.MemberExpression){
						CSPAutoGenLibMethodsNode = node;
						this.break();
					}
				}
			});	
		}
		if(CSPAutoGenLibMethodsNode === null)
			return null;

		if(CSPAutoGenLibSymTemplatesNode === null){
			estraverse.traverse(CSPAutoGenLibSymTemplatesAST, {
				enter: function(node){
					if (node.type === esprima.Syntax.MemberExpression){
						CSPAutoGenLibSymTemplatesNode = node;
						this.break();
					}
				}
			});	
		}
		if(CSPAutoGenLibSymTemplatesNode === null)
			return null;

		var newNode = JSON.parse(JSON.stringify(CSPAutoGenLibMethodCallNode));
		
		newNode.expression.callee.object.property.value = propertyName;
		newNode.expression.callee.object.property.raw = propertyName;
		newNode.expression.callee.property.name = methodName;
		newNode.expression.arguments = [];
		var nodeArgs = newNode.expression.arguments;
		//console.log("CallExpression: "+util.inspect(newNode.expression.arguments)+" "+args);

		for(var i in args)
			nodeArgs.push(genIdentifierNode(args[i]));
		nodeArgs.push(CSPAutoGenLibMethodsNode);
		nodeArgs.push(CSPAutoGenLibSymTemplatesNode);
		//console.log("DEBUG: generated lib call scripts:\n"+escodegen.generate(newNode));
		return newNode;
	};
	/********************End Node Generation Methods********************/

	/*******************************************************************/
	/************************ Node Type Methods ************************/
	/*******************************************************************/
	var isArrayNode = function(node) {
		// There are two ways to create Array:
		// 1. ArrayExpression: [a,b,c]
		// 2. New Array Expression: new Array(1,2);  
		//    this case needs to further checking the node's 
		//    children nodes.
		if(node.type === esprima.Syntax.ArrayExpression)
			return true;
		else if(node.type === esprima.Syntax.NewExpression){
			//check if it's new array expression.
			//node.callee.Identifier.name === Array
			if(node.hasOwnProperty('callee')){
				var childNode = node.callee;
				if(childNode.hasOwnProperty('name')){
					if(childNode.name === "Array"){
						return true;
					}
				}
			}
		}
		return false;
	};
	var isObjectNode = function(node) {
		// There are two ways to create Object:
		// 1. ObjectExpression: {key1:val1, key2:val2}
		// 2. New Object Expression: new Object();  
		//    this case needs to further checking the node's 
		//    children nodes.

		if(node.type === esprima.Syntax.ObjectExpression)
			return true;
		else if(node.type === esprima.Syntax.NewExpression){
			//check if it's new array expression.
			//node.callee.Identifier.name === Array
			if(node.hasOwnProperty('callee')){
				var childNode = node.callee;
				if(childNode.hasOwnProperty('name')){
					if(childNode.name === "Object"){
						return true;
					}
				}
			}
		}
		return false;
	};
	var isEvalCallNode = function(node){
		if (node.type===esprima.Syntax.CallExpression &&
			node.callee.type==="Identifier" && 
			node.callee.name==="eval" && 
			node.arguments.length > 0) {
			return true;
		}
		return false;
	};
	var isRegExpNode = function(node){
		if(node.regex)
			return true;
		else if (node.type===esprima.Syntax.NewExpression &&
			node.callee && 
			node.callee.name==="RegExp" ) {
			//console.log("A RegExp Node!");
			return true;
		}
		return false;
	};

	var isFunctionCallNode = function(node){
		if (node.type===esprima.Syntax.CallExpression &&
			node.callee.type==="Identifier" && 
			node.callee.name==="Function" && 
			node.arguments.length > 0) {
			return true;
		}
		return false;
	};

	var isNewRegExpNode = function(node){
		if(node.type === esprima.Syntax.NewExpression &&
			node.callee.type === "Identifier" &&
			node.callee.name === "RegExp"){
			return true;
		}
		return false;
	}

	var isIdentifierNode = function(node){
		return node.type === esprima.Syntax.Identifier;
	};
	var isLiteralNode = function(node){
		return node.type === esprima.Syntax.Literal;
		//if ((node.type === esprima.Syntax.Literal) && !node['regex'])
		//	return true;
		//return false;
	};
	var getLiteralNodeType = function(node){
		//Literal Node => string | boolean | null | number | regexp
		if(node.type !== esprima.Syntax.Literal)
			return null;
		//console.log(util.inspect(node));
		var type = typeof node.value;
		if (type === "object"){
			if (node.value instanceof RegExp)
				return "regexp";
			else if(node.value === null)
				return "null";
		}
		return type;
	};

	//Backup
	var getNonNestedObject1 = function(node){
		// first clone so we can mess with it without affecting original
		myNode =cloneGAST(node);

		NNO = {};
		depth = 0;
		// traverse once to process
		// add depth and parent
		estraverse.traverse(myNode, {
			enter: function(n, p){
				if (getNonNestedObjectHelper.getIfIsObjectOrArrayType(n)){
					depth++;
				}
				n.NNOdepth = depth;
				n.NNOParent = p;
			},
			leave: function(n, p){
				if (getNonNestedObjectHelper.getIfIsObjectOrArrayType(n)){
					depth--;
				}
			}
		});
		// traverse again to make NNO
		estraverse.traverse(myNode, {
			enter: function(n){
				if (isLiteralNode(n)){
					switch (getLiteralNodeType(n)){
						case "string":
							keyToPushStringTo = getNonNestedObjectHelper.getKeyToPushStringTo(n);
							getNonNestedObjectHelper.pushToNNO(NNO, keyToPushStringTo, n.value);
							break;
						case "boolean":
							getNonNestedObjectHelper.pushToNNO(NNO, "CSP_boolean", n.value);
							break;
						case "number":
							getNonNestedObjectHelper.pushToNNO(NNO, "CSP_number", n.value);
							break;
						default:
							console.log("uncaught type in CSPAutoGenToolSet:GetNonNestedObject:2nd estraverse traverse : " +
							 getLiteralNodeType(n) );
							//+ " "+util.inspect(n)
							break;
					}
					return estraverse.VisitorOption.Skip;
				}
				else if(!isArrayNode(n) && !isObjectNode(n) && (n.type in expressions) ){
					//console.log("found an expression: "+n.type); 
					getNonNestedObjectHelper.pushToNNO(NNO, "CSP_GAST", generateGASTFromAST(n));
					return estraverse.VisitorOption.Skip;
				}
				// do nothing otherwise
			},
		});		
		//console.log('==============================')
		//console.log("node: "+escodegen.generate(node));	
		//console.log("NNO: "+util.inspect(NNO));
		//console.log('==============================')
		return NNO;
	};

	/* 
	 * Used for flating Array and Object.
	 * Please read paper for details.
	 */
	var getNonNestedObject = function(node){
		// first clone so we can mess with it without affecting original
		myNode =cloneGAST(node);

		NNO = {};
		depth = 0;
		// traverse once to process
		// add depth and parent
		estraverse.traverse(myNode, {
			enter: function(n, p){
				if (getNonNestedObjectHelper.getIfIsObjectOrArrayType(n)){
					depth++;
				}
				n.NNOdepth = depth;
				n.NNOParent = p;
			},
			leave: function(n, p){
				if (getNonNestedObjectHelper.getIfIsObjectOrArrayType(n)){
					depth--;
				}
			}
		});
		// traverse again to make NNO
		estraverse.traverse(myNode, {
			enter: function(n, p){
				if(p && p.type==="Property" && p.key && p.key===n){
					//do nothing.
				}
				else if (isLiteralNode(n)){
					switch (getLiteralNodeType(n)){
						case "string":
							keyToPushStringTo = getNonNestedObjectHelper.getKeyToPushStringTo(n, "string");
							//if(!keyToPushStringTo) console.log("ALERT: underfined key:")
							getNonNestedObjectHelper.pushToNNO(NNO, keyToPushStringTo, n.value);
							break;
						case "boolean":
							keyToPushStringTo = getNonNestedObjectHelper.getKeyToPushStringTo(n, "boolean");
							getNonNestedObjectHelper.pushToNNO(NNO, keyToPushStringTo, n.value);
							break;
						case "number":
							keyToPushStringTo = getNonNestedObjectHelper.getKeyToPushStringTo(n, "number");
							getNonNestedObjectHelper.pushToNNO(NNO, keyToPushStringTo, n.value);
							break;
						default:
							//console.log("uncaught type in CSPAutoGenToolSet:GetNonNestedObject:2nd estraverse traverse : " +
							// getLiteralNodeType(n) );
							break;
					}
					return estraverse.VisitorOption.Skip;
				}
				else if(!isArrayNode(n) && !isObjectNode(n) && (n.type in expressions) ){
					//console.log("found an expression: "+escodegen.generate(n) ); 
					getNonNestedObjectHelper.pushToNNO(NNO, "CSP_GAST", generateGASTFromAST(n));
					return estraverse.VisitorOption.Skip;
				}
			},
		});		
		/*console.log('==============================')
		console.log("node: "+escodegen.generate(node));	
		console.log("NNO: "+util.inspect(NNO));
		console.log('==============================')
		for(var k in NNO){
			if (!k){
				//console.log("undefined k: "+util.inspect(NNO));
				console.log(util.inspect(node));
				
			}
			//console.log("NNO:key"+k+" v:"+util.inspect(NNO[k]));
		}*/
		return NNO;
	};
	var getNonNestedObjectHelper = {
		getIfIsObjectOrArrayType: function(n){
			if (n.CSPTag){
				if ((n.CSPTag=="array")||(n.CSPTag=="object")){
					return true;
				}
				return false;
			} else {
				if ((isArrayNode(n))||(isObjectNode(n))){
					return true;
				}
				return false;
			}
		},
		pushToNNO : function(NNO, key, value){
			if (NNO[key]==undefined){
				NNO[key] = [];
			}
			NNO[key].push(value);
		},
		getKeyToPushStringTo: function(n, t){
			// traverse upwards and see what objects/arrays n exists in
			// if in an object, return object name as the key
			// if not in anything, return key made with depth
			// console.log(String(n.value));
			if (n.NNOParent){
				var p = n.NNOParent;
				if (p.type === "Property" ){
					if(p.key && p.key.value){
						return p.key.value;
					}
				}
				else if(p.type === "ArrayExpression"){
					if(p.NNOParent && p.NNOParent.type==="Property")
						if(p.NNOParent.key && p.NNOParent.key.value){
							return p.NNOParent.key.value;
						}	
				}
			}
			if(t === "string")
				return "CSP_string_lev" + String(n.NNOdepth);
			else
				return t;
		}
	};

	var addElemToDict = function(k, v, dict){
		if(! (k in dict) ){
			dict[k] = [];
		}
		dict[k].push(v);
	};

	var expressions = {
    AssignmentExpression: 'AssignmentExpression',
    AssignmentPattern: 'AssignmentPattern',
    ArrayExpression: 'ArrayExpression',
    ArrowFunctionExpression: 'ArrowFunctionExpression',
    BlockStatement: 'BlockStatement',
    BinaryExpression: 'BinaryExpression',
    BreakStatement: 'BreakStatement',
    CallExpression: 'CallExpression',
    CatchClause: 'CatchClause',
    ClassBody: 'ClassBody',
    ClassDeclaration: 'ClassDeclaration',
    ClassExpression: 'ClassExpression',
    ConditionalExpression: 'ConditionalExpression',
    ContinueStatement: 'ContinueStatement',
    DoWhileStatement: 'DoWhileStatement',
    DebuggerStatement: 'DebuggerStatement',
    ExportAllDeclaration: 'ExportAllDeclaration',
    ExportDefaultDeclaration: 'ExportDefaultDeclaration',
    ExportNamedDeclaration: 'ExportNamedDeclaration',
    ExportSpecifier: 'ExportSpecifier',
    ExpressionStatement: 'ExpressionStatement',
    ForStatement: 'ForStatement',
    ForOfStatement: 'ForOfStatement',
    ForInStatement: 'ForInStatement',
    FunctionDeclaration: 'FunctionDeclaration',
    FunctionExpression: 'FunctionExpression',
    IfStatement: 'IfStatement',
    ImportDeclaration: 'ImportDeclaration',
    ImportDefaultSpecifier: 'ImportDefaultSpecifier',
    ImportNamespaceSpecifier: 'ImportNamespaceSpecifier',
    ImportSpecifier: 'ImportSpecifier',
    LabeledStatement: 'LabeledStatement',
    LogicalExpression: 'LogicalExpression',
    MemberExpression: 'MemberExpression',
    MetaProperty: 'MetaProperty',
    MethodDefinition: 'MethodDefinition',
    NewExpression: 'NewExpression',
    ObjectExpression: 'ObjectExpression',
    ObjectPattern: 'ObjectPattern',
    RestElement: 'RestElement',
    ReturnStatement: 'ReturnStatement',
    SequenceExpression: 'SequenceExpression',
    SpreadElement: 'SpreadElement',
    SwitchCase: 'SwitchCase',
    SwitchStatement: 'SwitchStatement',
    TaggedTemplateExpression: 'TaggedTemplateExpression',
    TemplateElement: 'TemplateElement',
    TemplateLiteral: 'TemplateLiteral',
    ThisExpression: 'ThisExpression',
    ThrowStatement: 'ThrowStatement',
    TryStatement: 'TryStatement',
    UnaryExpression: 'UnaryExpression',
    UpdateExpression: 'UpdateExpression',
    VariableDeclaration: 'VariableDeclaration',
    VariableDeclarator: 'VariableDeclarator',
    WhileStatement: 'WhileStatement'
	};

	/********************** End Node Type Methods **********************/

	return {
		generateGAST : generateGAST,
		generateGASTFromAST : generateGASTFromAST,
		compareTwoGAST : compareTwoGAST,
		generateGASTHash : generateGASTHash,
		// matchTargetScriptToGAST : matchTargetScriptToGAST,
		cloneGAST : cloneGAST,
		// getNodeTypeName : getNodeTypeName,
		isArrayNode : isArrayNode,
		isIdentifierNode : isIdentifierNode,
		isLiteralNode : isLiteralNode,
		isObjectNode : isObjectNode,
		getLiteralNodeType : getLiteralNodeType,
		getNonNestedObject : getNonNestedObject,
		genIdentifierNode : genIdentifierNode,
		genFunctionDeclarationNode : genFunctionDeclarationNode,
		genFunCallNode : genFunCallNode,
		genCSPAutoGenLibCallNode : genCSPAutoGenLibCallNode,
		genCSPVariableScopeNode : genCSPVariableScopeNode,
		genReturnNode : genReturnNode,
		findTemplate : findTemplate,
		storeTemplate : storeTemplate,
		storeTemplatesAsJSFile : storeTemplatesAsJSFile,
		storeTemplateArrsAsJSFile : storeTemplateArrsAsJSFile,
		storeSymbolicTemplatesAsJSFile : storeSymbolicTemplatesAsJSFile,
		//loadTemplate : loadTemplate,
		loadTemplatesFromDirectory : loadTemplatesFromDirectory,
		isNewRegExpNode : isNewRegExpNode,
		addElemToDict : addElemToDict,
		isEvalCallNode : isEvalCallNode,
		processTemplateArrsToRecoverRegExp : processTemplateArrsToRecoverRegExp
		// compareType : compareType
	};
};

var toolSet = CSPAutoGenToolSet();

module.exports = {
	generateGAST : toolSet.generateGAST,
	generateGASTFromAST : toolSet.generateGASTFromAST,
	compareTwoGAST : toolSet.compareTwoGAST,
	generateGASTHash : toolSet.generateGASTHash,
	cloneGAST : toolSet.cloneGAST,
	isArrayNode : toolSet.isArrayNode,
	isIdentifierNode : toolSet.isIdentifierNode,
	isLiteralNode : toolSet.isLiteralNode,
	isObjectNode : toolSet.isObjectNode,
	getLiteralNodeType : toolSet.getLiteralNodeType,
	getNonNestedObject : toolSet.getNonNestedObject,
	genIdentifierNode : toolSet.genIdentifierNode,
	genFunctionDeclarationNode : toolSet.genFunctionDeclarationNode,
	genFunCallNode : toolSet.genFunCallNode,
	genCSPAutoGenLibCallNode : toolSet.genCSPAutoGenLibCallNode,
	genCSPVariableScopeNode : toolSet.genCSPVariableScopeNode,
	genReturnNode : toolSet.genReturnNode,
	findTemplate : toolSet.findTemplate,
	storeTemplate : toolSet.storeTemplate,
	//loadTemplate : toolSet.loadTemplate,
	storeTemplatesAsJSFile : toolSet.storeTemplatesAsJSFile,
	storeTemplateArrsAsJSFile : toolSet.storeTemplateArrsAsJSFile,
	storeSymbolicTemplatesAsJSFile : toolSet.storeSymbolicTemplatesAsJSFile,
	processTemplateArrsToRecoverRegExp : toolSet.processTemplateArrsToRecoverRegExp,
	loadTemplatesFromDirectory : toolSet.loadTemplatesFromDirectory,
	isNewRegExpNode : toolSet.isNewRegExpNode,
	addElemToDict : toolSet.addElemToDict,
	isEvalCallNode : toolSet.isEvalCallNode
};


//====TESTING=====
/*
var fun = function(){ return 2*3; };
var org_array =['str1', [4,'str2'], {k1:'str3', k2:{k3:'str4'}}, 33, {k1:'str5'}, 2, 3, fun()+1];
var script = "['str1', [4,'str2'], {k1:'str3', k2:{k3:'str4'}}, 33, {k1:'str5'}, 2, 3, fun()+1]";
gast = toolSet.generateGAST(script);
var myNode = null;
estraverse.traverse(gast, {
  enter: function(node){
    if (toolSet.isArrayNode(node) || toolSet.isObjectNode(node)){
    	myNode = node;
    	return estraverse.VisitorOption.Skip;
    }
  }
});
var nno = toolSet.getNonNestedObject(myNode);
console.log(util.inspect(nno));
*/
