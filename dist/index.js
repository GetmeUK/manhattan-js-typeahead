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
	module.exports = __webpack_require__(3);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var $, Typeahead;

	$ = __webpack_require__(2);

	Typeahead = (function() {
	  Typeahead.pkg_prefix = 'data-mh-typeahead--';

	  function Typeahead(input, option) {
	    var block;
	    if (option == null) {
	      option = {};
	    }
	    $.config(this, {
	      'autoFirst': false,
	      'maxItems': 10,
	      'minChars': 2,
	      'mustMatch': false,
	      'convert': 'default',
	      'fetch': 'array',
	      'filter': 'startswith',
	      'highlight': 'default',
	      'sort': 'default',
	      'template': 'default'
	    }, options, input, this.pkg_prefix);
	    this._input = input;
	    this._input.__mh_typeahead = this;
	    this._index = -1;
	    block = 'mh-typeahead';
	    this._dom = {
	      'results': $.create('ol', {
	        'class': block
	      }),
	      'status': $.create(block + "__status")
	    };
	    Object.defineProperty(this, 'input', {
	      value: this._input
	    });
	    Object.defineProperty(this, 'index', {
	      value: this._index
	    });
	  }

	  Typeahead.prototype.close = function() {};

	  Typeahead.prototype.next = function() {};

	  Typeahead.prototype.open = function() {};

	  Typeahead.prototype.previous = function() {};

	  Typeahead.prototype.refresh = function() {};

	  Typeahead.prototype.select = function() {};

	  Typeahead.behaviour = {
	    fetch: {
	      'ajax': '',
	      'array': '',
	      'data-list': '',
	      'element': ''
	    },
	    filter: {
	      'startswith': '',
	      'contains': ''
	    },
	    highlight: {
	      'default': ''
	    },
	    sort: {
	      'default': ''
	    },
	    convert: {
	      'default': ''
	    },
	    template: {
	      'default': ''
	    }
	  };

	  return Typeahead;

	})();

	module.exports = {
	  Typeahead: Typeahead
	};


/***/ },
/* 2 */
/***/ function(module, exports) {

	!function(e){function __webpack_require__(t){if(r[t])return r[t].exports;var n=r[t]={exports:{},id:t,loaded:!1};return e[t].call(n.exports,n,n.exports,__webpack_require__),n.loaded=!0,n.exports}var r={};return __webpack_require__.m=e,__webpack_require__.c=r,__webpack_require__.p="",__webpack_require__(0)}([function(e,r,t){e.exports=t(1)},function(e,r){var t,n,u,i,o,a,c,s=[].indexOf||function(e){for(var r=0,t=this.length;r<t;r++)if(r in this&&this[r]===e)return r;return-1};n=function(e,r){var t,n,u;null==r&&(r={}),t=document.createElement(e);for(n in r)u=r[n],s.call(t,n)>=0?t[n]=u:t.setAttribute(n,u);return t},a=function(e,r){return null==r&&(r=document),Array.prototype.slice.call(r.querySelectorAll(e))},c=function(e,r){return null==r&&(r=document),r.querySelector(e)},u=function(e,r,t){var n,u,i;null==t&&(t={}),n=document.createEvent("Event"),n.initEvent(r,!0,!0);for(u in t)i=t[u],n[u]=i;return e.dispatchEvent(n)},i=function(e,r){var t,n,u,i;i=[];for(n in r)u=r[n],i.push(function(){var r,i,o,a;for(o=n.split(/\s+/),a=[],r=0,i=o.length;r<i;r++)t=o[r],a.push(e.removeEventListener(t,u));return a}());return i},o=function(e,r){var t,n,u,i;i=[];for(n in r)u=r[n],i.push(function(){var r,i,o,a;for(o=n.split(/\s+/),a=[],r=0,i=o.length;r<i;r++)t=o[r],a.push(e.addEventListener(t,u));return a}());return i},t=function(e,r,t,n,u){var i,o,a,c;null==u&&(u="data-"),a=[];for(o in r)c=r[o],e[o]=c,t.hasOwnProperty(o)&&(e[o]=t[o]),i=u+o.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase(),n.hasAttribute(i)?"number"==typeof c?a.push(e[o]=parseInt(n.getAttribute(i))):c===!1?a.push(e[o]=!0):a.push(e[o]=n.getAttribute(i)):a.push(void 0);return a},e.exports={create:n,one:c,many:a,dispatch:u,ignore:i,listen:o,config:t}}]);

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "typeahead.css";

/***/ }
/******/ ])
});
;