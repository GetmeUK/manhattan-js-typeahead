import * as chai from 'chai'
import * as sinon from 'sinon'

import * as setup from './setup.js'
import * as $ from 'manhattan-essentials'
import {Typeahead} from '../module/typeahead.js'

require('babel-polyfill')
chai.should()
chai.use(require('sinon-chai'))


describe('Typeahead', () => {

    let inputElm = null
    let otherInputElm = null

    beforeEach(() => {
        inputElm = $.create('input')
        document.body.appendChild(inputElm)

        otherInputElm = $.create('input')
        document.body.appendChild(otherInputElm)
    })

    afterEach(() => {
        document.body.removeChild(inputElm)
        document.body.removeChild(otherInputElm)
    })

    describe('constructor', () => {
        it('should generate a new `Typeahead` instance', () => {
            const typeahead = new Typeahead(inputElm)
            typeahead.should.be.an.instanceof(Typeahead)
        })
    })

    describe('getters & setters', () => {
        let typeahead = null

        beforeEach(() => {
            typeahead = new Typeahead(
                inputElm,
                {
                    'coerce': 'valueOnly',
                    'list': ['foo', 'bar']
                }
            )
            typeahead.init()
        })

        afterEach(() => {
            typeahead.destroy()
        })

        describe('focused', () => {
            it('should return the suggestion that has focus', async () => {

                await typeahead.update('fo')

                typeahead.focus(0)
                typeahead.focused.should.deep.equal({
                    'label': 'foo',
                    'value': 'foo'
                })
            })
            it('should return null if no suggestion has focus', () => {
                chai.expect(typeahead.focused).to.be.null
            })
        })

        describe('index', () => {
            it('should return the index of the currently focused '
                + 'suggestion', async () => {

                await typeahead.update('fo')

                typeahead.focus(0)
                typeahead.index.should.equal(0)
            })
        })

        describe('input', () => {
            it('should return the input element for the typeahead', () => {
                typeahead.input.should.equal(inputElm)
            })
        })

        describe('isOpen', () => {
            it('should return the input element for the '
                + 'typeahead', async () => {

                await typeahead.update('fo')
                typeahead.close()

                typeahead.isOpen.should.be.false

                typeahead.open()
                typeahead.isOpen.should.be.true
            })
        })

        describe('suggestionCount', () => {
            it('should return the number of suggestions for the current '
                + 'query', async () => {

                await typeahead.update('fo')

                typeahead.suggestionCount.should.equal(1)
            })
        })

        describe('suggestions', () => {
            it('should return the list of suggestions for the current '
                + 'query', async () => {

                await typeahead.update('fo')

                typeahead.suggestions.should.deep.equal([{
                    'label': 'foo',
                    'value': 'foo'
                }])
            })
        })

        describe('typeahead', () => {
            it('should return the typeahead element for the '
                + 'typeahead', () => {

                typeahead.typeahead
                    .classList
                    .contains(Typeahead.css['typeahead'])
                    .should
                    .be
                    .true
            })
        })
    })

    describe('public methods', () => {
        let typeahead = null

        beforeEach(() => {
            typeahead = new Typeahead(
                inputElm,
                {
                    'coerce': 'valueOnly',
                    'list': ['foo', 'bar']
                }
            )
            typeahead.init()
        })

        afterEach(() => {
            typeahead.destroy()
        })

        describe('clear', () => {
            it('should clear any value from the typeahead', async () => {

                // Set a value
                await typeahead.update('fo')
                typeahead.select(0)

                // Clear it
                typeahead.clear()
                inputElm.value.should.equal('')

            })
        })

        describe('clearCache', () => {
            it('should clear any internal cache', () => {

                // Populate the cache (for the sake of simplicity we do this
                // manually).
                typeahead._cache = {'foo': 'bar'}

                // Clear the cache
                typeahead.clearCache()
                typeahead._cache.should.deep.equal({})

            })
        })

        describe('close', () => {
            it('should close the typeahead and trigger a closed '
                + 'event', () => {

            })

            it('should do nothing if the typeahead is already closed', () => {

            })
        })

    })
})

// destroy
// focus
// init
// next
// open
// previous
// select
// update
