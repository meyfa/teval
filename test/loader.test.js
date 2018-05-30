"use strict";

const path = require("path");

const loader = require("../lib/loader.js");

const pathA = path.join(__dirname, "resources/template-a.txt");
const pathB = path.join(__dirname, "resources/template-b.html");
const pathNonexist = path.join(__dirname, "resources/template-nonexist.html");

describe("lib/loader.js", function () {

    describe("#load()", function () {

        afterEach(function () {
            delete loader._cache[pathA];
            delete loader._cache[pathB];
        });

        it("should read files", function () {
            return loader.load(pathA).then((s) => {
                if (!s || !s.length) {
                    throw new Error("file read failed");
                }
            });
        });

        it("should fail for nonexisting files", function () {
            return loader.load(pathNonexist).then((/*s*/) => {
                throw new Error("did not fail");
            }).catch(() => {
                // success
            });
        });

        it("should cache by default", function () {
            return loader.load(pathA).then((/*s*/) => {
                if (!loader._cache[pathA]) {
                    throw new Error("template not cached");
                }
            });
        });

        it("should allow for disabling the cache", function () {
            return loader.load(pathA, true).then((/*s*/) => {
                if (loader._cache[pathA]) {
                    throw new Error("template cached");
                }
            });
        });

        it("should not retrieve from cache if disabled", function () {
            loader._cache[pathA] = "fake cache data";
            return loader.load(pathA, true).then((s) => {
                if (s === "fake cache data") {
                    throw new Error("template not retrieved from cache");
                }
            });
        });

    });

});
