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
 * <formals> -> ( <variable>+ )
 */
 var isFormals = function(tree) {
  return setSuccess(tree, (    
       (tree.value instanceof Array)
    && (tree.value.length >= 1)
    && tree.value.reduce(function(accum, elem){
                    return isVariable(elem) && accum;
                 }, true)
  ), "formals")
};

/*
 * <type> -> num 
 *         | <type-expression>
 *         | [<type>]
 */
isType = function(tree) {
  var isNumType = function(input){
    return setSuccess(input, (
         (false == input.value instanceof Array)
      && (input.value === 'num')
    ), "type-num");
  };

  var isListType = function (input) {
  return setSuccess(input, (
         (input.lex === 'lister')
      && (input.elements instanceof Array)
      && input.elements.length == 1
      && isType(input.elements[0])
    ), "type-list");
  }
  return setSuccess(tree, (
       isNumType(tree)
    || isListType(tree)
    || isTypeExpression(tree)
  ), "type", true)
}

/*
 * <type-expression> -> (<type> -> <type>)
 */
var isTypeExpression = function(tree){
  return setSuccess(tree, (
       (tree.value instanceof Array)
    && (tree.value.length == 3)
    && isType(tree.value[0])
    && isType(tree.value[2])
    && isSpecificKeyword(tree.value[1], '->')
  ), "type-expression")
}

 /*
  * <lambda> -> (<type-expression> <formals> <variable-definition>* -> <expression>)
  */
var isLambda = function(tree) {
  return setSuccess(tree, (    
       (tree.value instanceof Array)
    && (tree.value.length >= 4)
    && isExpression(tree.value[tree.value.length - 1])
    && isTypeExpression(tree.value[0])
    && isFormals(tree.value[1])
    && isSpecificKeyword(tree.value[tree.value.length - 2], '->')
    && (
            (
                 (tree.value.length > 4)
              && tree.value.slice(2, tree.value.length - 2)
                           .reduce(function(accum, elem){
                              return isVariableDefinition(elem) && accum;
                           }, true)
            )
          || (tree.value.length == 4)
       )
  ), "lambda")
};

/*
 * <pattern-match> -> (<expression> <case>+ )
 *                  | ( <case>+ )
 * <case> -> | <expression> <expression>
 *         | | _ <expression>
 */
var isPatternMatch = function(tree){
  var isCaseArray = function(arr){
    return setSuccess(tree, (
         (arr instanceof Array)
      && (arr.length %3 == 0)
      && (arr.length >= 3)
      && arr.reduce(function(accum, elem){
                      return {
                        valid: (accum.valid && (
                             (accum.it == 0 && isSpecificKeyword(elem, '|'))
                          || (accum.it == 1 && ( isSpecificKeyword(elem, '_') || isExpression(elem)))
                          || (accum.it == 2 && isExpression(elem))
                        )),
                        it: (++accum.it % 3)
                      }
                    }, {valid:true, it: 0}).valid
    ), "pattern-match");
  };

  return setSuccess(tree, (
       (tree.value instanceof Array)
    && (tree.value.length >= 3)
    && (
           (
                isExpression(tree.value[0])
             && isCaseArray(tree.value.slice(1))
           )
        || isCaseArray(tree.value)
       )
  ), "pattern-match");
};

var isUnaryOp = function(input){
  return setSuccess(input, (
       (false == input.value instanceof Array)
    && input.lex === 'unary-operand'
  ), "unary-operand")
};

var isBinaryOp = function(input){
  return setSuccess(input, (
       (false == input.value instanceof Array)
    && input.lex === 'binary-operand'
  ), "binary-operand")
};

/*
 * <expression> ->  <digit>
 *                | <variable>
 *                | <list>
 *                | <lambda>
 *                | <pattern-match>
 *                | (<expression> <binary-operator> <expression> )
 *                | (<unary-operator> <expression> )
 *                | <application>
 */
var isExpression = function(inputTree) {
  var isUnaryOpExpression = function(tree) {
    return setSuccess(tree, (
         (tree.value instanceof Array)
      && (tree.value.length == 2)
      && isUnaryOp(tree.value[0])
      && isExpression(tree.value[1])
    ), "unary-operation")
  };

  var isBinaryOpExpression = function(tree) {
    return setSuccess(tree, (
         (tree.value instanceof Array)
      && (tree.value.length == 3)
      && isExpression(tree.value[0])
      && isBinaryOp(tree.value[1])
      && isExpression(tree.value[2])
    ), "binary-operation")
  };

  return setSuccess(inputTree, (
       isDigit(inputTree)
    || isVariable(inputTree)
    || isList(inputTree)
    || isLambda(inputTree)
    || isPatternMatch(inputTree)
    || isBinaryOpExpression(inputTree)
    || isUnaryOpExpression(inputTree)
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
 * <variable-definition> -> ( <variable> :: <expression> )
 */
var isVariableDefinition = function(tree) {
  return setSuccess(tree, (    
       (tree.value instanceof Array)
    && (tree.value.length == 3)
    && isSpecificKeyword(tree.value[1], '::')
    && isVariable(tree.value[0])
    && isExpression(tree.value[tree.value.length - 1])
  ), "variable-definition")
};

/*
 * <form> ->  <variable-definition>
 *          | <expression>
 */
var isForm = function(tree) {

  return setSuccess(tree, (
       isVariableDefinition(tree) 
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



