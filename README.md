# teval

[![Build Status](https://travis-ci.org/JangoBrick/teval.svg?branch=master)](https://travis-ci.org/JangoBrick/teval)
[![Code Climate](https://codeclimate.com/github/JangoBrick/teval/badges/gpa.svg)](https://codeclimate.com/github/JangoBrick/teval)

* Easy **value substitution** via {{property}} syntax
* Caches all templates by default for blazing-fast access times
* Optionally **sanitizes** substituted values for use in HTML
* Optionally **normalizes line endings**
* Built with Bluebird promises for ease of use



## Install

```
npm install --save teval
```



## Usage

Say your template looks like this:

```
Hello, {{name}}! You're looking at my {{ adjective }} template!
```

Then, you could use the following code:

```javascript
var teval = require("teval");

teval("/absolute/path/to/template.txt", {
    name: "world",
    adjective: "super cool"
}).then(function (template) {
    console.log(template);
});
```



## HTML value escaping

teval can escape HTML values for you, reducing the risk of XSS (or similar) to
zero. If the template path ends in .html, it does so automatically by default,
otherwise you can turn it on by passing the option.

Adding this to the previous example:

```javascript
teval("/absolute/path/to/template.txt", {
    name: "evil <b>XSS</b> attackers & other fellas",
    adjective: "completely <HTML>-safe"
}, {
    html: true
}).then(function (template) {
    console.log(template);
});
```

would yield as output:

```
Hello, evil &lt;b&gt;XSS&lt;/b&gt; attackers &amp; other fellas! You're looking
at my completely &lt;HTML&gt;-safe template!
```



## Line endings

Just like the `html` option in the previous example, you can specify a
`lineEndings` option. Set it to a string and teval will replace all the line
endings in the evaluated template, whatever form they might have, with that
string.



## Tests

All unit tests for this module are located in /test/test.js and should be run
using [Mocha](https://github.com/mochajs/mocha).



## License

The MIT License (MIT)

Copyright (c) 2016 JangoBrick

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
