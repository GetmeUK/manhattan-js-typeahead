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
        @_dom = {}
        @_dom.input = input
        @_dom.input.__mh_typeahead = this

        # Provide a read-only publicly accessible property for the input

        # The index of the currently select item
        @_index = -1

        # Flag indicating if the typeahead is currently open
        @_isOpen = false

        # Build the elements required for the typeahead
        @_dom.suggestions = $.create(
            'ol',
            {
                'class': [
                    @_bem('mh-typeahead'),
                    @_bem('mh-typeahead', '', 'closed')
                    ].join(' ')
            }
        )
        document.body.appendChild(@_dom.suggestions)

        # Set up event listeners for the typeahead
        $.listen @_dom.input,
            'blur': () => @close('blur')
            'input': () =>
                console.log this, 'input'

            'keydown': () =>
                console.log this, 'keydown'

        # Define read-only properties
        Object.defineProperty(this, 'index', {value: @_index})
        Object.defineProperty(this, 'input', {value: @_input})
        Object.defineProperty(this, 'isOpen', {value: @_isOpen})

    # Public methods

    close: (reason) ->
        # Close the typeahead. Closing the typeahead will dispatch a close event
        # against the input element which will include the reason for the close.

        # Check the typeahead is open (otherwise there's nothing for us to do)
        if not @isOpen
            return

        # Hide the typeahead visually
        @_dom.suggestions.addClass(@_bem('mh-typeahead', '', 'closed'))

        # Flag the typeahead as closed
        @_isOpen = false

        # Set the index so that no item is selected
        @index = -1

        # Dispatch a close event
        $.dispatch(@_dom.input, @_et('close'), {'reason': reason})

    next: () ->
        # Select the item after the currently selected item
        suggestionCount = @_dom.suggestions.children.length

        # Check there's an item to select, if not there's nothing more to do
        if suggestionCount is 0
            return

        # Check if the currently selected item is the last item in the list, if
        # so we wrap around to the first item in the list.
        if @index is (suggestionCount - 1)
            return @_goto(0)

        # Select the item after the currently selected item
        @_goto(self.index + 1)

    open: () ->
        # Open the typeahead. Opening the typeahead will dispatch an open event
        # against the input element.

        # Display the typeahead visually
        @_dom.suggestions.removeClass(@_bem('mh-typeahead', '', 'closed'))

        # Flag the typeahead as open
        @_isOpen = true

        # If configured so, automatically select the first item if no other item
        # is currently selected.
        if @autoFirst and @index == -1
            @_goto(0)

        # Dispatch an open event
        $.dispatch(@_dom.input, @_et('open'))

    previous: () ->
        # Select the item before the currently selected item
        suggestionCount = @_dom.suggestions.children.length

        # Check there's an item to select, if not there's nothing more to do
        if suggestionCount is 0
            return

        # Check if the currently selected item is the first item in the list, if
        # so we wrap around to the last item in the list.
        if @index == 0
            @_goto(suggestionCount - 1)

        # Select the item before the currently selected item
        @_goto(self.index - 1)

    refresh: () ->
        # evalutate

    select: () ->
        # Select an item from the suggestions

    # Private methods

    _bem: (block, element='', modifier='') ->
        # Build and return a class name
        name = block
        if element
            name = "#{name}__#{element}"
        if modifier
            name = "#{name}--#{modifier}"
        return name

    _et: (eventName) ->
        # Generate an event type name
        return "mh-typeahead--#{eventName}"

    _goto: (index) ->
        # Set the currently selected item index
        suggestions = @_dom.suggestions.children

        # Update the index of the selected item
        @_index = index

        if index > -1 and items.length > 0
            $.dispatch(@_dom.input, @_et('focus'), {item: @_suggestions[index]})

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


module.exports = {Typeahead: Typeahead}