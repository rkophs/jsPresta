/* Convert an array in tokens into a nested array (tree).
 *
 * Beginning and end of a child array are marked by 
 * tokens of open and closed parenthesis respectively.
 */

var parse = function(input) {
  var buildTree = function(tokens, listObj) {
    var token = tokens.shift();
    while ( undefined !== token && ")" !== token.value ) {
      if ( "(" === token.value ) {
        listObj.value.push(buildTree(tokens, {value:[]}));
      } else {
        listObj.value.push(token);
      }
      token = tokens.shift();
    }
    return listObj;
  };

  return buildTree(input, {value:[]});
};

exports.parse = parse;