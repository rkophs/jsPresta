/*
 * Name resolution & scanning: first scan, second rewrite
 * Check that each param/variable is used
 * Check param count higher than 0 (b/c we are only using purely functional)
 * Check that expressions are used appropriately (not as: [ (x) (display x) ])
 *		or lambda's are used correctly in an application of an expression
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