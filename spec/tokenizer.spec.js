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

    describe('public methods', () => {
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

        describe('addToken', () => {

            it('should add a token to the list of tokens', () => {
                tokenizer.addToken({'label': 'foo', 'value': 'foo'})
                tokenizer.tokens.should.deep.equal([
                    {'label': 'foo', 'value': 'foo'}
                ])
            })

            it('should add a token element to the tokenizer element', () => {
                tokenizer.addToken({'label': 'foo', 'value': 'foo'})
                tokenizer.tokenizer.children.length.should.equal(1)
                tokenizer.tokenizer.children[0]._token.should.deep.equal({
                    'label': 'foo',
                    'value': 'foo'
                })
            })

            it('should trigger a tokenadded event', () => {
                const onTokenAdded = sinon.spy()
                $.listen(inputElm, {'tokenadded': onTokenAdded})
                tokenizer.addToken({'label': 'foo', 'value': 'foo'})
                onTokenAdded.should.have.been.called
            })

            it('should add a new token at the given index', () => {
                tokenizer.addToken({'label': 'foo', 'value': 'foo'})
                tokenizer.addToken({'label': 'bar', 'value': 'bar'})
                tokenizer.addToken({'label': 'zee', 'value': 'zee'}, 1)
                tokenizer.tokens.should.deep.equal([
                    {'label': 'foo', 'value': 'foo'},
                    {'label': 'zee', 'value': 'zee'},
                    {'label': 'bar', 'value': 'bar'}
                ])  
            })

            it('should not allow duplicates if the allowDuplicates option '
                + 'is false', () => {

                tokenizer.addToken({'label': 'foo', 'value': 'foo'})
                tokenizer.addToken({'label': 'foo', 'value': 'foo'})
                tokenizer.tokens.should.deep.equal([
                    {'label': 'foo', 'value': 'foo'}
                ])
            })

            describe('allowDuplicates', () => {
                
                beforeEach(() => {
                    tokenizer._options.allowDuplicates = true
                })

                afterEach(() => {
                    tokenizer._options.allowDuplicates = false
                })

                it('should allow duplicates if the allowDuplicates option is '
                    + 'true', () => {

                    tokenizer.addToken({'label': 'foo', 'value': 'foo'})
                    tokenizer.addToken({'label': 'foo', 'value': 'foo'})
                    tokenizer.tokens.should.deep.equal([
                        {'label': 'foo', 'value': 'foo'},
                        {'label': 'foo', 'value': 'foo'}
                    ])
                })
            })
        })

        describe('destroy', () => {

            beforeEach(() => {
                tokenizer.destroy()

                sinon.spy(tokenizer._handlers, 'add')
                sinon.spy(tokenizer._handlers, 'remove')
                sinon.spy(tokenizer._handlers, 'sort')

                tokenizer.init()
            })

            it('it should remove the tokenizer', () => {
                tokenizer.destroy()

                // Pressing a key while the input has focus should no longer
                // call the add event handler.
                $.dispatch(inputElm, 'keydown')
                tokenizer._handlers.add.should.not.have.been.called

                // Selecting a suggestion within the associated typeahead
                // shouldn't call the add event hander.
                $.dispatch(inputElm, 'selected')
                tokenizer._handlers.add.should.not.have.been.called

                // The tokenizer element should have been removed from the DOM
                $.many(`.${Tokenizer.css['tokenizer']}`)
                    .length
                    .should
                    .equal(0)
                chai.expect(tokenizer.tokenizer).to.be.null

                // The reference to the tokenizer should have been removed 
                // from the input.
                chai.expect(inputElm._mhTokenizer).to.be.undefined
            })

            it('should allow the tokenizer to be destroyed even if it has not '
                + 'been initialized', () => {
                tokenizer.destroy()
                tokenizer.destroy()
            })            

            describe('sortable', () => {
                let sortableDestroy = null

                beforeEach(() => {
                    tokenizer.destroy()
                    tokenizer._options.sortable = true
                    tokenizer.init()
                
                    sortableDestroy = sinon.spy(
                        tokenizer._sortable,
                        'destroy'
                    )
                })

                it('should destroy sorting behaviour', () => {
                    tokenizer.destroy()

                    chai.expect(tokenizer._sortable).to.be.null
                    sortableDestroy.should.have.been.called
                })
            })
        })

        describe('init', () => {
        
            beforeEach(() => {
                tokenizer.destroy()

                sinon.spy(tokenizer._handlers, 'add')
                sinon.spy(tokenizer._handlers, 'remove')
                sinon.spy(tokenizer._handlers, 'sort')
            })

            it('should add a reference for the tokenizer to the '
                + 'input', () => {

                tokenizer.init()
                inputElm._mhTokenizer.should.equal(tokenizer)
            })

            it('should add a tokenizer element that will contain the '
                + 'suggestion elements', () => {

                tokenizer.init()
                tokenizer.tokenizer
                    .classList
                    .contains(Tokenizer.css['tokenizer'])
                    .should
                    .be
                    .true
            })

            it('should set up event handlers for the tokenizer', async () => {
                tokenizer.init()

            })

            describe('sortable', () => {

                it('should initialize sorting behaviour', () => {

                })
            })
        })

        // removeToken
    })
})
