var arguments = process.argv.slice(2);
var script = null;
var fs = require('fs');
var esprima = require('esprima');
var escodegen = require('escodegen');
var estraverse = require('estraverse');
var toolSet = require('../libs/CSPAutoGenToolSet.js');
var CSPAutoGenRuntimeFunctions = require('../libs/CSPAutoGenRuntimeFunctions.js');
var templateHandlers = require("../libs/CSPAutoGenTemplateFunctions.js");
var trainTask = require("../libs/CSPAutoGenTrainTask.js");
var util = require('util');

//For demo use only!
var config = {
  baseTemplateDir : "output/templates",
  enabledEvalScriptExtraction : true,
  templateJSFileName : 'output/templates.js',
  symbolicTemplateJSFileName : 'output/symtemplates.js',
};

var task = trainTask.TrainingTask();
task.init("localhost", "samples", config);
var templateObjs  = task.startTrainingTask();
var symTemplates = {};
var templates = {};
var templateArrs = task.loadTemplates(templates, symTemplates);

toolSet.storeTemplateArrsAsJSFile(templateArrs, config.templateJSFileName);
var symTemplateStrs = {};
for(var hash in symTemplates){
  var curSymTemplateStrs  = null;
  if(templates[hash].body && templates[hash].body.length>0 && 
    templates[hash].body[0].type === "VariableDeclaration" &&
    templates[hash].body[0].declarations &&
    templates[hash].body[0].declarations.length > 0 &&
    templates[hash].body[0].declarations[0].id.name === "CSPAutoGenGeneratedFunction" ){
   
    curSymTemplateStrs = templateHandlers.genSymTemplateStr(symTemplates[hash], symTemplates, "CSPAutoGenGeneratedFunction");
    //console.log("created a symbolic template for Function.");
  }
  else{
    curSymTemplateStrs = templateHandlers.genSymTemplateStr(symTemplates[hash], symTemplates);
    //console.log("created a symbolic template");
  }
  
  if(!curSymTemplateStrs){
    console.log("error: failed to build symbolic template: "+util.inspect(symTemplates[hash]));
    return ;
  }
  for(var k in curSymTemplateStrs)
    symTemplateStrs[k] = curSymTemplateStrs[k];
}

var symbolicTemplates = {};
//console.log("start to store symbolic templates:");
toolSet.storeSymbolicTemplatesAsJSFile(symTemplateStrs, config.symbolicTemplateJSFileName);




/*var testingEnviroment = (function(){
  // this block can be manually configured.
  var trainingScript1 = "samples/sample1.js";
  var trainingScript2 = "samples/sample2.js";
  //var trainingScript1 = "funsample3.js";
  //var trainingScript2 = "funsample4.js";
  var targetScript1 = 'var string1 = "local_string_from_target_script"; ' +
                    'var myArr = [\'str1\', [4 , \'str2\'], {k1:\'str3\', k2 :{ k3:\'str4\'}}, {k1:\'str5\'}, 2, 3, true, true, false];' + 
                    'var myObj = {this: "that", those: 3};' + 
                    'var arr = [1000,"other_string:",string1, string2, true, string1+string2+300]; ' +
                    'var arr2 = new Array(3,5); ' +
                    'var a = 4; ' +
                    '(function(){var a =400; eval("console.log(\'the a should be 400: \'+a +\'!!\');");})(); ' +
                    'if(arr[3]){ '+
                    '   var x = arr[0] + 10; '+
                    '   console.log(x+arr[1]+" XXXstring1:"+arr[2]+" string2:"+arr[3]+" combined_string:"+arr[5]); ' +
                    '}';
  var wm = "Hi";
  var username = "Stephen Curry";
  var age = 28;
  var major = "Basketball";
  var targetScript = 
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
  
  window = {};  
  window['CSPClientLibrary'] = {};
  window['CSPAutoGenRuntimeFunctions'] = CSPAutoGenRuntimeFunctions;
  window['CSPAutoGenTemplateFunctions'] = templateHandlers;
  var globalLineVar = "##################";
  var document = {
    contents : {},
    getElementById : function(id){
      return this.contents;
    }
  };
  CSPAutoGenRuntimeFunctions.init(window);

  var CSPClientLibrary = window['CSPClientLibrary'];  
  var templates = {};           //gast hash -> template.
  var symbolicTemplates = {};   //gast hash -> symbolic template.
  CSPClientLibrary['templates'] = templates;
  CSPClientLibrary['symbolicTemplates'] = symbolicTemplates;
  CSPClientLibrary['methods'] = CSPAutoGenRuntimeFunctions.ConversionMethods();
  
  var safeEval = CSPAutoGenRuntimeFunctions.safeEval;
  
  //This function simulates the browser environment after importing 
  //CSPAUtoGen-related functions.
  var init = function(){
    var script1 = fs.readFileSync(trainingScript1, 'utf8');
    var gast1 = toolSet.generateGAST(script1);
    //console.log("DEBUGINIT: "+script1);
    var script2 = fs.readFileSync(trainingScript2, 'utf8');
    var gast2 = toolSet.generateGAST(script2);
    if(!toolSet.compareTwoGAST(gast1, gast2)){
      console.log("error: array1.js and array2.js are not from the same template. ");
      return ;
    }

    var testingTemplate = templateHandlers.buildTemplateFromGASTSet([gast1, gast2]);
    if(testingTemplate === null) {
      console.log("error: failed to build template.");
      return ;
    }
    var tmpHash = toolSet.generateGASTHash(testingTemplate);
    console.log("generated template: "+toolSet.generateGASTHash(testingTemplate));
    //toolSet.storeTemplate(toolSet.cloneGAST(testingTemplate), 'templates/template'+tmpHash+'.txt');

    //console.log("generated template: "+escodegen.generate(testingTemplate));
    var evalArr=[], evalScriptGASTs=[], evalTemplates=[];
    var timetoutArr = [];
    var timeintervalArr = [];
    var functionArr=[], funScriptGASTs=[], funTemplates=[];

    templateHandlers.extractEvalLikeScripts(
        [gast1, gast2], evalArr,timetoutArr,timeintervalArr,functionArr);
    for(var i in evalArr){
      console.log("generate eval GAST: "+evalArr[i]);
      var tmp = toolSet.generateGAST(evalArr[i]);
      evalScriptGASTs.push(tmp);
    }
    console.log("EVAL: "+evalArr.length);
    if(!toolSet.compareTwoGAST(evalScriptGASTs[0], evalScriptGASTs[1])){
      console.log("error: two eval scripts are not from the same template. ");
      return ;
    }
    var evalTemplate = templateHandlers.buildTemplateFromGASTSet(evalScriptGASTs);
  
    for(var i in functionArr){
      console.log("generate Function GAST: "+functionArr[i]);
      var tmp = toolSet.generateGAST(functionArr[i]);
      funScriptGASTs.push(tmp);
    }
    if(!toolSet.compareTwoGAST(funScriptGASTs[0], funScriptGASTs[1])){
      console.log("error: two Function scripts are not from the same template. ");
      return ;
    }
    var funcTemplate = templateHandlers.buildTemplateFromGASTSet(funScriptGASTs);
    if(funcTemplate){
      console.log("succeed creating funcTemplate.");
    } 
    //store templates.
    //The reason we have two map is that genSymTemplateStr will modify the template 
    //parameter.
    
    var symTemplates = {};
    var templates = {};
    var templateHash = toolSet.generateGASTHash(testingTemplate);
    symTemplates[templateHash] = testingTemplate;
    var testingTemplateWithoutParentProperty = toolSet.cloneGAST(testingTemplate);
    templates[templateHash] = testingTemplateWithoutParentProperty;

    templateHash = toolSet.generateGASTHash(evalTemplate);
    symTemplates[templateHash] = evalTemplate;
    evalTemplateWithoutParentProperty = toolSet.cloneGAST(evalTemplate);
    templates[templateHash] = evalTemplateWithoutParentProperty;
    
    for(var hash in templates){
      console.log("store template at: "+'templates/template'+hash+'.txt');
      toolSet.storeTemplate(templates[hash], 'templates/template'+hash+'.txt');
    }
    console.log("start to store templates.");
    toolSet.storeTemplatesAsJSFile(templates, 'all.js');
    CSPClientLibrary['templates'] = templates;

    console.log("start to load templates.");
     toolSet.loadTemplatesFromDirectory("templates",CSPClientLibrary['templates'], symTemplates);
    //  templates = CSPClientLibrary['templates'];
    //create symbolic templates.
    var symTemplateStrs = {};
    for(var hash in symTemplates){
      var curSymTemplateStrs = templateHandlers.genSymTemplateStr(symTemplates[hash], CSPClientLibrary['templates']);
      //var curSymTemplateStrs = templateHandlers.genSymTemplateStr(symTemplates[hash], CSPClientLibrary['templates'], "CSPAutoGenGeneratedFunction");
      if(!curSymTemplateStrs){
        console.log("error: failed to build symbolic template: "+util.inspect(symTemplates[hash]));
        return ;
      }
      for(var k in curSymTemplateStrs)
        symTemplateStrs[k] = curSymTemplateStrs[k];
      //console.log("length of symtemplate strs: "+curSymTemplateStrs.length);
    }

    //Load symbolic tempates.
    //Note that during runtime, these symbolic templates are imported via 
    //exteral scripts, instead of using eval.
    console.log("start display symbolic templates:");
    for(var hash in symTemplateStrs){
      var jsString = symTemplateStrs[hash];
      console.log("JSString: "+jsString);
      symbolicTemplates[hash] = eval(jsString);
      console.log(hash+" "+jsString);
      console.log("Succeed loading SymTem function: "+hash +" => "+jsString);
    }

    var string1 = "mmmm";
    var string2 = "this is string2 value";
    var CSPAutoGenGeneratedFunction ="";

  };
  
  var startTesting = function(){
    (function(){ safeEval(targetScript); console.log(document.contents) })();
  };
  
  init();

  return {
    startTesting : startTesting
  }
})();

testingEnviroment.startTesting(); */

/*
var testing = function(script){
  console.log("DEBUG: 1. TESTING Start to parse script's AST...");
  var ast = esprima.parse(script);
  var debugCount = 0;
  var debugLevel = 0;
  var debugSpace = "";
  
  console.log("DEBUG: 2. TESTING Start to traverse AST...");
  
  // add CSPTag and CSPValue properties
  estraverse.traverse(ast, {
    enter: function(node){
      debugCount++;
      debugLevel++;
      debugSpace = Array(debugLevel).join("  ");
      
      if(toolSet.isLiteralNode(node)){
      }
      else if(toolSet.isIdentifierNode(node)){
      }
      else if(toolSet.isArrayNode(node)){

      }
      else if(toolSet.isObjectNode(node)){
      }
      else if(node.type === "FunctionDeclaration"){
        //return node;
        //console.log("DEBUG: function node:");
        //var m = node.params instanceof Array;
        //console.log("DEBUG: function node.params:"+ util.inspect(node));
        var gast = toolSet.generateGASTFromAST(node);
        console.log("testinggenSymTemplateStr scripts:\n"+ genSymTemplateStr(gast));
      }
      else if(node.type === "Program"){
        //var m = node.body instanceof Array;
        //console.log("DEBUG: "+util.inspect("Program:"+node.body+" "+m));
      }
      
    },

    leave: function (node, parent) {
      debugLevel--;
    }
  });
  
  return ast;
};


//var scriptt = "var x = [a, 2, a+b, [c,d,8]];";

var scriptt = "function m(){var x = []; x.push(2); return x+y;} m(); var x=function(){a();b();c();d(); x=[];}";
var gast = toolSet.generateGAST(scriptt);
var targetNode = null;
estraverse.traverse(gast, {
  enter: function(node){
    if(toolSet.isLiteralNode(node)){
    }
    else if(toolSet.isIdentifierNode(node)){
    }
    else if(toolSet.isArrayNode(node)){
      targetNode = node;
    }
    else if(toolSet.isObjectNode(node)){
    }
    else if(node.type ===esprima.Syntax.ReturnStatement){
      //console.log("return node:"+node.argument.type+"  "+util.inspect(node.argument));
    }
  },
  
  leave : function(node, parent){
    node['parent'] = parent;
  }
});

while(targetNode){
  var p = targetNode.parent;
  if(!p) break;
  console.log("testing parent: "+targetNode.type+" => "+p.type);
  if(p.type === esprima.Syntax.FunctionDeclaration){
    console.log("  FD:"+ p.body.body.length );
  }
  else if(p.type === esprima.Syntax.FunctionExpression){
    console.log("  FE:"+ p.body.body.length );
  }
  else if(p.type === esprima.Syntax.Program){
    console.log("  Program:"+ p.body.length );
  }
  targetNode = p;
}
*/



//(function(){var xdsdsd=222; eval("function m() {console.log('xxx'+xdsdsd)}; m()");})();
