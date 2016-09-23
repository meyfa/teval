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
 *
 * Returns, as a Promise, the evaluated template string.
 */
module.exports = function evaluate(template, properties, options) {

    // iterate over given properties and substitute values
    Object.keys(properties).forEach(function (prop) {
        template = replace(template, prop, properties[prop], options.html);
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
function replace(template, property, value, html) {

    if (html) {
        // escape, then convert newlines to <br />
        value = escapeHtml(value).replace(/\r\n?|\n/g, "<br />");
    }

    var escProp = escapeStringRegexp(property);
    var regexp = new RegExp("\\{\\{\\s*" + escProp + "\\s*\\}\\}", "g");

    return template.replace(regexp, value);

}
