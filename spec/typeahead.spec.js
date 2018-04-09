import * as chai from 'chai'
import * as sinon from 'sinon'

import * as setup from './setup.js'
import * as $ from 'manhattan-essentials'
import {Typeahead} from '../module/typeahead.js'

chai.should()
chai.use(require('sinon-chai'))


describe('Typeahead', () => {

    let inputElm = null

    beforeEach(() => {
        inputElm = $.create('input')
        document.body.appendChild(inputElm)
    })

    afterEach(() => {
        document.body.removeChild(inputElm)
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

            it('should return the suggestion that has focus', (done) => {

                inputElm.value = 'fo'
                $.dispatch(inputElm, 'input')

                function test() {
                    typeahead._focus(0)
                    typeahead.focused.should.deep.equal({
                        'label': 'foo',
                        'value': 'foo'
                    })
                    done()
                }
                setTimeout(test, 0)

            })

            it('should return null if no suggestion has focus', () => {
                chai.expect(typeahead.focused).to.be.null
            })

        })

    })
})


// input
// isOpen
// suggestionCount
// suggestions
// typeahead
