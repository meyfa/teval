"use strict";

const stringutil = require("./lib/stringutil");

const loader = require("./lib/loader");
const evaluator = require("./lib/evaluator");

/**
 * Evaluate the template at the given file path by replacing all the named
 * properties.
 *
 * The following options are supported:
 *
 * - html: whether to sanitize HTML (default: by file extension; .html = true)
 * - disableCache: whether to skip in-memory caching (default: false)
 * - lineEndings: string to replace all line endings with (default: nothing)
 * - prefix: the property name prefix to match (default: "{{")
 * - suffix: the property name suffix to match (default: "}}")
 *
 * @param {string} path The path to the template file.
 * @param {Object.<string, string>} properties A mapping of property names to
 *     substitution values.
 * @param {Object} options The options object.
 * @return {Promise<string>} The evaluated template string.
 */
module.exports = function teval(path, properties, options) {

    // figure out options
    const opts = options || {};
    const html = typeof opts.html !== "undefined"
        ? opts.html : stringutil.endsWith(path, ".html");

    const disableCache = !!opts.disableCache;

    // fetch and evaluate
    return loader.load(path, disableCache).then((template) => {
        return evaluator.evaluate(template, properties, {
            html: html,
            lineEndings: opts.lineEndings,
            prefix: opts.prefix,
            suffix: opts.suffix,
        });
    });

};
