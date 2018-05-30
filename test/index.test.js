"use strict";

const chai = require("chai");
chai.use(require("chai-as-promised"));
const expect = chai.expect;

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
        const properties = {
            "a": "SUBST_A",
            "b": "SUBST_B",
            ".*?[a-z]": "SUBST_UNSAFE",
        };
        return expect(index(pathA, properties))
            .to.eventually.equal("A SUBST_A B SUBST_B Unsafe SUBST_UNSAFE");
    });

    it("should replace line endings", function () {
        const properties = {};
        const options = {
            lineEndings: "__LF__",
        };
        return expect(index(pathB, properties, options))
            .to.eventually.satisfy((s) => (s.match(/__LF__/g) || []).length === 2);
    });

    it("should detect HTML files", function () {
        const properties = {
            "a": "<html>",
            "b": "&",
            ".*?[a-z]": "<",
        };
        const options = {
            // makes result easier to compare
            lineEndings: " ",
        };
        return expect(index(pathB, properties, options))
            .to.eventually.equal("L0: A &lt;html&gt; L1: B &amp; L2: Unsafe &lt;");
    });

    it("should not detect text as HTML", function () {
        const properties = {
            "a": "<html>",
            "b": "&",
            ".*?[a-z]": "<",
        };
        return expect(index(pathA, properties))
            .to.eventually.equal("A <html> B & Unsafe <");
    });

});
