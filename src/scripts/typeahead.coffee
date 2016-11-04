import * as $ from 'manhattan-essentials'


class Typeahead

    # A class that provides 'typeahead' behaviour for form fields.

    @pkg_prefix = 'data-mh-typeahead--'

    constructor: (input, options={}) ->

        # Configure the instance
        $.config(
            this,
            {
                # Settings
                autoFirst: false,
                maxItems: 10,
                minChars: 2,
                mustMatch: false,

                # Functions
                convert: 'default',
                fetch: 'array',
                filter: 'startswith',
                highlight: 'default',
                sort: 'default',
                template: 'default'
            },
            options,
            input,
            @pkg_prefix
            )

        # A reference to the input the typeahead is being applied to (we also
        # store a reverse reference to this instance against the input).
        @_input = input
        @_input.__mh_typeahead = this

        # Provide a read-only publicly accessible property for the input

        # The index of the currently select item
        @_index = -1

        # Build the elements required for the typeahead
        block = 'mh-typeahead'
        @_dom = {
            results: $.create('ol', {'class': block}),
            status: $.create("#{block}__status")
        }
        document.body.appendChild(@_dom.results)
        @_dom.results.appendChild(@_dom.status)

        # @@ Set up event listeners for the typeahead

        # Define read-only properties
        Object.defineProperty(this, 'input', {value: @_input})
        Object.defineProperty(this, 'index', {value: @_index})

    # Public methods

    close: () ->

    next: () ->

    open: () ->

    previous: () ->

    refresh: () ->
        # evalutate

    select: () ->

    # Behaviours

    @behaviour:

        fetch:
            'ajax': '',
            'array': '',
            'data-list': '',
            'element': ''

        filter:
            'startswith': ''
            'contains': ''

        highlight:
            'default': ''

        sort:
            'default': ''

        convert:
            'default': ''

        template:
            'default': ''

    # # Standard events
    # select
    # selectcomplete
    # open
    # close
    # highlight (change)


module.exports = {Typeahead: Typeahead}