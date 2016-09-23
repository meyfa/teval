/*jshint node: true */

module.exports = {

    /**
     * Returns true if and only if the string value of the first argument
     * ends with the given suffix. Otherwise, returns false. Does NOT support
     * the length argument.
     *
     * Normally, one would just use String.prototype.endsWith, but since there
     * are Node versions out there which don't support ES6 yet, this function
     * exists. It either wraps the native method, or alternatively performs
     * the check manually.
     */
    endsWith: function (str, suffix) {

        var subject = str.toString();
        if (typeof subject.endsWith === "function")
            return subject.endsWith(suffix);

        if (suffix === "")
            return true;

        return subject.slice(-suffix.length) === suffix;

    }

};
