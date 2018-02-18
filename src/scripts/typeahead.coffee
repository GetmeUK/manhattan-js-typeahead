$ = require 'manhattan-essentials'


class Typeahead

    # A class that provides 'typeahead' behaviour for form fields.

    # The prefix that identifies attributes used to configure the plugin
    @clsPrefix: 'data-mh-typeahead--'

    constructor: (input, options={}) ->

        # Configure the instance
        $.config(
            this,
            {
                # If `true` then the first suggestion will be selected by
                # default when the typeahead is open.
                autoFirst: false,

                # The data source
                list: [],

                # The maxium number of suggestions the typeahead will display
                maxItems: 10,

                # The minimum number of characters the user must enter before
                # the typeahead will display suggestions.
                minChars: 2,

                # If `true` then only a suggested value can be selected
                mustMatch: false,

                # The tag that will be used when mounting the typeahead to the
                # DOM.
                rootTag: 'div'
            },
            options,
            input,
            @constructor.clsPrefix
            )

        # Set up and configure behaviours
        @_behaviours = {}

        # Set the default filter based on data list
        fetch = 'array'
        if typeof @list is 'string'
            if @list[0] == '#'
                fetch = 'data-list'
            else
                fetch = 'string'

        $.config(
            @_behaviours,
            {
                coerce: 'pass-through',
                element: 'default',
                fetch: fetch,
                filter: 'startswith',
                input: 'set-value',
                sort: 'length'
            },
            options,
            input,
            @constructor.clsPrefix
            )

        # Provide a read-only publicly accessible property for the input

        # The index of the currently select item
        @_index = -1

        # Flag indicating if the typeahead is currently open
        @_isOpen = false

        # A cache of items fetched (specific to each fetch behaviour)
        @_cache = null

        # Domain for related DOM elements
        @_dom = {}

        # Store a reference to the input the typeahead is being applied to (we
        # also store a reverse reference to this instance against the input).
        @_dom.input = input
        @_dom.input.__mh_typeahead = this

        # Build the elements required for the typeahead
        @_dom.suggestions = $.create(
            @rootTag,
            {
                'class': [
                    @_bem('mh-typeahead'),
                    @_bem('mh-typeahead', '', 'closed')
                    ].join(' ')
            }
        )
        document.body.appendChild(@_dom.suggestions)

        # Turn off autocomplete for the input
        @_dom.input.setAttribute('autocomplete', 'off')

        # Define read-only properties
        Object.defineProperty(this, 'index', {get: () => return @_index})
        Object.defineProperty(this, 'input', {value: @_dom.input})
        Object.defineProperty(this, 'isOpen', {get: () => return @_isOpen})

        # Set up event listeners for the typeahead
        $.listen @_dom.input,
            'blur': () => @close('blur')
            'input': () => @update()
            'keydown': (ev) =>
                if not @isOpen
                    return

                switch (ev.keyCode)

                    when 9 # Tab
                        if @mustMatch
                            @select()

                    when 13 # Enter
                        if @index > -1
                            ev.preventDefault()
                            @select()

                    when 27 # Esc
                        @close('esc')

                    when 38 # Up arrow
                        ev.preventDefault()
                        @previous()

                    when 40 # Down arrow
                        ev.preventDefault()
                        @next()

        $.listen @_dom.suggestions,
            'mousedown': (ev) =>
                # We're only interested in mouse events against suggestions
                if ev.target ==  @_dom.suggestions
                    return

                # The user must have used the left mouse button
                if ev.button isnt 0
                    return
                ev.preventDefault()

                # Find the parent item
                suggestion = ev.target
                while suggestion.parentNode isnt @_dom.suggestions
                    suggestion = suggestion.parentNode

                # Find the index of the suggestion and use it to select it
                index = Array.prototype.indexOf.call(
                    @_dom.suggestions.children,
                    suggestion
                    )
                @select(index)

        $.listen window,
            'fullscreenchange orientationchange resize': (ev) =>
                # We close the typeahead if the window is resized
                if @isOpen
                    @close('resize')

    # Public methods

    clear: () ->
        # Clear the value
        @constructor.behaviours.input[@_behaviours.input](this, null)

        # Dispatch a clear event
        $.dispatch(@input, @_et('clear'))

    clearCache: () ->
        # Clear the item cache
        @_cache = null

    close: (reason) ->
        # Close the typeahead. Closing the typeahead will dispatch a close event
        # against the input element which will include the reason for the close.

        # Check the typeahead is open (otherwise there's nothing for us to do)
        if not @isOpen
            return

        # Hide the typeahead visually
        @_dom.suggestions.classList.add(@_bem('mh-typeahead', '', 'closed'))

        # Flag the typeahead as closed
        @_isOpen = false

        # Set the index so that no item is selected
        @index = -1

        # Dispatch a close event
        $.dispatch(@input, @_et('close'), {'reason': reason})

    fromCache: (namespace, key) ->
        # Return any value in the cache under the given namespace and key
        if not @_cache or not @_cache[namespace]
            return
        return @_cache[namespace][key]

    next: () ->
        # Select the item after the currently selected item
        suggestionCount = @_suggestions.length

        # Check there's an item to select, if not there's nothing more to do
        if suggestionCount is 0
            return

        # Check if the currently selected item is the last item in the list, if
        # so we wrap around to the first item in the list.
        if @index >= (suggestionCount - 1)
            return @_goto(0)

        # Select the item after the currently selected item
        @_goto(@index + 1)

    open: () ->
        # Open the typeahead. Opening the typeahead will dispatch an open event
        # against the input element.

        # Track the position of the typeahead inline with the input
        @_track()

        # Display the typeahead visually
        @_dom.suggestions.classList.remove(@_bem('mh-typeahead', '', 'closed'))

        # Flag the typeahead as open
        @_isOpen = true

        # If configured so, automatically select the first item if no other item
        # is currently selected.
        if @autoFirst and @index == -1
            @_goto(0)

        # Dispatch an open event
        $.dispatch(@input, @_et('open'))

    previous: () ->
        # Select the item before the currently selected item
        suggestionCount = @_suggestions.length

        # Check there's an item to select, if not there's nothing more to do
        if suggestionCount is 0
            return

        # Check if the currently selected item is the first item in the list, if
        # so we wrap around to the last item in the list.
        if @index <= 0
            return @_goto(suggestionCount - 1)

        # Select the item before the currently selected item
        @_goto(@index - 1)

    select: (index) ->
        # Select an item from the suggestions. Optional the index of the
        # suggestion to select can be specified, by default the currently
        # selected suggestion is selected.

        # If an index has been provided (and it's not the same as the current
        # index) then set it.
        if index isnt undefined and index != @index
            @_goto(index)

        if @index > -1
            suggestion = @_suggestions[@index]

            # Dispatch a select event for the suggestion (if the event is
            # prevented then
            if not $.dispatch(@input, @_et('select'), {'item': suggestion})
                return

            # Set the value against the input
            @constructor.behaviours.input[@_behaviours.input](this, suggestion)

            # Hide the suggestions
            @close('select')

            # Dispatch a selected event for the suggestion
            $.dispatch(@input, @_et('selected'), {'item': suggestion})

    toCache: (namespace, key, value) ->
        # Add a value to the cache for the given namespace and cache
        if not @_cache
            @_cache = {}

        if not @_cache[namespace]
            @_cache[namespace] = {}

        @_cache[namespace][key] = value

    update: () ->
        # Update the list of suggestions

        # Clear the current set of suggestions from the DOM
        while @_dom.suggestions.firstChild
            @_dom.suggestions.removeChild(@_dom.suggestions.firstChild)

        # Get the value the user has entered to query against
        q = @input.value.trim()

        # Check if input is empty
        unless @input.value.trim()
            @clear()

        # Check if there's enough characters to search
        if q.length < @minChars
            return @close('no-matches')

        # Fetching the list of items maybe an asynchronous process and therefore
        # we need to define what happens after the items are fetched in a
        # separate function.
        _update = (items) =>
            if items.length is 0
                return @close('no-matches')

            # Coerce the items fetched into the required format for the
            # behaviours that follow.
            coerce = @constructor.behaviours.coerce[@_behaviours.coerce]
            items = items.map (item) =>
                return coerce(this, item)

            # Filter the items to suggestions that match the user's query
            filter = @constructor.behaviours.filter[@_behaviours.filter]
            items = items.filter (item) =>
                return filter(this, item, q)

            # Sort the items so the best matching appear first
            sort = @constructor.behaviours.sort[@_behaviours.sort]
            items = items.sort (a, b) =>
                return sort(this, q, a, b)

            # Limit the list to the maximum number of items
            items = items.slice(0, @maxItems)

            # Update the suggestions
            @_suggestions = items

            # Unselect any previously selected suggestion
            @_index = -1

            # If there are suggestions for the user to pick from then add
            # them to the DOM and show them.
            if @_suggestions.length is 0
                return @close('no-matches')

            element = @constructor.behaviours.element[@_behaviours.element]
            for suggestion in @_suggestions
                @_dom.suggestions.appendChild(
                    element(this, suggestion, q)
                    )
            @open()

        # Fetch items to build our suggestions from
        fetch = @constructor.behaviours.fetch[@_behaviours.fetch]
        fetch(this, @list, q, _update)

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
        # Set the currently focused item index

        # If there is an item that currently has focus unflag it
        focusedClass = @_bem('mh-typeahead', 'suggestion', 'focused')
        focused = $.one('.' + focusedClass)
        if focused
            focused.classList.remove(focusedClass)

        # Update the index of the selected item
        @_index = index

        # If an item was focused...
        if index > -1 and @_suggestions.length > 0
            # Flag the focused item as having focus
            suggestion = @_dom.suggestions.children[index]
            suggestion.classList.add(focusedClass)

            # Dispatch a focus event against the input
            $.dispatch(@input, @_et('focus'), {item: @_suggestions[index]})

    _track: () ->
        # Position and size the typeahead inline with the input

        # Get the position of the input
        rect = @_dom.input.getBoundingClientRect()
        top = rect.top += window.scrollY
        left = rect.left += window.scrollX

        # Position the typeahead
        @_dom.suggestions.style.top = "#{top + rect.height}px"
        @_dom.suggestions.style.left = "#{left}px"
        @_dom.suggestions.style.width = "#{rect.width}px"

    # Behaviours

    @behaviours:

        # The `coerce` behaviour is used to convert fetched items to a suitable
        # objects for the remainder of the process (fitler > sort > element)
        coerce:
            'pass-through': (typeahead, item) ->
                # Pass-through (no coercion)
                return item

            'single-value': (typeahead, item) ->
                # Coerce a single value into an item setting both the item's
                # label and value to the value.
                return {value: item, label: item}

        # The `element` behaviour is used to create an element that will be
        # displayed as a suggestion in the typeahead.
        element:
            'default': (typeahead, item, q) ->
                # Return an element representing the item as a suggestion in the
                # typeahead.
                li = $.create(
                    'div',
                    {'class': typeahead._bem('mh-typeahead', 'suggestion')}
                    )

                # Highlight the matching portion of the label
                li.innerHTML = item.label.replace(
                    RegExp($.escapeRegExp(q), 'gi'),
                    '<mark>$&</mark>'
                    )
                return li

        # The `fetch` behaviour is used to retreive the list of items that will
        # form the suggestions.
        fetch:
            'ajax': (typeahead, url, q, callback) ->
                # Fetch items from the specified URL using

                # Check the cache first
                cacheKey = q.substr(0, typeahead.minChars).toLowerCase()
                cached = typeahead.fromCache('ajax', cacheKey)
                if cached
                    return callback(cached)

                # Add the query to the URL
                parts = url.split('?')
                if parts.length == 1
                    url = "#{url}?q=#{q}"
                else
                    url = "#{url}&q=#{q}"

                # Set up the request
                xhr = new XMLHttpRequest()
                xhr.addEventListener 'load', (ev) ->

                    # Extract the items from the JSON response
                    response = JSON.parse(ev.target.responseText)

                    if response.status == 'success'
                        items = response.payload.items
                        typeahead.toCache('ajax', cacheKey, items)
                        callback(items)
                    else
                        callback([])

                # Send the request
                xhr.open('GET', url)
                xhr.send(null)

            'array': (typeahead, array, q, callback) ->
                # Return the array (nothing to fetch)
                callback(array)

            'data-list': (typeahead, list, q, callback) ->
                # Fetch the items from the specified data-list
                dataList = $.one(list)
                options = $.many('option', dataList)
                items = []
                for option in options
                    item = {}
                    if option.textContent
                        item.label = option.textContent.trim()
                        item.value = option.textContent.trim()
                    if option.value
                        if not item.label
                            item.label = option.value.trim()
                        item.value = option.value.trim()
                    items.push(item)
                callback(items)

            'element': (typeahead, selector, q, callback) ->
                # Fetch the items from the elements selected with the selector
                elements = $.many(selector)
                values = (e.textContent for e in elements)
                items = ({label: v.trim(), value: v.trim()} for v in values)
                callback(items)

            'string': (typeahead, s, q, callback) ->
                # Fetch the items by splitting a comma separated string
                values = s.split(',').filter (value) ->
                    return value.trim().length > 0
                items = ({label: v.trim(), value: v.trim()} for v in values)
                callback(items)

        # The `filter` behaviour is used to filter suggestions from the fetched
        # items by the given query.
        filter:
            'contains': (typeahead, item, q) ->
                # Return true if the items value contains the query
                match = item.value.toLowerCase()
                return match.indexOf(q.toLowerCase()) > -1

            'startswith': (typeahead, item, q) ->
                # Return true if the items value starts with the query
                match = item.value.toLowerCase().substr(0, q.length)
                return q.toLowerCase() == match

        # The `input` behaviour is used to set the value of the input when an
        # item is selected.
        input:
            'set-hidden': (typeahead, item) ->
                # Set the value of the input to the item's label and the value
                # of the associated hidden field to the item's Id or value if
                # no Id is present.
                #
                # The associated hidden field should be set using a CSS selector
                # defined in the `data-mh-typeahead--hidden` attribute against
                # the input field.
                if item is null
                    typeahead.input.value = ''
                else
                    typeahead.input.value = item.label

                # Find the associated hidden field
                hiddenSelector = typeahead.input.getAttribute(
                    "#{typeahead.constructor.clsPrefix}hidden"
                    )
                hidden = $.one(hiddenSelector)

                # Set the hidden fields value
                if item is null
                    hidden.value = ''
                else
                    hidden.value = item.id or item.value

            'set-value': (typeahead, item) ->
                # Set the value of the input to that of the item's Id or value
                # if no Id is present.
                if item is null
                    typeahead.input.value = ''
                else
                    typeahead.input.value = item.id or item.value

        # The `sort` behaviour sorts items by their relevance to the user's
        # query.
        sort:
            'length': (typeahead, q, a, b) ->
                # Sort the items by startswith, then contains, then string
                # length.

                # Check starts vs. contains first
                q = q.toLowerCase()
                aStarts = q is a.value.substr(0, q.length).toLowerCase()
                bStarts = q is b.value.substr(0, q.length).toLowerCase()

                if aStarts and not bStarts
                    return -1
                else if bStarts and not aStarts
                    return 1

                # If no difference from starts vs. contains sort by length
                if a.value.length isnt b.value.length
                    if a.value.length < b.value.length
                        return -1
                    return 1

                # If no difference in length then sort alphabetically
                return if a.value < b.value then -1 else 1


module.exports = {Typeahead: Typeahead}
