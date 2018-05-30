"use strict";

const path = require("path");

const loader = require("../lib/loader.js");
const index = require("../index.js");

const pathA = path.join(__dirname, "resources/template-a.txt");
const pathB = path.join(__dirname, "resources/template-b.html");

describe("index.js", function () {

    afterEach(function () {
        delete loader._cache[pathA];
        delete loader._cache[pathB];
    });

    it("should load and evaluate", function () {
        return index(pathA, {
            "a": "SUBST_A",
            "b": "SUBST_B",
            ".*?[a-z]": "SUBST_UNSAFE",
        }).then((evalA) => {
            const expected = "A SUBST_A B SUBST_B Unsafe SUBST_UNSAFE";
            if (!evalA || evalA.trim() !== expected) {
                throw new Error("template not evaluated correctly");
            }
        });
    });

    it("should replace line endings", function () {
        return index(pathB, {}, {
            lineEndings: "__LF__",
        }).then((evalB) => {
            const lfCount = (evalB.match(/__LF__/g) || []).length;
            if (lfCount !== 3) {
                throw new Error("expected 3 substitutions, got " + lfCount);
            }
        });
    });

    it("should detect HTML files", function () {
        return index(pathB, {
            "a": "<html>",
            "b": "&",
            ".*?[a-z]": "<",
        }, {
            // makes result easier to compare
            lineEndings: " ",
        }).then((evalB) => {
            const expected = "L0: A &lt;html&gt; L1: B &amp; L2: Unsafe &lt;";
            if (!evalB || evalB.trim() !== expected) {
                throw new Error("HTML not automatically sanitized");
            }
        });
    });

    it("should not detect text as HTML", function () {
        return index(pathA, {
            "a": "<html>",
            "b": "&",
            ".*?[a-z]": "<",
        }).then((evalA) => {
            const expected = "A <html> B & Unsafe <";
            if (!evalA || evalA.trim() !== expected) {
                throw new Error("unexpected evaluation result");
            }
        });
    });

});
