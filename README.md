<div align="center">
    <img width="196" height="96" vspace="20" src="http://assets.getme.co.uk/manhattan-logo--variation-b.svg">
    <h1>Manhattan Typeahead</h1>
    <p>Type-a-head and tokens for form fields.</p>
    <a href="https://badge.fury.io/js/manhattan-typeahead"><img src="https://badge.fury.io/js/manhattan-typeahead.svg" alt="npm version" height="18"></a>
    <a href="https://travis-ci.org/GetmeUK/manhattan-js-typeahead"><img src="https://travis-ci.org/GetmeUK/manhattan-js-typeahead.svg?branch=master" alt="Build Status" height="18"></a>
    <a href='https://coveralls.io/github/GetmeUK/manhattan-js-typeahead?branch=master'><img src='https://coveralls.io/repos/github/GetmeUK/manhattan-js-typeahead/badge.svg?branch=master' alt='Coverage Status' height="18"/></a>
    <a href="https://david-dm.org/GetmeUK/manhattan-js-typeahead/"><img src='https://david-dm.org/GetmeUK/manhattan-js-typeahead/status.svg' alt='dependencies status' height="18"/></a>
</div>

## Installation

`npm install manhattan-typeahead --save-dev`


## Usage

```html
<label>
    Language
    <input
        name="languages_input"
        data-mh-typeahead
        data-mh-typeahead--coerce="valueOnly"
        data-mh-typeahead--list="C,C++,CoffeeScript,JavaScript,Lua,Moonscript,Perl,Python,Wren"
        >
    <input type="hidden" name="languages">
</label>

<label>
    Tags
    <input
        name="tags_input"
        value=""
        data-mh-tokenizer
        data-mh-tokenizer--hidden-selector="[name=tags]"
        data-mh-tokenizer--sortable
        >
    <input type="hidden" name="tags">
</label>
```

```JavaScript
import * as $ from 'manhattan-essentials'
import {tokenizer, typeahead} from 'manhattan-typeahead'

const myTypeahead = new typeahead.Typeahead($.one('[data-mh-typeahead]'))
myTypeahead.init()

const myTokenizer = new tokenizer.Tokenizer($.one('[data-mh-tokenizer]'))
myTokenizer.init([{'label': 'Some tag', 'value': 'Some value'}])
```
