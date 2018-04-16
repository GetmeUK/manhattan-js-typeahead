import * as $ from 'manhattan-essentials'
import {Sortable} from 'manhattan-sortable'


/**
 * Tokenizer UI component for form fields.
 */
export class Tokenizer {

    constructor(input, options={}, prefix='data-mh-tokenizer--') {

        // Configure the options
        this._options = {}

        $.config(
            this._options,
            {

                /**
                 * If true then a tag with the same value can be added
                 * multiple times.
                 */
                'allowDuplicates': false,

                /**
                 * A CSS selector used with the `store` behaviours to select a
                 * hidden input field to populate when storing token values.
                 *
                 * In the case of the `inputs` behaviour it should contain the
                 * name of the hidden field(s) to be created.
                 */
                'hiddenSelector': '',

                /**
                 * If true the tokens can be sorted.
                 */
                'sortable': false,

                /**
                 * If true then the tokenizer will take input directly from
                 * the related typeahead.
                 */
                'typeahead': false
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
                'element': 'default',
                'store': 'string',
                'tokenizer': 'default'
            },
            options,
            input,
            prefix
        )

        // Handle to the Sortable instance if the tokenizer supports sorting
        this._sortable = null

        // The list of tokens currently displayed in the tokenizer
        this._tokens = []

        // Domain for related DOM elements
        this._dom = {
            'input': null,
            'tokenizer': null
        }

        // Store a reference to the input element
        this._dom.input = input

        // Set up event handlers
        this._handlers = {

            'add': (event) => {
                // If the event was triggered by a keydown then check the
                // key is enter.
                if (event.type === 'keydown' && event.keyCode !== 13) {
                    return
                }

                // Get the value to add to the tokenizer
                let token = null
                if (this._options.typeahead) {

                    // If the typeahead option is set then look for the
                    // `_token` value against the input.
                    if (this.input._token) {
                        token = this.input._token
                        delete this.input._token
                    }

                } else {
                    // If not then check for a value in the input
                    const value = this.input.value.trim()

                    if (value !== '') {
                        token = {
                            'label': value,
                            value
                        }
                    }
                }

                // Clear the input
                this.input.value = ''

                // If a token was extracted then add it
                if (token !== null) {
                    this.addToken(token)
                }
            },

            'remove': (event) => {
                const {css} = this.constructor
                if (event.target.classList.contains(css['remove'])) {
                    event.preventDefault()

                    if(event.button === 0) {
                        const tokenElm = $.closest(
                            event.target,
                            `.${css['token']}`
                        )
                        this.removeToken(tokenElm._token)
                    }
                }
            },

            'sort': (event) => {
                // Rebuild the token list from based on the new token element
                // order.
                const tokenElms = $.many(
                    `.${this.constructor.css['token']}`,
                    this.tokenizer
                )
                this._tokens = tokenElms.map((tokenElm) => {
                    return tokenElm._token
                })

                // Sync the tokens
                this._sync()
            }
        }
    }

    // -- Getters & Setters --

    get input() {
        return this._dom.input
    }

    get tokenizer() {
        return this._dom.tokenizer
    }

    get tokens() {
        return this._tokens.slice()
    }

    // -- Public methods --

    /**
     * Add a token to the typeahead
     */
    addToken(token, index=null) {
        // If duplicates are not allowed then first check to make sure the
        // token has not already been added.
        if (!this._options.allowDuplicates) {
            for (let otherToken of this._tokens) {
                if (token.value === otherToken.value) {
                    return
                }
            }
        }

        // Add the token
        if (index === null) {
            this._tokens.push(token)
        } else {
            this._tokens.splice(index, 0, token)
        }

        // Sync the tokens
        this._sync()

        // Dispatch tokenadded event against the input
        $.dispatch(this.input, 'tokenadded', token)
    }

    /**
     * Remove the tokenizer.
     */
    destroy() {
        // Remove event listeners
        $.ignore(
            this.input,
            {
                'keydown': this._handlers.add,
                'selected': this._handlers.add
            }
        )

        if (this.tokenizer) {
            $.ignore(
                this.tokenizer,
                {
                    'click': this._handlers.remove,
                    'sorted': this._handlers.sort
                }
            )

            // Clear the tokens
            this._tokens = []

            // Remove the element
            this.tokenizer.parentNode.removeChild(this.tokenizer)
            this._dom.tokenizer = null
        }

        if (this._sortable !== null) {
            // Remove any sortable behaviour
            this._sortable.destroy()
            this._sortable = null
        }

        // Remove the tokenizer reference from the input
        delete this._dom.input._mhTokenizer
    }

    /**
     * Initialize the tokenizer.
     */
    init(tokens) {
        // Store a reference to the tokenizer instance against the input
        this.input._mhTokenizer = this

        // Create the tokenizer element
        const cls = this.constructor
        const tokenizer = cls.behaviours.tokenizer[this._behaviours.tokenizer]
        this._dom.tokenizer = tokenizer(this)

        // Set up sort behaviour
        if (this._options.sortable) {
            this._sortable = new Sortable(
                this.tokenizer,
                {
                    'grabSelector': `.${this.constructor.css['label']}`,
                    'grabber': 'selector'
                }
            )
            this._sortable.init()
        }

        // Set up event listeners
        $.listen(
            this.input,
            {
                'keydown': this._handlers.add,
                'selected': this._handlers.add
            }
        )

        $.listen(
            this.tokenizer,
            {
                'click': this._handlers.remove,
                'sorted': this._handlers.sort
            }
        )

        // Set the initial set of tokens
        this._tokens = tokens || []
        this._sync()
    }

    removeToken(token) {
        // Remove the token
        this._tokens = this._tokens.filter((t) => {
            return t !== token
        })

        // Sync the tokens
        this._sync()

        // Dispatch tokenadded event against the input
        $.dispatch(this.input, 'tokenremoved', token)
    }

    // -- Private methods --

    _sync() {
        const {behaviours} = this.constructor

        // Remove the existing token elements
        const tokenElms = $.many(
            `.${this.constructor.css['token']}`,
            this.tokenizer
        )
        for (let tokenElm of tokenElms) {
            tokenElm.parentNode.removeChild(tokenElm)
        }

        // Add the token elements
        const element = behaviours.element[this._behaviours.element]
        for (let token of this._tokens) {
            const tokenElm = element(this, token)
            tokenElm._token = token
            this.tokenizer.appendChild(tokenElm)
        }

        // Store the value of the tokens
        behaviours.store[this._behaviours.store](this)
    }
}


// -- Behaviours --

Tokenizer.behaviours = {

    /**
     * The `element` behaviour is used to create a new element that will be
     * displayed as a token in the tokenizer.
     */
    'element': {

        /**
         * Return an element containing the tokens label.
         */
        'default': (inst, token) => {

            // Create the label element
            const labelElm = $.create(
                'div',
                {'class': inst.constructor.css['label']}
            )
            labelElm.textContent = token.label

            // Create the remove button element
            const removeElm = $.create(
                'div',
                {'class': inst.constructor.css['remove']}
            )

            // Create the token element
            const tokenElm = $.create(
                'div',
                {'class': inst.constructor.css['token']}
            )
            tokenElm.appendChild(labelElm)
            tokenElm.appendChild(removeElm)

            return tokenElm
        }
    },

    /**
     * The `store` behaviour is used to combine and store the values of each
     * of token (typically so that they can be posted as part of a form
     * submission).
     */
    'store': {

        /**
         * Store the token values in a series of hidden input fields. The
         * `hiddenSelector` option is expected to contain the name for the
         * hidden field.
         */
        'inputs': (inst) => {
            // Find the form the associated input resides within
            const formElm = inst.input.form

            // Remove any existing hidden input fields for the tokenizer
            const valueName = inst._options.hiddenSelector
            const hiddenElms = $.many(`[name="${valueName}"]`, formElm)
            for (let hiddenElm of hiddenElms) {
                hiddenElm.parentNode.removeChild(hiddenElm)
            }
            // Add hidden elements for each token
            for (let token of inst.tokens) {
                let hiddenElm = $.create(
                    'input',
                    {
                        'name': valueName,
                        'value': token.value
                    }
                )
                formElm.appendChild(hiddenElm)
            }
        },

        /**
         * Store the token values as a serialized JSON list in a single hidden
         * field.
         */
        'json': (inst) => {
            const values = inst.tokens.map((token) => {
                return token.value
            })
            $.one(inst._options.hiddenSelector).value = JSON.stringify(values)
        },

        /**
         * Don't store the value (this allows the tokenizer to function purely
         * as a UI component).
         */
        'none': (inst) => {
            return null
        },

        /**
         * Store the token values as a comma separated string in a single
         * hidden field.
         */
        'string': (inst) => {
            const values = inst.tokens.map((token) => {
                return token.value
            })

            $.one(inst._options.hiddenSelector).value = values.join(',')
        }
    },

    /**
     * The `tokenizer` behaviour is used to return an elemnt to display the
     * tokens in. The behaviour can return a reference to an existing
     * element or create, insert and return a new element.
     */
    'tokenizer': {

        /**
         * The default behaviour creates a new div element and inserts it into
         * the the DOM after the input field.
         */
        'default': (inst) => {

            // Create a tokenizer element
            const cls = inst.constructor
            const tokenizer = $.create('div', {'class': cls.css['tokenizer']})

            // Insert the tokenizer after the input
            inst.input.parentNode.insertBefore(
                tokenizer,
                inst.input.nextSibling
            )

            return tokenizer
        }
    }

}


// -- CSS classes --

Tokenizer.css = {

    /**
     * Applied to the label element within a token.
     */
    'label': 'mh-token__label',

    /**
     * Applied to the remove element within a token.
     */
    'remove': 'mh-token__remove',

    /**
     * Applied to a token.
     */
    'token': 'mh-token',

    /**
     * Applied to the tokenizer (the container for tokens)
     */
    'tokenizer': 'mh-tokenizer'

}
