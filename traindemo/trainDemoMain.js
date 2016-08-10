var cmdArgs = process.argv.slice(2);
var script = null;
var fs = require('fs');
var esprima = require('esprima');
var escodegen = require('escodegen');
var estraverse = require('estraverse');
var toolSet = require('../libs/CSPAutoGenToolSet.js');
var templateHandlers = require("../libs/CSPAutoGenTemplateFunctions.js");
var trainTask = require('../libs/CSPAutoGenTrainTask.js');
var util = require('util');
var mkdirp = require('mkdirp');

//Please modify according to your setting.
var config = {
	baseTemplateDir : "templates",
	baseNonmatchingScriptDir : "failedscripts",
	enabledEvalScriptExtraction : false
};

/*
var TrainingTask = function(){
	var trainingSetDir = null;
	var domain = null;
	var templateDir = null;
	var nonMatchingScriptDir = null;

	var init = function(targetDomain, trainingSetDirArg){
		trainingSetDir = trainingSetDirArg;
		domain = targetDomain;
		templateDir = config.baseTemplateDir +'/'+domain;
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

		// generate samples GAST.
		for(var i in trainingSet){
			var script = trainingSet[i];
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
		console.log("finish analyzing "+trainingSet.length+" scripts in "+Object.keys(groups).length+" groups.");

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

	var loadTemplates = function(){
		if(!templateDir){
			console.log("error: loadTempaltes templateDir not set.");
			return ;
		}
		var templates = {};
		var typeArrs = {};
		toolSet.loadTemplatesFromDirectory(templateDir, null, null, typeArrs);
		console.log("succeeded loaded "+Object.keys(typeArrs).length+" templates.");
		return typeArrs;
	};

	return {
		init : init,
		startTrainingTask : startTrainingTask,
		loadTemplates : loadTemplates
	}
};
*/

var TestingTask = function(){
	var domain = null;
	var templateArrs = null;
	var nonMatchingScriptDir = null;
	var nonMatchingTreeScriptDir = null;
	var nonMatchingTypeScriptDir = null;

	var init = function(domainArg, templatesArg){
		domain = domainArg;
		templateArrs = templatesArg;
		nonMatchingScriptDir = config.baseNonmatchingScriptDir + '/'+domain;
		nonMatchingTreeScriptDir = nonMatchingScriptDir+'/mistrees';
		nonMatchingTypeScriptDir = nonMatchingScriptDir+'/mistypes';
		mkdirp.sync(nonMatchingTreeScriptDir);
		mkdirp.sync(nonMatchingTypeScriptDir);
	};

	var loadScriptsFromDirectory = function(directory){
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
    	var files = walk(directory);
    	if(!files || files.length===0){
    		console.log("error: failed to load testing scripts.");
    		return ;
    	}	
		
		var scripts = [];
		for(var i in files){
			var file = files[i];
			try{
				if(!fs.existsSync(file))
					return null;
				var contents = fs.readFileSync(file).toString();
				scripts.push(contents);
			}
			catch(e){
				console.log("error: failed to load scripts from "+file+": "+e);
				return null;
			}
		}
		console.log("succeeded loading "+scripts.length+" scripts.");
		return scripts;
	};

	var startTestingTask = function(scripts){
		if(!templateArrs){
			console.log("error: templateArrs not set.");
			return ;
		}

		var match = 0;
		var nonmatch = 0;
		var unmatchedScripts = {};
		var typeerrScripts = {}
		for(var i in scripts){
			var script = scripts[i];
			var values = [];
			var gast = toolSet.generateGAST(script, values);
			var hash = toolSet.generateGASTHash(gast);
			if (hash in templateArrs){
				var templateArr = templateArrs[hash];
				if(values.length != templateArrs[hash].length){
					console.log(" error: script "+hash+" two value arrs' size are not equal "+values.length+" "+templateArrs[hash].length);
					for(var k in values){
						if(values[k]==undefined || templateArrs[hash][k]==undefined){
							console.log("error: undefined values or types: "+values[k]+" VS "+templateArrs[hash][k]);
							console.log(script);
						}
					}
				}
				if(templateHandlers.matchGASTTypes(values, templateArrs[hash], script ))
					match++;
				else{
					nonmatch++;
					if(hash in typeerrScripts)
						typeerrScripts[hash].push(script);
					else
						typeerrScripts[hash] = [script];
				}
			}
			else{
				nonmatch++;
				if(hash in unmatchedScripts)
					unmatchedScripts[hash].push(script);
				else
					unmatchedScripts[hash] = [script];
			}
		}

		for(var hash in unmatchedScripts){
			var fc = unmatchedScripts[hash].length;
			var fn = hash+'_'+fc+'.js';
			var fullname = nonMatchingTreeScriptDir+'/'+fn
			fs.writeFileSync(fullname, unmatchedScripts[hash][0] , 'utf8');
		}
		for(var hash in typeerrScripts){
			var fc = typeerrScripts[hash].length;
			var fn = hash+'_'+fc+'.js';
			var fullname = nonMatchingTypeScriptDir+"/"+fn
			fs.writeFileSync(fullname, typeerrScripts[hash][0] , 'utf8');
		}
		var rs = match / (match+nonmatch);
		console.log("Results: match:"+match+" nonmatch:"+nonmatch+" rate:"+rs);
	};

	return {
		init : init,
		loadScriptsFromDirectory : loadScriptsFromDirectory,
		startTestingTask : startTestingTask
	};
};


if(cmdArgs.length != 3){
	console.log("usage: domain training_set_dir testing_set_dir");
	process.exit(1);
}
var task = trainTask.TrainingTask();
//targetDomain, trainingSetDirArg, config
task.init(cmdArgs[0], cmdArgs[1], config);
var templatesObj = task.startTrainingTask();
var templateArrs = task.loadTemplates();

var testingTask = TestingTask();
testingTask.init(cmdArgs[0], templateArrs);
var scripts = testingTask.loadScriptsFromDirectory(cmdArgs[2])
testingTask.startTestingTask(scripts); 
