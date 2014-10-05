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
}

/*
 * <datum> ->  <variable>
 *           | <digit>
 *           | <list>
 */
var isDatum = function(atom) {
  return setSuccess(atom, (
       isVariable(atom) 
    || isDigit(atom)
    || isList(atom)
  ), "datum", true)
};

/*
 * <keyword> -> string matching: if|lambda|define|quote|let
 */
var isKeyword = function(atom) {
  return setSuccess(atom, (
       (false == atom.value instanceof Array)
    && atom.lex === 'keyword'
  ), "keyword")
};

var isSpecificKeyword = function(tree, word){
  return (//setSuccess(tree, (
       isKeyword(tree)
    && tree.value === word
  )//, 'keyword');
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
 * <list> -> ( <datum>* )
 */
var isList = function(tree) {
  return setSuccess(tree, (
       (tree.value instanceof Array)
    && tree.value.reduce(function(accum, elem){
              return isDatum(elem) && accum;
           }, true)
  ), "list")
};

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
 * <application> -> ( <expression>+ )
 */
var isApplication = function(tree) {
  return setSuccess(tree, (
       (tree.value instanceof Array)
    && (tree.value.length >= 1)
    && tree.value.reduce(function(accum, elem){
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
 * <expression> ->  <digit>
 *                | <variable>
 *                | ( quote <datum> )
 *                | ( lambda <formals> <body> )
 *                | ( if <expression> <expression> <expression> ) 
 *                | ( <operator> <expression>+ )
 *                | <application>
 *                | ( let ( <syntax-binding>* ) <expression>+ )
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
  var isLambdaExpression = function(tree) {
    return setSuccess(tree, (
         (tree.value instanceof Array)
      && tree.value.length >= 3
      && tree.value[0].value == 'lambda'
      && isSpecificKeyword(tree.value[0], 'lambda')
      && isFormals(tree.value[1])
      && isBody(tree.value.slice(2))
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
  var isListExpression = function(tree) {
    return setSuccess(tree, (
         (tree.value instanceof Array)
      && tree.value.length == 2
      && ( false == tree.value[0] instanceof Array )
      && isSpecificKeyword(tree.value[0], 'quote')
      && isDatum(tree.value[1])
    ), "expression")
  }

  return setSuccess(inputTree, (
       isDigit(inputTree)
    || isVariable(inputTree)
    || isListExpression(inputTree)
    || isIfExpression(inputTree)
    || isOpExpression(inputTree)
    || isApplication(inputTree)
    || isLambdaExpression(inputTree)
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
 * <variable-definition> -> ( define <variable> <expression> )
 *                        | ( define ( <variable>+ ) <body> )
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



