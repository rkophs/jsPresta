/* Convert an array in tokens into a nested array (tree).
 *
 * Beginning and end of a child array are marked by 
 * tokens of open and closed parenthesis respectively.
 */

var parse = function(input) {
  var buildList = function(tokens) {
    var token = tokens.shift();
    var listObj = {lex: "lister", elements: []}

    while ( undefined !== token && "]" !== token.value ) {
      if ( "(" === token.value ) {
        listObj.elements.push(buildTree(tokens, {value:[]}));
      } else if ( "[" === token.value ) {
        listObj.elements.push(buildList(tokens));
      } else {
        listObj.elements.push(token);
      }
      token = tokens.shift();
    }
    return listObj;
  }

  var buildTree = function(tokens, listObj) {
    var token = tokens.shift();
    while ( undefined !== token && ")" !== token.value ) {
      if ( "(" === token.value ) {
        listObj.value.push(buildTree(tokens, {value:[]}));
      } else if ( "[" === token.value ) {
        listObj.value.push(buildList(tokens));
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