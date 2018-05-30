/*jshint node: true */
"use strict";

const Promise = require("bluebird");
const fs = require("fs");

const fsReadFile = Promise.promisify(fs.readFile);

/**
 * Maps file paths to their contents
 */
const cache = {};

module.exports = {};

// Store the cache object on the export so that we can use it in tests
module.exports._cache = cache;

/**
 * Read the template file at the given path.
 *
 * @param {string} path The file path.
 * @param {boolean} disableCache Whether to skip caching this template.
 * @return {Promise<string>} A Promise for the template string.
 */
function load(path, disableCache) {
    if (!disableCache && cache[path]) {
        return Promise.resolve(cache[path]);
    }
    return fsReadFile(path, "utf8").then((template) => {
        if (!disableCache) {
            cache[path] = template;
        }
        return template;
    });
};

module.exports.load = load;
