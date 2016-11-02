slice = Array.prototype.slice

$ = (selectors, container=document) ->
    # Select an element from a container using the given CSS selectors
    return container.querySelector(selectors)

$$ = (selectors, container=document) ->
    # Select elements from a container using the given CSS selectors
    return slice.call(container.querySelectorAll(expr))


class Typeahead

    # A class that provides 'typeahead' behaviour for form fields.

