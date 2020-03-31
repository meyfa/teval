'use strict'

const chai = require('chai')
chai.use(require('chai-as-promised'))
const expect = chai.expect

const evaluator = require('../lib/evaluator.js')

describe('lib/evaluator.js', function () {
  describe('#evaluate()', function () {
    const template1 = 'A {{a}} B {{ b }} Unsafe {{ .*?[a-z] }}'
    const template2 = 'L0: A {{a}}\nL1: B {{ b }}\nL2: Unsafe {{ .*?[a-z] }}\n'
    const template3 = '{{ a }} { b } <c> "d" .e}} {{f. end'

    it('should substitute properties', function () {
      const properties = {
        a: 'SUBST_A',
        b: 'SUBST_B',
        '.*?[a-z]': 'SUBST_UNSAFE'
      }
      const options = {
        html: false
      }
      expect(evaluator.evaluate(template1, properties, options))
        .to.equal('A SUBST_A B SUBST_B Unsafe SUBST_UNSAFE')
    })

    it('should not substitute if no mapping given', function () {
      const properties = {}
      const options = {
        html: false
      }
      expect(evaluator.evaluate(template1, properties, options))
        .to.equal(template1)
    })

    it('should sanitize HTML', function () {
      const properties = {
        a: '<html>',
        b: '&',
        '.*?[a-z]': '<'
      }
      const options = {
        html: true
      }
      expect(evaluator.evaluate(template1, properties, options))
        .to.equal('A &lt;html&gt; B &amp; Unsafe &lt;')
    })

    it('should replace line endings', function () {
      const properties = {}
      const options = {
        html: false,
        lineEndings: '__LF__'
      }
      const result = evaluator.evaluate(template2, properties, options)
      expect((result.match(/__LF__/g) || []).length).to.equal(3)
      expect((result.match(/\n/g) || []).length).to.equal(0)
    })

    it('should match different prefixes', function () {
      const properties = {
        e: 'SUBST'
      }
      const options = {
        prefix: '.'
      }
      expect(evaluator.evaluate(template3, properties, options))
        .to.equal('{{ a }} { b } <c> "d" SUBST {{f. end')
    })

    it('should match different suffixes', function () {
      const properties = {
        f: 'SUBST'
      }
      const options = {
        suffix: '.'
      }
      expect(evaluator.evaluate(template3, properties, options))
        .to.equal('{{ a }} { b } <c> "d" .e}} SUBST end')
    })

    it('should allow combining prefix and suffix', function () {
      const properties = {
        b: 'SUBST'
      }
      const options = {
        prefix: '{',
        suffix: '}'
      }
      expect(evaluator.evaluate(template3, properties, options))
        .to.equal('{{ a }} SUBST <c> "d" .e}} {{f. end')
    })

    it('should allow angle brackets even in HTML mode', function () {
      const properties = {
        c: '&SUBST'
      }
      const options = {
        html: true,
        prefix: '<',
        suffix: '>'
      }
      expect(evaluator.evaluate(template3, properties, options))
        .to.equal('{{ a }} { b } &amp;SUBST "d" .e}} {{f. end')
    })

    it('should allow prefix and suffix to be equal', function () {
      const properties = {
        d: 'SUBST'
      }
      const options = {
        prefix: '"',
        suffix: '"'
      }
      expect(evaluator.evaluate(template3, properties, options))
        .to.equal('{{ a }} { b } <c> SUBST .e}} {{f. end')
    })
  })
})
