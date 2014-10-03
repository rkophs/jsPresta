var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var brackets = require('../src/bracketLinter');

describe('BracketLinter', function(){
  describe('#lint() valids', function(){
    it('()', function(){
      var ret = brackets.lint("()");
      expect(ret.value).to.equal(true);
      expect(ret.error).to.equal(null);
    });
    it('(())', function(){
      var ret = brackets.lint("(())");
      expect(ret.value).to.equal(true);
      expect(ret.error).to.equal(null);
    });
    it('(()())', function(){
      var ret = brackets.lint("(()())");
      expect(ret.value).to.equal(true);
      expect(ret.error).to.equal(null);
    });
    it('()()', function(){
      var ret = brackets.lint("()()");
      expect(ret.value).to.equal(true);
      expect(ret.error).to.equal(null);
    });
    it('', function(){
      var ret = brackets.lint("");
      expect(ret.value).to.equal(true);
      expect(ret.error).to.equal(null);
    });
  });
  describe('#lint() invalids', function(){
    it('())(()', function(){
      var ret = brackets.lint("())(()");
      expect(ret.value).to.equal(false);
      expect(ret.error).to.equal("Malformed parenthesis");
    });
    it(')(', function(){
      var ret = brackets.lint(")(");
      expect(ret.value).to.equal(false);
      expect(ret.error).to.equal("Malformed parenthesis");
    });
    it('))(', function(){
      var ret = brackets.lint("))(");
      expect(ret.value).to.equal(false);
      expect(ret.error).to.equal("Malformed parenthesis");
    });
    it('))(((', function(){
      var ret = brackets.lint("))(((");
      expect(ret.value).to.equal(false);
      expect(ret.error).to.equal("Malformed parenthesis");
    });
    it('(((', function(){
      var ret = brackets.lint("(((");
      expect(ret.value).to.equal(false);
      expect(ret.error).to.equal("Malformed parenthesis");
    });
    it(')))', function(){
      var ret = brackets.lint(")))");
      expect(ret.value).to.equal(false);
      expect(ret.error).to.equal("Malformed parenthesis");
    });
    it('(()', function(){
      var ret = brackets.lint("(()");
      expect(ret.value).to.equal(false);
      expect(ret.error).to.equal("Malformed parenthesis");
    });
    it('())', function(){
      var ret = brackets.lint("())");
      expect(ret.value).to.equal(false);
      expect(ret.error).to.equal("Malformed parenthesis");
    });
    it('())(', function(){
      var ret = brackets.lint("())(");
      expect(ret.value).to.equal(false);
      expect(ret.error).to.equal("Malformed parenthesis");
    });
    it(')()(', function(){
      var ret = brackets.lint(")()(");
      expect(ret.value).to.equal(false);
      expect(ret.error).to.equal("Malformed parenthesis");
    });
  })
})
