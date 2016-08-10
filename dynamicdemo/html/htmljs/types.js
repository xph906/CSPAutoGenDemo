if(!esprima) console.log("esprima not loaded!");
if(!estraverse) console.log("estraverse not loaded!");
if(!util) console.log("util not loaded!");
if(!url) console.log("url not loaded!");
if(!toolSet) console.log("toolSet not loaded!");
if(!tldjs) console.log("tldjs not loaded!");
var urlTool = window['url'];

var parseDomain = function(url){
	if(!tldjs.tldExists(url))
		return null;
	else{
		var d = tldjs.getDomain(url);
		var index = domain.indexOf('.');
		if(index === -1)
			return null;
		var first = d.substr(0, index);
		var second = d.substr(index+1);
		return {domain: first, tld: second};
	}
	
};

/* 
 * PUBLIC methods: 
 *   inferType,
 *	 matchType
 */
var CSPAutoGenType = function(){
	var types = {
		"insufficient" : 0,
		"const" : 1,
		"enum"  : 2,
		"number": 3,
		"url"   : 4,
		"gast"  : 5,
		"regexp": 6,
		"boolean" : 7,
		"complex" : 8
	};

	//TODO: a lot of heuristc rules, need to re-organize.
	//TODO: optimize for performance
	var inferType = function(tag, data){
		//console.log("In inferType: "+util.inspect(tag) )
		var type = null;
		var value = null;

		if(tag === "number"){
			return {
				type : "number",
				value : null
			};
		}
		else if (tag === "boolean"){
			return {
				type : "boolean",
				value : null
			};
		}
		else if(tag==="array" || tag==="object"){
			var all = {};
			for(var i in data){
				var obj = data[i];
				for(var k in obj){
					if(k in all)
						all[k] = all[k].concat(obj[k]);
					else
						all[k] = obj[k];
				}
			}
			type = {};
			value = {};
			for(var k in all){
				var rs = null;
				if(k === "CSP_number"){
					rs = inferType("number", null);
					//console.log('csp number: '+k+" "+rs)
				}
				else if(k === "CSP_boolean"){
					rs = inferType("boolean", null);
					//console.log('csp boolean: '+k+" "+rs)
				}
				else if(k === "CSP_GAST"){
					rs = {};
					rs.type = "gast";
					rs.value = {};
					var ce = 0;
					for(var i in all[k]){
						ce++;
						rs.value[toolSet.generateGASTHash(all[k][i])]=true;
					}
				}
				else{
					rs = inferType("string", all[k]);
				}
				type[k] = rs.type;
				value[k] = rs.value;
			}
			return {
				type : type,
				value : value
			};
		}
		else if (data.length < 3){
			value = [];
			for(var i in data)
				value.push(data[i]); 
			type = "insufficient";
			return {
				type: type,
				value: value
			};
		}
		else{ //string with sufficient data
			var tmp = {};
			for(var i in data)
				tmp[data[i]] = true;
			var uniqData = Object.keys(tmp);
			var count = uniqData.length;
			
			//number
			var isNumber = true;
			for(var k in tmp){
				if(k.trim().length === 0)
					continue;
				else if(typeof k === 'number')
					continue;
				else if(typeof k === 'string' &&
					!isNaN(k.replace(/,/g, '')) )
					continue;
				else{
					isNumber = false;
					break;
				}
			}	
			if(isNumber){
				return {
					type : "number",
					value : null
				};
			}
			//boolean
			if(count === 1 || count === 2){
				if(('true' in Object.keys(tmp)) || 
					('false' in Object.keys(tmp)) ){
					return {
						type : "boolean",
						value: null
					}
				}
			}
			//const
			if(count == 1 && data.length>10){
				type = "const";
				value = data[0];
				return {
					type: type, 
					value:value};
			}

			var isURL = true;
			var domains = {};
			//url
			//TODO: find those redirection URLs.
			for(var i in data){
				try{
					var o = urlTool.parse(data[i]);
					if(o.protocol == null){
						isURL = false;
						continue;
					}
					o = parseDomain(data[i]);
					if(o==null){
						isURL = false;
						continue;
					}
					domains[o.domain+'.'+o.tld] = true;
				}
				catch(e){
					isURL = false;
					continue;
				}
			}
			if(isURL){
				type = 'url';
				value = domains;
				return {type: type, 
					value:value};
			}

			//safe regexp type
			var regSNA = /^[\w\d\s_\-\,]*$/;
			var isSafeString = true;
			var chars = {};
			var lens = [];
			
			for(var i in data){
				if(!regSNA.test(data[i])){
					isSafeString = false;
				}
				for(var j in data[i]){
					chars[data[i][j]] = true;
				}
				lens.push(data[i].length);
			}
			if(isSafeString){
				type = "regexp";
				value = regSNA;
				return {
					type: type, 
					value:value
				};
			}
			
			//TODO: complex
			//number, url, safe_regexp
			var complex = true;
			var domains = {};
			for(var i in data){
				if(data[i]===null || data[i]===undefined)
					continue;
				var d = data[i].toString().trim()
				if (d.length === 0)
					continue;
				else if(typeof d === 'number')
					continue;
				else if((typeof d === 'string') && !isNaN(d.replace(/,/g, '')))
					continue;
				else if(regSNA.test(d))
					continue;
				else {
					try{
						var o = urlTool.parse(d);
						if(o.protocol == null){
							complex = false;
							break;
						}
						o = parseDomain(d);
						if(o==null){
							complex = false;
							break;
						}
						domains[o.domain+'.'+o.tld] = true;
						continue;
					}
					catch(e){
						complex = false;
						break;
					}
				}
				complex = false;
				break;
			};

			if(complex){
				return {
					type : "complex", 
					value: domains
				};
			}

			//prefix and suffix
			var prefixStr = findPrefix(uniqData);
			var suffixStr = findSuffix(uniqData);
			//if(prefixStr.length>0 && suffixStr.length>0){
			var csl = prefixStr.length+suffixStr.length;
			var la = [];
			uniqData.forEach(function(elem){la.push(elem.length)});
			var minLen = min(la);
			var avgLen = avg(la);
			if(csl > minLen){
				var extraLen = csl - minLen;
				suffixStr = suffixStr.substr(extraLen);
			}
			if(csl > avgLen*0.5){
				var regexp = "^";
				regexp += regExpEscape(prefixStr);
				regexp += "(.)*";
				regexp += regExpEscape(suffixStr);
				regexp += "$";
				return {
					type : "regexp",
					value : new RegExp(regexp)
				};
			}
			//}

			//enum
			//TODO: figure out a better statistic way to determine enum!
			if(data.length / count > 10 && count <=5){
				type = "enum";
				value = Object.keys(tmp).sort();
				return {
					type: type, 
					value:value};
			}

			//other
			//TODO: test new regexp
			var dev = deviation(lens);
			var specialChars = Object.keys(chars);
			var regexp = "";
			if(dev <= 2.0 && data.length>100)
				regexp = "^[\\w\\d\\s_\\-\\,";
			else
				regexp = "^"+regExpEscape(prefixStr)+"[\\w\\d\\s_\\-\\,";
			
			var otherexp = "";
			for(var k in specialChars){
				var c = specialChars[k];
				if(!regSNA.test(c))
					otherexp += c;
			}
			regexp += regExpEscape(otherexp);
			regexp += "]";
			if(dev <= 2.0 && data.length>100){
				regexp += "{"+min(lens)+","+max(lens)+"}"
			}
			else{
				regexp += '*';
				regexp += regExpEscape(suffixStr);
			}
			regexp += "$";
			
			type = "regexp";
			value = new RegExp(regexp);
		}
		return {
			type: type, 
			value:value
		};
	};

	//typeObj: {type:type, value:value}
	//targetObj can be an array.
	var matchType = function(typeObj, targetObj, script){
		if(!typeObj || !typeObj.type){
			console.log("error: matchType typeObj is null. "+targetObj);
			return true;
		}
		if(Array.isArray(targetObj)){
			for(var i in targetObj){
				if(!matchType(typeObj, targetObj[i], script))
					return false;
			}
			return true;
		}
		if(targetObj.toString().trim().length === 0)
			return true;

		var regSNA = /^[\w\d\s_\-]*$/;
		if(typeObj.type === "insufficient"){
			var domains = {};
			targetObj = targetObj.toString();
			for(var i in typeObj.value){
				var d = typeObj.value[i].toString();
				
				if(d === targetObj)
					return true;

				var o = urlTool.parse(d);
				if(o.protocol == null) continue;
				o = parseDomain(d);
				if(o == null) continue;
				domains[o.domain+'.'+o.tld] = true;
			}
			if(matchType({type:"complex", value: domains}, targetObj))
				return true;
			console.log("NONMATCHING: insufficient: "+targetObj+" VS "+util.inspect(typeObj.value));
			for(var i in typeObj.value){
				var d = typeObj.value[i].toString();
				console.log("  "+d+" len:"+d.length);
			}
			return false;
		}
		else if(typeObj.type === "const"){
			var d = typeObj.value.toString();
			if(d === targetObj.toString()){
				return true;
			}
			else {
				console.log("NONMATCHING: const:"+targetObj.toString()+" VS "+d+" len:"+d.length);
				return false;
			}
		}
		else if(typeObj.type === "enum"){
			targetObj = targetObj.toString();
			for(var i in typeObj.value){
				var d = typeObj.value[i].toString() ;
				if(d == targetObj)
					return true;
				//console.log("Failed matching: "+d+" "+d.length+" VS "+targetObj.toString()+" "+targetObj.toString().length)
			}
			console.log("NONMATCHING: enum:"+targetObj+" VS "+util.inspect(typeObj.value));
			for(var i in typeObj.value){
				var d = typeObj.value[i].toString();
				console.log("  "+d+" len:"+d.length);
			}
			return false;
		}
		else if(typeObj.type === "number"){
			if(!targetObj)
				return true;
			else if(typeof targetObj === 'number')
				return true;
			else if((typeof targetObj === 'string') && 
				(!isNaN(targetObj.replace(/,/g, ''))) )
					return true;
			else{
				console.log("NONMATCHING: number:"+targetObj);
				return false;
			}
		}
		else if(typeObj.type === "url"){
			var o = urlTool.parse(targetObj.toString());
			if(o.protocol == null){
				console.log("NONMATCHING: url:"+targetObj);
				return false;
			}
			o = parseDomain(targetObj.toString());
			if(o==null){
				console.log("NONMATCHING: url:"+targetObj);
				return false;
			}
			var domain = o.domain+'.'+o.tld;
			if(domain in typeObj.value)
				return true;
			else{
				console.log("NONMATCHING: url:"+domain+" "+util.inspect(typeObj.value));
				return false;
			}
		}
		else if(typeObj.type === "gast"){
			try{
				var hash = toolSet.generateGASTHash(targetObj);
				if(hash in typeObj.value){
					return true;
				}
				else{
					console.log("NONMATCHING: gast:"+hash+" VS "+util.inspect(typeObj.value) );
					return false;
				}
			}
			catch(e){
				console.log("NONMATCHING: gast (e):"+targetObj+" VS "+util.inspect(typeObj.value) +" "+e);
				return false;
			}
		}
		else if(typeObj.type === "complex"){
			var d = targetObj.toString().trim()
			if (!d || d.length === 0)
				return true;
			else if(typeof d === 'number')
				return true;
			else if( (typeof d === 'string') && 
				!isNaN(d.replace(/,/g, '')) )
					return true;
			else if(regSNA.test(d))
				return true;
			else {
				try{
					var o = urlTool.parse(d);
					if(o.protocol == null){
						console.log("NONMATCHING: complex: "+d+" 2");
						return false;
					} 
					o = parseDomain(d);
					if(o == null){
						console.log("NONMATCHING: complex: "+d+" 3");
						return false;
					} 
					var k = o.domain+'.'+o.tld;
					if(k in typeObj.value)
						return true;
					console.log("NONMATCHING: complex: "+d+" 4");
					return false;
				}
				catch(e){
					console.log("NONMATCHING: complex: "+d+" 5");
					return false;
				}
			}
			console.log("NONMATCHING: complex: "+d+" 6");
			return false;
		}
		else if(typeObj.type === "regexp"){
			//console.log("REG: detect: "+util.inspect( typeObj.value) +"V:"+targetObj.toString()) ;
			if(typeObj.value.test(targetObj.toString()))
				return true;
			else{
				console.log("NONMATCHING: regexp:"+targetObj+" VS "+typeObj.value.toString() );
				return false;
			}
		}
		else if(typeObj.type === "boolean"){
			if(typeof targetObj == "boolean")
				return true;
			else if(targetObj=="true" || targetObj=="false")
				return false;
			console.log("NONMATCHING: boolean:"+targetObj);
			return false;
		}
		else{
			console.log("NONMATCHING: unknown type:"+targetObj+" "+util.inspect(typeObj));
			return false;
		}

	}

	var regExpEscape = function(string) {
  		return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	};
	//http://codereview.stackexchange.com/questions/65111/prefix-and-suffix-detection-algorithm
	var findPrefix = function(strings) {
		if(!strings.length) {
			return ""; // or null or undefined; your choice
		}
		var string1 = strings[0], string2 = strings[strings.length-1],i, l;
		
		// note: a regular for-loop is faster than forEach	
		// I'm using forEach because it's prettier
		strings.forEach(function (string) { 
			(string1 < string) || (string1 = string);
			(string2 > string) || (string2 = string);
		});

		i = 0;
		l = Math.min(string1.length, string2.length);
		while(i < l && string1[i] === string2[i]) {
			i++;
		}

		return string1.slice(0, i);
	};
	var reverse = function(string){
    	return string.split('').reverse().join('');
	};	
	var findSuffix = function(strings){
    	if(!strings || strings.length === 0){
        	return null;   
    	}
    	return reverse(findPrefix(strings.map(reverse)));
	};

	var avg = function(arr){
		if(arr==null || arr.length === 0)
			return null;
		var total = 0;
		for(var i in arr){
			total += arr[i];
		}
		return total / arr.length;
	};
	var deviation = function(arr){
		if(arr==null || arr.length === 0)
			return null;
		var m = avg(arr);
		var total = 0;
		for(var i in arr){
			var tmp = (arr[i]-m) * (arr[i]-m);
			total += tmp;
		}
		return total / arr.length;
	};
	var min = function(arr){
		if(arr==null || arr.length === 0)
			return null;
		var m = arr[0];
		for(var i in arr){
			if(arr[i] < m)
				m = arr[i];
		}
		return m;
	};
	var max = function(arr){
		if(arr==null || arr.length === 0)
			return null;
		var m = arr[0];
		for(var i in arr){
			if(arr[i] > m)
				m = arr[i];
		}
		return m;
	}
	
	return {
		inferType : inferType,
		matchType : matchType
	};
};
var typeFuns = CSPAutoGenType();
