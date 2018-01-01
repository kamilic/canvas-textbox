(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Ctextbox = factory());
}(this, (function () { 'use strict';

var constant = {
    OUTPUT_TYPE_BASE64: 1,
    OUTPUT_TYPE_BLOB: 2,
    OUTPUT_FORMAT_PNG: "image/png",
    OUTPUT_FORMAT_JPG: "image/jpg"
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {/**/}

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

var extend = function extend() {
	var options, name, src, copy, copyIsArray, clone;
	var target = arguments[0];
	var i = 1;
	var length = arguments.length;
	var deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}
	if (target == null || (typeof target === 'undefined' ? 'undefined' : _typeof(target)) !== 'object' && typeof target !== 'function') {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = extend(deep, clone, copy);

						// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						target[name] = copy;
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var clone_1 = createCommonjsModule(function (module) {
  var clone = function () {
    function _instanceof$$1(obj, type) {
      return type != null && obj instanceof type;
    }

    var nativeMap;
    try {
      nativeMap = Map;
    } catch (_) {
      // maybe a reference error because no `Map`. Give it a dummy value that no
      // value will ever be an instanceof.
      nativeMap = function nativeMap() {};
    }

    var nativeSet;
    try {
      nativeSet = Set;
    } catch (_) {
      nativeSet = function nativeSet() {};
    }

    var nativePromise;
    try {
      nativePromise = Promise;
    } catch (_) {
      nativePromise = function nativePromise() {};
    }

    /**
     * Clones (copies) an Object using deep copying.
     *
     * This function supports circular references by default, but if you are certain
     * there are no circular references in your object, you can save some CPU time
     * by calling clone(obj, false).
     *
     * Caution: if `circular` is false and `parent` contains circular references,
     * your program may enter an infinite loop and crash.
     *
     * @param `parent` - the object to be cloned
     * @param `circular` - set to true if the object to be cloned may contain
     *    circular references. (optional - true by default)
     * @param `depth` - set to a number if the object is only to be cloned to
     *    a particular depth. (optional - defaults to Infinity)
     * @param `prototype` - sets the prototype to be used when cloning an object.
     *    (optional - defaults to parent prototype).
     * @param `includeNonEnumerable` - set to true if the non-enumerable properties
     *    should be cloned as well. Non-enumerable properties on the prototype
     *    chain will be ignored. (optional - false by default)
    */
    function clone(parent, circular, depth, prototype, includeNonEnumerable) {
      if ((typeof circular === 'undefined' ? 'undefined' : _typeof(circular)) === 'object') {
        depth = circular.depth;
        prototype = circular.prototype;
        includeNonEnumerable = circular.includeNonEnumerable;
        circular = circular.circular;
      }
      // maintain two arrays for circular references, where corresponding parents
      // and children have the same index
      var allParents = [];
      var allChildren = [];

      var useBuffer = typeof Buffer != 'undefined';

      if (typeof circular == 'undefined') circular = true;

      if (typeof depth == 'undefined') depth = Infinity;

      // recurse this function so we don't reset allParents and allChildren
      function _clone(parent, depth) {
        // cloning null always returns null
        if (parent === null) return null;

        if (depth === 0) return parent;

        var child;
        var proto;
        if ((typeof parent === 'undefined' ? 'undefined' : _typeof(parent)) != 'object') {
          return parent;
        }

        if (_instanceof$$1(parent, nativeMap)) {
          child = new nativeMap();
        } else if (_instanceof$$1(parent, nativeSet)) {
          child = new nativeSet();
        } else if (_instanceof$$1(parent, nativePromise)) {
          child = new nativePromise(function (resolve, reject) {
            parent.then(function (value) {
              resolve(_clone(value, depth - 1));
            }, function (err) {
              reject(_clone(err, depth - 1));
            });
          });
        } else if (clone.__isArray(parent)) {
          child = [];
        } else if (clone.__isRegExp(parent)) {
          child = new RegExp(parent.source, __getRegExpFlags(parent));
          if (parent.lastIndex) child.lastIndex = parent.lastIndex;
        } else if (clone.__isDate(parent)) {
          child = new Date(parent.getTime());
        } else if (useBuffer && Buffer.isBuffer(parent)) {
          child = new Buffer(parent.length);
          parent.copy(child);
          return child;
        } else if (_instanceof$$1(parent, Error)) {
          child = Object.create(parent);
        } else {
          if (typeof prototype == 'undefined') {
            proto = Object.getPrototypeOf(parent);
            child = Object.create(proto);
          } else {
            child = Object.create(prototype);
            proto = prototype;
          }
        }

        if (circular) {
          var index = allParents.indexOf(parent);

          if (index != -1) {
            return allChildren[index];
          }
          allParents.push(parent);
          allChildren.push(child);
        }

        if (_instanceof$$1(parent, nativeMap)) {
          parent.forEach(function (value, key) {
            var keyChild = _clone(key, depth - 1);
            var valueChild = _clone(value, depth - 1);
            child.set(keyChild, valueChild);
          });
        }
        if (_instanceof$$1(parent, nativeSet)) {
          parent.forEach(function (value) {
            var entryChild = _clone(value, depth - 1);
            child.add(entryChild);
          });
        }

        for (var i in parent) {
          var attrs;
          if (proto) {
            attrs = Object.getOwnPropertyDescriptor(proto, i);
          }

          if (attrs && attrs.set == null) {
            continue;
          }
          child[i] = _clone(parent[i], depth - 1);
        }

        if (Object.getOwnPropertySymbols) {
          var symbols = Object.getOwnPropertySymbols(parent);
          for (var i = 0; i < symbols.length; i++) {
            // Don't need to worry about cloning a symbol because it is a primitive,
            // like a number or string.
            var symbol = symbols[i];
            var descriptor = Object.getOwnPropertyDescriptor(parent, symbol);
            if (descriptor && !descriptor.enumerable && !includeNonEnumerable) {
              continue;
            }
            child[symbol] = _clone(parent[symbol], depth - 1);
            if (!descriptor.enumerable) {
              Object.defineProperty(child, symbol, {
                enumerable: false
              });
            }
          }
        }

        if (includeNonEnumerable) {
          var allPropertyNames = Object.getOwnPropertyNames(parent);
          for (var i = 0; i < allPropertyNames.length; i++) {
            var propertyName = allPropertyNames[i];
            var descriptor = Object.getOwnPropertyDescriptor(parent, propertyName);
            if (descriptor && descriptor.enumerable) {
              continue;
            }
            child[propertyName] = _clone(parent[propertyName], depth - 1);
            Object.defineProperty(child, propertyName, {
              enumerable: false
            });
          }
        }

        return child;
      }

      return _clone(parent, depth);
    }

    /**
     * Simple flat clone using prototype, accepts only objects, usefull for property
     * override on FLAT configuration object (no nested props).
     *
     * USE WITH CAUTION! This may not behave as you wish if you do not know how this
     * works.
     */
    clone.clonePrototype = function clonePrototype(parent) {
      if (parent === null) return null;

      var c = function c() {};
      c.prototype = parent;
      return new c();
    };

    // private utility functions

    function __objToStr(o) {
      return Object.prototype.toString.call(o);
    }
    clone.__objToStr = __objToStr;

    function __isDate(o) {
      return (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === 'object' && __objToStr(o) === '[object Date]';
    }
    clone.__isDate = __isDate;

    function __isArray(o) {
      return (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === 'object' && __objToStr(o) === '[object Array]';
    }
    clone.__isArray = __isArray;

    function __isRegExp(o) {
      return (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === 'object' && __objToStr(o) === '[object RegExp]';
    }
    clone.__isRegExp = __isRegExp;

    function __getRegExpFlags(re) {
      var flags = '';
      if (re.global) flags += 'g';
      if (re.ignoreCase) flags += 'i';
      if (re.multiline) flags += 'm';
      return flags;
    }
    clone.__getRegExpFlags = __getRegExpFlags;

    return clone;
  }();

  if ('object' === 'object' && module.exports) {
    module.exports = clone;
  }
});

var TextLayerCollection = function (_Array) {
    inherits(TextLayerCollection, _Array);

    function TextLayerCollection() {
        classCallCheck(this, TextLayerCollection);
        return possibleConstructorReturn(this, (TextLayerCollection.__proto__ || Object.getPrototypeOf(TextLayerCollection)).call(this));
    }

    return TextLayerCollection;
}(Array);

var DEFAULT_CONF = {
    fontSize: 20,
    fontFamily: "Microsoft YaHei, PingFang SC, Arial",
    lineHeight: 1.5,
    verticalAlign: "alphabetic",
    color: "rgba(0, 0, 0, 1)",
    padding: 5,
    strokeWidth: 1,
    strokeColor: null,
    backgroundColor: null,
    forceNextLine: false
};

function integrateWithGetter(obj) {
    return Object.defineProperties(obj, {
        font: {
            get: function get$$1() {
                return this.fontSize + "px " + this.fontFamily;
            }
        }
    });
}

var TextLayer = function TextLayer() {
    var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
    var conf = arguments[1];
    classCallCheck(this, TextLayer);

    this.textRect = [];
    var defaultConf = clone_1(DEFAULT_CONF);
    var currentConf = conf && integrateWithGetter(extend(defaultConf, conf)) || defaultConf;
    currentConf.text = text;
    integrateWithGetter(this);
    return extend(this, currentConf);
};

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {TextLayer} layer
 * @param {Number} currentPos
 * @param {Number} maxWidth
 * @returns {{pos: number, textWidth: Number, text, nextLine: boolean}}
 * @this Renderer
 */
var DEBUG = false;

function consultForSuitableText(ctx, layer, currentPos, maxWidth) {
    var text = layer.text.slice(currentPos);
    var textWidth = ctx.measureText(text).width;
    var resultWidth = textWidth + this.previousDrawingWidth;

    if (text.length > 0) {
        if (resultWidth >= maxWidth) {
            var oriText = layer.text.slice(currentPos);
            var pos = oriText.length;
            var halfPos = void 0;
            var addOneCharText = oriText;
            var _text = oriText;
            var addOneCharResultWidth = void 0;
            var _resultWidth = void 0;
            var _textWidth = void 0;
            var addOneCharTextWidth = void 0;

            do {
                pos = Math.floor(_text.length / 2);
                halfPos = pos;
                _text = oriText.slice(0, pos);
                addOneCharText = oriText.slice(0, pos + 1);
                addOneCharResultWidth = ctx.measureText(addOneCharText).width + this.previousDrawingWidth;
                _textWidth = ctx.measureText(_text).width;
                _resultWidth = ctx.measureText(_text).width + this.previousDrawingWidth;
            } while (_resultWidth >= maxWidth);

            while (!(_resultWidth <= maxWidth && addOneCharResultWidth > maxWidth)) {
                if (halfPos === 1 && _resultWidth > maxWidth) {
                    pos -= 1;
                } else {
                    halfPos = Math.ceil(halfPos / 2);
                    pos = pos + halfPos;
                }
                _text = oriText.slice(0, pos);
                addOneCharText = oriText.slice(0, pos + 1);
                _textWidth = ctx.measureText(_text).width;
                addOneCharTextWidth = ctx.measureText(addOneCharText).width;
                addOneCharResultWidth = addOneCharTextWidth + this.previousDrawingWidth;
                _resultWidth = _textWidth + this.previousDrawingWidth;
            }
            return {
                pos: currentPos + pos - 1,
                textWidth: _textWidth,
                text: _text,
                nextLine: true
            };
        } else {
            return {
                pos: currentPos + text.length - 1,
                textWidth: textWidth,
                text: text,
                nextLine: false
            };
        }
    }
}

function getRealLineHeight(lineHeight, fontSize) {
    if (typeof lineHeight === "number") {
        return parseFloat((lineHeight * fontSize).toFixed(2));
    } else if (typeof lineHeight === "string") {
        return parseInt(lineHeight);
    }
}

function nextLine() {
    this.previousDrawingWidth = 0;
    this.currentLine += 1;
    this.eachLine[this.eachLine.length] = {
        inlineElements: []
    };
}

function reset() {
    this.previousDrawingWidth = 0;
    this.currentLine = 1;
}

function calculate(ctx, collection, maxWidthOrConf, isIncremental) {
    var _this = this;

    var _maxWidthConfHander = maxWidthConfHander(maxWidthOrConf),
        top = _maxWidthConfHander.top,
        left = _maxWidthConfHander.left,
        maxWidth = _maxWidthConfHander.maxWidth;

    var textBoxHeight = 0;
    var textBoxWidth = maxWidth;
    if (!isIncremental) {
        this.eachLine = [{
            inlineElements: []
        }];
    }

    collection.forEach(function (layer) {
        ctx.save();
        ctx.font = layer.font;

        if (layer.forceNextLine) {
            nextLine.apply(_this);
        }

        var currentTextPos = 0;
        var suitableText = consultForSuitableText.call(_this, ctx, layer, currentTextPos, maxWidth);

        while (suitableText) {
            // let inlineBoxTop = top + lineHeight * this.currentLine;
            var inlineBoxLeft = _this.previousDrawingWidth;
            var text = suitableText.text;
            var textWidth = suitableText.textWidth;

            currentTextPos = suitableText.pos += 1;
            _this.eachLine[_this.eachLine.length - 1].inlineElements.push({
                layer: layer,
                // inlineBoxTop,
                inlineBoxLeft: inlineBoxLeft,
                text: text,
                textWidth: textWidth
            });
            _this.previousDrawingWidth += suitableText.textWidth;

            if (suitableText.nextLine) {
                nextLine.apply(_this);
            }

            suitableText = consultForSuitableText.call(_this, ctx, layer, currentTextPos, maxWidth);
        }
        ctx.restore();
    });

    this.eachLine.forEach(function (line) {
        var inlineElements = line.inlineElements;
        var lineLineHeight = inlineElements.length > 0 ? Math.max.apply(null, inlineElements.map(function (v) {
            return getRealLineHeight(v.layer.lineHeight, v.layer.fontSize);
        })) : 0;
        line.lineHeight = lineLineHeight;
        line.lineBoxX = left;
        textBoxHeight += line.lineHeight;
        line.lineBoxY = textBoxHeight;
        inlineElements.forEach(function (el) {
            var layer = el.layer;
            var layerFontSize = layer.fontSize;
            var deltaY = parseFloat(((lineLineHeight - layerFontSize) / 2).toFixed(2));

            el.x = line.lineBoxX + el.inlineBoxLeft;
            el.y = line.lineBoxY - deltaY;
            el.deltaY = deltaY;
        });
    });

    this.height = textBoxHeight;
    this.width = textBoxWidth;
    this.top = top;
    this.left = left;
    this.lastReflowIndex = collection.length - 1;
}

function _draw$1(ctx) {
    this.eachLine.forEach(function (line) {
        var inlineElements = line.inlineElements;
        var lineHeight = line.lineHeight; // px
        inlineElements.forEach(function (el) {
            var layer = el.layer;

            ctx.save();
            ctx.font = layer.font || ctx.font;
            // ctx.textAlign = layer.verticalAlign;
            ctx.fillStyle = layer.color || ctx.fillStyle;
            ctx.strokeStyle = layer.strokeColor || "transparent";
            ctx.lineWidth = parseInt(layer.strokeWidth) || ctx.strokeWidth;

            if (layer.backgroundColor) {
                var layerFontSize = layer.fontSize;
                var deltaY = el.deltaY;
                var paddingTop = layer.padding;
                ctx.save();
                ctx.fillStyle = layer.backgroundColor;
                ctx.fillRect(el.x, el.y + paddingTop, el.textWidth, -(layerFontSize + paddingTop));
                if (DEBUG) {
                    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
                    ctx.fillRect(el.x, el.y + deltaY, el.textWidth, -lineHeight);
                }
                ctx.restore();
            }

            ctx.fillText(el.text, el.x, el.y);
            layer.strokeColor && ctx.strokeText(el.text, el.x, el.y);
            ctx.restore();
        });
    });
}

function maxWidthConfHander() {
    var maxWidthOrConf = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 300;

    var maxWidth = void 0;
    var top = 0;
    var left = 0;

    if ((typeof maxWidthOrConf === "undefined" ? "undefined" : _typeof(maxWidthOrConf)) === "object") {
        maxWidth = maxWidthOrConf.maxWidth || 300;
        top = maxWidthOrConf.top || 0;
        left = maxWidthOrConf.left || 0;
    } else if (!parseInt(maxWidthOrConf)) {
        throw Error("Type maxWidth error! expect Number.");
    } else {
        maxWidth = parseInt(maxWidthOrConf) || 300;
    }
    return { top: top, left: left, maxWidth: maxWidth };
}

var Renderer = function () {
    function Renderer() {
        classCallCheck(this, Renderer);

        this.previousDrawingWidth = 0;
        this.width = 0;
        this.height = 0;
        this.top = 0;
        this.left = 0;
        this.lastReflowIndex = 0;
        this.forceReflow = false;
        this.eachLine = [];
    }

    createClass(Renderer, [{
        key: "draw",
        value: function draw(ctx, collection, maxWidthOrConf, isReflow) {
            if (!isReflow && !this.forceReflow) {
                // partially reflow
                this.reflow(ctx, collection.slice(this.lastReflowIndex + 1), maxWidthOrConf, true);
            } else {
                reset.call(this);
                this.reflow(ctx, collection, maxWidthOrConf, false);
            }
            _draw$1.call(this, ctx);
        }
    }, {
        key: "reflow",
        value: function reflow(ctx, collection, maxWidthOrConf, isIncremental) {
            calculate.call(this, ctx, collection, maxWidthOrConf, isIncremental);
        }
    }, {
        key: "clear",
        value: function clear(ctx) {
            ctx.clearRect(this.top, this.left, this.width, this.height);
        }

        // undo(ctx, layer) {
        //     let eachLine = this.eachLine;
        //     for (let i = eachLine.length - 1; i >= 0; i -= 1) {
        //         for (let j = eachLine[i].inlineElements.length; j > 0; j -= 1) {
        //             let line = eachLine[i].inlineElements[j];
        //             if (line.layer === layer) {
        //                 delete line[j];
        //             }
        //         }
        //     }
        //     this.lastReflowIndex -= 1;
        //     _draw.call(this, ctx);
        // }
        //
        // redo(ctx, collection, maxWidthOrConf) {
        //     this.draw(ctx, collection, maxWidthOrConf, false);
        //     this.lastReflowIndex += 1;
        // }

    }]);
    return Renderer;
}();

var CTextBox = function () {
    function CTextBox() {
        classCallCheck(this, CTextBox);

        this.collection = new TextLayerCollection();
        this.renderer = new Renderer();
        this.operationStack = [];
    }

    createClass(CTextBox, [{
        key: "draw",
        value: function draw(canvasOrCtx) {
            var maxWidthOrConf = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 300;
            var isReflow = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            var canvas = null;
            var ctx = null;
            if (canvasOrCtx instanceof HTMLCanvasElement) {
                canvas = canvasOrCtx;
            } else if (canvasOrCtx instanceof CanvasRenderingContext2D) {
                ctx = canvasOrCtx;
            }

            if (canvas) {
                ctx = canvasOrCtx.getContext("2d");
            }

            if (ctx) {
                this.renderer.draw(ctx, this.collection, maxWidthOrConf, isReflow);
            } else {
                throw Error("Argument 1 type error, expected HTMLCanvasElement or CanvasRenderingContext2D");
            }
        }
    }, {
        key: "output",
        value: function output(canvas, type, format) {}
    }, {
        key: "put",
        value: function put(text, conf) {
            this.collection.push(new TextLayer(text, conf));
            return this;
        }
    }, {
        key: "line",
        value: function line(text) {
            var conf = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            this.collection.push(new TextLayer(text, extend(conf, { forceNextLine: true })));
            return this;
        }
    }, {
        key: "undo",
        value: function undo() {
            var level = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

            var layers = new TextLayerCollection();
            while (level--) {
                var layer = this.collection.pop();
                if (layer) {
                    layers.push(layer);
                    this.operationStack.push(clone_1(layer));
                } else {
                    break;
                }
            }
            return layers;
        }
    }, {
        key: "redo",
        value: function redo() {
            var level = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

            while (level--) {
                var layer = this.operationStack.pop();
                if (layer) {
                    this.collection.push(layer);
                } else {
                    break;
                }
            }
            return this;
        }
    }]);
    return CTextBox;
}();

CTextBox.FORMAT_PNG = constant.OUTPUT_FORMAT_PNG;
CTextBox.FORMAT_JPG = constant.OUTPUT_FORMAT_JPG;
CTextBox.TYPE_BLOB = constant.OUTPUT_TYPE_BLOB;
CTextBox.TYPE_BASE64 = constant.OUTPUT_TYPE_BASE64;

return CTextBox;

})));