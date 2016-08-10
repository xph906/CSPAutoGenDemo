var util = require('util');
var esprima = require('esprima');
var estraverse = require('estraverse');
var escodegen = require('escodegen');
var toolSet = require('./CSPAutoGenToolSet.js');
var templateHandlers = require("./CSPAutoGenTemplateFunctions.js");
var diff = require('deep-diff').diff;

var CSPRuntimeFunctions = function(){
	var win = undefined;

	/* The parameter is the global window.
	 * It's required when the codes are not running on browser.*/
	var init = function(w){
		win = this.window || w;
	};

	/* Find template from DB for target script. If cannot find any,
	 * return null.
	 * The argument templates is a dictionary: hash -> template */
	var findTemplate = function(gast, templates){
	  var hash = toolSet.generateGASTHash(gast);
	  // check if hash matches any
	  if(hash in templates){
	  	return templates[hash];
	  }
	  return null;
	};

	/* PRIVATE function to check if nodes in gast and template
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
	}

	/* This function will extract the data value/nodes from a GAST 
	 * and serve them as the actual parameters of corresponding 
	 * symbolic template. */
	var extractParametersForSymbolicTemplate = function(gast){
	  var count = 0;
	  var args = [];

	  estraverse.traverse(gast, {
	    enter: function(node){
	    	switch(node.CSPTag){
	    		case "string":
					args.push(node.value);
					break;
				case "number":
					args.push(parseInt(node.value));
					break;
				case "boolean":
					args.push(Boolean(node.value) );
					break;
				case "evalcall":
					if(node['CSPValue']){
						var evalGAST = toolSet.generateGAST(node['CSPValue']);
						var evalArgs = extractParametersForSymbolicTemplate(evalGAST);
						args = args.concat(evalArgs);
					}
					break;
				case "functioncall":
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
			if(node.CSPTag==="object" || node.CSPTag==="array" || 
				node.CSPTag==="evalcall" || node.CSPTag==="functioncall"){
				return estraverse.VisitorOption.Skip;
			} 
	    }
	  });
	  //console.log("DEBUG: extractParametersForSymbolicTemplate result: "+args);
	  return args;
	};

	/* The function will replace the original eval function when event
	 * domContentLoaded is called. i.e., window.eval = safeEval.
	 */
	var safeEval = function(script){
		var gast = toolSet.generateGAST(script);
		//console.log("safeEval: "+util.inspect(win));
		var templates = win.CSPClientLibrary['templates'];
		var symbolicTemplates = win.CSPClientLibrary['symbolicTemplates'];
		if(gast === null){
		  console.log("error: safeEval cannot parse the script.");
		  return ;
		}

		// Find template for this script
		var template = findTemplate(gast, templates);
		if(template === null){
		  console.log("error: safeEval cannot find template for this script.");
		  return ;
		} else {
			console.log("success: safeEval now evaluating script");
		}
		var templateHash = toolSet.generateGASTHash(template);
		//console.log("template hash:"+templateHash);

		var symbolicTemplate = symbolicTemplates[templateHash];
		if(symbolicTemplate===null || symbolicTemplate===undefined){
		  console.log("error: safeEval cannot find symbolic template.");
		  return ;
		}

		// Generate actual arguments of this call.
		var args = extractParametersForSymbolicTemplate(gast);
		console.log("DEBUG: safeEval extracted actual parameters:");
		for(var key in args){
		  console.log("DEBUG:   arg: "+key+" => "+(typeof args[key])+": "+args[key] );
		}
		console.log("DEBUG: safeEval will call the following symbolic function:\n"+symbolicTemplate.toString()+"\n");

		//TODO:
		symbolicTemplate.apply(this, args);

	};

	/****************************************************
	 **** EvaluateASTNode2JSValue conversion methods ****
	 ****************************************************/
	var ConversionMethods = function(){
	  /* This method will extract the first array node
	   * from scripts. 
	   * TESTING: this function is only used during testing. */
	  var extractArrayNodeFromScript = function(arrayScript){
	    
	    var ast = esprima.parse(arrayScript);
	    var arrayNode = null;
	    estraverse.traverse(ast, {
	      enter: function(node){
	        if (node.type === esprima.Syntax.ArrayExpression){
	          arrayNode = node;
	          this.break();
	        }
	        else if(node.type === esprima.Syntax.NewExpression){
	          if(node.hasOwnProperty('callee')){
	            var childNode = node.callee;
	            if(childNode.hasOwnProperty('name')){
	              if(childNode.name === "Array"){
	                arrayNode = node;
	                this.break();
	              }
	            }
	          }
	        }
	      }
	    });
	    return arrayNode;
	  };

	  /* DEPRECATED: we won't call this function any more because
	   * it doens't respect the scope chain rules of JavaScript */
	  var convertIdentifierAST2Val = function(idAST, env){
	    var name = idAST.name;
	    if(env.hasOwnProperty(name)){
	      return env[name];
	    }
	    else{
	      console.log("error: environment doens't contain identifier: "+name);
	      return null;
	    }
	  };
		
		/* This function will be called to resolve actual array value 
		 * while executing a symbolic template. */
	  var evaluateArrayAST2JSValue = 
	    function(arrayAST, env, methods,symtemplates){
	    // Only two potential node types:
	    // 1. ArrayExpression
	    // 2. NewExpression 
	    console.log("DEBUG: evaluateArrayAST2JSValue input args: \n"+escodegen.generate(arrayAST));
	    if(arrayAST.type === esprima.Syntax.ArrayExpression){
	      var elements = arrayAST.elements;
	    }
	    else if(arrayAST.type === esprima.Syntax.NewExpression){
	      // actually, these two kinds of Array expression can be combiled.
	      // if it's ArrayExpression, var elements = node.elements;
	      // if it's NewExpression, var elements = node.arguments;
	      // then iterately process each element in elements.
	      var elements = arrayAST.arguments;
	    }
	    else{
	      console.log("error: evaluateArrayAST2JSValue unknown array type. "+arrayAST.type);
	      return null;
	    }

      var array = new Array();
      for(var i in elements){
        var elem = elements[i];
        if(toolSet.isLiteralNode(elem)){
          var subtype = typeof elem.value;
          if (subtype === "string")
            array.push(elem.value);
          else if (subtype === "number")
            array.push(parseInt(elem.value));
          else if (subtype === "boolean")
            array.push(Boolean(elem.value));
          else //for RegExp and null.
            array.push(elem.value);
        }
        else if(toolSet.isIdentifierNode(elem)){
          //Note that we access the identifier's value from 
          var funName = templateHandlers.generateSymbolicTemplateName(elem);
          var idVal = this[funName]();
          console.log("DEBUG: evaluateArrayAST2JSValue resolved id node:  "+
            elem.name+" => "+idVal);
          array.push(idVal);
        }
        else if(toolSet.isArrayNode(elem)){
        	// should match escodegen.generate(elem)
          var subArray = evaluateArrayAST2JSValue(elem, env, methods,symtemplates);
          array.push(subArray);
        }
        else if(toolSet.isObjectNode(elem)){
        	// should match escodegen.generate(elem)
          var subObject = evaluateObjectAST2JSValue(elem, env, methods,symtemplates);
          array.push(subObject);
        }
        else{ //when the elements are expression.
          var funName = templateHandlers.generateSymbolicTemplateName(elem);
          if(!funName){
          	console.log( "error: convertIdentifierAST2Val "+
          		"cannot find expression's symbolic template.");
          	array.push(null);
          	return ;
          }
          var args = extractParametersForSymbolicTemplate(elem);
          var idVal = this[funName].apply(this,args);
          console.log("DEBUG: evaluateArrayAST2JSValue resolved expression node:  '"+
            escodegen.generate(elem)+"' => "+idVal);
          array.push(idVal);
        }
      }
      console.log("DEBUG: evaluateArrayAST2JSValue results: \n"+util.inspect(array) );
      return array;
	  };

		/* This function will be called to resolve actual object value 
		 * while executing a symbolic template. */
	  var evaluateObjectAST2JSValue = 
	    function(objectAST, env, methods,symtemplates){
	    // check if object AST to make sure
	    console.log("DEBUG: evaluateObjectAST2JSValue input args: \n"+escodegen.generate(objectAST));
	    if(objectAST.type === esprima.Syntax.ObjectExpression){
	    	// get property ASTs from object AST
	      properties = objectAST.properties;
	    }
	    else{
	      console.log("error: evaluateObjectAST2JSValue unknown array type. "+objectAST.type);
	      return null;
	    }

      var object = {};
      // iterate over property ASTs and populate js object
      for(k in properties){
        var elem = properties[k].value;
        var JSkeyname = properties[k].key.name;
        
        if(toolSet.isLiteralNode(elem)){
          var subtype = typeof elem.value;
          if (subtype === "string")
            // array.push(elem.value);
          	object[JSkeyname] = elem.value;
          else if (subtype === "number")
            // array.push(parseInt(elem.value));
          	object[JSkeyname] = parseInt(elem.value);
          else if (subtype === "boolean")
            // array.push(Boolean(elem.value));
            object[JSkeyname] = Boolean(elem.value);
          else //for RegExp and null.
            // array.push(elem.value);
            object[JSkeyname]= elem.value;
        }
        else if(toolSet.isIdentifierNode(elem)){
          //Note that we access the identifier's value from 
          var funName = templateHandlers.generateSymbolicTemplateName(elem);
          var idVal = this[funName]();
          console.log("DEBUG: evaluateObjectAST2JSValue resolved id node:  "+
            elem.name+" => "+idVal);
          // array.push(idVal);
          object[JSkeyname] = idVal;
        }
        else if(toolSet.isArrayNode(elem)){
        	// should match escodegen.generate(elem)
          var subArray = evaluateArrayAST2JSValue(elem, env, methods,symtemplates);
          // array.push(subArray);
          object[JSkeyname] = subArray;
        }
        else if(toolSet.isObjectNode(elem)){
        	// should match escodegen.generate(elem)
          var subObject = evaluateObjectAST2JSValue(elem, env, methods,symtemplates);
          // array.push(subObject);
          object[JSkeyname] = subObject;
        }
        else{ //when the elements are expression.
          var funName = templateHandlers.generateSymbolicTemplateName(elem);
          if(!funName){
          	console.log( "error: convertIdentifierAST2Val "+
          		"cannot find expression's symbolic template.");
          	// array.push(null);
          	object[JSkeyname] = null;
          	return ;
          }
          var args = extractParametersForSymbolicTemplate(elem);
          var idVal = this[funName].apply(this,args);
          console.log("DEBUG: evaluateObjectAST2JSValue resolved expression node:  '"+
            escodegen.generate(elem)+"' => "+idVal);
          // array.push(idVal);
          object[JSkeyname] = idVal;
        }
      }
      console.log("DEBUG: evaluateObjectAST2JSValue results: \n"+util.inspect(object) );
      return object;
	  };
	  
	  return {
	    extractArrayNodeFromScript : extractArrayNodeFromScript,
	    evaluateArrayAST2JSValue : evaluateArrayAST2JSValue,
	    evaluateObjectAST2JSValue : evaluateObjectAST2JSValue,
	    convertIdentifierAST2Val : convertIdentifierAST2Val
	  }
	};

	return {
		init : init,
		safeEval : safeEval,
		extractParametersForSymbolicTemplate : extractParametersForSymbolicTemplate,
		findTemplate : findTemplate,
		ConversionMethods : ConversionMethods
	};
};

var functions = CSPRuntimeFunctions();

module.exports = {
	init : functions.init,
	safeEval : functions.safeEval,
	extractParametersForSymbolicTemplate : functions.extractParametersForSymbolicTemplate,
	findTemplate : functions.findTemplate,
	ConversionMethods : functions.ConversionMethods
};