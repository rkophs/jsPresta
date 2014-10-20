var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var tokenizer = require('../src/tokenizer');

describe('tokenizer', function(){
  describe('#tokenize() single valids', function(){
    it('Assert types', function(){
      var ret = tokenizer.tokenize("()");
      assert.typeOf(ret.errors, 'Array');
      assert.typeOf(ret.tokens, 'Array');
    });
    it('bracket', function(){
      var ret = tokenizer.tokenize("()");
      assert.equal(ret.tokens.length, 2);
      assert.equal(ret.errors.length, 0);
      expect(ret.tokens[0].value).to.equal('(');
      expect(ret.tokens[1].value).to.equal(')');
    });
    it('list op', function(){
      var ret = tokenizer.tokenize("[]");
      assert.equal(ret.tokens.length, 2);
      assert.equal(ret.errors.length, 0);
      expect(ret.tokens[0].value).to.equal('[');
      expect(ret.tokens[0].lex).to.equal('lister');
      expect(ret.tokens[1].value).to.equal(']');
      expect(ret.tokens[1].lex).to.equal('lister');
    });
    it('digit', function(){
      var ret = tokenizer.tokenize("345.345");
      assert.equal(ret.tokens.length, 1);
      assert.equal(ret.errors.length, 0);
      expect(ret.tokens[0].value).to.equal(345.345);
      expect(ret.tokens[0].lex).to.equal('digit');
    });
    it('keyword', function(){
      var words = ['if','lambda','list', '|', '_', 'num'];
      for (it in words){
        var ret = tokenizer.tokenize(words[it]);
        assert.equal(ret.tokens.length, 1);
        assert.equal(ret.errors.length, 0);
        expect(ret.tokens[0].value).to.equal(words[it]);
        expect(ret.tokens[0].lex).to.equal('keyword');
      }
    });
    it('binary operator', function(){
      var words = ['+','-','/','*','>','<','>=','<=','==','&&', '||'];
      for (it in words){
        var ret = tokenizer.tokenize(words[it]);
        assert.equal(ret.tokens.length, 1);
        assert.equal(ret.errors.length, 0);
        expect(ret.tokens[0].value).to.equal(words[it]);
        expect(ret.tokens[0].lex).to.equal('binary-operand');
      }
    });
    it('unary operator', function(){
      var words = ['!'];
      for (it in words){
        var ret = tokenizer.tokenize(words[it]);
        assert.equal(ret.tokens.length, 1);
        assert.equal(ret.errors.length, 0);
        expect(ret.tokens[0].value).to.equal(words[it]);
        expect(ret.tokens[0].lex).to.equal('unary-operand');
      }
    });
    it('syntactic sugar', function(){
      var words = ['::', '->'];
      for (it in words){
        var ret = tokenizer.tokenize(words[it]);
        assert.equal(ret.tokens.length, 1);
        assert.equal(ret.errors.length, 0);
        expect(ret.tokens[0].value).to.equal(words[it]);
        expect(ret.tokens[0].lex).to.equal('sugar');
      }
    });
    it('variable', function(){
      var words = ['test','test2','te2sdf','te223','t'];
      for (it in words){
        var ret = tokenizer.tokenize(words[it]);
        assert.equal(ret.tokens.length, 1);
        assert.equal(ret.errors.length, 0);
        expect(ret.tokens[0].value).to.equal(words[it]);
        expect(ret.tokens[0].lex).to.equal('variable');
      }
    });
  });

  describe("#tokenize() single invalids", function(){
    it('empty', function(){
      var ret = tokenizer.tokenize('');
      expect(ret.tokens).to.equal(null);
      expect(ret.errors.length).to.equal(1);
      expect(ret.errors[0]).to.equal("Cannot have empty string.");
    });
    it('invalid words', function(){
      var words = ['341ff', '23ff2', '23,12', ',', '!&', '23!', '23&', '&23', '&ad', 'sdf&', '=', '545=', 'adf11=asdf23', '-:::>', '-7>'];
      for (it in words){
        var ret = tokenizer.tokenize(words[it]);
        assert.equal(ret.errors.length, 1);
        expect(ret.tokens).to.equal(null);
        expect(ret.errors[0]).to.equal("Illegal character or word: " + words[it]);
      }
    });
  });

  describe("#tokenize() multiple", function(){
    it('valid', function(){
      var ret = tokenizer.tokenize('(+(== 3 4   \n\n)5 6)  \n ');
      assert.equal(ret.tokens.length, 10);
      assert.equal(ret.errors.length, 0);
    });
    it('valid type', function(){
      var ret = tokenizer.tokenize('(num->num->num)  \n ');
      assert.equal(ret.tokens.length, 7);
      assert.equal(ret.errors.length, 0);
    });
    it('invalid mix', function(){
      var ret = tokenizer.tokenize('(== 3f 4   \n\n)  \n ');
      assert.equal(ret.tokens, null);
      assert.equal(ret.errors.length, 1);
      expect(ret.errors[0]).to.equal("Illegal character or word: 3f");
    });
    it('multiple invalid mix', function(){
      var ret = tokenizer.tokenize('(== 3f 4   \n\n)6t  \n ');
      assert.equal(ret.tokens, null);
      assert.equal(ret.errors.length, 2);
      expect(ret.errors[0]).to.equal("Illegal character or word: 3f");
      expect(ret.errors[1]).to.equal("Illegal character or word: 6t");
    });
  });
})
