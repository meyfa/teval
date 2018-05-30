"use strict";

const stringutil = require("../lib/stringutil.js");

describe("lib/stringutil.js", function () {

    describe("#endsWith()", function () {

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
