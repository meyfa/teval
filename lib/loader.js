/*jshint node: true */
"use strict";

var Promise = require("bluebird");
var fs = require("fs");

var fsReadFile = Promise.promisify(fs.readFile);

/**
 * Maps file paths to their contents
 */
var cache = {};

/**
 * Reads the template file at the given path and returns its contents as a
 * Promise. The second parameter is optional; if it is set to true, the string
 * that was read will not be cached for another access in the future.
 */
module.exports = function load(path, disableCache) {

    var prom;

    if (!disableCache && cache[path]) {
        // load from cache
        prom = Promise.resolve(cache[path]);
    } else {
        // read file
        prom = fsReadFile(path, "utf8");
    }

    if (!disableCache) {
        // store in cache
        prom = prom.then(function (template) {
            cache[path] = template;
            return template;
        });
    }

    return prom;

};

// Store the cache object on the export so that we can use it in tests
module.exports._cache = cache;
