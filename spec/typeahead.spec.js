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
                + 'event', async () => {

                const onClosed = sinon.spy()
                $.listen(inputElm, {'closed': onClosed})

                // Open the typeahead
                await typeahead.update('fo')
                typeahead.open()

                // Close the typeahead
                typeahead.close()

                typeahead.isOpen.should.equal(false)
                onClosed.should.have.been.called

            })

            it('should do nothing if the typeahead is already closed', () => {

                const onClosed = sinon.spy()
                $.listen(inputElm, {'closed': onClosed})

                // Close the typeahead (which is already closed)
                typeahead.close()

                onClosed.should.not.have.been.called

            })
        })

        describe('destroy', () => {

            beforeEach(() => {
                typeahead.destroy()

                sinon.spy(typeahead._handlers, 'clear')
                sinon.spy(typeahead._handlers, 'close')
                sinon.spy(typeahead._handlers, 'nav')
                sinon.spy(typeahead._handlers, 'update')

                typeahead.init()
            })

            it('it should remove the typeahead', () => {
                typeahead.destroy()

                // Resizing the window or blurring the input should no longer 
                // call the close event handler.
                $.dispatch(window, 'fullscreenchange')
                $.dispatch(window, 'orientationchange')
                $.dispatch(window, 'resize')
                $.dispatch(inputElm, 'blur')
                typeahead._handlers.close.should.not.have.been.called

                // Pressing a key while the input has focus should no longer
                // call the nav event handler.
                $.dispatch(inputElm, 'keydown')
                typeahead._handlers.nav.should.not.have.been.called

                // Updating the input element should no longer call the update
                // event handler.
                $.dispatch(inputElm, 'input')
                typeahead._handlers.update.should.not.have.been.called

                // The typeahead element should have been removed from the DOM
                $.many(`.${Typeahead.css['typeahead']}`)
                    .length
                    .should
                    .equal(0)
                console.log(typeahead.typeahead)
                chai.expect(typeahead.typeahead).to.be.null

                // The reference to the typeahead should have been removed 
                // from the input.
                chai.expect(inputElm._mhTypeahead).to.be.undefined
            })

            it('should allow the typeahead to be destroyed even if it has not '
                + 'been initialized', () => {
                typeahead.destroy()
                typeahead.destroy()
            })            

        })

        describe('focus', () => {
            let otherTypeahead = null

            beforeEach(() => {
                otherTypeahead = new Typeahead(
                    inputElm,
                    {
                        'coerce': 'valueOnly',
                        'list': ['foo', 'foobar', 'bar']
                    }
                )
                otherTypeahead.init()
            })

            afterEach(() => {
                otherTypeahead.destroy()
            })

            it('should focus on the suggestion at the given '
                + 'index', async () => {

                // Populate the typeahead
                await otherTypeahead.update('fo')

                // Focus on first suggestion
                const focusedCSS = Typeahead.css['focused']
                otherTypeahead.focus(0)
                otherTypeahead.index.should.equal(0)
                otherTypeahead.focused.value.should.equal('foo')
                otherTypeahead.typeahead
                    .children[0]
                    .classList
                    .contains(focusedCSS)
                    .should
                    .be
                    .true

                // Focus on second suggestion
                otherTypeahead.focus(1)
                otherTypeahead.index.should.equal(1)
                otherTypeahead.focused.value.should.equal('foobar')
                otherTypeahead.typeahead
                    .children[1]
                    .classList
                    .contains(focusedCSS)
                    .should
                    .be
                    .true
        
                otherTypeahead.typeahead
                    .children[0]
                    .classList
                    .contains(focusedCSS)
                    .should
                    .be
                    .false

                // Remove focus from any suggestion
                otherTypeahead.focus(-1)
                otherTypeahead.index.should.equal(-1)
                chai.expect(otherTypeahead.focused).to.be.null
                $.many(`.${focusedCSS}`, otherTypeahead.typeahead)
                    .length
                    .should
                    .equal(0)
                
            })
        })

        describe('init', () => {

            beforeEach(() => {
                typeahead.destroy()

                sinon.spy(typeahead._handlers, 'clear')
                sinon.spy(typeahead._handlers, 'close')
                sinon.spy(typeahead._handlers, 'nav')
                sinon.spy(typeahead._handlers, 'select')
                sinon.spy(typeahead._handlers, 'update')

            })

            it('should add a reference for the to the '
                + 'input', () => {

                typeahead.init()
                inputElm._mhTypeahead.should.equal(typeahead)
            })

            it('should add a typeahead element that will contain the '
                + 'suggestion elements', () => {

                typeahead.init()
                typeahead.typeahead
                    .classList
                    .contains(Typeahead.css['typeahead'])
                    .should
                    .be
                    .true
            })

            it('should set autocomplete to off against the input '
                + 'elment', () => {

                typeahead.init()
                inputElm.getAttribute('autocomplete').should.equal('off')
            })

            it('should set up event handlers for the typeahead', async () => {
                typeahead.init()

                // Resizing the window should call the close event handler
                $.dispatch(window, 'fullscreenchange')
                $.dispatch(window, 'orientationchange')
                $.dispatch(window, 'resize')
                $.dispatch(inputElm, 'blur')
                typeahead._handlers.close.callCount.should.equal(4)

                // Pressing a key while the input has focus should call the
                // nav event handler.
                $.dispatch(inputElm, 'keydown')
                typeahead._handlers.nav.should.have.been.called

                // Updating the input element should call the update event
                // handler.
                $.dispatch(inputElm, 'input')
                typeahead._handlers.update.should.have.been.called

                // Clicking on a suggestion should call the select event
                // handler.
                await typeahead.update('fo')
                $.dispatch(typeahead.typeahead.children[0], 'mousedown')
                typeahead._handlers.select.should.have.been.called
            })
        })

        describe('next', () => {
            let otherTypeahead = null

            beforeEach(() => {
                otherTypeahead = new Typeahead(
                    inputElm,
                    {
                        'coerce': 'valueOnly',
                        'list': ['foo', 'foobar', 'bar']
                    }
                )
                otherTypeahead.init()
            })

            afterEach(() => {
                otherTypeahead.destroy()
            })

            it('should select the next suggestion', async () => {
                await otherTypeahead.update('fo')
                otherTypeahead.focus(0)
                otherTypeahead.next()
                otherTypeahead.index.should.equal(1)
                otherTypeahead.focused.value.should.equal('foobar')
            })

            it('should cycle to the first suggestion if on the last '
                + 'suggestion', async () => {
                await otherTypeahead.update('fo')
                otherTypeahead.focus(1)
                otherTypeahead.next()
                otherTypeahead.index.should.equal(0)
                otherTypeahead.focused.value.should.equal('foo')
            })

            it('should do nothing if there are no suggestions', () => {
                otherTypeahead.next()
                otherTypeahead.index.should.equal(-1)               
            })            
        })

        describe('open', () => {
            it('should open the typeahead', async () => {

                const onOpened = sinon.spy()
                $.listen(inputElm, {'opened': onOpened})

                // Open the typeahead
                await typeahead.update('fo')
                typeahead.open()

                typeahead.isOpen.should.equal(true)
                onOpened.should.have.been.called

            })

            it('should do nothing if the typeahead is already '
                + 'open', async () => {

                const onOpened = sinon.spy()
                $.listen(inputElm, {'opened': onOpened})

                // Open the typeahead (which is already open)
                typeahead.open()

                onOpened.should.not.have.been.called

            })
        })

        describe('previous', () => {
            let otherTypeahead = null

            beforeEach(() => {
                otherTypeahead = new Typeahead(
                    inputElm,
                    {
                        'coerce': 'valueOnly',
                        'list': ['foo', 'foobar', 'bar']
                    }
                )
                otherTypeahead.init()
            })

            afterEach(() => {
                otherTypeahead.destroy()
            })

            it('should select the previous suggestion', async () => {
                await otherTypeahead.update('fo')
                otherTypeahead.focus(1)
                otherTypeahead.previous()
                otherTypeahead.index.should.equal(0)
                otherTypeahead.focused.value.should.equal('foo')
            })

            it('should cycle to the last suggestion if on the first '
                + 'suggestion', async () => {
                await otherTypeahead.update('fo')
                otherTypeahead.focus(0)
                otherTypeahead.previous()
                otherTypeahead.index.should.equal(1)
                otherTypeahead.focused.value.should.equal('foobar')
            })

            it('should do nothing if there are no suggestions', () => {
                otherTypeahead.previous()
                otherTypeahead.index.should.equal(-1)               
            })            
        })

        describe('select', () => {
            it('should tigger a select and selected event against the ' 
                + 'input', async () => {

                await typeahead.update('fo')

            })

            it('should not attempt to set an input value if the select ' 
                + 'event is cancelled', async () => {

                await typeahead.update('fo')

            })
            
            it('should close the typeahead', async () => {
                await typeahead.update('fo')

            })
        })
    })
})

// update
