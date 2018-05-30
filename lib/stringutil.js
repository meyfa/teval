"use strict";

module.exports = {};

/**
 * Determine whether the given string ends with the given suffix.
 *
 * This is a utility function that works even for older Node versions, in
 * contrast to the native String#endsWith().
 *
 * @param {[type]} str    [description]
 * @param {[type]} suffix [description]
 * @return {[type]} [description]
 */
function endsWith(str, suffix) {
    const subject = str.toString();
    const sfx = "" + suffix;
    return sfx === "" || subject.slice(-sfx.length) === sfx;
}

module.exports.endsWith = endsWith;
