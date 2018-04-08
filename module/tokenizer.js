import * as $ from 'manhattan-essentials'


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
                 * A CSS selector used with the `store` behaviours to select a
                 * hidden input field to populate when storing token values.
                 *
                 * In the case of the `inputs` behaviour it should contain the
                 * name of the hidden field(s) to be created.
                 */
                'hiddenSelector': false,

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
                'store': 'string'
            },
            options,
            input,
            prefix
        )

        // The list of tokens currently displayed in the typeahead
        this._tokens = []

        // Domain for related DOM elements
        this._dom = {
            'input': null,
            'tokenizer': null
        }

        // Store a reference to the input element
        this._dom.input = input

        // @@ Set up event handlers
        this._handlers = {

            'add': (event) => {
                // If the event was triggered by a keydown then check the
                // key is enter/return

                // @@ If the typeahead option is set then look for the
                // `_tokenizer` value against the input.

                // @@ If not then use the value of the input

                // @@ Clear the input

                // @@ Add the token
                return '@@'
            },

            'remove': (event) => {
                const removeCSS = this.constructor.css['remove']
                if (event.target.classList.contains(removeCSS)) {
                    event.preventDefault()
                    this.removeToken(event.target._token)
                }
            },

            'sorted': (event) => {
                // @@ Rebuild the token list from based on the new token element
                // order

                // @@ Sync the tokens

                return '@@'
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

    addToken(token, index=null) {
        // Add the token
        this._tokens.push(token)

        // Sync the tokens
        this._sync()

        // Dispatch tokenadded event against the input
        $.dispatch(this.input, 'tokenadded', token)
    }

    /**
     * Remove the tokenizer.
     */
    destroy() {
        return this.todo
    }

    /**
     * Initialize the tokenizer.
     */
    init(tokens) {
        return this.todo
    }

    removeToken(token) {
        // Remove the token
        this._tokens = this._tokens.filter((t) => {
            return t !== token
        })

        // Sync the tokens
        this._sync()

        // Dispatch tokenadded event against the input
        $.dispatch(this.input, 'tokenadded', token)
    }

    // -- Private methods --

    _sync() {
        const {behaviours} = this.constructor

        // Remove the existing token elements
        const tokenElms = $.many(this.constructor['token'], this.tokenizer)
        for (let tokenElm in tokenElms) {
            tokenElm.parentNode.removeChild(tokenElm)
        }

        // Add the token elements
        const element = behaviours.element[this._behaviour.element]
        for (let token in this._tokens) {
            const tokenElm = element(this, token)
            tokenElm._token = token
            this.tokenizer.appendChild(tokenElm)
        }

        // Store the value of the tokens
        behaviours[this._behaviour.store](this)
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
            for (let hiddenElm in hiddenElms) {
                hiddenElm.parentNode.removeChild(hiddenElm)
            }

            // Add hidden elements for each token
            for (let token in inst.token) {
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
