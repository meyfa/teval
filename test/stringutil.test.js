"use strict";

const chai = require("chai");
chai.use(require("chai-as-promised"));
const expect = chai.expect;

const stringutil = require("../lib/stringutil.js");

describe("lib/stringutil.js", function () {

    describe("#endsWith()", function () {

        it("should return true for matching suffixes", function () {
            expect(stringutil.endsWith("Hello World", "World")).to.be.true;
        });

        it("should return false for non-matching suffixes", function () {
            expect(stringutil.endsWith("Hello World", "Foo")).to.be.false;
        });

        it("should always match the empty string", function () {
            expect(stringutil.endsWith("Hello World", "")).to.be.true;
        });

        it("should return false for null suffixes", function () {
            expect(stringutil.endsWith("Hello World", null)).to.be.false;
        });

        it("should only match the end", function () {
            expect(stringutil.endsWith("Hello World", "Hello")).to.be.false;
        });

        it("should return false for inputs shorter than suffix", function () {
            expect(stringutil.endsWith("Hello", "Hello World")).to.be.false;
            expect(stringutil.endsWith("World", "Hello World")).to.be.false;
        });

        it("should fail for null inputs", function () {
            expect(() => stringutil.endsWith(null, "")).to.throw();
        });

    });

});
