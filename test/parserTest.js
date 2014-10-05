var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var tokenizer = require('../src/tokenizer');
var parser = require('../src/parser');

describe('parser', function(){
  describe("#parse()", function(){
    it('single', function(){
      var ret = parser.parse(tokenizer.tokenize('()').tokens);
      assert.equal(ret.value.length, 1);
      assert.equal(ret.value[0].value.length, 0);
    });
    it('nested', function(){
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
  });
})
