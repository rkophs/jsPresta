/* Checks to ensure an equal number of closing and opening parenthesis.
 * 
 * Also check that the input starts with an open and ends with close
 */

var bracketLinter = function(input) {

  var parenthesis = input.replace(/[^\(\)]/g, '')
                         .split('');

  var count = 0;
  for ( it in parenthesis ) {
    if (count < 0){
      return {value:false, error:"Malformed parenthesis"};
    }
    count += (parenthesis[it] === ')' ? -1 : 1);
  }
  if (count != 0){
    return {value:false, error:"Malformed parenthesis"};
  }
  return {value: true, error: null};
}

exports.lint = bracketLinter;