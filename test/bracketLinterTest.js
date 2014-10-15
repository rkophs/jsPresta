var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var brackets = require('../src/bracketLinter');

describe('BracketLinter', function(){
  describe('#lint() valid parens', function(){
    it('()', function(){
      var ret = brackets.lint("()");
      expect(ret).to.equal(true);
    });
    it('(())', function(){
      var ret = brackets.lint("(())");
      expect(ret).to.equal(true);
    });
    it('(()())', function(){
      var ret = brackets.lint("(()())");
      expect(ret).to.equal(true);
    });
    it('()()', function(){
      var ret = brackets.lint("()()");
      expect(ret).to.equal(true);
    });
    it('', function(){
      var ret = brackets.lint("");
      expect(ret).to.equal(true);
    });
  });
  describe('#lint() invalid parens', function(){
    it('())(()', function(){
      var ret = brackets.lint("())(()");
      expect(ret).to.equal(false);
    });
    it(')(', function(){
      var ret = brackets.lint(")(");
      expect(ret).to.equal(false);
    });
    it('))(', function(){
      var ret = brackets.lint("))(");
      expect(ret).to.equal(false);
    });
    it('))(((', function(){
      var ret = brackets.lint("))(((");
      expect(ret).to.equal(false);
    });
    it('(((', function(){
      var ret = brackets.lint("(((");
      expect(ret).to.equal(false);
    });
    it(')))', function(){
      var ret = brackets.lint(")))");
      expect(ret).to.equal(false);
    });
    it('(()', function(){
      var ret = brackets.lint("(()");
      expect(ret).to.equal(false);
    });
    it('())', function(){
      var ret = brackets.lint("())");
      expect(ret).to.equal(false);
    });
    it('())(', function(){
      var ret = brackets.lint("())(");
      expect(ret).to.equal(false);
    });
    it(')()(', function(){
      var ret = brackets.lint(")()(");
      expect(ret).to.equal(false);
    });
  });
  describe('#lint() valid brackets', function(){
    it('[]', function(){
      var ret = brackets.lint("[]");
      expect(ret).to.equal(true);
    });
    it('[][]', function(){
      var ret = brackets.lint("[][]");
      expect(ret).to.equal(true);
    });
    it('[[]][[]]', function(){
      var ret = brackets.lint("[[]][[]]");
      expect(ret).to.equal(true);
    });
    it('[[]]', function(){
      var ret = brackets.lint("[[]]");
      expect(ret).to.equal(true);
    });
  });
  describe('#lint() invalid brackets', function(){
    it('[]', function(){
      var ret = brackets.lint("[]][[]");
      expect(ret).to.equal(false);
    });
    it('][', function(){
      var ret = brackets.lint("][");
      expect(ret).to.equal(false);
    });
    it(']][', function(){
      var ret = brackets.lint("]][");
      expect(ret).to.equal(false);
    });
    it('[[[', function(){
      var ret = brackets.lint("[[[");
      expect(ret).to.equal(false);
    });
    it(']]]', function(){
      var ret = brackets.lint("]]]");
      expect(ret).to.equal(false);
    });
    it('[[]', function(){
      var ret = brackets.lint("[[]");
      expect(ret).to.equal(false);
    });
    it('[]][', function(){
      var ret = brackets.lint("[]][");
      expect(ret).to.equal(false);
    });
    it('][][', function(){
      var ret = brackets.lint("][][");
      expect(ret).to.equal(false);
    });
  });
  describe('#lint() valid mixed', function(){
    it('[]()', function(){
      var ret = brackets.lint("[]()");
      expect(ret).to.equal(true);
    });
    it('()[]', function(){
      var ret = brackets.lint("()[]");
      expect(ret).to.equal(true);
    });
    it('([])', function(){
      var ret = brackets.lint("([])");
      expect(ret).to.equal(true);
    });
    it('[()]', function(){
      var ret = brackets.lint("[()]");
      expect(ret).to.equal(true);
    });
    it('(([]))', function(){
      var ret = brackets.lint("(([]))");
      expect(ret).to.equal(true);
    });
    it('([()])', function(){
      var ret = brackets.lint("([()])");
      expect(ret).to.equal(true);
    });
    it('[(())]', function(){
      var ret = brackets.lint("[(())]");
      expect(ret).to.equal(true);
    });
    it('[[()]]', function(){
      var ret = brackets.lint("[[()]]");
      expect(ret).to.equal(true);
    });
    it('[[()]]', function(){
      var ret = brackets.lint("[[()]]");
      expect(ret).to.equal(true);
    });
    it('[([])]', function(){
      var ret = brackets.lint("[([])]");
      expect(ret).to.equal(true);
    });
    it('([[]])', function(){
      var ret = brackets.lint("([[]])");
      expect(ret).to.equal(true);
    });
    it('([[]])([([](()[]))[[][[[([])]([()])]]]()])', function(){
      var ret = brackets.lint("([[]])([([](()[]))[[][[[([])]([()])]]]()])");
      expect(ret).to.equal(true);
    });
  });
  describe('#lint() invalid mixed', function(){
    it(']()', function(){
      var ret = brackets.lint("]()");
      expect(ret).to.equal(false);
    });
    it('([]', function(){
      var ret = brackets.lint("([]");
      expect(ret).to.equal(false);
    });
    it('[(])', function(){
      var ret = brackets.lint("[(])");
      expect(ret).to.equal(false);
    });
    it('([([)]])', function(){
      var ret = brackets.lint("([([)]])");
      expect(ret).to.equal(false);
    });
    it('(()[(((())])))', function(){
      var ret = brackets.lint("(()[(((())])))");
      expect(ret).to.equal(false);
    });
    it('[[([)]]]', function(){
      var ret = brackets.lint("[[([)]]]");
      expect(ret).to.equal(false);
    });
    it(']()[', function(){
      var ret = brackets.lint("]()[");
      expect(ret).to.equal(false);
    });
  });
})
