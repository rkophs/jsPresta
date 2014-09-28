/* Parse input tree (nested arrays) and match against
 * the grammar defined for a language.
 *
 * Return true if the tree matches the grammar,
 * and false if it does not.
 */

setSuccess = function(tree, success){
  tree.error = !success;
  return success
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
  ))
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
  ))
};

/*
 * <variable> -> string matching: /^[A-Za-z]\w*$/
 */
var isVariable = function(atom) {
  return setSuccess(atom, (
       (false == atom instanceof Array)
    && atom.lex === 'variable'
  ))
};

/*
 * <keyword> -> string matching: if|lamda|define|quote|let
 */
var isKeyword = function(atom) {
  return setSuccess(atom, (
       (false == tree.value instanceof Array)
    && tree.lex === 'keyword'
  ))
};

/*
 * <Operator> -> character matching: +|-|/|*|=|<|>|<=|>=
 */
var isOperator = function(atom) {
  return setSuccess(atom, (
       (false == atom.value instanceof Array)
    && atom.lex === 'operator'
  ))
};

/*
 * <digit> -> parsable floating point number
 */
var isDigit = function(atom) {
  return setSuccess(atom, (
       ( false == (atom.value instanceof Array) )
    && ( atom.lex === 'digit' )
  ))
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
  ))
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
  ))
};

/*
 * <formals> ->  <variable>
 *             | ( <variables>* )
 */
var isFormals = function(tree) {
  return setSuccess(tree, (
       (
             (false == (tree.value instanceof Array))
          && isVariable(tree)
       )
    || (
             (tree.value instanceof Array)
          && tree.value.reduce(function(accum, elem){
                    return accum && isVariable(elem);
                 },true)
       )
  ))
};

/*
 * <expression> ->  <digit>
 *                | <variable>
 *                | ( quote <datum> )
 *                | ( lambda <formals> <expression> )
 *                | ( if <expression> <expression> <expression> ) 
 *                | ( if <expression> <expression> ) 
 *                | ( <operator> <expression>* )
 *                | <application>
 *                | ( let ( <syntax-binding>* ) <expression>+ )
 */
var isExpression = function(tree) {
  var isIfExpression = function(tree) {
    return (
         (tree.value instanceof Array)
      && (tree.value.length == 3 || tree.value.length == 4)
      && ( false == tree.value[0].value instanceof Array )
      && tree.value[0].value === 'if'
      && tree.value.slice(1)
                   .reduce(function(accum, elem){
                      return accum && isExpression(elem);
                   }, true)
    )
  };
  var isLambdaExpression = function(tree) {
    return (
         (tree.value instanceof Array)
      && tree.value.length == 3
      && ( false == tree.value[0] instanceof Array )
      && tree.value[0].value === 'lambda'
      && isFormals(tree.value[1])
      && isExpression(tree.value[2])
    )
  };
  var isLetExpression = function(tree) {
    return setSuccess(tree, (
         (tree.value instanceof Array)
      && (tree.value[1].value instanceof of Array)
      && tree.value.length >= 3 
      && tree.value[0].value == "let"
      && tree.value[1].value
                .reduce(function(accum, elem){
                  return accum && isSyntaxBinding(elem);
                }, true)
      && tree.value.split(2)
             .reduce(function(accum, elem){
               return accum && isExpression(elem);
             }, true)
    ))
  };
  var isOpExpression = function(tree) {
    return (
         (tree.value instanceof Array)
      && (tree.value.length == 2 || tree.value.length == 3)
      && isOperator(tree.value[0])
      && tree.value.slice(1)
                   .reduce(function(accum, elem){
                      return accum && isExpression(elem)
                   }, true)
       )
  };
  var isListExpression = function(tree) {
    return (
         (tree.value instanceof Array)
      && tree.value.length == 2
      && ( false == tree.value[0] instanceof Array )
      && tree.value[0].value === 'quote'
      && isDatum(tree.value[1])
    )
  }

  return setSuccess(tree, (
       isDigit(tree)
    || isVariable(tree)
    || isListExpression(tree)
    || isLambdaExpression(tree)
    || isIfExpression(tree)
    || isOpExpression(tree)
    || isApplication(tree)
    || isLetExpression(tree)
  ))
};

/*
 * <variable-definition> -> ( define <variable> <expression> )
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
  ))
};

/*
 * <definition> ->  <variable-definition>
 *                | ( let ( <syntax-binding>* ) <definition>* )
 */
var isDefinition = function(tree) {
  var isLetDefinition = function(tree) {
    return setSuccess(tree, (
         (tree.value instanceof Array)
      && (tree.value[1].value instanceof of Array)
      && tree.value.length >= 2 
      && tree.value[0].value == "let"
      && tree.value[1].value
                .reduce(function(accum, elem){
                  return accum && isSyntaxBinding(elem);
                }, true)
      && tree.value.split(2)
             .reduce(function(accum, elem){
               return accum && isDefinition(elem);
             }, true)
    ))
  };

  return setSuccess(tree, (
       isVariableDefinition(tree) 
    || isLetDefinition(tree)
  ))
};

/*
 * <form> ->  <definition>
 *          | <expression>
 */
var isForm = function(tree) {
  return setSuccess(tree, (
       isDefinition(tree) 
    || isExpression(tree)
  ))
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
  ))
};

var syntaxLint = function(inputTree) {
  return {
    value: isProgram(inputTree, 1),
    error: null
  }
};

exports.lint = syntaxLint;



