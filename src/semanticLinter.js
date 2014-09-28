/*
 * Name resolution & scanning: first scan, second rewrite
 * Check that inputs to functions have correct count of params
 * Check that each param/variable is used
 * Check type definition (number atom vs list atom)
 */

var newScope = function(){
	return {
 		values: []
 		children: []
 	}
}

var newVariable = function(name, type){
	return {
		name: name,
		type: type
	}
}


var buildSymbolTree = function(syntaxTree) {
	
}