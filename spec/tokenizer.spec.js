import * as chai from 'chai'
import * as sinon from 'sinon'

import * as setup from './setup.js'
import * as $ from 'manhattan-essentials'
import {Sortable} from 'manhattan-sortable'
import {Tokenizer} from '../module/tokenizer.js'

require('babel-polyfill')
chai.should()
chai.use(require('sinon-chai'))


describe('Tokenizer', () => {

    let formElm = null
    let inputElm = null
    let hiddenInputElm = null

    beforeEach(() => {
        formElm = $.create('form')

        inputElm = $.create('input')
        formElm.appendChild(inputElm)

        hiddenInputElm = $.create('input', {'name': 'hidden-field'})
        formElm.appendChild(hiddenInputElm)
        
        document.body.appendChild(formElm)
    })

    afterEach(() => {
        document.body.removeChild(formElm)
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
                tokenizer.addToken({
                    'label': 'foo', 
                    'value': 'foo'
                })
                tokenizer.addToken({
                    'label': 'bar', 
                    'value': 'bar'
                })
            })

            it('should return a list of tokens added to the ' 
                + 'typeahead', () => {

                tokenizer.tokens.should.deep.equal([
                    {
                        'label': 'foo', 
                        'value': 'foo'
                    },
                    {
                        'label': 'bar', 
                        'value': 'bar'
                    }
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
                tokenizer.addToken({
                    'label': 'foo', 
                    'value': 'foo'
                })
                tokenizer.tokens.should.deep.equal([
                    {
                        'label': 'foo', 
                        'value': 'foo'
                    }
                ])
            })

            it('should add a token element to the tokenizer element', () => {
                tokenizer.addToken({
                    'label': 'foo', 
                    'value': 'foo'
                })
                tokenizer.tokenizer.children.length.should.equal(1)
                tokenizer.tokenizer.children[0]._token.should.deep.equal({
                    'label': 'foo',
                    'value': 'foo'
                })
            })

            it('should dispatch a tokenadded event', () => {
                const onTokenAdded = sinon.spy()
                $.listen(inputElm, {'tokenadded': onTokenAdded})
                tokenizer.addToken({
                    'label': 'foo', 
                    'value': 'foo'
                })
                onTokenAdded.should.have.been.called
            })

            it('should add a new token at the given index', () => {
                tokenizer.addToken({
                    'label': 'foo', 
                    'value': 'foo'
                })
                tokenizer.addToken({
                    'label': 'bar', 
                    'value': 'bar'
                })
                tokenizer.addToken(
                    {
                        'label': 'zee', 
                        'value': 'zee'
                    }, 
                    1
                )
                tokenizer.tokens.should.deep.equal([
                    {
                        'label': 'foo', 
                        'value': 'foo'
                    },
                    {
                        'label': 'zee', 
                        'value': 'zee'
                    },
                    {
                        'label': 'bar', 
                        'value': 'bar'
                    }
                ])  
            })

            it('should not allow duplicates if the allowDuplicates option '
                + 'is false', () => {

                tokenizer.addToken({
                    'label': 'foo', 
                    'value': 'foo'
                })
                tokenizer.addToken({
                    'label': 'foo', 
                    'value': 'foo'
                })
                tokenizer.tokens.should.deep.equal([
                    {
                        'label': 'foo', 
                        'value': 'foo'
                    }
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

                    tokenizer.addToken({
                        'label': 'foo', 
                        'value': 'foo'
                    })
                    tokenizer.addToken({
                        'label': 'foo', 
                        'value': 'foo'
                    })
                    tokenizer.tokens.should.deep.equal([
                        {
                            'label': 'foo', 
                            'value': 'foo'
                        },
                        {
                            'label': 'foo', 
                            'value': 'foo'
                        }
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

            it('should set up event handlers for the tokenizer', () => {
                tokenizer.init()

                // Pressing a key while the input has focus should call the
                // add event handler.
                $.dispatch(inputElm, 'keydown')
                tokenizer._handlers.add.should.have.been.called

                // Clicking on the tokenizer element should call the remove
                // event handler.
                $.dispatch(tokenizer.tokenizer, 'click')
                tokenizer._handlers.remove.should.have.been.called

                // Sorting the list of token elements should call the sort
                // event handler.
                $.dispatch(tokenizer.tokenizer, 'sorted')
                tokenizer._handlers.sort.should.have.been.called
            })

            describe('sortable', () => {

                beforeEach(() => {
                    tokenizer._options.sortable = true
                })

                it('should initialize sorting behaviour', () => {
                    tokenizer.init()
                    tokenizer._sortable.should.be.an.instanceof(Sortable)
                })
            })
        })

        describe('removeToken', () => {
            let token = null

            beforeEach(() => {
                token = {
                    'label': 'bar',
                    'value': 'bar'
                }
                tokenizer.addToken({
                    'label': 'foo', 
                    'value': 'foo'
                })
                tokenizer.addToken(token)
                tokenizer.addToken({
                    'label': 'zee', 
                    'value': 'zee'
                })
            })

            it('should remove a token from the list of tokens', () => {
                tokenizer.removeToken(token)
                tokenizer.tokens.should.deep.equal([
                    {
                        'label': 'foo', 
                        'value': 'foo'
                    },
                    {
                        'label': 'zee', 
                        'value': 'zee'
                    }
                ])
            })

            it('should remove a token element from the tokenizer '
                + 'element', () => {
                
                tokenizer.removeToken(token)
                tokenizer.tokenizer.children.length.should.equals(2)
                tokenizer.tokenizer.children[0]._token.should.deep.equal({
                    'label': 'foo', 
                    'value': 'foo'
                })
                tokenizer.tokenizer.children[1]._token.should.deep.equal({
                    'label': 'zee', 
                    'value': 'zee'
                })
            })

            it('should dispatch a tokenremoved event', () => {
                const onTokenRemoved = sinon.spy()
                $.listen(inputElm, {'tokenremoved': onTokenRemoved})
                tokenizer.removeToken(token)
                onTokenRemoved.should.have.been.called
            })
        })
    })

    describe('private method', () => {
        let tokenizer = null

        beforeEach(() => {
            tokenizer = new Tokenizer(
                inputElm, 
                {'hiddenSelector': '[name="hidden-field"]'}
            )
        })

        afterEach(() => {
            tokenizer.destroy()
        })

        describe('_sync', () => {

            it('should update the list of token elements to match the list '
                + 'of tokens', () => {

                tokenizer.init([
                    {
                        'label': 'foo',
                        'value': 'foo'
                    },
                    {
                        'label': 'bar', 
                        'value': 'bar'
                    },
                    {
                        'label': 'zee', 
                        'value': 'zee'
                    }
                ])
                tokenizer._sync()

                tokenizer.tokenizer.children.length.should.equals(3)
                tokenizer.tokenizer.children[0]._token.should.deep.equal({
                    'label': 'foo', 
                    'value': 'foo'
                })
                tokenizer.tokenizer.children[1]._token.should.deep.equal({
                    'label': 'bar', 
                    'value': 'bar'
                })
                tokenizer.tokenizer.children[2]._token.should.deep.equal({
                    'label': 'zee', 
                    'value': 'zee'
                })
            })

            it('should update the value of the tokens in the form', () => {
                tokenizer.init([
                    {
                        'label': 'foo', 
                        'value': 'foo'
                    },
                    {
                        'label': 'bar', 
                        'value': 'bar'
                    },
                    {
                        'label': 'zee', 
                        'value': 'zee'
                    }
                ])
                tokenizer._sync()

                hiddenInputElm.value.should.equal('foo,bar,zee')
            })
        })
    })

    describe('events', () => {
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

        describe('add', () => {

            it('should add a new token based on the input value if the enter '
                + 'key is pressed', () => {

                inputElm.value = 'foo'
                $.dispatch(inputElm, 'keydown', {'keyCode': 13})

                tokenizer.tokens.should.deep.equal([
                    {
                        'label': 'foo', 
                        'value': 'foo'
                    }
                ])
            })

            it('should do nothing if the input value is empty', () => {

                inputElm.value = ''
                $.dispatch(inputElm, 'keydown', {'keyCode': 13})

                tokenizer.tokens.should.deep.equal([])
            })

            it('should do nothing if the key pressed isn\'t enter', () => {

                inputElm.value = 'foo'
                $.dispatch(inputElm, 'keydown', {'keyCode': 999})

                tokenizer.tokens.should.deep.equal([])
            })

            it('should clear the input value', () => {

                inputElm.value = 'foo'
                $.dispatch(inputElm, 'keydown', {'keyCode': 13})

                inputElm.value.should.equal('')
            })

            describe('typeahead', () => {

                beforeEach(() => {
                    tokenizer._options.typeahead = true
                })

                it('should add a new token based on the _token attribute '
                    + 'against the input', () => {

                    inputElm._token = {
                        'label': 'foo', 
                        'value': 'foo'
                    }
                    $.dispatch(inputElm, 'keydown', {'keyCode': 13})

                    tokenizer.tokens.should.deep.equal([
                        {
                            'label': 'foo', 
                            'value': 'foo'
                        }
                    ])
                })

                it('should do nothing if the _token attribute against the '
                    + 'input value coerces to false', () => {

                    inputElm._token = null
                    $.dispatch(inputElm, 'keydown', {'keyCode': 13})

                    tokenizer.tokens.should.deep.equal([])
                })
            })
        })

        describe('remove', () => {
            
            beforeEach(() => {
                tokenizer.addToken({
                    'label': 'foo', 
                    'value': 'foo'
                })
            })

            it('should remove the token associated with the element '
                + 'clicked', () => {

                const [tokenElm] = tokenizer.tokenizer.children
                const removeElm = $.one(
                    `.${Tokenizer.css['remove']}`, 
                    tokenElm
                )
                $.dispatch(removeElm, 'click', {'button': 0})

                tokenizer.tokens.should.deep.equal([])
            })

            it('should do nothing if the element selected isn\'t the remove '
                + 'element', () => {

                const [tokenElm] = tokenizer.tokenizer.children
                $.dispatch(tokenElm, 'click', {'button': 0})

                tokenizer.tokens.should.deep.equal([
                    {
                        'label': 'foo', 
                        'value': 'foo'
                    }
                ])
            })

            it('should do nothing if the remove element is clicked with any '
                + 'button other than the left mouse button', () => {

                const [tokenElm] = tokenizer.tokenizer.children
                const removeElm = $.one(
                    `.${Tokenizer.css['remove']}`, 
                    tokenElm
                )
                $.dispatch(removeElm, 'click', {'button': 1})

                tokenizer.tokens.should.deep.equal([
                    {
                        'label': 'foo', 
                        'value': 'foo'
                    }
                ])
            })
        })

        describe('sort', () => {

            beforeEach(() => {
                tokenizer.addToken({
                    'label': 'foo', 
                    'value': 'foo'
                })
                tokenizer.addToken({
                    'label': 'bar', 
                    'value': 'bar'
                })
                tokenizer.addToken({
                    'label': 'zee', 
                    'value': 'zee'
                })
            })

            it('should update the tokenizer\'s tokens to match the order '
                + 'of the elements', () => {

                const tokenizerElm = tokenizer.tokenizer
                const [tokenElm] = tokenizerElm.children
                tokenizerElm.removeChild(tokenElm)
                tokenizerElm.appendChild(tokenElm)
                $.dispatch(tokenizerElm, 'sorted')

                tokenizer.tokens.should.deep.equal([
                    {
                        'label': 'bar', 
                        'value': 'bar'
                    },
                    {
                        'label': 'zee', 
                        'value': 'zee'
                    },
                    {
                        'label': 'foo', 
                        'value': 'foo'
                    }
                ])
            })
        })        
    })

    describe('behaviours > element', () => {
        const behaviours = Tokenizer.behaviours.element
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
    
        describe('default', () => {
            it('it should return an element representing the token', () => {

                const html = '<div class="mh-token">' 
                        + '<div class="mh-token__label">Foo</div>'
                        + '<div class="mh-token__remove"></div>'
                    + '</div>'
                const elm = behaviours.default(
                    tokenizer, 
                    {
                        'label': 'Foo', 
                        'value': 'foo'
                    }
                )
                elm.outerHTML.should.equal(html)

            })
        })
    })

    describe('behaviours > store', () => {
        const behaviours = Tokenizer.behaviours.store
        let tokenizer = null

        beforeEach(() => {
            tokenizer = new Tokenizer(
                inputElm,
                {'hiddenSelector': '[name="hidden-field"]'}
            )
            tokenizer.init([
                {
                    'label': 'foo', 
                    'value': 'foo'
                },
                {
                    'label': 'bar', 
                    'value': 'bar'
                },
                {
                    'label': 'zee', 
                    'value': 'zee'
                }
            ])
        })

        afterEach(() => {
            tokenizer.destroy()
        })
    
        describe('inputs', () => {
            beforeEach(() => {
                tokenizer._options.hiddenSelector = 'my-field'
            })

            afterEach(() => {
                tokenizer._options.hiddenSelector = '[name="hidden-field"]'
            })
        
            it('should set the value of the tokenizer as hidden '
                + 'fields', () => {

                behaviours.inputs(tokenizer)

                let hiddenFields = $.many('[name="my-field"]')
                hiddenFields[0].value.should.equal('foo')
                hiddenFields[1].value.should.equal('bar')
                hiddenFields[2].value.should.equal('zee')

                behaviours.inputs(tokenizer)

                hiddenFields = $.many('[name="my-field"]')
                hiddenFields[0].value.should.equal('foo')
                hiddenFields[1].value.should.equal('bar')
                hiddenFields[2].value.should.equal('zee')
            })
        })

        describe('json', () => {
            it('should set the value of the tokenizer as a JSON string '
                + 'against the associated hidden field', () => {

                behaviours.json(tokenizer)
                hiddenInputElm.value = JSON.stringify(['foo', 'bar', 'zee'])
            })
        })

        describe('none', () => {
            it('should do nothing and return null', () => {

                chai.expect(behaviours.none(tokenizer)).to.be.null
            })
        })

        describe('string', () => {
            it('should set the value of the tokenizer as a comma separated '
                + 'string against the associated hidden field', () => {

                behaviours.json(tokenizer)
                hiddenInputElm.value = 'foo,bar,zee'
            })
        })
    })

    describe('behaviours > tokenizer', () => {
        const behaviours = Tokenizer.behaviours.tokenizer
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

        describe('default', () => {
            
            it('should return a container element which the token elements '
                + 'will be added to', () => {

                const elm = behaviours.default(tokenizer)
                elm.outerHTML.should.equal('<div class="mh-tokenizer"></div>')

            })

        })
    })
})
