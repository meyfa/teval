'use strict'

const fsPromises = require('fs').promises

/**
 * Maps file paths to their contents
 */
const cache = {}

/**
 * Read the template file at the given path.
 *
 * @param {string} path The file path.
 * @param {boolean} disableCache Whether to skip caching this template.
 * @returns {Promise} A Promise for the template string.
 */
async function load (path, disableCache) {
  if (!disableCache && cache[path]) {
    return cache[path]
  }
  const template = await fsPromises.readFile(path, 'utf8')
  if (!disableCache) {
    cache[path] = template
  }
  return template
}

module.exports = {
  load,
  // Store the cache object on the export so that we can use it in tests
  _cache: cache
}
