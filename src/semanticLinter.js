/*
 * Name resolution & scanning: first scan, second rewrite
 * Check that each param/variable is used
 * Check param count higher than 0 (b/c we are only using purely functional)
 * Check that expressions are used appropriately (not as: [ (x) (display x) ])
 *		or lambda's are used correctly in an application of an expression
 * New scopes are defined within lambdas, therefore, variables are either declared
 *  in the formal clauses or within the the variable definition clauses
 *
 * Check that the program can be invoked (first element is a function and subsequent are valid params)
 * in matcher... check that _ only happens once and is last
 */

var newScope = function(){
	return {
 		values: [],
 		children: []
 	}
}

var count = 0;
var newVariable = function(name, type){
	count++;
	return {
		alias: alias,
		id: count
	}
}

var buildSymbolTree = function(syntaxTree) {

	var symbols = [];
	console.log(syntaxTree);
}

exports.lint = buildSymbolTree;