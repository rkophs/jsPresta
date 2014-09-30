/*
 * Name resolution & scanning: first scan, second rewrite
 * Check that each param/variable is used
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