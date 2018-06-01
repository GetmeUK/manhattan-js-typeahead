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

                sinon.spy(typeahead._handlers, 'close')
                sinon.spy(typeahead._handlers, 'nav')
                sinon.spy(typeahead._handlers, 'select')
                sinon.spy(typeahead._handlers, 'update')

            })

            it('should add a reference for the typeahead to the '
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

            it('should do nothing if the typeahead is already open', () => {

                const onOpened = sinon.spy()
                $.listen(inputElm, {'opened': onOpened})

                // Open the typeahead (which is already open)
                typeahead.open()

                onOpened.should.not.have.been.called

            })

            describe('autoFirst', () => {

                beforeEach(() => {
                    typeahead._options.autoFirst = true
                })

                afterEach(() => {
                    typeahead._options.autoFirst = false
                })

                it('should select the first element if the autoFirst option '
                    + 'is true', async () => {

                    // Open the typeahead
                    await typeahead.update('fo')
                    typeahead.open()

                    typeahead.index.should.equal(0)
                })
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
            it('should dispatch a select and selected event against the '
                + 'input', async () => {

                const onSelect = sinon.spy()
                const onSelected = sinon.spy()
                $.listen(inputElm, {'select': onSelect})
                $.listen(inputElm, {'selected': onSelected})

                await typeahead.update('fo')

                typeahead.select(0)

                onSelect.should.have.been.called
                onSelect.getCall(0)
                    .args[0]
                    .suggestion
                    .value
                    .should
                    .equal('foo')

                onSelected.should.have.been.called
                onSelected.getCall(0)
                    .args[0]
                    .suggestion
                    .value
                    .should
                    .equal('foo')

                inputElm.value.should.equal('foo')
            })

            it('should not attempt to set an input value if the select '
                + 'event is cancelled', async () => {

                $.listen(
                    inputElm,
                    {
                        'select': (event) => {
                            event.preventDefault()
                        }
                    }
                )

                const onSelected = sinon.spy()
                $.listen(inputElm, {'selected': onSelected})

                await typeahead.update('fo')

                typeahead.select(0)

                onSelected.should.not.have.been.called

                inputElm.value.should.equal('')
            })

            it('should close the typeahead', async () => {
                await typeahead.update('fo')

                typeahead.open()
                typeahead.select(0)

                typeahead.isOpen.should.be.false
            })

            it('should not dispatch a select event if the index given is '
                + '-1', async () => {

                const onSelect = sinon.spy()
                $.listen(inputElm, {'select': onSelect})

                await typeahead.update('fo')

                typeahead.open()
                typeahead.select(-1)

                onSelect.should.not.have.been.called
            })
        })

        describe('update', () => {

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

                Typeahead.behaviours.fetch.failedFetch = () => {
                    return new Promise((resolve, reject) => {
                        throw Error('Failed to fetch')
                    })
                }

                sinon.spy(otherTypeahead, 'close')
            })

            afterEach(() => {
                otherTypeahead.close.restore()
                otherTypeahead.destroy()
            })

            it('should populate the typeahead with suggestions that '
                + 'match the query string', async () => {

                await otherTypeahead.update('fo')

                otherTypeahead.suggestionCount.should.equal(2)
                otherTypeahead.suggestions.should.deep.equal([
                    {
                        'label': 'foo',
                        'value': 'foo'
                    },
                    {
                        'label': 'foobar',
                        'value': 'foobar'
                    }
                ])
                otherTypeahead.typeahead.children.length.should.equal(2)

            })

            it('should clear existing suggestions', async () => {

                await otherTypeahead.update('fo')
                await otherTypeahead.update('xy')

                otherTypeahead.suggestionCount.should.equal(0)
                otherTypeahead.typeahead.children.length.should.equal(0)

            })

            it('should clear the input value if the query string is '
                + 'empty', async () => {

                inputElm.value = 'some value'
                await otherTypeahead.update('')
                inputElm.value.should.equal('')

            })

            it('should close without fetching suggestions if the query'
                + 'string is shorter than the minChar option', async () => {

                await otherTypeahead.update('fo')
                await otherTypeahead.open()
                await otherTypeahead.update('f')

                otherTypeahead.suggestionCount.should.equal(0)
                otherTypeahead.isOpen.should.be.false

            })

            describe('no results', () => {
                let originalList = null

                beforeEach(() => {
                    originalList = otherTypeahead._options.list
                    otherTypeahead._options.list = []
                })

                afterEach(() => {
                    otherTypeahead._options.list = originalList
                })

                it('should close the typeahead if no suggestions are '
                    + 'fetched', async () => {

                    await otherTypeahead.update('fo')
                    otherTypeahead.close.should.have.been.called
                })
            })

            describe('failure', () => {

                beforeEach(() => {
                    otherTypeahead._behaviours.fetch = 'failedFetch'
                })

                afterEach(() => {
                    otherTypeahead._behaviours.fetch = 'array'
                })

                it('should close the typeahead if there is an error raised '
                    + 'while fetching the results', async () => {

                    await otherTypeahead.update('fo')
                    otherTypeahead.close.should.have.been.called
                })
            })

            describe('cancel previous call', () => {

                beforeEach(() => {
                    sinon.spy(Typeahead.behaviours.fetch, 'array')

                })

                afterEach(() => {
                    Typeahead.behaviours.fetch['array'].restore()
                })

                it('should prevent the results of the initial response '
                    + 'being applied', async () => {

                    otherTypeahead.update('fo')
                    await otherTypeahead.update('fo')

                    const arrayFunc = Typeahead.behaviours.fetch['array']
                    arrayFunc.returnValues[0].then((response) => {
                        response[1].cancelled.should.be.true
                    })
                    arrayFunc.returnValues[1].then((response) => {
                        response[1].cancelled.should.be.false
                    })
                })
            })
        })
    })

    describe('private methods', () => {
        let typeahead = null

        beforeEach(() => {
            typeahead = new Typeahead(inputElm)
            typeahead.init()

            inputElm.getBoundingClientRect = () => {
                return {
                    'bottom': 40,
                    'height': 20,
                    'left': 30,
                    'right': 130,
                    'top': 20,
                    'width': 100
                }
            }

            window.pageXOffset = 10
            window.pageYOffset = 10
        })

        afterEach(() => {
            typeahead.destroy()
        })

        describe('track', () => {

            it('should position the typeahead inline with the input', () => {
                typeahead._track()
                typeahead.typeahead.style.top.should.equal('50px')
                typeahead.typeahead.style.left.should.equal('40px')
                typeahead.typeahead.style.width.should.equal('100px')
            })

        })
    })

    describe('events', () => {

        let typeahead = null

        beforeEach(() => {
            typeahead = new Typeahead(
                inputElm,
                {
                    'coerce': 'valueOnly',
                    'list': ['foo', 'foobar', 'bar']
                }
            )
            typeahead.init()

            sinon.spy(typeahead, 'close')
            sinon.spy(typeahead, 'next')
            sinon.spy(typeahead, 'previous')
            sinon.spy(typeahead, 'select')
            sinon.spy(typeahead, 'update')
        })

        afterEach(() => {
            typeahead.close.restore()
            typeahead.next.restore()
            typeahead.previous.restore()
            typeahead.select.restore()
            typeahead.update.restore()
            typeahead.destroy()
        })

        describe('nav', () => {

            it('should call select when the enter key is pressed if the a '
                + 'suggestion has focus', async () => {

                await typeahead.update('fo')
                typeahead.focus(0)

                $.dispatch(inputElm, 'keydown', {'key': 'Enter'})
                typeahead.select.should.have.been.called
            })

            it('should call close when the enter key is pressed if the no '
                + 'suggestion has focus', async () => {

                await typeahead.update('fo')

                $.dispatch(inputElm, 'keydown', {'key': 'Enter'})
                typeahead.select.should.not.have.been.called
                typeahead.close.should.have.been.called
            })

            it('should close the typeahead when the escape key is '
                + 'pressed', async () => {

                await typeahead.update('fo')

                $.dispatch(inputElm, 'keydown', {'key': 'Escape'})
                typeahead.isOpen.should.be.false
            })

            it('should call previous when the up arrow is '
                + 'pressed', async () => {

                await typeahead.update('fo')

                $.dispatch(inputElm, 'keydown', {'key': 'ArrowUp'})
                typeahead.previous.should.have.been.called
            })

            it('should call next when the down arrow is '
                + 'pressed', async () => {

                await typeahead.update('fo')

                $.dispatch(inputElm, 'keydown', {'key': 'ArrowDown'})
                typeahead.next.should.have.been.called
            })

            it('should do nothing if the tab key is pressed and the '
                + 'mustMatch option is false', async () => {

                const onSelect = sinon.spy()
                $.listen(inputElm, {'select': onSelect})

                await typeahead.update('fo')

                $.dispatch(inputElm, 'keydown', {'key': 'Tab'})
                onSelect.should.not.have.been.called
            })

            it('should do nothing if the typeahead isn\'t open', async () => {

                await typeahead.update('fo')
                typeahead.close()

                $.dispatch(inputElm, 'keydown', {'key': 'a'})
                typeahead.index.should.equal(-1)
            })

            it('should/ do nothing if none of the navigation keys are '
                + 'pressed', async () => {

                await typeahead.update('fo')

                $.dispatch(inputElm, 'keydown', {'key': ''})
                typeahead.index.should.equal(-1)
            })

            describe('mustMatch', () => {

                beforeEach(() => {
                    typeahead._options.mustMatch = true
                })

                afterEach(() => {
                    typeahead._options.mustMatch = false
                })

                it('should select the current suggestion if the tab key is '
                    + 'pressed and the mustMatch option is '
                    + 'true', async () => {

                    const onSelect = sinon.spy()
                    $.listen(inputElm, {'select': onSelect})

                    await typeahead.update('fo')
                    typeahead.focus(0)

                    $.dispatch(inputElm, 'keydown', {'key': 'Tab'})
                    onSelect.should.have.been.called
                })
            })
        })

        describe('select', () => {

            it('should do nothing if the typeahead is the target of the'
                + 'event', async () => {

                await typeahead.update('fo')

                $.dispatch(
                    typeahead.typeahead,
                    'mousedown',
                    {'button': 0}
                )
                typeahead.select.should.not.have.been.called
            })

            it('should do nothing if the left mouse button didn\'t trigger '
                + 'the event', async () => {

                await typeahead.update('fo')

                $.dispatch(
                    typeahead.typeahead.children[0],
                    'mousedown',
                    {'button': 1}
                )
                typeahead.select.should.not.have.been.called
            })

            it('should call the select method with the index of the selected '
                + 'suggestion', async () => {

                await typeahead.update('fo')

                $.dispatch(
                    typeahead.typeahead.children[0].children[0],
                    'mousedown',
                    {'button': 0}
                )
                typeahead.select.should.have.been.calledWith(0)
            })

        })

        describe('update', () => {

            it('should call the update method only after a short '
                + 'delay', (done) => {

                $.dispatch(typeahead.input, 'input')
                $.dispatch(typeahead.input, 'input')
                typeahead.update.should.not.have.been.called

                const afterDelay = () => {
                    typeahead.update.should.have.been.called
                    done()
                }

                setTimeout(afterDelay, 200)
            })
        })
    })

    describe('behaviours > coerce', () => {
        const behaviours = Typeahead.behaviours.coerce
        let signal = null
        let typeahead = null

        beforeEach(() => {
            typeahead = new Typeahead(inputElm)
            typeahead.init()
        })

        afterEach(() => {
            typeahead.destroy()
        })

        describe('passThrough', () => {
            it('should return the suggestion passed uncoerced', () => {
                const suggestion = {
                    'label': 'foo',
                    'value': 'foo'
                }
                behaviours.passThrough(typeahead, suggestion)
                    .should
                    .equal(suggestion)
            })
        })

        describe('valueOnly', () => {
            it('should return the value passed coerced to a suggestion '
                + 'object', () => {

                behaviours.valueOnly(typeahead, 'foo')
                    .should
                    .deep
                    .equal({
                        'label': 'foo',
                        'value': 'foo'
                    })
            })
        })
    })

    describe('behaviours > element', () => {
        const behaviours = Typeahead.behaviours.element
        let typeahead = null
        let suggestion = null

        beforeEach(() => {
            typeahead = new Typeahead(inputElm)
            typeahead.init()

            suggestion = {
                'label': 'Foo',
                'value': 'foo'
            }
        })

        afterEach(() => {
            typeahead.destroy()
        })

        describe('default', () => {
            it('it should return an element containing the suggestion with '
                + 'the matching part of the label marked', () => {

                const html = '<div class="mh-typeahead__suggestion">'
                        + '<mark>Fo</mark>o'
                    + '</div>'
                const elm = behaviours.default(typeahead, suggestion, 'fo')
                elm.outerHTML.should.equal(html)

            })
        })
    })

    describe('behaviours > fetch', () => {
        const behaviours = Typeahead.behaviours.fetch
        let signal = null
        let typeahead = null

        beforeEach(() => {
            signal = {'cancelled': true}
        })

        afterEach(() => {
            if (typeahead) {
                typeahead.destroy()
            }
        })

        describe('ajax', () => {

            beforeEach(() => {
                global.fetch = () => {
                    return Promise.resolve({
                        'json': () => {
                            return {
                                'payload': {
                                    'suggestions': [
                                        {
                                            'label': 'foo',
                                            'value': 'foo'
                                        },
                                        {
                                            'label': 'foobar',
                                            'value': 'foobar'
                                        }
                                    ]
                                }
                            }
                        }
                    })
                }

                sinon.spy(global, 'fetch')
            })

            it('it should return a list of suggestions from a remote '
                + 'url', async () => {

                typeahead = new Typeahead(
                    inputElm,
                    {'list': '/some-url'}
                )
                typeahead.init()

                // With no args
                const suggestions = await behaviours.ajax(
                    typeahead,
                    'fo',
                    signal
                )
                suggestions.should.deep.equal([
                    [
                        {
                            'label': 'foo',
                            'value': 'foo'
                        },
                        {
                            'label': 'foobar',
                            'value': 'foobar'
                        }
                    ],
                    signal
                ])
            })

            it('it should return a list of suggestions from a remote '
                + 'url with args', async () => {

                typeahead = new Typeahead(
                    inputElm,
                    {'list': '/some-url?testing=123'}
                )
                typeahead.init()

                // With args
                const suggestions = await behaviours.ajax(
                    typeahead,
                    'fo',
                    signal
                )
                suggestions.should.deep.equal([
                    [
                        {
                            'label': 'foo',
                            'value': 'foo'
                        },
                        {
                            'label': 'foobar',
                            'value': 'foobar'
                        }
                    ],
                    signal
                ])

                global.fetch
                    .should
                    .have
                    .been
                    .calledWith('/some-url?testing=123&q=fo')
            })

            it('it should use a cached version if available and the cache '
                + 'is not disabled', async () => {

                typeahead = new Typeahead(
                    inputElm,
                    {'list': '/some-url'}
                )
                typeahead.init()

                await behaviours.ajax(typeahead, 'fo', signal)
                await behaviours.ajax(typeahead, 'fo', signal)

                global.fetch.should.have.been.calledOnce
            })

            it('it should not use the cache if the cache is '
                + 'disabled', async () => {

                typeahead = new Typeahead(
                    inputElm,
                    {
                        'disableCache': true,
                        'list': '/some-url'
                    }
                )
                typeahead.init()

                await behaviours.ajax(typeahead, 'fo', signal)
                await behaviours.ajax(typeahead, 'fo', signal)

                global.fetch.should.have.been.calledTwice

            })
        })

        describe('array', () => {
            it('it should return a list of suggestions from an '
                + 'array', async () => {

                typeahead = new Typeahead(
                    inputElm,
                    {
                        'list': [
                            {
                                'label': 'foo',
                                'value': 'foo'
                            },
                            {
                                'label': 'foobar',
                                'value': 'foobar'
                            }
                        ]
                    }
                )
                typeahead.init()

                const suggestions = await behaviours.array(
                    typeahead,
                    'fo',
                    signal
                )
                suggestions.should.deep.equal([
                    [
                        {
                            'label': 'foo',
                            'value': 'foo'
                        },
                        {
                            'label': 'foobar',
                            'value': 'foobar'
                        }
                    ],
                    signal
                ])
            })
        })

        describe('elements', () => {
            let ulElm = null

            beforeEach(() => {
                ulElm = $.create('ul', {'class': 'suggestions'})
                document.body.appendChild(ulElm)

                const inputElm1 = $.create('li')
                inputElm1.textContent = 'foo'
                const inputElm2 = $.create('li')
                inputElm2.textContent = 'foobar'

                ulElm.appendChild(inputElm1)
                ulElm.appendChild(inputElm2)
            })

            afterEach(() => {
                document.body.removeChild(ulElm)
            })

            it('it should return a list of suggestions from the content of '
                + 'a selection of elements', async () => {

                typeahead = new Typeahead(
                    inputElm,
                    {'list': '.suggestions > *'}
                )
                typeahead.init()

                const suggestions = await behaviours.elements(
                    typeahead,
                    'fo',
                    signal
                )
                suggestions.should.deep.equal([
                    [
                        {
                            'label': 'foo',
                            'value': 'foo'
                        },
                        {
                            'label': 'foobar',
                            'value': 'foobar'
                        }
                    ],
                    signal
                ])
            })
        })

        describe('json', () => {
            it('it should return a list of suggestions from an a JSON '
                + 'string', async () => {

                typeahead = new Typeahead(
                    inputElm,
                    {
                        'list': JSON.stringify([
                            {
                                'label': 'foo',
                                'value': 'foo'
                            },
                            {
                                'label': 'foobar',
                                'value': 'foobar'
                            }
                        ])
                    }
                )
                typeahead.init()

                const suggestions = await behaviours.json(
                    typeahead,
                    'fo',
                    signal
                )
                suggestions.should.deep.equal([
                    [
                        {
                            'label': 'foo',
                            'value': 'foo'
                        },
                        {
                            'label': 'foobar',
                            'value': 'foobar'
                        }
                    ],
                    signal
                ])
            })
        })

        describe('string', () => {
            it('it should return a list of suggestions from an a comma'
                + 'separated list', async () => {

                typeahead = new Typeahead(
                    inputElm,
                    {'list': 'foo,foobar'}
                )
                typeahead.init()

                const suggestions = await behaviours.string(
                    typeahead,
                    'fo',
                    signal
                )
                suggestions.should.deep.equal([['foo', 'foobar'], signal])
            })
        })
    })

    describe('behaviours > filter', () => {
        const behaviours = Typeahead.behaviours.filter
        let typeahead = null
        let suggestion = null

        beforeEach(() => {
            typeahead = new Typeahead(inputElm)
            typeahead.init()

            suggestion = {
                'label': 'Foobar',
                'value': 'foobar'
            }
        })

        afterEach(() => {
            typeahead.destroy()
        })

        describe('contains', () => {
            it('should return true if the query string value is contained in '
                + 'the suggestion\'s value', () => {

                const s = suggestion
                behaviours.contains(typeahead, s, 'foo').should.be.true
                behaviours.contains(typeahead, s, 'oob').should.be.true
                behaviours.contains(typeahead, s, 'bar').should.be.true
                behaviours.contains(typeahead, s, 'xyz').should.be.false
            })
        })

        describe('startswith', () => {
            it('should return true if the query string value is starts with '
                + 'the suggestion\'s value', () => {

                const s = suggestion
                behaviours.startswith(typeahead, s, 'foo').should.be.true
                behaviours.startswith(typeahead, s, 'oob').should.be.false
            })
        })
    })

    describe('behaviours > input', () => {
        const behaviours = Typeahead.behaviours.input
        let hiddenInputElm = null
        let suggestion = null
        let typeahead = null

        beforeEach(() => {
            hiddenInputElm = $.create(
                'input',
                {
                    'name': 'hidden-field',
                    'type': 'hidden'
                }
            )
            document.body.appendChild(hiddenInputElm)

            suggestion = {
                'label': 'Foo',
                'value': 'foo'
            }

            typeahead = new Typeahead(
                inputElm,
                {
                    'coerce': 'valueOnly',
                    'hiddenSelector': '[name="hidden-field"]',
                    'list': ['foo', 'bar']
                }

            )
            typeahead.init()
        })

        afterEach(() => {
            typeahead.destroy()
        })

        describe('setHidden', () => {
            it('it should set the value of the hidden field to the '
                + 'suggestion\'s value', () => {

                behaviours.setHidden(typeahead, suggestion)
                hiddenInputElm.value.should.equal('foo')
            })

            it('it should clear the value of the hidden field and the input '
                + 'if null is sent as a suggestion', () => {

                behaviours.setHidden(typeahead, null)
                hiddenInputElm.value.should.equal('')
                inputElm.value.should.equal('')
            })

            it('it should set the value of the input to the suggestion\'s '
                + 'label', () => {

                behaviours.setHidden(typeahead, suggestion)
                inputElm.value.should.equal('Foo')
            })

            it('it should dispatch a change event against the input', () => {
                const onChange = sinon.spy()
                $.listen(inputElm, {'change': onChange})
                behaviours.setHidden(typeahead, suggestion)
                onChange.should.have.been.called
            })

        })

        describe('setValue', () => {
            it('it should set the value of the input to the suggestion\'s '
                + 'label', () => {

                behaviours.setValue(typeahead, suggestion)
                inputElm.value.should.equal('foo')
            })

            it('it should clear the value of input if null is sent as a '
                + 'suggestion', () => {

                behaviours.setValue(typeahead, null)
                inputElm.value.should.equal('')
            })

            it('it should dispatch a change event against the input', () => {
                const onChange = sinon.spy()
                $.listen(inputElm, {'change': onChange})
                behaviours.setValue(typeahead, suggestion)
                onChange.should.have.been.called
            })
        })

        describe('tokenizer', () => {
            it('it should set the _token attribute against the input'
                + 'label', () => {

                behaviours.tokenizer(typeahead, suggestion)
                inputElm._token.should.equal(suggestion)
            })

            it('it should dispatch a change event against the input', () => {
                const onChange = sinon.spy()
                $.listen(inputElm, {'change': onChange})
                behaviours.tokenizer(typeahead, suggestion)
                onChange.should.have.been.called
            })
        })
    })

    describe('behaviours > query', () => {
        const behaviours = Typeahead.behaviours.query
        let typeahead = null

        beforeEach(() => {
            typeahead = new Typeahead(inputElm)
            typeahead.init()
        })

        afterEach(() => {
            typeahead.destroy()
        })

        describe('value', () => {
            it('should return the value of the input element stripped of '
                + 'whitespace', () => {

                inputElm.value = ' foo '
                behaviours.value(typeahead).should.equal('foo')
            })
        })
    })

    describe('behaviours > sort', () => {
        const behaviours = Typeahead.behaviours.sort
        let typeahead = null

        beforeEach(() => {
            typeahead = new Typeahead(inputElm)
            typeahead.init()
        })

        afterEach(() => {
            typeahead.destroy()
        })

        describe('length', () => {
            it('should return -1 if a starts with the query string and b '
                + 'does not', () => {

                const result = behaviours.length(
                    typeahead,
                    'foo',
                    {'label': 'foobar'},
                    {'label': 'barfoo'}
                )
                result.should.equal(-1)

            })

            it('should return 1 if b starts with the query string and a '
                + 'does not', () => {

                const result = behaviours.length(
                    typeahead,
                    'foo',
                    {'label': 'barfoo'},
                    {'label': 'foobar'}
                )
                result.should.equal(1)

            })

            it('should return -1 if both labels start with the query string '
                + 'but a is shorter than b', () => {

                const result = behaviours.length(
                    typeahead,
                    'foo',
                    {'label': 'fooba'},
                    {'label': 'foobar'}
                )
                result.should.equal(-1)

            })

            it('should return 1 if both labels start with the query string '
                + 'but b is shorter than a', () => {

                const result = behaviours.length(
                    typeahead,
                    'foo',
                    {'label': 'foobar'},
                    {'label': 'fooba'}
                )
                result.should.equal(1)

            })

            it('should return -1 if both labels start with the query string, '
                + 'are the same length, and a is less than b', () => {

                const result = behaviours.length(
                    typeahead,
                    'foo',
                    {'label': 'foobaa'},
                    {'label': 'foobar'}
                )
                result.should.equal(-1)

            })

            it('should return 1 if both labels start with the query string, '
                + 'are the same length, and b is less than a', () => {

                const result = behaviours.length(
                    typeahead,
                    'foo',
                    {'label': 'foobar'},
                    {'label': 'foobaa'}
                )
                result.should.equal(1)

            })
        })
    })

})
