'use strict'

const escapeStringRegexp = require('escape-string-regexp')
const escapeHtml = require('escape-html')

module.exports = {}

/**
 * Evaluate the given template by replacing all the named properties.
 *
 * The following options are supported:
 *
 * - html: whether to sanitize HTML entities in the substitution values
 * - lineEndings: (optional) string to replace all line endings with
 * - prefix: (optional, default "{{") the property name prefix to match
 * - suffix: (optional, default "}}") the property name suffix to match
 *
 * @param {string} template The template string.
 * @param {object} properties A mapping of property names to substitution values.
 * @param {object} options The options object.
 * @returns {string} The evaluation result.
 */
function evaluate (template, properties, options) {
  const prefix = options.prefix || '{{'
  const suffix = options.suffix || '}}'

  let result = template

  // iterate over given properties and substitute values
  for (const prop of Object.keys(properties)) {
    const regexp = makeSearchRegExp(prop, prefix, suffix)
    result = replace(result, regexp, properties[prop], options.html)
  }

  // normalize line endings
  if (typeof options.lineEndings === 'string') {
    result = result.replace(/\r\n?|\n/g, options.lineEndings)
  }

  return result
}

module.exports.evaluate = evaluate

/**
 * Takes a template string, a property name and its substitution value, as well
 * as a boolean indicating whether HTML should be escaped.
 * Returns the template with all occurences of the property replaced.
 */

/**
 * Replace all occurrences of the given RegExp with the given value. Optionally
 * escape HTML entities.
 *
 * @param {string} template The template string.
 * @param {RegExp} regexp The regular expression to search for.
 * @param {string} value The replacement value.
 * @param {boolean} html Whether to escape HTML entities.
 * @returns {string} The template string with all replacements applied.
 */
function replace (template, regexp, value, html) {
  let val = value
  if (html) {
    // escape, then convert newlines to <br />
    val = escapeHtml(val).replace(/\r\n?|\n/g, '<br />')
  }
  return template.replace(regexp, val)
}

/**
 * Returns a RegExp matching the given property enclosed in a prefix/suffix
 * pair.
 */

/**
 * Construct a RegExp matching the given property enclosed in a prefix/suffix
 * pair.
 *
 * @param {string} property The property name.
 * @param {string} prefix The prefix string.
 * @param {string} suffix The suffix string.
 * @returns {RegExp} A regular expression matching the given input combination.
 */
function makeSearchRegExp (property, prefix, suffix) {
  const escProp = escapeStringRegexp(property)
  const escPrefix = escapeStringRegexp(prefix)
  const escSuffix = escapeStringRegexp(suffix)

  const regexpStr = escPrefix + '\\s*' + escProp + '\\s*' + escSuffix

  return new RegExp(regexpStr, 'g')
}
