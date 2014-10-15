/* Checks to ensure an equal number of closing and opening parenthesis.
 * 
 * Also check that the input starts with an open and ends with close
 */

var bracketLinter = function(input) {

  var mix = function(arr){
    var count = 0;
    var depth = [];
    for (it in arr) {
      var token = arr[it];
      if(count < 0) {
        return false;
      }

      if (token === '('){
        depth[count++] = '(';
      } else if (token === ')') {
        if (depth[--count] !== '(') {
          return false;
        }
      } else if (token === '[') {
        depth[count++] = '[';
      } else if (token === ']') {
        if (depth[--count] !== '[') {
          return false;
        }
      }
    }
    if (count != 0){
      return false;
    }
    return true;
  }

  var parenthesis = input.replace(/[^\(\)\]\[]/g, '')
                         .split('');

  var valid = mix(parenthesis);
  return valid;
}

exports.lint = bracketLinter;