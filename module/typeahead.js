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
                 * A selector used with the `input` behaviour (see
                 * `setHidden`) to select a hidden input field to populate
                 * when a suggestion is selected.
                 */
                'hiddenSelector': '',

                /**
                 * The list of typeahead suggestions, the fetch behaviour will
                 * determine the required data type for the list option.
                 */
                'list': [],

                /**
                 * The maxium number of suggestions the typeahead should
                 * display.
                 */
                'maxSuggestions': 10,

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

        // The index of the currently focused suggestion with the typeahead
        // (-1 indicates that no suggestion has focus).
        this._index = -1

        // A flag indicating if the typeahead is open (visible)
        this._open = false

        // The list of suggestions currently displayed in the typeahead
        this._suggestions = null

        // Domain for related DOM elements
        this._dom = {
            'input': null,
            'typeahead': null
        }

        // Store a reference to the input element
        this._dom.input = input

        // Set up event handlers
        this._handlers = {

            'clear': (event) => {
                event.preventDefault()
                this.clear()
            },

            'close': (event) => {
                this.close()
            },

            'nav': (event) => {

                // The typeahead can only be navigated if it's open
                if (!this.isOpen) {
                    return
                }

                // Handle the key pressed
                switch (event.keyCode) {

                case 9:
                    // Tab
                    if (this._options.mustMatch) {
                        this.select()
                    }
                    break

                case 13:
                    // Enter
                    if (this.index > -1) {
                        event.preventDefault()
                        this.select()
                    }
                    break

                case 27:
                    // Escape
                    this.close()
                    break

                case 38:
                    // Up arrow
                    event.preventDefault()
                    this.previous()
                    break

                case 40:
                    event.preventDefault()
                    this.next()
                    break

                default:
                    break
                }
            },

            'select': (event) => {

                // Ingore mousedown (touchstart) against the typeahead
                if (event.target === this.typeahead) {
                    return
                }

                // Check the mouse button that triggered the event was the
                // left mouse button (for touchstart will be the default).
                if (event.button !== 0) {
                    return
                }

                // Cancel the default event behaviour
                event.preventDefault()

                // Get the suggestion element that was selected
                let elm = event.target
                while (elm.parentNode !== this.typeahead) {
                    elm = elm.parentNode
                }

                // Find the index of the suggestion and select it
                const index = Array.prototype.indexOf.call(
                    this.typeahead.children,
                    elm
                )
                this.select(index)
            },

            'update': (event) => {
                this._update()
            }
        }
    }

    // -- Getters & Setters --

    get focused() {
        if (this.index === -1) {
            return null
        }
        return this._suggestions[this.index]
    }

    get index() {
        return this._index
    }

    get input() {
        return this._dom._index
    }

    get isOpen() {
        return this._open
    }

    get suggestionCount() {
        return this._suggestions.length
    }

    get suggestions() {
        return this._suggestions.slice()
    }

    get typeahead() {
        return this._dom.typeahead
    }

    // -- Public methods --

    /**
     * Clear any existing value from the input field.
     */
    clear() {
        this.constructor.behaviours.input[this._behaviouts.input](this, null)
    }

    /**
     * Clear the cache.
     */
    clearCache() {
        this._cache = {}
    }

    /**
     * Close the typeahead.
     */
    close() {
        // If the typeahead is already closed there's nothing to do
        if (!this.isOpen) {
            return
        }

        // Hide the typeahead
        this.typeahead.classList.remove(this.constructor.css['open'])

        // Flag the typeahead as closed
        this._open = false

        // Reset the index
        this._index = -1

        // Dispatch closed event against the input
        $.dispatch(this.input, 'closed')
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
        // If there's no suggestions then there's nothing to do
        if (this.suggestionCount === 0) {
            return
        }

        // If the last suggestion currently has focus then cycle round to the
        // first suggestion.
        if (this.index >= this.suggestionCount) {
            this._focus(0)
            return
        }

        // Select the next suggestion
        this._focus(this.index + 1)
    }

    /**
     * Open the typeahead.
     */
    open() {
        // Ensure the typeahead is position inline with associated input field
        this._track()

        // Show the typeahead
        this.typeahead.classList.add(this.constructor.css['open'])

        // Flag the typeahead as open
        this._open = true

        // If the `autoFirst` option is true and no suggestion currently has
        // focus then select the first option.
        if (this._options.autoFirst && this.index === -1) {
            this._focus(0)
        }

        // Dispatch opened event against the input
        $.dispatch(this.input, 'opened')
    }

    /**
     * Select the previous suggestion.
     */
    previous() {
        // If there's no suggestions then there's nothing to do
        if (this.suggestionCount === 0) {
            return
        }

        // If the first suggestion is currently has focus then cycle round to
        // the first suggestion.
        if (this.index <= 0) {
            this._focus(this.suggestionCount - 1)
            return
        }

        // Select the previous suggestion
        this._focus(this.index - 1)
    }

    /**
     * Select the suggestion at the given index or if no index is provided
     * then select the current suggestion.
     */
    select(index=null) {

        // If an index is given (and it's not the the same as the current
        // index then select it).
        if (index !== null && index !== this.index) {
            this._focus(index)
        }

        // Check that a suggestion has focus
        if (this.index === -1) {
            return
        }

        // Dispatch select event against the input
        const suggestion = this._suggestions[this.index]
        if (!$.dispatch(this.input, 'select', {suggestion})) {
            return
        }

        // Set value in the associated input
        this.constructor.behaviours.input[this._behaviours.input](
            this,
            suggestion
        )

        // Close the typeahead
        this.close()

        // Dispatch selected event against the input
        $.dispatch(this.input, 'selected', {suggestion})
    }

    // -- Private methods --

    /**
     * Focus on the suggestion at the given index.
     */
    _focus(index) {

        // Remove the focused CSS class any suggestion element in the type
        // ahead.
        const focusedCSS = this.constructor.css['focused']
        const focusedElm = $.one(`.${focusedCSS}`, this.typeahead)
        if (focusedElm) {
            focusedElm.classList.remove('focusedCSS')
        }

        // Update the index of the focused suggestion
        this._index = index

        // If a suggestion was given focus apply the focused CSS class to the
        // associated suggestion element in the typeahead.
        if (this.focused) {
            const suggestionElm = this._dom.suggestions.children[this.index]
            suggestionElm.classList.add(focusedCSS)
        }
    }

    /**
     * Position the typehead inline with the associated input element.
     */
    _track() {
        const rect = this.input.getBoundingClientRect()
        const top = rect.top + window.pageYOffset
        const left = rect.left + window.pageXOffset
        this.typeahead.style.top = `${top + rect.height}px`
        this.typeahead.style.left = `${left}px`
        this.typeahead.style.width = `${rect.width}px`
    }

    /**
     * Update the typeahead to show relevant suggestions for the current
     * query.
     */
    _update() {
        const {behaviours} = this.constructor

        // Clear all current suggestions and associated elements
        this._index = -1
        this._suggestions = []

        // Get the query string
        const q = behaviours.query[this._behaviours.query](this)

        // If there's no query string then clear the current input field's
        // value.
        if (q.length === 0) {
            this.clear()
        }

        // If the query string is shorter than the minumum number of
        // characters required the we close the typeahead and we're done.
        if (q.length < this._options.minChars) {
            this.close()
            return
        }

        // Fetch the list of suggestions
        behaviours.fetch[this._behaviours.fetch](this, q)
            .then((suggestions) => {

                // If no suggestions were returned then close the typeahead
                // and we're done.
                if (suggestions.length === 0) {
                    this.close()
                    return
                }

                const todo = '@@'

                // @@ Coerce the suggestions fetched into the required format
                // (e.g {'label': '...', 'value': '...', ...}.

                // @@ Filter the suggestions to just those that match the query

                // @@ Sort the suggestions

                // @@ Limit the list of suggestions to the maximum suggestions

                // @@ ...

            })
            .catch(() => {

                // If there was an error fetching the suggestions close the
                // typeahead and we're done.
                this.close()
            })
    }
}


// -- Behaviours --

Typeahead.behaviours = {

    /**
     * The `coerce` behaviour is used to convert a fetched suggestion into a
     * suitable object for the `fitler` > `sort` > `element` behaviours.
     */
    'coerce': {

        /**
         * Pass-through (no coercion)
         */
        'passThrough': (inst, suggestion) => {
            return suggestion
        },

        /**
         * Coerce a value into a suggestion setting both the suggestion's
         * label and value as the value.
         */
        'valueOnly': (inst, suggestion) => {
            return {
                'label': suggestion,
                'value': suggestion
            }
        }
    },

    /**
     * The `element` behaviour is used to create a new element that will be
     * displayed as a suggestion in the typeahead.
     */
    'element': {

        /**
         * Return an element containing the suggestions label with the
         * matching segment of the label marked / highlighted.
         */
        'default': (inst, suggestion, q) => {

            // Create the element to contain the suggestion
            const elm = $.create(
                'div',
                {'class': inst.constructor.css['suggestion']}
            )

            // Add the suggestion to the element and mark the portion of the
            // suggestion that matches the query.
            elm.innerHTML = suggestion.label.replace(
                new RegExp($.escapeRegExp(q), 'gi'),
                '<mark>$&</mark>'
            )

            return elm
        }
    },

    /**
     * The `fetch` behaviour is used to retreive a list suggestions for the
     * typeahead.
     */
    'fetch': {

        /**
         * Fetch the suggestions using an AJAX call.
         */
        'ajax': (inst, q) => {
            return '@@'
        },

        /**
         * Return the list option (which should be an array)
         */
        'array': (inst, q) => {
            return '@@'
        },

        /**
         * Split the list option (which should be a string) ny
         */
        'csv': (inst, q) => {
            return '@@'
        },

        /**
         * Select a <datalist> element using the list option as a CSS selector
         * and return its options as suggestions.
         */
        'dataList': (inst, q) => {
            return '@@'
        },

        /**
         * Select a list of DOM element using the list option as a CSS
         * selector and return the content of the elements as suggestions.
         */
        'elements': (inst, q) => {
            return '@@'
        }
    },

    /**
     * The `filter` behaviour is used to filter suggestions against the query.
     */
    'filter': {

        /**
         * Return true if the suggestion contains the query
         */
        'contains': (inst, suggestion, q) => {
            const value = suggestion.value.toLowerCase()
            return value.indexOf(q.toLowerCase()) > -1
        },

        /**
         * Return true if the suggestion starts with the query
         */
        'startswith': (inst, suggestion, q) => {
            const value = suggestion.value.toLowerCase().substr(0, q.length)
            return value === q.toLowerCase()
        }
    },

    /**
     * The `input` behaviour is used to set the value of the input when a
     * suggestion is selected.
     */
    'input': {

        /**
         * Set the value of the input as the suggestion's label and the value
         * of a hidden input (see `hiddenSelector` option) as the suggestion's
         * value.
         */
        'setHidden': (inst, suggestion) => {
            return '@@'

            // Trigger change event against the input
        },

        /**
         * Set the value of the input to the suggestion's value.
         */
        'setValue': (inst, suggestion) => {
            return '@@'

            // Trigger change event against the input
        }
    },

    /**
     * The `query` behaviour is used to obtain the query string from the
     * associated input field.
     */
    'query': {

        /**
         * Return the the value of the associated input field.
         */
        'value': (inst) => {
            return inst.input.value.trim()
        }

    },

    /**
     * The `sort` behaviour sorts suggestions by their relevance to the query
     */
    'sort': {

        /**
         * Sort a suggestion by startswith, then contains, then string length.
         */
        'length': (inst, q, a, b) => {
            return false
        }
    }

}


// -- CSS classes --

Typeahead.css = {

    /**
     * Applied to the suggestion that currently has focus.
     */
    'focused': 'mh-typeahead__suggestion--focused',

    /**
     * Applied to the typeahead when it is open.
     */
    'open': 'mh-typeahead--open',

    /**
     * Applied to suggestions that appear within the typeahead.
     */
    'suggestion': 'mh-typeahead__suggestion',

    /**
     * Applied to the typeahead element.
     */
    'typeahead': 'mh-typeahead'

}

// Clear button option
