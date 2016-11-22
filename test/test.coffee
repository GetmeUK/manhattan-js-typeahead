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

describe 'Typeahead', ->

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
                input.value = 'Ja'

            it "should populate the typeahead's list of suggestions", ->

                typeahead.update()

                typeahead._suggestions.should.deep.equal [
                    {value: 'Java', label: 'Java'},
                    {value: 'JavaScript', label: 'JavaScript'}
                    ]
                typeahead._dom.suggestions.childNodes.length.should.equal 2


# @@ Configurations
    # - autoFirst
    # - list
    # - maxItems
    # - minChars
    # - mustMatch
    # - rootTag

# @@ Behaviours
    # - coerce
        # - pass-through
        # - single-value
    # - element
        # - default
    # - fetch
        # - ajax
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