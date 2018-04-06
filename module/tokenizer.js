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
                'sortable': false

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
                'coerce': 'valueOnly',
                'element': 'default',
                'store': 'string'
            },
            options,
            input,
            prefix
        )

        // The list of tokens currently displayed in the typeahead
        this._tokens = null

        // Domain for related DOM elements
        this._dom = {
            'input': null,
            'typeahead': null
        }

        // Store a reference to the input element
        this._dom.input = input

        // @@ Set up event handlers
        this._handlers = {}
    }

    // -- Getters & Setters --

    get tokens() {
        return this.todo
    }

    // -- Public methods --

    addToken(token, index=null) {
        // @@ trigger tokenadded
        return this.todo
    }

    removeToken(token) {
        // @@ trigger tokenremoved
        return this.todo
    }

    // -- Private methods --

    _sync() {
        // @@ _sync??? Sync the values in the tokens with the
        // relevant input elements.
        return this.todo
    }
}


// -- Behaviours --

Tokenizer.behaviours = {

    /**
     * The `coerce` behaviour is used to convert a received token into a
     * suitable object for displaying (via `element`) and storing
     * (via `store`).
     */
    'coerce': {

        /**
         * Pass-through (no coercion)
         */
        'passThrough': (inst, token) => {
            return token
        },

        /**
         * Coerce a value into a token setting both the token's label and
         * value as the value.
         */
        'valueOnly': (inst, token) => {
            return {
                'label': token,
                'value': token
            }
        }
    },

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
            return 'todo'
        },

        /**
         * Store the token values as a serialized JSON list in a single hidden
         * field.
         */
        'json': (inst) => {
            return 'todo'
        },

        /**
         * Don't store the value (this allows the tokenizer to function purely
         * as a UI component).
         */
        'none': (inst) => {
            return
        },

        /**
         * Store the token values as a comma separated string in a single
         * hidden field.
         */
        'string': (inst) => {
            return 'todo'
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
