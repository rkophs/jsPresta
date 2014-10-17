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
    });

    it('full list valid', function(){
      var tree = parser.parse(tokenizer.tokenize('( f [ 10 10 ] )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
    });

    it('single list valid', function(){
      var tree = parser.parse(tokenizer.tokenize('( f [10] )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
    });

    it('lamda inside list is valid', function(){
      var tree = parser.parse(tokenizer.tokenize('(f [ 10 f ( lambda (y)( num num )( + 10 y )) ] )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);

    });

    it('nested lists valid ', function(){
      var tree = parser.parse(tokenizer.tokenize('( f [ x 30 [ y 50 ] ] )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
    });

    it('nested lists valid with valid application (lists, digits and vars)', function(){
      var tree = parser.parse(tokenizer.tokenize('( f [ x 30 ( b 50 ) ])').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
    });

    it('full list invalid', function(){
      var tree = parser.parse(tokenizer.tokenize('( f [ (define x 10) 20 30 ] )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, false);
    });

    it('nested list valid', function(){
      var tree = parser.parse(tokenizer.tokenize('( f [ 20 30 [ 10 30 ]] )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
    });

    it('list with op valid', function(){
      var tree = parser.parse(tokenizer.tokenize('( f [ ( + 20 30 ) ])').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
    })

    it('list invalid token count', function(){
      var tree = parser.parse(tokenizer.tokenize('(f [ ( + 20 30 ) 20  ])').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
    })

  });

  describe("#lint() variable definitions and expressions/lambdas", function(){
    it('define to valid variable', function(){
      var tree = parser.parse(tokenizer.tokenize('( define x y )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
    });

    it('define to valid digit', function(){
      var tree = parser.parse(tokenizer.tokenize('( define x 10 )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
    });

    it('define to valid list', function(){
      var tree = parser.parse(tokenizer.tokenize('( define x [y z] )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
    });

    it('define to valid lambdas', function(){
      var tree1 = parser.parse(tokenizer.tokenize('( define plus (lambda (y) (num num) (+ y 20)) )').tokens);
      var tree2 = parser.parse(tokenizer.tokenize('( define plus (lambda (y) (num num) (define z 10) (+ y z)) )').tokens);
      var tree3 = parser.parse(tokenizer.tokenize('( define plus (lambda (y) (num num) (+ y z) ))').tokens);
      var tree4 = parser.parse(tokenizer.tokenize('( define plus (lambda (q z) (num num num) (+ q z)))').tokens); //Syntax correct, sematic incorrect
      var ret1 = linter.lint(tree1);
      var ret2 = linter.lint(tree2);
      var ret3 = linter.lint(tree3);
      var ret4 = linter.lint(tree4);

      assert.equal(ret1, true);
      assert.equal(ret2, true);
      assert.equal(ret3, true);
      assert.equal(ret4, true);
    });

    it('define to invalid lambdas', function(){
      var tree1 = parser.parse(tokenizer.tokenize('( define plus (lambda (num num)(y z)(+ y z)) )').tokens);
      var tree2 = parser.parse(tokenizer.tokenize('( define plus (lambda (y)(num num)((define z 10) (+ y z)) ))').tokens);
      var tree3 = parser.parse(tokenizer.tokenize('( define plus (lambda (y) ((define z 10) (+ y z)) ))').tokens);
      var tree4 = parser.parse(tokenizer.tokenize('( define plus (lambda (+ y z) ))').tokens);
      var tree5 = parser.parse(tokenizer.tokenize('( define plus (lambda (num num)(+ y z) ))').tokens);
      var tree6 = parser.parse(tokenizer.tokenize('( define plus (lambda (y) (num num) (define z 10) ))').tokens);
      var tree7 = parser.parse(tokenizer.tokenize('( define plus (lambda (y) ))').tokens);
      var tree8 = parser.parse(tokenizer.tokenize('( define plus (lambda (y) (num num)))').tokens);
      var tree9 = parser.parse(tokenizer.tokenize('( define plus (lambda (num num) (y)))').tokens);
      var tree10 = parser.parse(tokenizer.tokenize('( define plus (lambda (y) (+ y z) (- 20 10) ))').tokens);
      var tree11 = parser.parse(tokenizer.tokenize('( define plus (lambda (y) (define z 10) (num num) (+ y z) (- 20 10) ))').tokens);
      var tree12 = parser.parse(tokenizer.tokenize('( define plus (lambda (y) (+ y z) (define z 10) (- 20 10) ))').tokens);
      var tree13 = parser.parse(tokenizer.tokenize('( define plus (lambda (y) (define z 10)(+ y z) (- 20 10) ))').tokens);
      var tree14 = parser.parse(tokenizer.tokenize('( define plus (lambda (y) (+ y z) (num num) (define z 10) (- 20 10) ))').tokens);
      var tree15 = parser.parse(tokenizer.tokenize('( define plus (lambda () ((+ 10 20)) ))').tokens); //pure means no need for this fn
      var tree16 = parser.parse(tokenizer.tokenize('( define plus (lambda () (num) (+ 10 20) ))').tokens); //pure means no need for this fn
      var tree17 = parser.parse(tokenizer.tokenize('( define plus (lambda (y)  ((+ y z)) ))').tokens);
      var tree18 = parser.parse(tokenizer.tokenize('( define plus (lambda (y) (num num) ((+ y z)) ))').tokens);
      var tree19 = parser.parse(tokenizer.tokenize('( define plus (lambda (num num)(num num)(+ y z)) )').tokens);

      var ret1 = linter.lint(tree1);
      var ret2 = linter.lint(tree2);
      var ret3 = linter.lint(tree3);
      var ret4 = linter.lint(tree4);
      var ret5 = linter.lint(tree5);
      var ret6 = linter.lint(tree6);
      var ret7 = linter.lint(tree7);
      var ret8 = linter.lint(tree8);
      var ret9 = linter.lint(tree9);
      var ret10 = linter.lint(tree10);
      var ret11 = linter.lint(tree11);
      var ret12 = linter.lint(tree12);
      var ret13 = linter.lint(tree13);
      var ret14 = linter.lint(tree14);
      var ret15 = linter.lint(tree15);
      var ret16 = linter.lint(tree16);
      var ret17 = linter.lint(tree17);
      var ret18 = linter.lint(tree18);
      var ret19 = linter.lint(tree19);

      assert.equal(ret1, false);
      assert.equal(ret2, false);
      assert.equal(ret3, false);
      assert.equal(ret4, false);
      assert.equal(ret5, false);
      assert.equal(ret6, false);
      assert.equal(ret7, false);
      assert.equal(ret8, false);
      assert.equal(ret9, false);
      assert.equal(ret10, false);
      assert.equal(ret11, false);
      assert.equal(ret12, false);
      assert.equal(ret13, false);
      assert.equal(ret14, false);
      assert.equal(ret15, false);
      assert.equal(ret16, false);
      assert.equal(ret17, false);
      assert.equal(ret18, false);
      assert.equal(ret19, false);
    });

    it('define to invalid lambda again', function(){
      var tree = parser.parse(tokenizer.tokenize('( define plus (lambda (y)))').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, false);
    });

    it('define to incorrect scope', function(){
      var tree = parser.parse(tokenizer.tokenize('( define x (10) )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, false);
    });

    it('define invalid variable name', function(){
      var tree = parser.parse(tokenizer.tokenize('( define if (z) )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, false);
    });

    it('define invalid token count', function(){
      var tree = parser.parse(tokenizer.tokenize('( define y z 10 )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, false);
    });

  });

  describe("#lint() if", function(){
    it('valid if digit', function(){
      var tree = parser.parse(tokenizer.tokenize('(if 1 2 3)').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
      assert.equal(tree.value[0].value[0].syntax, 'keyword')
    });
    it('valid if var', function(){
      var tree = parser.parse(tokenizer.tokenize('(if y 2 3)').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
    });
    it('valid if var twice', function(){
      var tree = parser.parse(tokenizer.tokenize('(if y z 3)').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
    });
    it('valid if application', function(){
      var tree = parser.parse(tokenizer.tokenize('(if (y 20 30) 2 3)').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
    });
    it('valid if application twice', function(){
      var tree = parser.parse(tokenizer.tokenize('(if (y 20 30) (z 10 10) 3)').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
    });
    it('invalid if wrong token count too little', function(){
      var tree = parser.parse(tokenizer.tokenize('(if (z 10 10) 3)').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, false);
    });
    it('invalid if wrong token count too much', function(){
      var tree = parser.parse(tokenizer.tokenize('(if (z 10 10) 3 4 (f 4 5))').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, false);
    });
  });

  describe("#lint() operation", function(){
    it('valid ops', function(){
      var tree1 = parser.parse(tokenizer.tokenize('(+ 1 2 3)').tokens);
      var tree2 = parser.parse(tokenizer.tokenize('(+ 1 )').tokens);
      var tree3 = parser.parse(tokenizer.tokenize('(+ (- 10 (* 20 (/ 4 (> 3 (< 4 (>= (<= (== (|| 2 (! 2)) 3) 4) 5) 6) 7) 8) 9) 10) 20)').tokens);
      var ret1 = linter.lint(tree1);
      var ret2 = linter.lint(tree2);
      var ret3 = linter.lint(tree3);

      assert.equal(ret1, true);
      assert.equal(ret2, true);
      assert.equal(ret3, true);
      assert.equal(tree1.value[0].value[0].syntax, 'operator');
    });

    it('invalid ops tokens', function(){
      var tree = parser.parse(tokenizer.tokenize('(+)').tokens);
      ret = linter.lint(tree);
      assert.equal(ret, false);
    });
  });

  describe('#lint() applications and programs', function(){
    it('valid application', function(){
      var tree1 = parser.parse(tokenizer.tokenize('( define plus (lambda (y) (num num) (+ y 20)) ) (plus 20)').tokens);
      var tree2 = parser.parse(tokenizer.tokenize('(display ((lambda (y) (num num) (+ y 20)) 50))').tokens);
      var ret1 = linter.lint(tree1);
      var ret2 = linter.lint(tree2);

      assert.equal(ret1, true);
      assert.equal(ret2, true);
    });

    it('invalid programs and applications', function(){
      var tree1 = parser.parse(tokenizer.tokenize('( plus (20 20 ) )').tokens);
      var tree2 = parser.parse(tokenizer.tokenize('( 20 20 )').tokens);
      var tree2 = parser.parse(tokenizer.tokenize('( [20 30 (20 y)] )').tokens);
      var ret1 = linter.lint(tree1);
      var ret2 = linter.lint(tree2);

      assert.equal(ret1, false);
      assert.equal(ret2, false);
    });
  });

  describe('#lint() form', function(){
    it('valid define and expression application', function(){
      var tree = parser.parse(tokenizer.tokenize('( define plus (lambda (y) (num num) (+ y 20)) ) (plus 20)').tokens);
      var ret = linter.lint(tree);
      
      assert.equal(ret, true);
    });

    it('invalid application', function(){
      var tree = parser.parse(tokenizer.tokenize('()').tokens);
      var ret = linter.lint(tree);
      
      assert.equal(ret, false);
    });
  });

})
