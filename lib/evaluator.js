/*jshint node: true */
"use strict";

var escapeStringRegexp = require("escape-string-regexp");
var escapeHtml = require("escape-html");

/**
 * Takes the contents of a template, a map of properties to their wanted values,
 * and the following evaluation options in an object:
 *
 * - html: whether to sanitize HTML in the property replacements
 * - lineEndings: (optional) string to replace all line endings with
 * - prefix: (optional, default "{{") the property name prefix to match
 * - suffix: (optional, default "}}") the property name suffix to match
 *
 * Returns, as a Promise, the evaluated template string.
 */
module.exports = function evaluate(template, properties, options) {

    var prefix = options.prefix || "{{";
    var suffix = options.suffix || "}}";

    // iterate over given properties and substitute values
    Object.keys(properties).forEach(function (prop) {
        var regexp = makeSearchRegExp(prop, prefix, suffix);
        template = replace(template, regexp, properties[prop], options.html);
    });

    // normalize line endings
    if (options.lineEndings) {
        template = template.replace(/\r\n?|\n/g, options.lineEndings);
    }

    return template;

};

/**
 * Takes a template string, a property name and its substitution value, as well
 * as a boolean indicating whether HTML should be escaped.
 * Returns the template with all occurences of the property replaced.
 */
function replace(template, regexp, value, html) {
    if (html) {
        // escape, then convert newlines to <br />
        value = escapeHtml(value).replace(/\r\n?|\n/g, "<br />");
    }
    return template.replace(regexp, value);
}

/**
 * Returns a RegExp matching the given property enclosed in a prefix/suffix
 * pair.
 */
function makeSearchRegExp(property, prefix, suffix) {

    var escProp = escapeStringRegexp(property),
        escPrefix = escapeStringRegexp(prefix),
        escSuffix = escapeStringRegexp(suffix);

    var regexpStr = escPrefix + "\\s*" + escProp + "\\s*" + escSuffix;

    return new RegExp(regexpStr, "g");

}
