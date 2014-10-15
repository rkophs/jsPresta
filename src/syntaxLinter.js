/* Parse input tree (nested arrays) and match against
 * the grammar defined for a language.
 *
 * Return true if the tree matches the grammar,
 * and false if it does not.
 */

setSuccess = function(tree, success, syntax, noChange){
  tree.error = !success;
  if(!(noChange && tree.syntax) || !success){
    tree.syntax = syntax;
  }
  return success;
};

/*
 * <keyword> -> string matching: if|lambda|define|quote|let|cons
 */
var isKeyword = function(atom) {
  return setSuccess(atom, (
       (false == atom.value instanceof Array)
    && atom.lex === 'keyword'
  ), "keyword")
};

var isSpecificKeyword = function(tree, word){
  return setSuccess(tree, (
       isKeyword(tree)
    && tree.value === word
  ), 'keyword');
}

/*
 * <Operator> -> character matching: +|-|/|*|=|<|>|<=|>=
 */
var isOperator = function(atom) {
  return setSuccess(atom, (
       (false == atom.value instanceof Array)
    && atom.lex === 'operator'
  ), "operator")
};

/*
 * <list> -> [ <expression>* ]
 */
var isList = function(tree) {
  return setSuccess(tree, (
       (tree.lex === 'lister')
    && (tree.elements instanceof Array)
    && tree.elements.reduce(function(accum, elem){
                    return accum && isExpression(elem)
                 }, true)
  ), "list")
}

/*
 * <digit> -> parsable floating point number
 */
var isDigit = function(atom) {
  return setSuccess(atom, (
       ( false == (atom.value instanceof Array) )
    && ( atom.lex === 'digit' )
  ), "digit")
};

/*
 * <application> -> ( <variable> <expression>* )
 *                | ( <lambda> <expression>* )
 */
var isApplication = function(tree) {
  return setSuccess(tree, (
       (tree.value instanceof Array)
    && (tree.value.length >= 1)
    && (
             isVariable(tree.value[0])
          || isLambda(tree.value[0])
       )
    && tree.value.slice(1)
                 .reduce(function(accum, elem){
                    return isExpression(elem) && accum;
                 }, true)
  ), "application")
};

/*
 * <formals> -> ( <variables>+ )
 */
var isFormals = function(tree) {
  return setSuccess(tree, (
       (tree.value instanceof Array)
    && (tree.value.length >= 1)
    && tree.value.reduce(function(accum, elem){
              return isVariable(elem) && accum;
           },true)
  ), "formals")
};

/*
 * <lambda> -> ( lambda <formals> <body> )
 */
var isLambda = function(tree) {
  return setSuccess(tree, (
       (tree.value instanceof Array)
    && tree.value.length >= 3
    && tree.value[0].value == 'lambda'
    && isSpecificKeyword(tree.value[0], 'lambda')
    && isFormals(tree.value[1])
    && isBody(tree.value.slice(2))
  ), "lambda", true);
}

/*
 * <expression> ->  <digit>
 *                | <variable>
 *                | <list>
 *                | <lambda>
 *                | ( if <expression> <expression> <expression> ) 
 *                | ( <operator> <expression>+ )
 *                | <application>
 */
var isExpression = function(inputTree) {

  var isIfExpression = function(tree) {
    return setSuccess(tree, (
         (tree.value instanceof Array)
      && (tree.value.length == 4)
      && ( false == tree.value[0].value instanceof Array )
      && isSpecificKeyword(tree.value[0], 'if')
      && tree.value.slice(1)
                   .reduce(function(accum, elem){
                      return accum && isExpression(elem);
                   }, true)
    ), "expression")
  };
  var isOpExpression = function(tree) {
    return setSuccess(tree, (
         (tree.value instanceof Array)
      && (tree.value.length >= 2)
      && isOperator(tree.value[0])
      && tree.value.slice(1)
                   .reduce(function(accum, elem){
                      return accum && isExpression(elem)
                   }, true)
       ), "expression")
  };

  return setSuccess(inputTree, (
       isDigit(inputTree)
    || isVariable(inputTree)
    || isList(inputTree)
    || isLambda(inputTree)
    || isIfExpression(inputTree)
    || isOpExpression(inputTree)
    || isApplication(inputTree)
  ), "expression", true)
};

/*
 * <variable> -> string matching: /^[A-Za-z]\w*$/
 */
var isVariable = function(atom) {
  return setSuccess(atom, (
       (false == atom instanceof Array)
    && atom.lex === 'variable'
  ), "variable")
};

/*
 * <body> -> <definition>* <expression>
 */
var isBody = function(tree){
  isValidOrder = function(input){
    var bits = input.reduce(function(accum, elem){
                  accum.push(isDefinition(elem) ? 0 : (isExpression(elem) ? 1 : 2));
                  return accum;
                }, []);
    if(bits[bits.length - 1] != 1){
      return false;
    }

    for(bitIt in bits.slice(0, bits.length - 1)){
      if(bits[bitIt] != 0 ){
        return false;
      } 
    }
    return true;
  };
  
  return setSuccess(tree, (
       (tree instanceof Array)
    && tree.length >= 1
    && isValidOrder(tree)
  ), "body");
}

/*
 * <variable-definition> ->  ( define <variable> <expression> )
 *              
 */
var isVariableDefinition = function(tree) {
  return setSuccess(tree, (    
       (tree.value instanceof Array)
    && tree.value.length == 3 
    && tree.value[0].value === 'define'
    && isVariable(tree.value[1]) 
    && isExpression(tree.value[2])
  ), "variable-definition")
};

/*
 * <definition> ->  <variable-definition>
 */
var isDefinition = function(tree) {
  return setSuccess(tree, (
       isVariableDefinition(tree) 
  ), "definition", true)
};

/*
 * <form> ->  <definition>
 *          | <expression>
 */
var isForm = function(tree) {

  return setSuccess(tree, (
       isDefinition(tree) 
    || isExpression(tree)
  ), "form", true)
};

/*
 * <program> -> <form>* 
 */
var isProgram = function(tree) {
  return setSuccess(tree, (
       ( tree.value instanceof Array )
    && tree.value.reduce(function(accum, elem) {
              return isForm(elem) && accum;
           }, true)
  ), "program")
};

var syntaxLinter = function(parseTree) {
  return isProgram(parseTree, 1);
};

exports.lint = syntaxLinter;



