var Promise = require("bluebird");

var path = require("path");

var loader = require("../lib/loader");
var evaluator = require("../lib/evaluator");
var index = require("../index");



var pathA = path.join(__dirname, "resources/template-a.txt"),
    pathB = path.join(__dirname, "resources/template-b.html");



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

    it("should cache by default", function (done) {
        loader(pathA).then(function (s) {
            if (!loader._cache[pathA]) {
                return done(new Error("template not cached"));
            }
            done();
        });
    });

    it("should allow for disabling the cache", function (done) {
        loader(pathA, true).then(function (s) {
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

    var a, b;

    before(function (done) {
        Promise.join(loader(pathA), loader(pathB), function (ta, tb) {
            a = ta; b = tb;
            done();
        });
    });

    after(function () {
        delete loader._cache[pathA];
        delete loader._cache[pathB];
    });



    it("should substitute properties", function () {
        var evalA = evaluator(a, {
            "a": "SUBST_A",
            "b": "SUBST_B",
            ".*?[a-z]": "SUBST_UNSAFE"
        }, {
            html: false
        });
        if (evalA.trim() !== "A SUBST_A B SUBST_B Unsafe SUBST_UNSAFE") {
            throw new Error("substitution failed");
        }
    });

    it("should sanitize HTML", function () {
        var evalA = evaluator(a, {
            "a": "<html>",
            "b": "&",
            ".*?[a-z]": "<"
        }, {
            html: true
        });
        if (evalA.trim() !== "A &lt;html&gt; B &amp; Unsafe &lt;") {
            throw new Error("HTML not sanitized");
        }
    });

    it("should replace line endings", function () {
        var evalB = evaluator(b, {}, {
            html: false,
            lineEndings: "__LF__"
        });
        var lfCount = (evalB.match(/__LF__/g) || []).length;
        if (lfCount !== 3) {
            throw new Error(lfCount + " line endings substituted, expeted 3");
        }
        var nCount = (evalB.match(/\n/) || []).length;
        if (nCount > 0) {
            throw new Error("old line endings not removed");
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
            ".*?[a-z]": "SUBST_UNSAFE"
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
            lineEndings: "__LF__"
        }).then(function (evalB) {
            var lfCount = (evalB.match(/__LF__/g) || []).length;
            if (evalB.indexOf("__LF__") < 0) {
                return done(new Error("line endings not substituted"));
            }
            done();
        });

    });

    it("should detect HTML files", function (done) {
        index(pathB, {
            "a": "<html>",
            "b": "&",
            ".*?[a-z]": "<"
        }, {
            // makes result easier to compare
            lineEndings: " "
        }).then(function (evalB) {
            var expected = "L0: A &lt;html&gt; L1: B &amp; L2: Unsafe &lt;";
            if (!evalB || evalB.trim() !== expected) {
                return done(new Error("HTML not automatically sanitized"));
            }
            done();
        });
    });

});
