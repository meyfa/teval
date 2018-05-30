"use strict";

const chai = require("chai");
chai.use(require("chai-as-promised"));
const expect = chai.expect;

const path = require("path");

const loader = require("../lib/loader.js");

const pathA = path.join(__dirname, "resources/template-a.txt");
const pathNonexist = path.join(__dirname, "resources/template-nonexist.html");

describe("lib/loader.js", function () {

    describe("#load()", function () {

        afterEach(function () {
            delete loader._cache[pathA];
        });

        it("should read files", function () {
            return expect(loader.load(pathA)).to.eventually.be.a("string");
        });

        it("should fail for nonexisting files", function () {
            return expect(loader.load(pathNonexist)).to.eventually.be.rejected;
        });

        it("should cache by default", function () {
            return loader.load(pathA).then((/*s*/) => {
                return expect(loader._cache[pathA]).to.be.a("string");
            });
        });

        it("should allow for disabling the cache", function () {
            return loader.load(pathA, true).then((/*s*/) => {
                return expect(loader._cache[pathA]).to.be.undefined;
            });
        });

        it("should not retrieve from cache if disabled", function () {
            loader._cache[pathA] = "fake cache data";
            return expect(loader.load(pathA, true))
                .to.eventually.not.equal("fake cache data");
        });

    });

});
