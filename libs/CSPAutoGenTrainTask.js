
var script = null;
var fs = require('fs');
var esprima = require('esprima');
var escodegen = require('escodegen');
var estraverse = require('estraverse');
var toolSet = require('./CSPAutoGenToolSet.js');
var templateHandlers = require("./CSPAutoGenTemplateFunctions.js");
var util = require('util');
var mkdirp = require('mkdirp');

var TrainingTask = function(){
	var trainingSetDir = null;
	var domain = null;
	var templateDir = null;
	var nonMatchingScriptDir = null;
	var enabledEvalScriptExtraction = null;

	var init = function(targetDomain, trainingSetDirArg, config){
		trainingSetDir = trainingSetDirArg;
		domain = targetDomain;
		templateDir = config.baseTemplateDir +'/'+domain;
		enabledEvalScriptExtraction = config.enabledEvalScriptExtraction;
		//nonMatchingScriptDir = config.baseNonmatchingScriptDir + '/'+domain;

		mkdirp.sync(templateDir);
	};

	var loadTrainingSet = function(){
		var walk = function(dir) {
			var results = [];
			var list = fs.readdirSync(dir);
			list.forEach( function(file) {
				var filename = dir + '/' + file;
				if(filename.substr(filename.length-3) === ".js"){
					var stat = fs.statSync(filename);
					//console.log("FILE: "+filename.toString());
					if (stat && !stat.isDirectory())
						results.push(filename);
				}
				
			});
			return results;
    	}
    	// load training data set.
    	var files = walk(trainingSetDir);
    	if(!files || files.length===0){
    		console.log("error: failed to load training set.");
    		return ;
    	}	
		
		var trainingSet = [];
		for(var i in files){
			var file = files[i];
			try{
				if(!fs.existsSync(file))
					return null;
				var contents = fs.readFileSync(file).toString();
				trainingSet.push(contents);
			}
			catch(e){
				console.log("error: failed to load tempalte from "+file+": "+e);
				return null;
			}
		}
		console.log("succeeded loading "+trainingSet.length+" training samples.");
		return trainingSet;
	};
 
	var startTrainingTask = function(){
		console.log("start training task with training data directory: "+trainingSetDir);
		console.log("                    with domain:"+domain);
		var trainingSet = loadTrainingSet();
		var gasts = [];
		var groups = {};     //hash -> [["","",...], ["","",...], ...]
		var templates = {};  //hash -> GAST
		var evalScripts = [];

		// generate samples GAST.
		for(var i in trainingSet){
			var script = trainingSet[i];
			try{
				var dataList = [];
				var gast = toolSet.generateGAST(script,dataList);
				if(enabledEvalScriptExtraction)
					gasts.push(gast);
				var hash = toolSet.generateGASTHash(gast);
				toolSet.addElemToDict(hash, dataList, groups);
				if(!(hash in templates))
					templates[hash] = toolSet.cloneGAST(gast);
			}
			catch(e){
				console.log("failed to parse scripts: "+e);
			}
		}
		console.log("finish analyzing "+trainingSet.length+" scripts in "+Object.keys(groups).length+" groups.");

		//For dynamic script demo use.
		if(enabledEvalScriptExtraction){	
			templateHandlers.extractEvalLikeScripts(gasts, evalScripts);
			console.log("finish extracting "+evalScripts.length +" eval scripts.");
			for(var i in evalScripts){
				var script = evalScripts[i];
				try{
					var dataList = [];
					var gast = toolSet.generateGAST(script,dataList);
					var hash = toolSet.generateGASTHash(gast);
					toolSet.addElemToDict(hash, dataList, groups);
					if(!(hash in templates))
						templates[hash] = toolSet.cloneGAST(gast);
				}
				catch(e){
					console.log("failed to parse scripts: "+e);
				}
			}
		}

		// build templates.
		var templatesObj = {};
		for(var hash in templates){
			var template = templateHandlers.buildTemplateFromDataList(templates[hash], groups[hash]);
			console.log("finish building template "+hash);
			if(hash != template.hash){
				console.log("error: two hashes are different. ");
				process.exit(1);
			}
			templatesObj[hash] = template;

			toolSet.storeTemplate(templates[hash], templateDir+"/"+hash+".js");
		}
		return templatesObj;
	};

	var loadTemplates = function(templates, symTemplates){
		if(!templateDir){
			console.log("error: loadTempaltes templateDir not set.");
			return ;
		}
		var typeArrs = {};
		toolSet.loadTemplatesFromDirectory(templateDir, templates, symTemplates, typeArrs);
		console.log("succeeded loaded "+Object.keys(typeArrs).length+" templates.");
		return typeArrs;
	};

	return {
		init : init,
		startTrainingTask : startTrainingTask,
		loadTemplates : loadTemplates
	}
};

//var task = TrainingTask();

module.exports = {
	TrainingTask : TrainingTask
};