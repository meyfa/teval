/*jshint node: true */

var Promise = require("bluebird");
var fs = require("fs");





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
        prom = read(path);
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





/**
 * Reads the file at the given path and returns its contents as a string.
 */
function read(path) {

    return new Promise(function (fulfill, reject) {
        fs.readFile(path, "utf8", function (err, template) {
            if (err) reject(err);
            else fulfill(template);
        });
    });

}
