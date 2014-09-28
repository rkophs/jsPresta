/* Checks to ensure an equal number of closing and opening parenthesis.
 * 
 * Also check that the input starts with an open and ends with close
 */

var bracketLinter = function(input) {

  if ( false ==  /^\((.|\n)*(\)|\s|\n)$/.test(input) ) { //Must being/end in bracket
    var error = "Input must begin with opening parenthesis and end with closing parenthesis.";
    return {value: false, error: error};
  }

  var diff = (input.match( /\(/g ) || '').length - (input.match( /\)/g ) || '').length;
  if(diff) {
    var error = Math.abs(diff) + " too many " + (diff < 0 ? "closing" : "opening" ) + " parenthesis."
    return {value: false, error: error};
  }

  return {value: true, error: null};
}

exports.lint = bracketLinter;