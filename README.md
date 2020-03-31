# teval

[![Build Status](https://travis-ci.com/meyfa/teval.svg?branch=master)](https://travis-ci.com/meyfa/teval)
[![Test Coverage](https://api.codeclimate.com/v1/badges/66cd545fd26d600e5001/test_coverage)](https://codeclimate.com/github/meyfa/teval/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/66cd545fd26d600e5001/maintainability)](https://codeclimate.com/github/meyfa/teval/maintainability)

* Easy **value substitution** via {{property}} syntax
* **Customizable** prefix/suffix (match `<property>`, or `'property'`, or ...)
* Caches all templates by default for blazing-fast access times
* Optionally **sanitizes** substituted values for use in HTML
* Optionally **normalizes line endings**

## Install

```
npm i teval
```

## Usage

Say your template looks like this:

```
Hello, {{name}}! You're looking at my {{ adjective }} template!
```

Then, you could use the following code:

```javascript
const teval = require('teval')

teval('/absolute/path/to/template.txt', {
  name: 'world',
  adjective: 'super cool'
}).then((template) => {
  console.log(template)
})
```

### HTML value escaping

teval can escape HTML values for you, reducing the risk of XSS (or similar) to
zero. If the template path ends in .html, it does so automatically by default,
otherwise you can turn it on by passing the option.

Adding this to the previous example:

```javascript
teval('/absolute/path/to/template.txt', {
  name: 'evil <b>XSS</b> attackers & other fellas',
  adjective: 'completely <HTML>-safe'
}, { html: true }).then((template) => {
  console.log(template)
})
```

would yield as output:

```
Hello, evil &ltb&gtXSS&lt/b&gt attackers &amp other fellas! You're looking
at my completely &ltHTML&gt-safe template!
```

### Line endings

Just like the `html` option in the previous example, you can specify a
`lineEndings` option. Set it to a string and teval will replace all the line
endings in the evaluated template, whatever form they might have, with that
string.

### Changing the prefix/suffix

The prefix and suffix are what the property names to be matched are enclosed in,
so by default `{{` and `}}`. You can change them to anything you like.

Template:

```
Hello %name%! You're looking at my %adjective% template!
```

Code:

```javascript
const teval = require('teval')

teval('/absolute/path/to/template.txt', {
  name: 'world',
  adjective: 'super cool'
}, { prefix: '%', suffix: '%' }).then((template) => {
  console.log(template)
})
```
