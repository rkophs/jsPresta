/* Convert string input into array of words/symbols; space delimited.
 *
 * In the case that a token (word) can not be matched a language specified
 * lex, undefined is set for that location in the array.
 */

var setDigit = function(word) {
  return ((!isNaN(parseFloat(word))) && (0 === word.search(/^[0-9\.]+$/))) ?
    {lex: 'digit', value: parseFloat(word)} : null;
}

var setVariable = function(word) {
  // Word must be name starting with a letter, 
  // followed by any number of digits and letters
  return 0 === word.search(/^[A-Za-z]\w*$/) ?
    {lex: 'variable', value: word, error: false} : null;
}

var setKeyWord = function(word) {
  return 0 === word.search(/^(if|lambda|define|quote|list|num|\||\_)$/) ?
    {lex: 'keyword', value: word, error:false} : null;
}

var setOperator = function(word) {
  //Word must be <= >= * + - / > < =
  return 0 === word.search(/(^\&\&$|^\|\|$|^[\<\>\=]\=$|^[\*\/\+\-\>\<\!]$)/) ?
    {lex: 'operator', value: word, error:false} : null;
}

var setList = function(word) {
  return 0 === word.search(/^[\[\]]$/) ?
    {lex: 'lister' , value: word} : null;
}

var setBracket = function(word) {
  return 0 === word.search(/^[\(\)]$/) ?
    {value: word} : null;
}

var tokenize = function(input) {
  
  var errors = [];
  var lexError = function(word) {
    if (word === ''){
      errors.push("Cannot have empty string.");
    } else {
      errors.push("Illegal character or word: " + word);
    }
  }

  tokens = input.replace(/\(/g, ' ( ') //Replace all instances of '(' with ' ( '
                .replace(/\)/g, ' ) ') //Replace all instances of ')' with ' ) '
                .replace(/\[/g, ' [ ') //Replace all instances of '[' with ' [ '
                .replace(/\]/g, ' ] ') //Replace all instances of ']' with ' ] '  
                .trim()                //Remove leading/trailing white space on ends of the string input
                .split(/\s+/)          //Split on every chunk of whitespace  
                .map(function(word) {
                  return setDigit(word) || setKeyWord(word) || setOperator(word) 
                    || setVariable(word) || setList(word) || setBracket(word) || lexError(word);
                });

  return {
    errors: errors, 
    tokens: (errors.length > 0 ? null : tokens)
  };
};

exports.tokenize = tokenize;