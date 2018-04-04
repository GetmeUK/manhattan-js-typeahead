import * as $ from 'manhattan-essentials'


// -- Class definition --

/**
 * Typeahead UI component for form fields.
 */
export class Typeahead {

    constructor(input, options={}, prefix='data-mh-typeahead--') {

        // Configure the options
        this._options = {}

        $.config(
            this._options,
            {

                /**
                 * If true the first suggestion will be automatically selected
                 * when the typeahead is opened.
                 */
                'autoFirst': false,

                /**
                 * By default if the `fetch` behaviour supports caching (e.g
                 * `ajax`) then fetched suggestions will be cached, setting
                 * this option to true will disable that caching.
                 */
                'disableCache': false,

                /**
                 * The list of typeahead suggestions, the fetch behaviour will
                 * determine the required data type for the list option.
                 */
                'list': [],

                /**
                 * The maxium number of suggestions the typeahead should
                 * display.
                 */
                'maxItems': 10,

                /**
                 * The minimum number of characters a user must enter before
                 * the typeahead will display suggestions.
                 */
                'minChars': 2,

                /**
                 * If true then only a value matching one of the typeaheads
                 * suggestions can populate the associated field.
                 */
                'mustMatch': false
            },
            options,
            input,
            prefix
        )

        // Configure the behaviours
        this._behaviours = {}

        $.config(
            this._behaviours,
            {
                'coerce': 'passThrough',
                'element': 'default',
                'fetch': 'array',
                'filter': 'filter',
                'input': 'set-value',
                'query': 'value',
                'sort': 'length'
            },
            options,
            input,
            prefix
        )

        // A cache of fetched suggestions (whether the cache is used or not is
        // determined by the `fetch` behaviour and the `disableCache` options).
        this._cache = null

        // The index of the currently selected suggestion with the typeahead
        // (-1 indicates that no suggestion is selected).
        this._index = -1

        // A flag indicating if the typeahead is open (visible)
        this._open = false

        // Domain for related DOM elements
        this._dom = {
            'input': null,
            'typeahead': null
        }

        // Store a reference to the input element
        this._dom.input = input

        // Set up event handlers
        this._handlers = {

            'close': () => {
                return '@@'
            },

            'nav': () => {
                return '@@'
            },

            'select': () => {
                return '@@'
            },

            'update': () => {
                return '@@'
            }
        }
    }

    // -- Getters & Setters --

    get index() {
        return this._index
    }

    get input() {
        return this._dom._index
    }

    get isOpen() {
        return this._open
    }

    get typeahead() {
        return this._dom.typeahead
    }

    // -- Public methods --

    /**
     * Close the typeahead.
     */
    close() {
        return this.todo
    }

    /**
     * Remove the typeahead.
     */
    destroy() {
        return this.todo
    }

    /**
     * Initialize the typeahead.
     */
    init() {
        return this.todo
    }

    /**
     * Select the next suggestion.
     */
    next() {
        return this.todo
    }

    /**
     * Open the typeahead.
     */
    open() {
        return this.todo
    }

    /**
     * Select the previous suggestion.
     */
    previous() {
        return this.todo
    }

    /**
     * Select the suggestion at the given index.
     */
    select(index) {
        return this.todo
    }

    // -- Private methods --

    /**
     * Select the suggestion at the given index (without triggering an event).
     */
    _select(index) {
        return this.todo
    }

    /**
     * Position the typehead inline with the associated input element.
     */
    _track() {
        return this.todo
    }

    /**
     * Update the typeahead to show relevant suggestions for the current
     * query.
     */
    _update() {
        return this.todo
    }
}


// -- Behaviours --

Typeahead.behaviours = {}


// -- CSS classes --

Typeahead.css = {}


// @@ Define a separate class for the cache
