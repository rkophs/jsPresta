var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var tokenizer = require('../src/tokenizer');
var parser = require('../src/parser');
var linter = require('../src/syntaxLinter');

describe('syntaxLinter', function(){
  describe("#lint() list no params", function(){
    it('empty list param', function(){
      var tree = parser.parse(tokenizer.tokenize('( f [] )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
      assert.equal(tree.value[0].value[1].syntax, "list");
    });

    it('full list valid', function(){
      var tree = parser.parse(tokenizer.tokenize('( f [ 10 10 ] )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
      assert.equal(tree.value[0].value[1].syntax, "list");
      assert.equal(tree.value[0].value[1].elements[0].syntax, "digit");
    });

    it('single list valid', function(){
      var tree = parser.parse(tokenizer.tokenize('( f [10] )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
    });

    it('lamda inside list is valid', function(){
      var tree = parser.parse(tokenizer.tokenize('(f [ 10 f ((num -> num) (y) -> ( 10 + y )) ] )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
      assert.equal(tree.value[0].value[1].elements[0].syntax, "digit");
      assert.equal(tree.value[0].value[1].elements[1].syntax, "variable");
      assert.equal(tree.value[0].value[1].elements[2].syntax, "lambda");
    });

    it('nested lists valid ', function(){
      var tree = parser.parse(tokenizer.tokenize('( f [ x 30 [ y 50 ] ] )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
      assert.equal(tree.value[0].value[1].elements[2].syntax, "list");
      assert.equal(tree.value[0].value[1].elements[2].elements[0].syntax, "variable");
      assert.equal(tree.value[0].value[1].elements[2].elements[1].syntax, "digit");
    });

    it('nested lists valid with valid application (lists, digits and vars)', function(){
      var tree = parser.parse(tokenizer.tokenize('( f [ x 30 ( b 50 ) ])').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
      assert.equal(tree.value[0].value[1].elements[2].syntax, "application");
      assert.equal(tree.value[0].value[1].elements[2].value[0].syntax, "variable");
      assert.equal(tree.value[0].value[1].elements[2].value[1].syntax, "digit");
    });

    it('full list invalid', function(){
      var tree = parser.parse(tokenizer.tokenize('( f [ ( x :: 10) 20 30 ] )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, false);
    });

    it('list with op valid', function(){
      var tree = parser.parse(tokenizer.tokenize('( f [ ( 20 + 30 ) ])').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
      assert.equal(tree.value[0].value[1].elements[0].syntax, "binary-operation");
      assert.equal(tree.value[0].value[1].elements[0].value[0].syntax, "digit");
      assert.equal(tree.value[0].value[1].elements[0].value[1].syntax, "binary-operand");
      assert.equal(tree.value[0].value[1].elements[0].value[2].syntax, "digit");
    })

    it('list invalid op', function(){
      var tree = parser.parse(tokenizer.tokenize('(f [ ( + 20 30 ) ])').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, false);
    })

  });

  describe("#lint() variable definitions and expressions/lambdas", function(){
    it('define to valid variable', function(){
      var tree = parser.parse(tokenizer.tokenize('( x :: y )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
      assert.equal(tree.value[0].syntax, 'variable-definition');
      assert.equal(tree.value[0].value[0].syntax, 'variable');
      assert.equal(tree.value[0].value[1].syntax, 'keyword');
      assert.equal(tree.value[0].value[2].syntax, 'variable');
    });

    it('define to valid digit', function(){
      var tree = parser.parse(tokenizer.tokenize('( x :: 10 )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
      assert.equal(tree.value[0].syntax, 'variable-definition');
      assert.equal(tree.value[0].value[0].syntax, 'variable');
      assert.equal(tree.value[0].value[1].syntax, 'keyword');
      assert.equal(tree.value[0].value[2].syntax, 'digit');
    });

    it('define to valid list', function(){
      var tree = parser.parse(tokenizer.tokenize('( x :: [y z] )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
      assert.equal(tree.value[0].value[0].syntax, 'variable');
      assert.equal(tree.value[0].value[1].syntax, 'keyword');
      assert.equal(tree.value[0].value[2].syntax, 'list');
      assert.equal(tree.value[0].value[2].elements[0].syntax, 'variable');
      assert.equal(tree.value[0].value[2].elements[1].syntax, 'variable');
    });

    it('define to valid operation', function(){
      var tree = parser.parse(tokenizer.tokenize('( x :: (10 + 12) )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
      assert.equal(tree.value[0].value[0].syntax, 'variable');
      assert.equal(tree.value[0].value[1].syntax, 'keyword');
      assert.equal(tree.value[0].value[2].syntax, 'binary-operation');
      assert.equal(tree.value[0].value[2].value[0].syntax, 'digit');
      assert.equal(tree.value[0].value[2].value[1].syntax, 'binary-operand');
      assert.equal(tree.value[0].value[2].value[0].syntax, 'digit');
    });

    it('define to valid lambdas', function(){
      var lambdas = [
        '( plus :: ((num -> num) (y) -> (y + 20)) )',
        '( plus :: ((num -> num) (y) (z :: 10) -> (y + z)) )',
        '( plus :: ((num -> num) (y) (z :: 10) (zz :: (y + z)) -> ( y + z) ))',
        '( plus :: ((num -> ( num -> num )) (q z) -> ( q + z)))',
        '( plus :: ((num -> ( num -> num )) (q z) (z :: 10) (a :: 11) -> ( q + z)))'
      ];
      for(it in lambdas){
        var tree = parser.parse(tokenizer.tokenize(lambdas[it]).tokens);
        var ret = linter.lint(tree)
        assert.equal(ret, true);
        assert.equal(tree.value[0].syntax, 'variable-definition');
        assert.equal(tree.value[0].value[0].syntax, 'variable');
        assert.equal(tree.value[0].value[2].syntax, 'lambda');
        assert.equal(tree.value[0].value[2].value[0].syntax, 'type-expression');
        assert.equal(tree.value[0].value[2].value[1].syntax, 'formals');
      }
    });

    it('valid type syntax check', function(){
      var str = '( plus :: ( (num -> ( num -> [[[(num -> num)]]] )) (y z) (x :: 10) -> (! y))  )';
      var tree = parser.parse(tokenizer.tokenize(str).tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
      assert.equal(tree.value[0].value[2].syntax, 'lambda');
      assert.equal(tree.value[0].value[2].value[0].syntax, 'type-expression');
      assert.equal(tree.value[0].value[2].value[0].value[0].syntax, 'type-num');
      assert.equal(tree.value[0].value[2].value[0].value[1].syntax, 'keyword');
      assert.equal(tree.value[0].value[2].value[0].value[2].syntax, 'type-expression');
      assert.equal(tree.value[0].value[2].value[0].value[2].value[0].syntax, 'type-num');
      assert.equal(tree.value[0].value[2].value[0].value[2].value[1].syntax, 'keyword');
      assert.equal(tree.value[0].value[2].value[0].value[2].value[2].syntax, 'type-list');
      assert.equal(tree.value[0].value[2].value[0].value[2].value[2].elements[0].syntax, 'type-list');
      assert.equal(tree.value[0].value[2].value[0].value[2].value[2].elements[0].elements[0].syntax, 'type-list');
      assert.equal(tree.value[0].value[2].value[0].value[2].value[2].elements[0].elements[0].elements[0].syntax, 'type-expression');
      assert.equal(tree.value[0].value[2].value[0].value[2].value[2].elements[0].elements[0].elements[0].value[0].syntax, 'type-num');
      assert.equal(tree.value[0].value[2].value[0].value[2].value[2].elements[0].elements[0].elements[0].value[1].syntax, 'keyword');
      assert.equal(tree.value[0].value[2].value[0].value[2].value[2].elements[0].elements[0].elements[0].value[2].syntax, 'type-num');
      assert.equal(tree.value[0].value[2].value[1].syntax, 'formals');
      assert.equal(tree.value[0].value[2].value[1].value[0].syntax, 'variable');
      assert.equal(tree.value[0].value[2].value[1].value[1].syntax, 'variable');
      assert.equal(tree.value[0].value[2].value[2].syntax, 'variable-definition');
      assert.equal(tree.value[0].value[2].value[2].value[0].syntax, 'variable');
      assert.equal(tree.value[0].value[2].value[2].value[2].syntax, 'digit');
      assert.equal(tree.value[0].value[2].value[3].syntax, 'keyword');
      assert.equal(tree.value[0].value[2].value[4].syntax, 'unary-operation');
      assert.equal(tree.value[0].value[2].value[4].value[0].syntax, 'unary-operand');
      assert.equal(tree.value[0].value[2].value[4].value[1].syntax, 'variable');
    });

    it('valid types', function(){
      var lambdas = [
        '( plus :: ( (num -> ( num -> num )) (y) -> (y + 20))  )',
        '( plus :: ( (( num -> num ) -> num ) (y) -> (y + 20))  )',
        '( plus :: ( (( num -> ( num -> num )) -> num ) (y) -> (y + 20))  )',
        '( plus :: ( ( [num] -> num ) (y) -> (y + 20))  )',
        '( plus :: ( ( [num] -> [num] ) (y) -> (y + 20))  )',
        '( plus :: ( ( num -> [num] ) (y) -> (y + 20))  )',
        '( plus :: ( ( [[num]] -> [[[num]]] ) (y) -> (y + 20))  )',
        '( plus :: ( ( [[(num -> num)]] -> [[[(num -> (num-> [[(num -> num)]]) )]]] ) (y) -> (y + 20))  )'
      ];
      for(it in lambdas){
        var tree = parser.parse(tokenizer.tokenize(lambdas[it]).tokens);
        var ret = linter.lint(tree)
        assert.equal(ret, true);
      }
    });

    it('invalid types', function(){
      var lambdas = [
        '( plus :: ( (num -> ( num -> )) (y) -> (y + 20))  )',
        '( plus :: ( ( -> num ) (y) -> (y + 20))  )',
        '( plus :: ( (num -> ()) (y) -> (y + 20))  )',
        '( plus :: ( (() -> num) (y) -> (y + 20))  )',
        '( plus :: ( ( [] -> num ) (y) -> (y + 20))  )',
        '( plus :: ( ( [[[]]] -> num ) (y) -> (y + 20))  )',
        '( plus :: ( ( [[[][]]] -> num ) (y) -> (y + 20))  )',
        '( plus :: ( ( [[[num][num]]] -> num ) (y) -> (y + 20))  )',
        '( plus :: ( ( [num][num] -> num ) (y) -> (y + 20))  )',
        '( plus :: ( ( num num ) (y) -> (y + 20))  )',
        '( plus :: ( ( num ) (y) -> (y + 20))  )',
        '( plus :: ( () (y) -> (y + 20))  )',
        '( plus :: ( ( -> ) (y) -> (y + 20))  )',
        '( plus :: ( ( num -> num -> num ) (y) -> (y + 20))  )',
        '( plus :: ( ( int -> int ) (y) -> (y + 20))  )',
        '( plus :: ( ( int -> num ) (y) -> (y + 20))  )',
        '( plus :: ( ( num -> int ) (y) -> (y + 20))  )',
        '( plus :: ( ( num -> [int] ) (y) -> (y + 20))  )',
        '( plus :: ( num (y) -> (y + 20))  )',
        '( plus :: ( [num] (y) -> (y + 20))  )',
        '( plus :: ( [num -> num] (y) -> (y + 20))  )',
      ];
      for(it in lambdas){
        var tree = parser.parse(tokenizer.tokenize(lambdas[it]).tokens);
        var ret = linter.lint(tree)
        assert.equal(ret, false);
      }
    });

    it('define to invalid lambdas', function(){
      var lambdas = [
        '( plus :: ( (num -> ( num -> num )) [y] -> (y + 20))  )',
        '( plus :: ((y) -> (y + 20))  )',
        '( plus :: ( ( num -> num ) -> (y + 20))  )',
        '( plus :: ( ( num -> num ) () -> (10 + 20))  )',
        '( plus :: ( ( num -> num ) (y num) -> (10 + 20))  )',
        '( plus :: ( ( num -> num ) (y) (10 + 20))  )',
        '( plus :: ( ( num -> num ) (y) -> )  )',
        '( plus :: ( ( num -> num ) (y) -> ())  )',
        '( plus :: ( ( num -> num ) (y)  ))',
        '( plus :: ( ( num -> num )))',
        '( plus :: ( ( num -> num ) (y) -> (z :: 10) ))',
        '( plus :: ( ( num -> num ) (y) (z :: 10) -> () ))',
        '( plus :: ( ( num -> num ) (z :: 10) (y) -> (10 + y) ))',
        '( plus :: ( ( num -> num ) (z :: 10) (y) (z :: 10) -> (z :: 10) ))',
        '( plus :: ( ( num -> num ) (z :: 10) (y) -> (z :: 10) ))',
      ];
      for(it in lambdas){
        var tree = parser.parse(tokenizer.tokenize(lambdas[it]).tokens);
        var ret = linter.lint(tree)
        assert.equal(ret, false);
      }
    });

    it('define to incorrect scope', function(){
      var tree = parser.parse(tokenizer.tokenize('( x :: (10) )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, false);
    });

    it('define invalid variable name', function(){
      var tree = parser.parse(tokenizer.tokenize('( if :: (z) )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, false);
    });

    it('define invalid token count', function(){
      var tree = parser.parse(tokenizer.tokenize('( y :: z 10 )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, false);
    });

  });

  describe("#lint() pattern matches syntax check", function () {
    it(('valid pattern syntax 1'),function(){
      var tree = parser.parse(tokenizer.tokenize('( x :: ( | ( x < y ) 2 | _ 3 ) )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
      assert.equal(tree.value[0].value[0].syntax, 'variable');
      assert.equal(tree.value[0].value[1].syntax, 'keyword');
      assert.equal(tree.value[0].value[2].syntax, 'pattern-match');
      assert.equal(tree.value[0].value[2].value[0].syntax, 'keyword');
      assert.equal(tree.value[0].value[2].value[1].syntax, 'binary-operation');
      assert.equal(tree.value[0].value[2].value[2].syntax, 'digit');
      assert.equal(tree.value[0].value[2].value[3].syntax, 'keyword');
      assert.equal(tree.value[0].value[2].value[4].syntax, 'keyword');
      assert.equal(tree.value[0].value[2].value[5].syntax, 'digit');
    });

    it(('valid pattern syntax 2'),function(){
      var tree = parser.parse(tokenizer.tokenize('( x :: ( y | 3 2 | _ 3 ) )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
      assert.equal(tree.value[0].value[0].syntax, 'variable');
      assert.equal(tree.value[0].value[1].syntax, 'keyword');
      assert.equal(tree.value[0].value[2].syntax, 'pattern-match');
      assert.equal(tree.value[0].value[2].value[0].syntax, 'variable');
      assert.equal(tree.value[0].value[2].value[1].syntax, 'keyword');
      assert.equal(tree.value[0].value[2].value[2].syntax, 'digit');
      assert.equal(tree.value[0].value[2].value[3].syntax, 'digit');
      assert.equal(tree.value[0].value[2].value[4].syntax, 'keyword');
      assert.equal(tree.value[0].value[2].value[5].syntax, 'keyword');
      assert.equal(tree.value[0].value[2].value[6].syntax, 'digit');
    });
  })

  describe("#lint() pattern matches", function(){
    it('valid patterns', function(){
      var patterns = [
        '(x :: ( | (x < y) 2 ))',
        '(x :: ( | 3 2 | (x == 2) 3 ))',
        '(x :: ( | _ 2 | (x == 2) 3 ))',
        '(x :: ( | (x + y) 2 | _ 3 ))',
        '(x :: ( | _ 3 ))',
        '(x :: ( y | 2 1 ))',
        '(x :: ( y | (x < y) 1 | 4 5 ))',
        '(x :: ( y | _ 1 | 4 5 ))',
        '(x :: ( y | _ 1 | _ 5 ))',
        '(x :: ( y | (x + y) 1 | _ 5 ))',
        '(x :: ( y | _ (10 - z) ))',
        '(x :: ( (x + z) | _ (10 - z) ))'
      ];

      for(it in patterns){
        var tree = parser.parse(tokenizer.tokenize(patterns[it]).tokens);
        var ret = linter.lint(tree);
        assert.equal(ret, true);
      }
    });

    it('invalid patterns', function(){
      var patterns = [
        '(x :: ( | 2 ))',
        '(x :: ( | ))',
        '(x :: ( | _ ))',
        '(x :: ( | _ 10 20))',
        '(x :: ( | _ | 10 20 ))',
        '(x :: ( | _ | | 10 20 ))',
        '(x :: ( | | | | 10 20 ))',
        '(x :: ( y | _ 10 20 ))',
        '(x :: ( y | _  ))',
        '(x :: ( y | _ | 10 20 ))',
        '(x :: ( y z | _ 10 | 10 20 ))',
        '(x :: ( _ | _ 10 | 10 20 ))',
      ];

      for(it in patterns){
        var tree = parser.parse(tokenizer.tokenize(patterns[it]).tokens);
        var ret = linter.lint(tree);
        assert.equal(ret, false);
      }
    });
  });

  describe("#lint() operation", function(){
    it('valid ops', function(){
      var ops = [
        '(1 + 2)', 
        '(! 1)',
        '(((((((((((! 2) || 3) == 4) <= 5 ) >= 6 ) < 7) > 8) / 9) * 10) + 20) - 30) '
      ];
      for(it in ops){
        var tree = parser.parse(tokenizer.tokenize(ops[it]).tokens);
        var ret = linter.lint(tree)
        assert.equal(ret, true);
      }
    });

    it('invalid ops tokens', function(){
      var ops = [
        '(+)', '( + + + )', '(3 +)', '( 3 + 4 4 )', 
        '( 3 + 4 + 4 )', '( + 4 + 4 )', '( + 4 4 )',
        '(4 !)', '(4 ! 4)'
      ];
      for(it in ops){
        var tree = parser.parse(tokenizer.tokenize(ops[it]).tokens);
        var ret = linter.lint(tree)
        assert.equal(ret, false);
      }
    });
  });

  describe('#lint() applications and programs', function(){
    it('valid application', function(){
      var apps = [
        '(plus :: (( num -> num )(y) -> (y + 20)) ) (plus 20)',
        '( display (( num -> num )(y) -> (y + 20)) 50))',
        '( plus 20 20 )',
        '( x :: [10 20 (y 20)] )',
        '(executeLambda ((num -> num) (y) -> (y + 20)) )'
      ];
      for(it in apps){
        var tree = parser.parse(tokenizer.tokenize(apps[it]).tokens);
        var ret = linter.lint(tree)
        assert.equal(ret, true);
      }
    });

    it('invalid programs and applications', function(){
      var apps = [
        '( plus ( 20 20 ) )',
        '( 20 20 )',
        '( x :: [20 30 (20 y)])',
        '()'
      ];
      for(it in apps){
        var tree = parser.parse(tokenizer.tokenize(apps[it]).tokens);
        var ret = linter.lint(tree)
        assert.equal(ret, false);
      }
    });
  });


  describe("#lint() valid program and form", function(){
    it('define to valid program and form', function(){

    });

  });
})
