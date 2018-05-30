"use strict";

const Promise = require("bluebird");

const path = require("path");

const loader = require("../lib/loader.js");
const evaluator = require("../lib/evaluator.js");

const pathA = path.join(__dirname, "resources/template-a.txt");
const pathB = path.join(__dirname, "resources/template-b.html");
const pathC = path.join(__dirname, "resources/template-c.txt");

describe("lib/evaluator.js", function () {

    describe("#evaluate()", function () {

        let a, b, c;

        before(function () {
            return Promise.all([
                loader.load(pathA),
                loader.load(pathB),
                loader.load(pathC),
            ]).spread((ta, tb, tc) => {
                a = ta;
                b = tb;
                c = tc;
            });
        });

        after(function () {
            delete loader._cache[pathA];
            delete loader._cache[pathB];
            delete loader._cache[pathC];
        });

        it("should substitute properties", function () {
            const evalA = evaluator.evaluate(a, {
                "a": "SUBST_A",
                "b": "SUBST_B",
                ".*?[a-z]": "SUBST_UNSAFE",
            }, {
                html: false,
            });
            if (evalA.trim() !== "A SUBST_A B SUBST_B Unsafe SUBST_UNSAFE") {
                throw new Error("substitution failed");
            }
        });

        it("should not substitute if no mapping given", function () {
            const evalA = evaluator.evaluate(a, {}, {
                html: false,
            });
            if (evalA !== a) {
                throw new Error("input was modified");
            }
        });

        it("should sanitize HTML", function () {
            const evalA = evaluator.evaluate(a, {
                "a": "<html>",
                "b": "&",
                ".*?[a-z]": "<",
            }, {
                html: true,
            });
            if (evalA.trim() !== "A &lt;html&gt; B &amp; Unsafe &lt;") {
                throw new Error("HTML not sanitized");
            }
        });

        it("should replace line endings", function () {
            const evalB = evaluator.evaluate(b, {}, {
                html: false,
                lineEndings: "__LF__",
            });
            const lfCount = (evalB.match(/__LF__/g) || []).length;
            if (lfCount !== 3) {
                throw new Error(lfCount + " line endings substituted, expected 3");
            }
            const nCount = (evalB.match(/\n/) || []).length;
            if (nCount > 0) {
                throw new Error("old line endings not removed");
            }
        });

        it("should match different prefixes", function () {
            const evalC = evaluator.evaluate(c, {
                "e": "SUBST",
            }, {
                prefix: ".",
            });
            const expected = "{{ a }} { b } <c> \"d\" SUBST {{f. end";
            if (evalC.trim() !== expected) {
                throw new Error("incorrect substitution, expected '" + expected
                        + "' but got '" + evalC + "'");
            }
        });

        it("should match different suffixes", function () {
            const evalC = evaluator.evaluate(c, {
                "f": "SUBST",
            }, {
                suffix: ".",
            });
            const expected = "{{ a }} { b } <c> \"d\" .e}} SUBST end";
            if (evalC.trim() !== expected) {
                throw new Error("incorrect substitution, expected '" + expected
                        + "' but got '" + evalC + "'");
            }
        });

        it("should allow combining prefix and suffix", function () {
            const evalC = evaluator.evaluate(c, {
                "b": "SUBST",
            }, {
                prefix: "{",
                suffix: "}",
            });
            const expected = "{{ a }} SUBST <c> \"d\" .e}} {{f. end";
            if (evalC.trim() !== expected) {
                throw new Error("incorrect substitution, expected '" + expected
                        + "' but got '" + evalC + "'");
            }
        });

        it("should allow angle brackets even in HTML mode", function () {
            const evalC = evaluator.evaluate(c, {
                "c": "&SUBST",
            }, {
                html: true,
                prefix: "<",
                suffix: ">",
            });
            const expected = "{{ a }} { b } &amp;SUBST \"d\" .e}} {{f. end";
            if (evalC.trim() !== expected) {
                throw new Error("incorrect substitution, expected '" + expected
                        + "' but got '" + evalC + "'");
            }
        });

        it("should allow prefix and suffix to be equal", function () {
            const evalC = evaluator.evaluate(c, {
                "d": "SUBST",
            }, {
                prefix: "\"",
                suffix: "\"",
            });
            const expected = "{{ a }} { b } <c> SUBST .e}} {{f. end";
            if (evalC.trim() !== expected) {
                throw new Error("incorrect substitution, expected '" + expected
                        + "' but got '" + evalC + "'");
            }
        });

    });

});
