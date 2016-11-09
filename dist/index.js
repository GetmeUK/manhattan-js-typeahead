(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["ManhattanTypeahead"] = factory();
	else
		root["ManhattanTypeahead"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	module.exports = __webpack_require__(2);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "typeahead.css";

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var $, Typeahead;

	$ = __webpack_require__(3);

	Typeahead = (function() {
	  Typeahead.pkgPrefix = 'data-mh-typeahead--';

	  function Typeahead(input, options) {
	    var fetch;
	    if (options == null) {
	      options = {};
	    }
	    $.config(this, {
	      autoFirst: false,
	      list: [],
	      maxItems: 10,
	      minChars: 2,
	      mustMatch: false,
	      rootTag: 'div'
	    }, options, input, this.constructor.pkgPrefix);
	    this._behaviours = {};
	    fetch = 'array';
	    if (typeof this.list === 'string') {
	      if (this.list[0] === '#') {
	        fetch = 'data-list';
	      } else {
	        fetch = 'string';
	      }
	    }
	    $.config(this._behaviours, {
	      coerce: 'pass-through',
	      element: 'default',
	      fetch: fetch,
	      filter: 'startswith',
	      input: 'set-value',
	      sort: 'length'
	    }, options, input, this.constructor.pkgPrefix);
	    this._dom = {};
	    this._dom.input = input;
	    this._dom.input.__mh_typeahead = this;
	    this._index = -1;
	    this._isOpen = false;
	    this._cache = null;
	    this._dom.suggestions = $.create(this.rootTag, {
	      'class': [this._bem('mh-typeahead'), this._bem('mh-typeahead', '', 'closed')].join(' ')
	    });
	    document.body.appendChild(this._dom.suggestions);
	    this._dom.input.setAttribute('autocomplete', 'off');
	    Object.defineProperty(this, 'index', {
	      get: (function(_this) {
	        return function() {
	          return _this._index;
	        };
	      })(this)
	    });
	    Object.defineProperty(this, 'input', {
	      value: this._dom.input
	    });
	    Object.defineProperty(this, 'isOpen', {
	      get: (function(_this) {
	        return function() {
	          return _this._isOpen;
	        };
	      })(this)
	    });
	    $.listen(this._dom.input, {
	      'blur': (function(_this) {
	        return function() {
	          return _this.close('blur');
	        };
	      })(this),
	      'input': (function(_this) {
	        return function() {
	          return _this.update();
	        };
	      })(this),
	      'keydown': (function(_this) {
	        return function(ev) {
	          if (!_this.isOpen) {
	            return;
	          }
	          switch (ev.keyCode) {
	            case 9:
	              if (_this.mustMatch) {
	                return _this.select();
	              }
	              break;
	            case 13:
	              if (_this.index > -1) {
	                ev.preventDefault();
	                return _this.select();
	              }
	              break;
	            case 27:
	              return _this.close('esc');
	            case 38:
	              ev.preventDefault();
	              return _this.previous();
	            case 40:
	              ev.preventDefault();
	              return _this.next();
	          }
	        };
	      })(this)
	    });
	    $.listen(this._dom.suggestions, {
	      'mousedown': (function(_this) {
	        return function(ev) {
	          var index, suggestion;
	          if (ev.target === _this._dom.suggestions) {
	            return;
	          }
	          if (ev.button !== 0) {
	            return;
	          }
	          ev.preventDefault();
	          suggestion = ev.target;
	          while (suggestion.parentNode !== _this._dom.suggestions) {
	            suggestion = suggestion.parentNode;
	          }
	          index = Array.prototype.indexOf.call(_this._dom.suggestions.children, suggestion);
	          return _this.select(index);
	        };
	      })(this)
	    });
	    $.listen(window, {
	      'fullscreenchange orientationchange resize': (function(_this) {
	        return function(ev) {
	          if (_this.isOpen) {
	            return _this.close('resize');
	          }
	        };
	      })(this)
	    });
	  }

	  Typeahead.prototype.clearCache = function() {
	    return this._cache = null;
	  };

	  Typeahead.prototype.close = function(reason) {
	    if (!this.isOpen) {
	      return;
	    }
	    this._dom.suggestions.classList.add(this._bem('mh-typeahead', '', 'closed'));
	    this._isOpen = false;
	    this.index = -1;
	    return $.dispatch(this.input, this._et('close'), {
	      'reason': reason
	    });
	  };

	  Typeahead.prototype.fromCache = function(namespace, key) {
	    if (!this._cache || !this._cache[namespace]) {
	      return;
	    }
	    return this._cache[namespace][key];
	  };

	  Typeahead.prototype.next = function() {
	    var suggestionCount;
	    suggestionCount = this._suggestions.length;
	    if (suggestionCount === 0) {
	      return;
	    }
	    if (this.index === (suggestionCount - 1)) {
	      return this._goto(0);
	    }
	    return this._goto(this.index + 1);
	  };

	  Typeahead.prototype.open = function() {
	    this._track();
	    this._dom.suggestions.classList.remove(this._bem('mh-typeahead', '', 'closed'));
	    this._isOpen = true;
	    if (this.autoFirst && this.index === -1) {
	      this._goto(0);
	    }
	    return $.dispatch(this.input, this._et('open'));
	  };

	  Typeahead.prototype.previous = function() {
	    var suggestionCount;
	    suggestionCount = this._suggestions.length;
	    if (suggestionCount === 0) {
	      return;
	    }
	    if (this.index === 0) {
	      return this._goto(suggestionCount - 1);
	    }
	    return this._goto(this.index - 1);
	  };

	  Typeahead.prototype.select = function(index) {
	    var suggestion;
	    if (index !== void 0 && index !== this.index) {
	      this._goto(index);
	    }
	    if (this.index > -1) {
	      suggestion = this._suggestions[this.index];
	      if (!$.dispatch(this.input, this._et('select'), {
	        item: suggestion
	      })) {
	        return;
	      }
	      this.constructor.behaviours.input[this._behaviours.input](this, suggestion);
	      this.close('select');
	      return $.dispatch(this.input, this._et('selected'), {
	        'item': suggestion
	      });
	    }
	  };

	  Typeahead.prototype.toCache = function(namespace, key, value) {
	    if (!this._cache) {
	      this._cache = {};
	    }
	    if (!this._cache[namespace]) {
	      this._cache[namespace] = {};
	    }
	    return this._cache[namespace] = value;
	  };

	  Typeahead.prototype.update = function() {
	    var _update, fetch, q;
	    while (this._dom.suggestions.firstChild) {
	      this._dom.suggestions.removeChild(this._dom.suggestions.firstChild);
	    }
	    q = this.input.value.trim();
	    if (q.length < this.minChars) {
	      return this.close('no-matches');
	    }
	    _update = (function(_this) {
	      return function(items) {
	        var coerce, element, filter, i, len, ref, sort, suggestion;
	        if (items.length === 0) {
	          return _this.close('no-matches');
	        }
	        coerce = _this.constructor.behaviours.coerce[_this._behaviours.coerce];
	        items = items.map(function(item) {
	          return coerce(_this, item);
	        });
	        filter = _this.constructor.behaviours.filter[_this._behaviours.filter];
	        items = items.filter(function(item) {
	          return filter(_this, item, q);
	        });
	        sort = _this.constructor.behaviours.sort[_this._behaviours.sort];
	        items = items.sort(function(a, b) {
	          return sort(_this, q, a, b);
	        });
	        items = items.slice(0, _this.maxItems);
	        _this._suggestions = items;
	        _this._index = -1;
	        if (_this._suggestions.length === 0) {
	          return _this.close('no-matches');
	        }
	        element = _this.constructor.behaviours.element[_this._behaviours.element];
	        ref = _this._suggestions;
	        for (i = 0, len = ref.length; i < len; i++) {
	          suggestion = ref[i];
	          _this._dom.suggestions.appendChild(element(_this, suggestion, q));
	        }
	        return _this.open();
	      };
	    })(this);
	    fetch = this.constructor.behaviours.fetch[this._behaviours.fetch];
	    return fetch(this, this.list, q, _update);
	  };

	  Typeahead.prototype._bem = function(block, element, modifier) {
	    var name;
	    if (element == null) {
	      element = '';
	    }
	    if (modifier == null) {
	      modifier = '';
	    }
	    name = block;
	    if (element) {
	      name = name + "__" + element;
	    }
	    if (modifier) {
	      name = name + "--" + modifier;
	    }
	    return name;
	  };

	  Typeahead.prototype._et = function(eventName) {
	    return "mh-typeahead--" + eventName;
	  };

	  Typeahead.prototype._goto = function(index) {
	    var focused, focusedClass, suggestion;
	    focusedClass = this._bem('mh-typeahead', 'suggestion', 'focused');
	    focused = $.one('.' + focusedClass);
	    if (focused) {
	      focused.classList.remove(focusedClass);
	    }
	    this._index = index;
	    if (index > -1 && this._suggestions.length > 0) {
	      suggestion = this._dom.suggestions.children[index];
	      suggestion.classList.add(focusedClass);
	      return $.dispatch(this.input, this._et('focus'), {
	        item: this._suggestions[index]
	      });
	    }
	  };

	  Typeahead.prototype._track = function() {
	    var left, rect, top;
	    rect = this._dom.input.getBoundingClientRect();
	    top = rect.top += window.scrollY;
	    left = rect.left += window.scrollX;
	    this._dom.suggestions.style.top = (top + rect.height) + "px";
	    return this._dom.suggestions.style.left = left + "px";
	  };

	  Typeahead.behaviours = {
	    coerce: {
	      'pass-through': function(typeahead, item) {
	        return item;
	      },
	      'single-value': function(typeahead, item) {
	        return {
	          value: item,
	          label: item
	        };
	      }
	    },
	    element: {
	      'default': function(typeahead, item, q) {
	        var li;
	        li = $.create('div', {
	          'class': typeahead._bem('mh-typeahead', 'suggestion')
	        });
	        li.innerHTML = item.label.replace(RegExp($.escapeRegExp(q), 'gi'), '<mark>$&</mark>');
	        return li;
	      }
	    },
	    fetch: {
	      'ajax': function(typeahead, url, q, callback) {
	        var cacheKey, cached, parts, xhr;
	        cacheKey = q.substr(0, typeahead.minChars).toLowerCase();
	        cached = typeahead.fromCache('ajax', cacheKey);
	        if (cached) {
	          return callback(cached);
	        }
	        parts = url.split('?');
	        if (parts.length === 1) {
	          url = url + "?q=" + q;
	        } else {
	          url = url + "&q=" + q;
	        }
	        xhr = new XMLHttpRequest();
	        xhr.addEventListener('load', function(ev) {
	          var items, response;
	          response = JSON.parse(ev.target.responseText);
	          if (response.status === 'success') {
	            items = response.payload.items;
	            typeahead.toCache('ajax', cacheKey, items);
	            return callback(items);
	          } else {
	            return callback([]);
	          }
	        });
	        xhr.open('GET', url);
	        return xhr.send(null);
	      },
	      'array': function(typeahead, array, q, callback) {
	        return callback(array);
	      },
	      'data-list': function(typeahead, list, q, callback) {
	        var dataList, i, item, items, len, option, options;
	        dataList = $.one(list);
	        options = $.many('option', dataList);
	        items = [];
	        for (i = 0, len = options.length; i < len; i++) {
	          option = options[i];
	          item = {};
	          if (option.textContent) {
	            item.label = option.textContent.trim();
	            item.value = option.textContent.trim();
	          }
	          if (option.value) {
	            console.log(option.value);
	            if (!item.label) {
	              item.label = option.value.trim();
	            }
	            item.value = option.value.trim();
	          }
	          items.push(item);
	        }
	        return callback(items);
	      },
	      'element': function(typeahead, selector, q, callback) {
	        var e, elements, items, v, values;
	        elements = $.many(selector);
	        values = (function() {
	          var i, len, results;
	          results = [];
	          for (i = 0, len = elements.length; i < len; i++) {
	            e = elements[i];
	            results.push(e.textContent);
	          }
	          return results;
	        })();
	        items = (function() {
	          var i, len, results;
	          results = [];
	          for (i = 0, len = values.length; i < len; i++) {
	            v = values[i];
	            results.push({
	              label: v.trim(),
	              value: v.trim()
	            });
	          }
	          return results;
	        })();
	        return callback(items);
	      },
	      'string': function(typeahead, s, q, callback) {
	        var items, v, values;
	        values = s.split(',').filter(function(value) {
	          return value.trim().length > 0;
	        });
	        items = (function() {
	          var i, len, results;
	          results = [];
	          for (i = 0, len = values.length; i < len; i++) {
	            v = values[i];
	            results.push({
	              label: v.trim(),
	              value: v.trim()
	            });
	          }
	          return results;
	        })();
	        return callback(items);
	      }
	    },
	    filter: {
	      'contains': function(typeahead, item, q) {
	        var match;
	        match = item.value.toLowerCase();
	        return match.indexOf(q.toLowerCase()) > -1;
	      },
	      'startswith': function(typeahead, item, q) {
	        var match;
	        match = item.value.toLowerCase().substr(0, q.length);
	        return q.toLowerCase() === match;
	      }
	    },
	    input: {
	      'set-hidden': function(typeahead, item) {
	        var hidden, hiddenSelector;
	        typeahead.input.value = item.label;
	        hiddenSelector = typeahead.input.getAttribute(typeahead.constructor.pkgPrefix + "hidden");
	        hidden = $.one(hiddenSelector);
	        return hidden.value = item.id || item.value;
	      },
	      'set-value': function(typeahead, item) {
	        return typeahead.input.value = item.id || item.value;
	      }
	    },
	    sort: {
	      'length': function(typeahead, q, a, b) {
	        var aStarts, bStarts;
	        q = q.toLowerCase();
	        aStarts = q === a.value.substr(0, q.length).toLowerCase();
	        bStarts = q === b.value.substr(0, q.length).toLowerCase();
	        if (aStarts && !bStarts) {
	          console.log('a');
	          return 1;
	        } else if (bStarts && !aStarts) {
	          console.log('b');
	          return -1;
	        }
	        if (a.value.length !== b.value.length) {
	          return a.value.length - b.value.length;
	        }
	        if (a.value < b.value) {
	          return -1;
	        } else {
	          return 1;
	        }
	      }
	    }
	  };

	  return Typeahead;

	})();

	module.exports = {
	  Typeahead: Typeahead
	};


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	(function webpackUniversalModuleDefinition(root, factory) {
		if(true)
			module.exports = factory();
		else if(typeof define === 'function' && define.amd)
			define([], factory);
		else if(typeof exports === 'object')
			exports["ManhattanEssentials"] = factory();
		else
			root["ManhattanEssentials"] = factory();
	})(this, function() {
	return /******/ (function(modules) { // webpackBootstrap
	/******/ 	// The module cache
	/******/ 	var installedModules = {};

	/******/ 	// The require function
	/******/ 	function __webpack_require__(moduleId) {

	/******/ 		// Check if module is in cache
	/******/ 		if(installedModules[moduleId])
	/******/ 			return installedModules[moduleId].exports;

	/******/ 		// Create a new module (and put it into the cache)
	/******/ 		var module = installedModules[moduleId] = {
	/******/ 			exports: {},
	/******/ 			id: moduleId,
	/******/ 			loaded: false
	/******/ 		};

	/******/ 		// Execute the module function
	/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

	/******/ 		// Flag the module as loaded
	/******/ 		module.loaded = true;

	/******/ 		// Return the exports of the module
	/******/ 		return module.exports;
	/******/ 	}


	/******/ 	// expose the modules object (__webpack_modules__)
	/******/ 	__webpack_require__.m = modules;

	/******/ 	// expose the module cache
	/******/ 	__webpack_require__.c = installedModules;

	/******/ 	// __webpack_public_path__
	/******/ 	__webpack_require__.p = "";

	/******/ 	// Load entry module and return exports
	/******/ 	return __webpack_require__(0);
	/******/ })
	/************************************************************************/
	/******/ ([
	/* 0 */
	/***/ function(module, exports, __webpack_require__) {

		module.exports = __webpack_require__(1);


	/***/ },
	/* 1 */
	/***/ function(module, exports) {

		var config, create, dispatch, escapeRegExp, ignore, listen, many, one,
		  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

		create = function(tag, props) {
		  var element, k, v;
		  if (props == null) {
		    props = {};
		  }
		  element = document.createElement(tag);
		  for (k in props) {
		    v = props[k];
		    if ((indexOf.call(element, k) >= 0)) {
		      element[k] = v;
		    } else {
		      element.setAttribute(k, v);
		    }
		  }
		  return element;
		};

		many = function(selectors, container) {
		  if (container == null) {
		    container = document;
		  }
		  return Array.prototype.slice.call(container.querySelectorAll(selectors));
		};

		one = function(selectors, container) {
		  if (container == null) {
		    container = document;
		  }
		  return container.querySelector(selectors);
		};

		dispatch = function(element, eventType, props) {
		  var event, k, v;
		  if (props == null) {
		    props = {};
		  }
		  event = document.createEvent('Event');
		  event.initEvent(eventType, true, true);
		  for (k in props) {
		    v = props[k];
		    event[k] = v;
		  }
		  return element.dispatchEvent(event);
		};

		ignore = function(element, listeners) {
		  var eventType, eventTypes, func, results;
		  results = [];
		  for (eventTypes in listeners) {
		    func = listeners[eventTypes];
		    results.push((function() {
		      var i, len, ref, results1;
		      ref = eventTypes.split(/\s+/);
		      results1 = [];
		      for (i = 0, len = ref.length; i < len; i++) {
		        eventType = ref[i];
		        results1.push(element.removeEventListener(eventType, func));
		      }
		      return results1;
		    })());
		  }
		  return results;
		};

		listen = function(element, listeners) {
		  var eventType, eventTypes, func, results;
		  results = [];
		  for (eventTypes in listeners) {
		    func = listeners[eventTypes];
		    results.push((function() {
		      var i, len, ref, results1;
		      ref = eventTypes.split(/\s+/);
		      results1 = [];
		      for (i = 0, len = ref.length; i < len; i++) {
		        eventType = ref[i];
		        results1.push(element.addEventListener(eventType, func));
		      }
		      return results1;
		    })());
		  }
		  return results;
		};

		config = function(inst, props, args, element, prefix) {
		  var attr, k, results, v;
		  if (prefix == null) {
		    prefix = 'data-';
		  }
		  results = [];
		  for (k in props) {
		    v = props[k];
		    inst[k] = v;
		    if (args.hasOwnProperty(k)) {
		      inst[k] = args[k];
		    }
		    attr = prefix + k.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
		    if (element.hasAttribute(attr)) {
		      if (typeof v === 'number') {
		        results.push(inst[k] = parseInt(element.getAttribute(attr)));
		      } else if (v === false) {
		        results.push(inst[k] = true);
		      } else {
		        results.push(inst[k] = element.getAttribute(attr));
		      }
		    } else {
		      results.push(void 0);
		    }
		  }
		  return results;
		};

		escapeRegExp = function(s) {
		  return s.replace(/[\^\$\\\.\*\+\?\(\)\[\]\{\}\|]/g, '\\$&');
		};

		module.exports = {
		  create: create,
		  one: one,
		  many: many,
		  dispatch: dispatch,
		  ignore: ignore,
		  listen: listen,
		  config: config,
		  escapeRegExp: escapeRegExp
		};


	/***/ }
	/******/ ])
	});
	;

/***/ }
/******/ ])
});
;