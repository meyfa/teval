/*jshint node: true */

var loader = require("./lib/loader");
var evaluator = require("./lib/evaluator");





/**
 * Takes a template path, a map of properties to their wanted values, and an
 * optional object specifying the following settings:
 *
 * - html: whether to sanitize HTML (default: by file extension; .html = true)
 * - disableCache: whether to skip in-memory caching (default: false)
 * - lineEndings: string to replace all line endings with (default: nothing)
 *
 * Returns, as a Promise, the evaluated template string.
 */
module.exports = function teval(path, properties, options) {

    // figure out options
    options = options || {};
    var html = typeof options.html !== "undefined" ?
               options.html : path.endsWith(".html");

    // 1) fetch
    var disableCache = options ? !!options.disableCache : false;
    var content = loader(path, disableCache);

    // 2) evaluate
    content = content.then(function (template) {
        return evaluator(template, properties, {
            html: html,
            lineEndings: options.lineEndings
        });
    });

    return content;

};
