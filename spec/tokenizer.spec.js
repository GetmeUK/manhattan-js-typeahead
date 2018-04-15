import * as chai from 'chai'
import * as sinon from 'sinon'

import * as setup from './setup.js'
import * as $ from 'manhattan-essentials'
import {Tokenizer} from '../module/tokenizer.js'

require('babel-polyfill')
chai.should()
chai.use(require('sinon-chai'))


describe('Tokenizer', () => {

    let inputElm = null
    let hiddenInputElm = null
    let otherInputElm = null
    let otherHiddenInputElm = null

    beforeEach(() => {
        inputElm = $.create('input')
        document.body.appendChild(inputElm)

        hiddenInputElm = $.create('input', {'name': 'hidden-field'})
        document.body.appendChild(hiddenInputElm)

        otherInputElm = $.create('input')
        document.body.appendChild(otherInputElm)

        otherHiddenInputElm = $.create(
            'input', 
            {'name': 'other-hidden-field'}
        )
        document.body.appendChild(otherHiddenInputElm)
    })

    afterEach(() => {
        document.body.removeChild(inputElm)
        document.body.removeChild(hiddenInputElm)
        document.body.removeChild(otherInputElm)
        document.body.removeChild(otherHiddenInputElm)
    })

    describe('constructor', () => {
        it('should generate a new `Tokenizer` instance', () => {
            const tokenizer = new Tokenizer(inputElm)
            tokenizer.should.be.an.instanceof(Tokenizer)
        })
    })

    describe('getters & setters', () => {
        let tokenizer = null

        beforeEach(() => {
            tokenizer = new Tokenizer(
                inputElm, 
                {'hiddenSelector': '[name="hidden-field"]'}
            )
            tokenizer.init()
        })

        afterEach(() => {
            tokenizer.destroy()
        })

        describe('input', () => {
            it('should return the input element for the tokenizer', () => {
                tokenizer.input.should.equal(inputElm)
            })
        })

        describe('tokenizer', () => {
            it('should return the tokenizer element for the '
                + 'tokenizer', () => {

                tokenizer.tokenizer
                    .classList
                    .contains(Tokenizer.css['tokenizer'])
                    .should
                    .be
                    .true
            })
        })

        describe('tokens', () => {

            beforeEach(() => {
                tokenizer.addToken({'label': 'foo', 'value': 'foo'})
                tokenizer.addToken({'label': 'bar', 'value': 'bar'})
            })

            it('should return a list of tokens added to the ' 
                + 'typeahead', () => {

                tokenizer.tokens.should.deep.equal([
                    {'label': 'foo', 'value': 'foo'},
                    {'label': 'bar', 'value': 'bar'}
                ])
            })
        })
    })
})
