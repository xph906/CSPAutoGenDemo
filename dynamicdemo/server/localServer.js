var express = require('express');
var bodyParser = require('body-parser')
var path = require('path');

var https = require('https');
var http = require('http');
var fs = require('fs');
var morgan = require('morgan');
var cors = require('cors');
var formidable = require('formidable');
var base64 = require('base-64');
var config = require('./config.js');
var runtimeFuns = require('../../libs/CSPAutoGenRuntimeFunctions');
var toolSet = require('../../libs/CSPAutoGenToolSet.js');
var templateFuns = require('../../libs/CSPAutoGenTemplateFunctions.js');
var count = 1;
var escodegen = require('escodegen');
var util = require('util')
var templates = {};
var symTemplates = {};
var templateTypeArrs = {};
toolSet.loadTemplatesFromDirectory('templates', templates, symTemplates, templateTypeArrs);
console.log("Loaded templates "+Object.keys(templates).length+". ");

var app = express();
app.use(morgan('dev'));
app.use(cors());

var corsOptions = {
  origin: '*',
  allowedHeaders : 'Content-Type'
};

app.use('/jsRepository',
  express.static(path.join(__dirname, config.js_repository)));

app.use(bodyParser({limit: '50mb'}));
app.use(bodyParser.json() );

process.on('uncaughtException', function(err) {
  console.log(err.stack);
  throw err;
});

app.options('/js-factory', cors(corsOptions)); 
app.post('/js-factory', cors(corsOptions), function(req, res, next){
	var file_name, script, full_path, decoded_script;
  try{

    decoded_script = decodeURI(req.body.script);
    var values = [];
    var gast = toolSet.generateGAST(decoded_script, values);
    var hash = toolSet.generateGASTHash(gast);
    //console.log("script hash: "+hash+" "+util.inspect(Object.keys(templates)) );
    if(!templateFuns.matchScriptValues(hash, values, templateTypeArrs)){
      res.json({ 
        success: false, 
        message: 'cannot find template.'
      }); 
      console.log("cannot find template1.");
      return ;
    }
    else{
      console.log("pass matching!");
    }
    var template = templates[hash];
    if(!template){
      res.json({ 
        success: false, 
        message: 'cannot find template.'
      }); 
      console.log("cannot find template2.");
      return ;
    }
    gast = templateFuns.modifyGASTForEvalKeyword(gast, templates);

    decoded_script = escodegen.generate(gast);

    file_name = req.body.hash+count+'.js';
    count++;
    full_path = path.join(__dirname, config.js_repository, file_name);
    fs.writeFileSync(full_path, decoded_script);
    //console.log("saved decoded script: "+decoded_script);
    res.json({ success: true, filename: file_name,
        message: 'saved '+ req.body.file_name}); 
  }
  catch (e) {
    console.log('error in js-factory: '+e.stack);
    res.json({ success: false,
        message: e.toString()}); 
  }
});

http.createServer(app).listen(config.http_port);