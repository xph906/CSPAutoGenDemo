if(!esprima) console.log("esprima not loaded!");
if(!escodegen) console.log("escodegen not loaded!");
if(!estraverse) console.log("estraverse not loaded!");
if(!DeepDiff) console.log("diff not loaded!");
if(!util) console.log("util not loaded!");
if(!toolSet) console.log("toolSet not loaded!");
if(!templateFunctions)  console.log("templateFunctions not loaded");
var diff = DeepDiff;

var CSPAutoGenRIURL="http://localhost:8880/js-factory";
var CSPAutoGenRepositoryURL="http://localhost:8880/jsRepository/";

var CSPRuntimeFunctions = function(){
	
	/**********************************Tools**************************************/
	/* 
	 * find template from carried templates. 
	 * If cannot find any, return null.
	 * The argument templates is a dictionary: hash -> template 
	 */
	var matchTemplate = function(gast, values, templates){

	  var hash = toolSet.generateGASTHash(gast);
	  if(hash in templates){
	  	if(templateFunctions.matchScriptValues(hash, values, templates))
	  		return hash;
	  	else{
	  		console.log("failed matching types.");
	  		return false;
	  	}
	  }
	  else{
	  	console.log("failed find template tree.");
	  }
	  return null;
	};

	/* 
	 * Private: check if nodes in gast and template
	 * have matching types.
	 * TODO: this function has not been implemented yet.
	 */
	var checkGastTemplateTypes = function(gast, template){
		return true;
	}

	/* 
	 * Private: extract the data value/nodes from a GAST 
	 * and feed them as the actual parameters to  
	 * symbolic template. 
	 */
	var extractParametersForSymbolicTemplate = function(gast){
		var count = 0;
		var args = [];
		estraverse.traverse(gast, {
		   	enter: function(node){
		   		var subtype = toolSet.getLiteralNodeType(node);
	      		if(subtype === "string" ){
					args.push(node.value);
				}
				else if(subtype === "number"){
					args.push(parseInt(node.value));
				}
				else if(subtype === "boolean"){
					args.push(Boolean(node.value));
				}
				else if(toolSet.isEvalCallNode(node)){
					console.log("ISEVALCALL: "+node)
					var evalGAST = toolSet.generateGAST(node.arguments[0].value.toString());
					var evalArgs = extractParametersForSymbolicTemplate(evalGAST);
					args = args.concat(evalArgs);
				}
				else if(toolSet.isArrayNode(node) ||
					toolSet.isObjectNode(node)){
					args.push(node);
				}      
				//don't go any further for object and array nodes.
				if(toolSet.isArrayNode(node) || toolSet.isObjectNode(node) || toolSet.isEvalCallNode(node)){
					return estraverse.VisitorOption.Skip;
				} 
		    }
		});
		return args;
	};

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

	
	/***************************************************************************/
	/*** The following safeXXX function replace disabled eval-like functions.***/
	/***************************************************************************/
	var safeEval = function(script){
		var args = [];
		var symbolicTemplate = processDynamicScripts(script, args,"eval('<br>&nbsp;&nbsp;", "');");
		if(!symbolicTemplate ){
			console.log("cannot find symbolicTemplate for script: "+script);
			return;
		}
		symbolicTemplate.apply(this, args);
	};

	var safeSetInterval = function(firstArg, secondArg){
		if(firstArg instanceof Function){
			return originalSetInterval(firstArg, secondArg);
		}
		else{
			var args = [];
			var symbolicTemplate = processDynamicScripts(firstArg, args, 
				"setInterval('<br>&nbsp;&nbsp;", "', "+secondArg+"');");
			if(symbolicTemplate === null){
				return null;
			}
			var tmpFun = function(){
				symbolicTemplate.apply(this, args);
			};
			return originalSetInterval(tmpFun, secondArg);
		}
	};

	var safeSetTimeout = function(firstArg, secondArg){
		if(firstArg instanceof Function){
			return originalSetTimeout(firstArg, secondArg);
		}
		else{
			var args = [];
			var symbolicTemplate = processDynamicScripts(firstArg, args, 
				"setTimeout('<br>&nbsp;&nbsp;", "', "+secondArg+"');");
			if(symbolicTemplate === null){
				return null;
			}
			var tmpFun = function(){
				symbolicTemplate.apply(this, args);
			};
			return originalSetTimeout(tmpFun, secondArg);
		}
	};

	var safeFunction = function(){
		var args = Array.prototype.slice.call(arguments);
		var body = args[args.length-1];
		var title = "";
		for(var i in args){
			if(i < args.length-1)
				title += (args[i]+",");
		}
		if(title.length > 0)
			title = title.substr(0, title.length-1);
		var scripts = "var CSPAutoGenGeneratedFunction = function("+title+"){";
		scripts += body;
		scripts += "}";
		console.log("SAFEFunction:"+scripts);

		var newArgs = [];
		var symbolicTemplate = processDynamicScripts(scripts, newArgs, 
			"var newFun = Function("+title+",'<br>&nbsp;&nbsp;", 
			"');<br>newFun('==================================', username, age);<br>");
		return symbolicTemplate.apply(this, newArgs);
	};

	var processDynamicScripts = function(script, outArgs, displayLeft, displayRight){
		var values = [];
		var gast = toolSet.generateGAST(script, values);
		var templates = window.CSPClientLibrary['templates'];
		var symbolicTemplates = window.CSPClientLibrary['symbolicTemplates'];
		if(gast === null){
		  console.log("error: processDynamicScripts cannot parse the script.");
		  return null;
		}

		// Find template for this script
		var templateHash = matchTemplate(gast, values, templates);
		if(templateHash === null){
			console.log("error: processDynamicScripts cannot find template for this script. ");
			return null;
		}

		var symbolicTemplate = symbolicTemplates[templateHash];
		if(symbolicTemplate===null || symbolicTemplate===undefined){
			console.log("error: processDynamicScripts cannot find symbolic template.");
			return null;
		}
		
		//For demo only!
		if(document.getElementById('evalcode')){
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
			document.getElementById('evalcode').innerHTML = displayLeft+newScript+displayRight;
		}

		// Generate actual arguments of this call.
		var args = extractParametersForSymbolicTemplate(gast);
		if(args){
			for(var key in args){
				outArgs.push(args[key]);
				console.log("ARGS: "+key+" => "+args[key]);
			}
		}
		console.log("Found symbolic template: "+util.inspect(symbolicTemplate))
		return symbolicTemplate;
	};
	/***************************************************************************/
	/********* The following functions handle runtime-included scripts *********/
	/***************************************************************************/
	var getURLHost = function (url){
		var parser = document.createElement('a');
		parser.href = url;
		return parser.hostname;
	};

	var requestExternalScriptSrc = function (script, scriptHash, node) {
		var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
		var encoded_script = encodeURI(script);
		var obj = {hash:scriptHash, script:encoded_script};
		var params = JSON.stringify(obj);
		var new_node;

		var externalJSReadyCallback = function () {
			if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				try{
					var obj = JSON.parse(xmlhttp.responseText);
					if (obj.success === true) {
						newNode = document.createElement('script');
						newNode.src = CSPAutoGenRepositoryURL+obj.filename;
						node.parentNode.insertBefore(newNode, node);
						var p = node.parentNode;
						p.removeChild(node);
					}
					else {
						console.log('Failed to create external js: '+obj.message);
					}
				}
				catch (e) {
					console.log('Failed to create external js: '+obj.message);
				}
      		}
		};
		
		xmlhttp.open("POST", CSPAutoGenRIURL, true);
		xmlhttp.setRequestHeader("Content-type", "application/json")
		xmlhttp.onreadystatechange = externalJSReadyCallback;
    	xmlhttp.send(params);
	};

	var runtimeInlineScriptHandler = function(script, node){
		var values = [];
		var gast = toolSet.generateGAST(script,values);
		var templates = window.CSPClientLibrary['templates'];
		if(gast === null){
		  console.log("error: runtimeInlineScriptHandler cannot parse the script.");
		  return null;
		}

		// Find template for this script
		var templateHash = matchTemplate(gast, values, templates);
		if(templateHash === null){
			console.log("error: runtimeInlineScriptHandler cannot find template for this script.");
			return null;
		}
		var hash = toolSet.generateGASTHash(gast);
		requestExternalScriptSrc(script, hash, node);
	};
	
	var runtimeInlineScriptObserverOptions = {
		subtree: true,
		childList: true,
		attributes: false
	};
	var runtimeInlineScriptObserver = new MutationObserver(function (mutations) {
		mutations.forEach(function (mutation) {
			var node, node_name, script;
			for (var i = 0; i < mutation.addedNodes.length; i++){
				try{
					node = mutation.addedNodes[i];
					node_name = node.nodeName.toUpperCase();
					if (node_name === "SCRIPT"){
						var script = node.innerHTML.trim();
						if (script.length === 0)
							continue;
						console.log("Found runtime-included inline scripts.");
						console.log(script);
						runtimeInlineScriptHandler(script, node);
					}
				}
				catch (e) {
					console.log("CSP Error in MutationObserver callback "+e);
				}
			}
		})
	});

	var onDomContentLoadedEventHandler = function(e){
		console.log("DOMContentLoaded event is fired");
		runtimeInlineScriptObserver.observe(document, runtimeInlineScriptObserverOptions);

	};

	/******************************************************************************/
	/******************* EvaluateASTNode2JSValue conversion methods ***************/
	/******************************************************************************/
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
	    //console.log("DEBUG: evaluateArrayAST2JSValue input args: \n"+escodegen.generate(arrayAST));
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
          var funName = generateSymbolicTemplateName(elem);
          var idVal = this[funName]();
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
          var funName = generateSymbolicTemplateName(elem);
          if(!funName){
          	array.push(null);
          	return ;
          }
          var args = extractParametersForSymbolicTemplate(elem);
          var idVal = this[funName].apply(this,args);
          //console.log("DEBUG: evaluateArrayAST2JSValue resolved expression node:  '"+
          //  escodegen.generate(elem)+"' => "+idVal);
          array.push(idVal);
        }
      }
      return array;
	  };

		/* This function will be called to resolve actual object value 
		 * while executing a symbolic template. */
	  var evaluateObjectAST2JSValue = 
	    function(objectAST, env, methods,symtemplates){
	    // check if object AST to make sure
	    //console.log("DEBUG: evaluateObjectAST2JSValue input args: \n"+escodegen.generate(objectAST));
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
          var funName = generateSymbolicTemplateName(elem);

          var idVal = this[funName]();
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
          var funName = generateSymbolicTemplateName(elem);
          if(!funName){
          	console.log( "error: convertIdentifierAST2Val "+
          		"cannot find expression's symbolic template.");
          	// array.push(null);
          	object[JSkeyname] = null;
          	return ;
          }
          var args = extractParametersForSymbolicTemplate(elem);
          console.log("FUN : "+funName)
          console.log("ARGS: "+util.inspect(args)+" "+util.inspect(elem) );
          var idVal = this[funName].apply(this,args);
          object[JSkeyname] = idVal;
        }
      }
      console.log("extracted object: "+util.inspect(object));
      return object;
	  };
	  
	  return {
	    extractArrayNodeFromScript : extractArrayNodeFromScript,
	    evaluateArrayAST2JSValue : evaluateArrayAST2JSValue,
	    evaluateObjectAST2JSValue : evaluateObjectAST2JSValue,
	    convertIdentifierAST2Val : convertIdentifierAST2Val
	  }
	};

	/************************************INIT**************************************/
	
	window['CSPClientLibrary'] = {};
	window['CSPClientLibrary']['symbolicTemplates'] = {};
	if(!CSPAutoGenTemplates)
		console.log("error: failed to import templates");
	window['CSPClientLibrary']['templates'] = CSPAutoGenTemplates;
	toolSet.processTemplateArrsToRecoverRegExp(window['CSPClientLibrary']['templates']);

	var count = 0;
	for(var elem in window){
		if(elem.startsWith("CSPFun")){
			count++;
			var hash = elem.substr(6);
			window['CSPClientLibrary']['symbolicTemplates'][hash] = window[elem];
			//console.log(" imported symbolic template: "+hash);
		}
	}
	console.log("Imported "+count+" symbolic templates.");

  	window.eval = safeEval;
  	var originalSetInterval = window.setInterval;
  	window.setInterval = safeSetInterval;
  	var originalSetTimeout = window.setTimeout;
  	window.setTimeout = safeSetTimeout;
  	window.Function = safeFunction;
  	document.addEventListener("DOMContentLoaded", onDomContentLoadedEventHandler);

	return {
		safeEval : safeEval,
		extractParametersForSymbolicTemplate : extractParametersForSymbolicTemplate,
		ConversionMethods : ConversionMethods
	};
};

var runtimefuns = CSPRuntimeFunctions(window);
window['CSPAutoGenRuntimeFunctions'] = runtimefuns;
window['CSPClientLibrary']['methods'] = runtimefuns.ConversionMethods();