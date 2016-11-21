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

        it 'should trigger a close event against the typeahead', ->

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