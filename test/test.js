"use strict";

var Promise = require("bluebird");

var path = require("path");

var stringutil = require("../lib/stringutil");
var loader = require("../lib/loader");
var evaluator = require("../lib/evaluator");
var index = require("../index");



var pathA = path.join(__dirname, "resources/template-a.txt"),
    pathB = path.join(__dirname, "resources/template-b.html"),
    pathC = path.join(__dirname, "resources/template-c.txt"),
    pathNonexist = path.join(__dirname, "resources/template-nonexist.html");



describe("stringutil", function () {

    describe(".endsWith", function () {

        it("should return true for matching suffixes", function () {
            if (stringutil.endsWith("Hello World", "World") !== true) {
                throw new Error("suffix not matched");
            }
        });

        it("should return false for non-matching suffixes", function () {
            if (stringutil.endsWith("Hello World", "Foo") !== false) {
                throw new Error("suffix matched");
            }
        });

        it("should always match the empty string", function () {
            if (stringutil.endsWith("Hello World", "") !== true) {
                throw new Error("empty string not matched");
            }
        });

        it("should return false for null suffixes", function () {
            if (stringutil.endsWith("Hello World", null) !== false) {
                throw new Error("wrong return value");
            }
        });

        it("should only match the end", function () {
            if (stringutil.endsWith("Hello World", "Hello") !== false) {
                throw new Error("matched the beginning");
            }
        });

        it("should return false for inputs shorter than suffix", function () {
            if (stringutil.endsWith("Hello", "Hello World") !== false) {
                throw new Error("matched the beginning");
            }
            if (stringutil.endsWith("World", "Hello World") !== false) {
                throw new Error("matched the end");
            }
        });

        it("should fail for null inputs", function () {
            try {
                stringutil.endsWith(null, "");
            } catch (e) {
                return;
            }
            throw new Error("no exception thrown");
        });

    });

});



describe("loader", function () {

    afterEach(function () {
        delete loader._cache[pathA];
        delete loader._cache[pathB];
    });



    it("should read files", function (done) {
        loader(pathA).then(function (s) {
            if (!s || !s.length) {
                return done(new Error("file read failed"));
            }
            done();
        });
    });

    it("should fail for nonexisting files", function (done) {
        loader(pathNonexist).then(function (/*s*/) {
            done(new Error("did not fail"));
        }).catch(function () {
            done();
        });
    });

    it("should cache by default", function (done) {
        loader(pathA).then(function (/*s*/) {
            if (!loader._cache[pathA]) {
                return done(new Error("template not cached"));
            }
            done();
        });
    });

    it("should allow for disabling the cache", function (done) {
        loader(pathA, true).then(function (/*s*/) {
            if (loader._cache[pathA]) {
                return done(new Error("template cached"));
            }
            done();
        });
    });

    it("should not retrieve from cache if disabled", function (done) {
        loader._cache[pathA] = "fake cache data";
        loader(pathA, true).then(function (s) {
            if (s === "fake cache data") {
                return done(new Error("template not retrieved from cache"));
            }
            done();
        });
    });

});



describe("evaluator", function () {

    var a, b, c;

    before(function (done) {
        Promise.join(loader(pathA), loader(pathB), loader(pathC),
            function (ta, tb, tc) {
                a = ta; b = tb; c = tc;
                done();
            }
        );
    });

    after(function () {
        delete loader._cache[pathA];
        delete loader._cache[pathB];
        delete loader._cache[pathC];
    });



    it("should substitute properties", function () {
        var evalA = evaluator(a, {
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
        var evalA = evaluator(a, {}, {
            html: false,
        });
        if (evalA !== a) {
            throw new Error("input was modified");
        }
    });

    it("should sanitize HTML", function () {
        var evalA = evaluator(a, {
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
        var evalB = evaluator(b, {}, {
            html: false,
            lineEndings: "__LF__",
        });
        var lfCount = (evalB.match(/__LF__/g) || []).length;
        if (lfCount !== 3) {
            throw new Error(lfCount + " line endings substituted, expected 3");
        }
        var nCount = (evalB.match(/\n/) || []).length;
        if (nCount > 0) {
            throw new Error("old line endings not removed");
        }
    });

    it("should match different prefixes", function () {
        var evalC = evaluator(c, {
            "e": "SUBST",
        }, {
            prefix: ".",
        });
        var expected = "{{ a }} { b } <c> \"d\" SUBST {{f. end";
        if (evalC.trim() !== expected) {
            throw new Error("incorrect substitution, expected '" + expected
                    + "' but got '" + evalC + "'");
        }
    });

    it("should match different suffixes", function () {
        var evalC = evaluator(c, {
            "f": "SUBST",
        }, {
            suffix: ".",
        });
        var expected = "{{ a }} { b } <c> \"d\" .e}} SUBST end";
        if (evalC.trim() !== expected) {
            throw new Error("incorrect substitution, expected '" + expected
                    + "' but got '" + evalC + "'");
        }
    });

    it("should allow combining prefix and suffix", function () {
        var evalC = evaluator(c, {
            "b": "SUBST",
        }, {
            prefix: "{",
            suffix: "}",
        });
        var expected = "{{ a }} SUBST <c> \"d\" .e}} {{f. end";
        if (evalC.trim() !== expected) {
            throw new Error("incorrect substitution, expected '" + expected
                    + "' but got '" + evalC + "'");
        }
    });

    it("should allow angle brackets even in HTML mode", function () {
        var evalC = evaluator(c, {
            "c": "&SUBST",
        }, {
            html: true,
            prefix: "<",
            suffix: ">",
        });
        var expected = "{{ a }} { b } &amp;SUBST \"d\" .e}} {{f. end";
        if (evalC.trim() !== expected) {
            throw new Error("incorrect substitution, expected '" + expected
                    + "' but got '" + evalC + "'");
        }
    });

    it("should allow prefix and suffix to be equal", function () {
        var evalC = evaluator(c, {
            "d": "SUBST",
        }, {
            prefix: "\"",
            suffix: "\"",
        });
        var expected = "{{ a }} { b } <c> SUBST .e}} {{f. end";
        if (evalC.trim() !== expected) {
            throw new Error("incorrect substitution, expected '" + expected
                    + "' but got '" + evalC + "'");
        }
    });

});



describe("index", function () {

    afterEach(function () {
        delete loader._cache[pathA];
        delete loader._cache[pathB];
    });

    it("should load and evaluate", function (done) {
        index(pathA, {
            "a": "SUBST_A",
            "b": "SUBST_B",
            ".*?[a-z]": "SUBST_UNSAFE",
        }).then(function (evalA) {
            var expected = "A SUBST_A B SUBST_B Unsafe SUBST_UNSAFE";
            if (!evalA || evalA.trim() !== expected) {
                return done(new Error("template not evaluated correctly"));
            }
            done();
        });
    });

    it("should replace line endings", function (done) {
        index(pathB, {}, {
            lineEndings: "__LF__",
        }).then(function (evalB) {
            var lfCount = (evalB.match(/__LF__/g) || []).length;
            if (lfCount !== 3) {
                return done(new Error("expected 3 substitutions, got " + lfCount));
            }
            done();
        });

    });

    it("should detect HTML files", function (done) {
        index(pathB, {
            "a": "<html>",
            "b": "&",
            ".*?[a-z]": "<",
        }, {
            // makes result easier to compare
            lineEndings: " ",
        }).then(function (evalB) {
            var expected = "L0: A &lt;html&gt; L1: B &amp; L2: Unsafe &lt;";
            if (!evalB || evalB.trim() !== expected) {
                return done(new Error("HTML not automatically sanitized"));
            }
            done();
        });
    });

    it("should not detect text as HTML", function (done) {
        index(pathA, {
            "a": "<html>",
            "b": "&",
            ".*?[a-z]": "<",
        }).then(function (evalA) {
            var expected = "A <html> B & Unsafe <";
            if (!evalA || evalA.trim() !== expected) {
                return done(new Error("unexpected evaluation result"));
            }
            done();
        });
    });

});
