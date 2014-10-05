var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var tokenizer = require('../src/tokenizer');
var parser = require('../src/parser');
var linter = require('../src/syntaxLinter');

describe('syntaxLinter', function(){
  describe("#lint() list and datums", function(){
    it('empty list valid', function(){
      var tree = parser.parse(tokenizer.tokenize('( quote () )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
      assert.equal(tree.syntax, 'program');
      assert.equal(tree.value[0].syntax, 'expression');
      assert.equal(tree.value[0].value[0].syntax, 'keyword');
      assert.equal(tree.value[0].value[1].syntax, 'list');
    });

    it('full list valid', function(){
      var tree = parser.parse(tokenizer.tokenize('( quote (10 f ) )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
      assert.equal(tree.syntax, 'program');
      assert.equal(tree.value.length, 1);
      assert.equal(tree.value[0].syntax, 'expression');
      assert.equal(tree.value[0].value.length, 2);
      assert.equal(tree.value[0].value[0].syntax, 'keyword');
      assert.equal(tree.value[0].value[1].syntax, 'list');
      assert.equal(tree.value[0].value[1].value.length, 2);
      assert.equal(tree.value[0].value[1].value[0].value, 10 );
      assert.equal(tree.value[0].value[1].value[0].syntax, 'digit' );
      assert.equal(tree.value[0].value[1].value[1].value, 'f' );
      assert.equal(tree.value[0].value[1].value[1].syntax, 'variable' );
    });

    it('single list', function(){
      var tree = parser.parse(tokenizer.tokenize('( quote 10 )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
      assert.equal(tree.syntax, 'program');
      assert.equal(tree.value.length, 1);
      assert.equal(tree.value[0].syntax, 'expression');
      assert.equal(tree.value[0].value.length, 2);
      assert.equal(tree.value[0].value[0].syntax, 'keyword');
      assert.equal(tree.value[0].value[1].syntax, 'digit');
      assert.equal(tree.value[0].value[1].value, 10);
    });

    it('nested lists valid (lists, digits and vars)', function(){
      var tree = parser.parse(tokenizer.tokenize('( quote ( x 30 ( y 50 ) ))').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
    });

    it('quote no list', function(){
      var tree = parser.parse(tokenizer.tokenize('( quote )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, false);
    });

    it('full list invalid', function(){
      var tree = parser.parse(tokenizer.tokenize('( quote ( (define x 10) 20 30 ))').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, false);
    });

    it('nested list invalid', function(){
      var tree = parser.parse(tokenizer.tokenize('( quote ( 20 30 (quote (10 30))))').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, false);
    });

    it('list with op invalid', function(){
      var tree = parser.parse(tokenizer.tokenize('( quote ( + 20 30 ))').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, false);
    })

    it('list invalid token count', function(){
      var tree = parser.parse(tokenizer.tokenize('( quote ( + 20 30 ) 20 )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, false);
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
      var tree = parser.parse(tokenizer.tokenize('( define x (quote (y z) )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
    });

    it('define to valid lambdas', function(){
      var tree1 = parser.parse(tokenizer.tokenize('( define plus (lambda (y) (+ y 20)) )').tokens);
      var tree2 = parser.parse(tokenizer.tokenize('( define plus (lambda (y) (define z 10) (+ y z)) )').tokens);
      var tree3 = parser.parse(tokenizer.tokenize('( define plus (lambda (y) ((+ y z)) ))').tokens); //Syntax correct, sematic incorrect
      var tree4 = parser.parse(tokenizer.tokenize('( define plus (lambda (q z) ((+ q z)) ))').tokens); //Syntax correct, sematic incorrect
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
      var tree1 = parser.parse(tokenizer.tokenize('( define plus (lambda (y) ((define z 10) (+ y z)) ))').tokens);
      var tree2 = parser.parse(tokenizer.tokenize('( define plus (lambda (+ y z) ))').tokens);
      var tree3 = parser.parse(tokenizer.tokenize('( define plus (lambda (y) (define z 10) ))').tokens);
      var tree4 = parser.parse(tokenizer.tokenize('( define plus (lambda (y) ))').tokens);
      var tree5 = parser.parse(tokenizer.tokenize('( define plus (lambda (y) (+ y z) (- 20 10) ))').tokens);
      var tree6 = parser.parse(tokenizer.tokenize('( define plus (lambda (y) (define z 10) (+ y z) (- 20 10) ))').tokens);
      var tree7 = parser.parse(tokenizer.tokenize('( define plus (lambda (y) (+ y z) (define z 10) (- 20 10) ))').tokens);
      var tree8 = parser.parse(tokenizer.tokenize('( define plus (lambda () ((+ 10 20)) ))').tokens); //pure means no need for this fn

      var ret1 = linter.lint(tree1);
      var ret2 = linter.lint(tree2);
      var ret3 = linter.lint(tree3);
      var ret4 = linter.lint(tree4);
      var ret5 = linter.lint(tree5);
      var ret6 = linter.lint(tree6);
      var ret7 = linter.lint(tree7);
      var ret8 = linter.lint(tree7);
      
      assert.equal(ret1, false);
      assert.equal(ret2, false);
      assert.equal(ret3, false);
      assert.equal(ret4, false);
      assert.equal(ret5, false);
      assert.equal(ret6, false);
      assert.equal(ret7, false);
      assert.equal(ret8, false);
    });

    it('define to invalid lambda again', function(){
      var tree = parser.parse(tokenizer.tokenize('( define plus (lambda (y)))').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, false);
    });

    it('define to valid digit, semantically incorrect', function(){
      var tree = parser.parse(tokenizer.tokenize('( define x (10) )').tokens);
      var ret = linter.lint(tree);
      assert.equal(ret, true);
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
      var tree3 = parser.parse(tokenizer.tokenize('(+ (- 10 (* 20 (/ 4 (> 3 (< 4 (>= (<= (= (! 2) 3) 4) 5) 6) 7) 8) 9) 10) 20)').tokens);
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

  describe('#lint() application', function(){
    it('valid application', function(){
      var tree = parser.parse(tokenizer.tokenize('( define plus (lambda (y) (+ y 20)) ) (plus 20)').tokens);
      var ret = linter.lint(tree);

      assert.equal(ret, true);
    });
  });

  describe('#lint() form', function(){
    it('valid define and expression application', function(){
      var tree = parser.parse(tokenizer.tokenize('( define plus (lambda (y) (+ y 20)) ) (plus 20)').tokens);
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