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
 * <syntax-binding> ->  ( <variable> <expression> )
 */
var isSyntaxBinding = function(tree) {
  return setSuccess(tree, (
       (tree.value instanceof Array)
    && (tree.value.length == 2)
    && isVariable(tree.value[0])
    && isExpression(tree.value[1])
  ), "syntax-binding")
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
 * <variable> -> string matching: /^[A-Za-z]\w*$/
 */
var isVariable = function(atom) {
  return setSuccess(atom, (
       (false == atom instanceof Array)
    && atom.lex === 'variable'
  ), "variable")
};

/*
 * <keyword> -> string matching: if|lamda|define|quote|let
 */
var isKeyword = function(atom) {
  return setSuccess(atom, (
       (false == tree.value instanceof Array)
    && tree.lex === 'keyword'
  ), "keyword")
};

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
 * <digit> -> parsable floating point number
 */
var isDigit = function(atom) {
  return setSuccess(atom, (
       ( false == (atom.value instanceof Array) )
    && ( atom.lex === 'digit' )
  ), "digit")
};

/*
 * <list> -> ( <datum>* )
 */
var isList = function(tree) {
  return setSuccess(atom, (
       (tree instanceof Array)
    && tree.reduce(function(accum, elem){
              return isDatum(elem) && accum;
           }, true)
  ), "list")
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
 * <formals> -> ( <variables>* )
 */
var isFormals = function(tree) {
  return setSuccess(tree, (
       (tree.value instanceof Array)
    && tree.value.reduce(function(accum, elem){
              return accum && isVariable(elem);
           },true)
  ), "formals")
};

/*
 * <expression> ->  <digit>
 *                | <variable>
 *                | ( quote <datum> )
 *                | ( lambda <formals> <body> )
 *                | ( if <expression> <expression> <expression> ) 
 *                | ( if <expression> <expression> ) 
 *                | ( <operator> <expression>* )
 *                | <application>
 *                | ( let ( <syntax-binding>* ) <expression>+ )
 */
var isExpression = function(tree) {
  var isIfExpression = function(tree) {
    return setSuccess(tree, (
         (tree.value instanceof Array)
      && (tree.value.length == 3 || tree.value.length == 4)
      && ( false == tree.value[0].value instanceof Array )
      && tree.value[0].value === 'if'
      && tree.value.slice(1)
                   .reduce(function(accum, elem){
                      return accum && isExpression(elem);
                   }, true)
    ), "expression")
  };
  var isLambdaExpression = function(tree) {
    return setSuccess(tree, (
         (tree.value instanceof Array)
      && tree.value.length == 3
      && ( false == tree.value[0] instanceof Array )
      && tree.value[0].value === 'lambda'
      && isFormals(tree.value[1])
      && isBody(tree.value[2])
    ), "expression")
  };
  var isOpExpression = function(tree) {
    return setSuccess(tree, (
         (tree.value instanceof Array)
      && (tree.value.length == 2 || tree.value.length == 3)
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
      && tree.value[0].value === 'quote'
      && isDatum(tree.value[1])
    ), "expression")
  }

  return setSuccess(tree, (
       isDigit(tree)
    || isVariable(tree)
    || isListExpression(tree)
    || isLambdaExpression(tree)
    || isIfExpression(tree)
    || isOpExpression(tree)
    || isApplication(tree)
  ), "expression", true)
};

var isBody = function(tree){
  isValidOrder = function(input){
    bits = input.reduce(function(accum, elem){
                  return accum.push(isDefinition(elem) ? 0 : (isExpression(elem) ? 1 : 2));
                }, []);
    return (
         bits.reduce(function(accum, elem){
            return (elem < 2) && (elem >= arr[it - 1]);
         })
      && bits[bits.length - 1] === 1;
    )
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
    && (
            isVariable(tree.value[1]) 
         && isExpression(tree.value[2])
       )
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
              return accum && isForm(elem);
           }, true)
  ), "program")
};

var syntaxLinter = function(parseTree) {
  return {
    value: isProgram(parseTree, 1),
    error: null
  }
};

var constructSymbolTable = function(concreteTree) {
  var table 
  var helper(tree, context){

  }
}

exports.lint = syntaxLinter;



