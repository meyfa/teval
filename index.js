'use strict'

const loader = require('./lib/loader')
const evaluator = require('./lib/evaluator')

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
 * @param {object} properties A mapping of property names to substitution values.
 * @param {object} options The options object.
 * @returns {Promise} The evaluated template string.
 */
module.exports = async function teval (path, properties, options) {
  // figure out options
  const opts = options || {}
  const html = typeof opts.html !== 'undefined' ? opts.html : path.endsWith('.html')

  const disableCache = !!opts.disableCache

  // fetch and evaluate
  const template = await loader.load(path, disableCache)
  return evaluator.evaluate(template, properties, {
    html: html,
    lineEndings: opts.lineEndings,
    prefix: opts.prefix,
    suffix: opts.suffix
  })
}
