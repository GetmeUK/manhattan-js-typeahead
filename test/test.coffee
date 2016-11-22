# Imports

chai = require 'chai'
jsdom = require 'mocha-jsdom'
sinon = require 'sinon'
sinonChai = require 'sinon-chai'

$ = require 'manhattan-essentials'
Typeahead = require('../src/scripts/typeahead').Typeahead


# Set up

should = chai.should()
chai.use(sinonChai)


# Tests

describe 'Typeahead (class)', ->

    jsdom()

    form = null
    input = null
    typeahead = null

    before ->
        # Build a form with an input field
        form = $.create('form')
        input = $.create('input', {'data-mh-typeahead': true})
        input.getBoundingClientRect = ->
            return {
                bottom: 20,
                height: 10,
                left: 10,
                right: 110,
                top: 10,
                width: 100
                }

        document.body.appendChild(form)
        form.appendChild(input)

        # Initialize a typeahead for the input field
        typeahead = new Typeahead(input, {
            coerce: 'single-value',
            list: [
                'CoffeeScript',
                'Java',
                'JavaScript',
                'Lua',
                'MoonScript',
                'Perl',
                'PHP',
                'Python',
                'Ruby'
                ]
            })

    describe 'constructor', ->

        it 'should generate a new `Typeahead` instance', ->

            typeahead.should.be.an.instanceof Typeahead

        it 'should disable autocomplete against the input', ->

            input.getAttribute('autocomplete').should.equal 'off'

        it 'should add the suggestions element to the body', ->

            $.one('.mh-typeahead', document.body).should.exist

    describe 'clearCache', ->

        before ->
            # Populate the cache artificially
            typeahead.toCache('test', 'foo', 'bar')

        it 'should clear the cache', ->

            typeahead.clearCache()
            should.not.exist(typeahead.fromCache('test', 'foo'))

    describe 'close', ->

        beforeEach ->
            # Set the content of input in order to open the typeahead
            input.value = 'Ja'
            $.dispatch(input, 'input')

        it 'should flag the typeahead as closed', ->

            typeahead.close()
            typeahead.isOpen.should.be.false

        it 'should add a closed CSS class to the typehead', ->

            typeahead.close()
            suggestionsDom = typeahead._dom.suggestions
            closed = typeahead._bem('mh-typeahead', '', 'closed')
            suggestionsDom.classList.contains(closed).should.be.true

        it 'should dispatch a close event against the input', ->

            listener = sinon.spy()
            input.addEventListener('mh-typeahead--close', listener)
            typeahead.close('test')
            listener.should.have.been.calledOn input

            ev = listener.args[0][0]
            ev.reason.should.equal 'test'

    describe 'fromCache', ->

        before ->
            # Populate the cache artificially
            typeahead.toCache('test', 'foo', 'bar')

        it 'should return a cached value', ->

            typeahead.fromCache('test', 'foo').should.equal 'bar'

    describe 'next', ->

        before ->
            # Set the content of input in order to populate the suggestions list
            input.value = 'Ja'
            $.dispatch(input, 'input')

        it 'should focus the next suggestion in the list', ->

            # Select the first value
            typeahead.next()
            typeahead.index.should.equal 0

            # Select the next and last value
            typeahead.next()
            typeahead.index.should.equal 1

            # Wrap round and select the first value
            typeahead.next()
            typeahead.index.should.equal 0

    describe 'open', ->

        beforeEach ->
            # Set the content of input in order to populate the suggestions list
            input.value = 'Ja'
            $.dispatch(input, 'input')

            # Close the typeahead so that we can open it
            typeahead.close()

        it 'should flag the typeahead as open', ->

            typeahead.open()
            typeahead.isOpen.should.be.true

        it 'should remove the closed CSS class from the typeahead', ->

            typeahead.open()
            suggestionsDom = typeahead._dom.suggestions
            closed = typeahead._bem('mh-typeahead', '', 'closed')
            suggestionsDom.classList.contains(closed).should.be.false

        it 'should position the typeahead in-line with the input', ->

            typeahead.open()

            suggestionsDom = typeahead._dom.suggestions
            suggestionsDom.style.left.should.equal '10px'
            suggestionsDom.style.top.should.equal '20px'
            suggestionsDom.style.width.should.equal '100px'

        it 'should dispatch an open event against the input', ->

            listener = sinon.spy()
            input.addEventListener('mh-typeahead--open', listener)
            typeahead.open()
            listener.should.have.been.calledOn input

    describe 'previous', ->

        before ->
            # Set the content of input in order to populate the suggestions list
            input.value = 'Ja'
            $.dispatch(input, 'input')

        it 'should focus the previous suggestion in the list', ->

            # Select the last value
            typeahead.previous()
            typeahead.index.should.equal 1

            # Select the previous and first value
            typeahead.previous()
            typeahead.index.should.equal 0

            # Wrap round and select the last value
            typeahead.previous()
            typeahead.index.should.equal 1

    describe 'select', ->

        beforeEach ->
            # Set the content of input in order to populate the suggestions list
            input.value = 'Ja'
            $.dispatch(input, 'input')

        it 'should give focus to the indexed suggestion (if provided)', ->

            typeahead.select(1)
            typeahead.index.should.equal 1

        it 'should set the value against the input', ->

            typeahead.next()
            typeahead.select()
            input.value.should.equal 'Java'

        it 'should close the typeahead', ->

            typeahead.next()
            typeahead.select()
            typeahead.isOpen.should.be.false

        it 'should dispatch a select and selected event against the
            typeahead', ->

            selectListener = sinon.spy()
            selectedListener = sinon.spy()
            input.addEventListener('mh-typeahead--select', selectListener)
            input.addEventListener('mh-typeahead--selected', selectedListener)

            typeahead.next()
            typeahead.select()

            selectEv = selectListener.args[0][0]
            selectedEv = selectListener.args[0][0]

            selectListener.should.have.been.calledOn input
            selectEv.item.should.deep.equal {'value': 'Java', 'label': 'Java'}

            selectedListener.should.have.been.calledOn input
            selectedEv.item.should.deep.equal {'value': 'Java', 'label': 'Java'}

    describe 'toCache', ->

        it 'should store a value in the cache', ->

            typeahead.toCache('test', 'foo', 'bar')
            typeahead.fromCache('test', 'foo').should.equal 'bar'

    describe 'update', ->

        beforeEach ->
            typeahead.open()

        describe 'when input has no value', ->

            before ->
                input.value = ''

            it 'should close the typeahead', ->

                typeahead.update()
                typeahead.isOpen.should.be.false

            it 'should dispatch a close event against the input', ->

                listener = sinon.spy()
                input.addEventListener('mh-typeahead--close', listener)
                typeahead.update()
                listener.should.have.been.calledOn input

                ev = listener.args[0][0]
                ev.reason.should.equal 'no-matches'

        describe "when the input's value matches no items in the list", ->

            before ->
                # Set the content of input with a value that wont match any
                # items.
                input.value = 'boo'

            it 'should close the typeahead', ->

                typeahead.update()
                typeahead.isOpen.should.be.false

            it 'should dispatch a close event against the input', ->

                listener = sinon.spy()
                input.addEventListener('mh-typeahead--close', listener)
                typeahead.update()
                listener.should.have.been.calledOn input

                ev = listener.args[0][0]
                ev.reason.should.equal 'no-matches'

        describe "when the input's value matches items in the list", ->

            before ->
                # Set the content of input in order to populate the suggestions
                # list
                input.value = 'Ja'

            it "should populate the typeahead's list of suggestions", ->

                typeahead.update()

                typeahead._suggestions.should.deep.equal [
                    {value: 'Java', label: 'Java'},
                    {value: 'JavaScript', label: 'JavaScript'}
                    ]
                typeahead._dom.suggestions.childNodes.length.should.equal 2


describe 'Typeahead (options)', ->

    jsdom()

    form = null
    input = null
    list = [
        'CoffeeScript',
        'Java',
        'JavaScript',
        'Lua',
        'MoonScript',
        'Perl',
        'PHP',
        'Python',
        'Ruby'
        ]
    typeahead = null

    before ->
        # Build a form with an input field
        form = $.create('form')
        input = $.create('input', {'data-mh-typeahead': true})
        document.body.appendChild(form)
        form.appendChild(input)

    describe 'autoFirst', ->

        describe 'when true', ->

            before ->
                typeahead = new Typeahead(input, {
                    autoFirst: true,
                    coerce: 'single-value',
                    list: list
                    })

            it 'should automatically select the first suggestion when opened', ->

                input.value = 'Ja'
                $.dispatch(input, 'input')

                typeahead.index.should.equal 0

    describe 'list', ->

        describe 'when an array', ->

            before ->
                typeahead = new Typeahead(input, {
                    coerce: 'single-value',
                    list: list
                    })

            it 'should set the fetch behaviour as array', ->

                typeahead._behaviours.fetch.should.equal 'array'

        describe 'when a string', ->

            before ->
                typeahead = new Typeahead(input, {
                    coerce: 'single-value',
                    list: list.join(',')
                    })

            it 'should set the fetch behaviour as string', ->

                typeahead._behaviours.fetch.should.equal 'string'

        describe 'when an Id', ->

            before ->
                typeahead = new Typeahead(input, {
                    coerce: 'single-value',
                    list: '#test'
                    })

            it 'should set the fetch behaviour as element', ->

                typeahead._behaviours.fetch.should.equal 'data-list'

    describe 'maxItems', ->

        before ->
            typeahead = new Typeahead(input, {
                coerce: 'single-value',
                list: list,
                maxItems: 1
                })

            # Set the content of input in order to open the typeahead
            input.value = 'Ja'
            $.dispatch(input, 'input')

        describe 'when 1', ->

            it 'should limit the number of items displayed as suggestions to
                1', ->

                typeahead._suggestions.length.should.equal 1

    describe 'minChars', ->

        describe 'when 3', ->

            before ->
                typeahead = new Typeahead(input, {
                    coerce: 'single-value',
                    list: list,
                    minChars: 3
                    })

            it 'should set the minimum number of characters required to trigger a
                search for matching items to 3', ->

                input.value = 'Ja'
                $.dispatch(input, 'input')
                typeahead.isOpen.should.be.false

                input.value = 'Jav'
                $.dispatch(input, 'input')
                typeahead.isOpen.should.be.true

    describe 'mustMatch', ->

        describe 'when true', ->

            before ->
                typeahead = new Typeahead(input, {
                    autoFirst: true,
                    coerce: 'single-value',
                    list: list,
                    mustMatch: true
                    })

            it 'should automatically select the first suggestion when tabbing
                away from the field', ->

                input.value = 'Ja'
                $.dispatch(input, 'input')
                $.dispatch(input, 'keydown', {keyCode: 9})

                input.value.should.equal 'Java'

    describe 'rootTag', ->

        describe 'when p', ->

            before ->
                typeahead = new Typeahead(input, {
                    coerce: 'single-value',
                    list: list,
                    rootTag: 'p'
                    })

            it 'should use a paragraph tag (<p>) to implement the typeahead
                component', ->

                tagName = typeahead._dom.suggestions.tagName.toLowerCase()
                tagName.should.equal 'p'


describe 'Typeahead (behaviours)', ->

    jsdom()

    typeahead = null

    before ->
        form = $.create('form')
        input = $.create('input', {'data-mh-typeahead': true})
        document.body.appendChild(form)
        form.appendChild(input)
        typeahead = new Typeahead(input)

    describe 'coerce', ->

        describe 'pass-through', ->

            it 'should return the item passed unchanged', ->

                behaviour = Typeahead.behaviours.coerce['pass-through']
                result = behaviour(typeahead, {label: 'foo', value: 'bar'})
                result.should.deep.equal {label: 'foo', value: 'bar'}

        describe 'single-value', ->

            it 'should return an item where the label and value are both the
                value passed', ->

                behaviour = Typeahead.behaviours.coerce['single-value']
                result = behaviour(typeahead, 'foo')
                result.should.deep.equal {label: 'foo', value: 'foo'}

    describe 'element', ->

        describe 'default', ->

            it 'should return an DOM element representing the item as a
                suggestion', ->

                behaviour = Typeahead.behaviours.element['default']
                result = behaviour(
                    typeahead,
                    {label: 'foo', value: 'foo'},
                    'fo'
                    )

                result.outerHTML.should.equal(
                    '<div class="mh-typeahead__suggestion">' +
                        '<mark>fo</mark>o' +
                    '</div>'
                    )

    describe 'fetch', ->

        describe 'ajax', ->

            requests = []

            before ->
                window.XMLHttpRequest = sinon.useFakeXMLHttpRequest()
                global.XMLHttpRequest = window.XMLHttpRequest
                window.XMLHttpRequest.onCreate = (xhr) ->
                    requests.push(xhr)

            after ->
                window.XMLHttpRequest.restore()
                requests = []

            it 'should request the list using an AJAX request', ->

                callback = sinon.spy()
                behaviour = Typeahead.behaviours.fetch['ajax']
                behaviour(typeahead, '/foo', 'fo', callback)
                requests[0].respond(200,
                    {'Content-Type': 'application/json'},
                    JSON.stringify({
                        'status': 'success',
                        'payload': {'items': ['foo', 'foobar']}
                        })
                    )
                callback.should.have.been.called

                list = callback.args[0][0]
                list.should.deep.equal ['foo', 'foobar']

                # Check the result was cached
                typeahead.fromCache('ajax', 'fo').should.deep.equal(
                    ['foo', 'foobar']
                    )

            it 'should use the cache for subsequent requets', ->

                callback = sinon.spy()
                behaviour = Typeahead.behaviours.fetch['ajax']
                behaviour(typeahead, '/foo', 'fo', callback)
                callback.should.have.been.called

                list = callback.args[0][0]
                list.should.deep.equal ['foo', 'foobar']

        describe 'array', ->

            callback = sinon.spy()
            behaviour = Typeahead.behaviours.fetch['array']



# @@ Behaviours
    # - fetch
        # - array
        # - data-list
        # - element
        # - string
    # - filter
        # - contains
        # - startswith
    # - input
        # - set-hidden
        # - set-value
    # - sort
        # - length