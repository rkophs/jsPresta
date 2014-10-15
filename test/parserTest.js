var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var tokenizer = require('../src/tokenizer');
var parser = require('../src/parser');

describe('parser', function(){
  describe("#parse()", function(){
    it('single paren', function(){
      var ret = parser.parse(tokenizer.tokenize('()()').tokens);
      assert.equal(ret.value.length, 2);
      assert.equal(ret.value[0].value.length, 0);
      assert.equal(ret.value[1].value.length, 0);
    });
    it('nested paren', function(){
      var ret = parser.parse(tokenizer.tokenize('(())').tokens);
      assert.equal(ret.value.length, 1);
      assert.equal(ret.value[0].value.length, 1);
      assert.equal(ret.value[0].value[0].value.length, 0);
    });
    it('nested with tokens', function(){
      var ret = parser.parse(tokenizer.tokenize('(+(- 4 5) 6)').tokens);
      assert.equal(ret.value.length, 1);
      assert.equal(ret.value[0].value.length, 3);

      assert.equal(ret.value[0].value[0].value, '+');
      assert.equal(ret.value[0].value[1].value.length, 3);
      assert.equal(ret.value[0].value[1].value[0].value, '-');
      assert.equal(ret.value[0].value[1].value[1].value, 4);
      assert.equal(ret.value[0].value[1].value[2].value, 5);
      assert.equal(ret.value[0].value[2].value, 6);
    });

    it('single bracket', function(){
      var ret = parser.parse(tokenizer.tokenize('[]').tokens);
      assert.equal(ret.value[0].lex, 'lister');
      assert.equal(ret.value[0].elements.length, 0);
    });
    it('single bracket paren', function(){
      var ret = parser.parse(tokenizer.tokenize('( [] 10 )').tokens);
      assert.equal(ret.value.length, 1);
      assert.equal(ret.value[0].value.length, 2);
      assert.equal(ret.value[0].value[0].elements.length, 0);
      assert.equal(ret.value[0].value[0].lex, 'lister');
      assert.equal(ret.value[0].value[1].value, 10);
      assert.equal(ret.value[0].value[1].lex, 'digit');

    });

    it('nested bracket', function(){
      var ret = parser.parse(tokenizer.tokenize('[[]]').tokens);
      assert.equal(ret.value[0].lex, 'lister');
      assert.equal(ret.value[0].elements.length, 1);
      assert.equal(ret.value[0].elements[0].lex, 'lister');
      assert.equal(ret.value[0].elements[0].elements.length, 0);
    });

    it('nested with tokens again', function(){
      var ret = parser.parse(tokenizer.tokenize('(+(- 4 5 [9 (+ 2 3)]) 6)').tokens);
      assert.equal(ret.value.length, 1);
      assert.equal(ret.value[0].value.length, 3);

      assert.equal(ret.value[0].value[0].value, '+');
      assert.equal(ret.value[0].value[1].value.length, 4);
      assert.equal(ret.value[0].value[1].value[0].value, '-');
      assert.equal(ret.value[0].value[1].value[1].value, 4);
      assert.equal(ret.value[0].value[1].value[2].value, 5);
      assert.equal(ret.value[0].value[1].value[3].lex, 'lister');
      assert.equal(ret.value[0].value[1].value[3].elements.length, 2);
      assert.equal(ret.value[0].value[1].value[3].elements[0].value, 9);
      assert.equal(ret.value[0].value[1].value[3].elements[1].value.length, 3);
      assert.equal(ret.value[0].value[1].value[3].elements[1].value[0].value, '+');
      assert.equal(ret.value[0].value[1].value[3].elements[1].value[1].value, '2');
      assert.equal(ret.value[0].value[1].value[3].elements[1].value[2].value, '3');
    });
  });
})
