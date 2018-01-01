import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import extend from 'extend';
import clone from 'clone';
import _Object$getPrototypeOf from 'babel-runtime/core-js/object/get-prototype-of';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import _Object$defineProperties from 'babel-runtime/core-js/object/define-properties';
import _typeof from 'babel-runtime/helpers/typeof';

var constant = {
    OUTPUT_TYPE_BASE64: 1,
    OUTPUT_TYPE_BLOB: 2,
    OUTPUT_FORMAT_PNG: "image/png",
    OUTPUT_FORMAT_JPG: "image/jpg"
};

var TextLayerCollection = function (_Array) {
    _inherits(TextLayerCollection, _Array);

    function TextLayerCollection() {
        _classCallCheck(this, TextLayerCollection);

        return _possibleConstructorReturn(this, (TextLayerCollection.__proto__ || _Object$getPrototypeOf(TextLayerCollection)).call(this));
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
    return _Object$defineProperties(obj, {
        font: {
            get: function get() {
                return this.fontSize + "px " + this.fontFamily;
            }
        }
    });
}

var TextLayer = function TextLayer() {
    var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
    var conf = arguments[1];

    _classCallCheck(this, TextLayer);

    this.textRect = [];
    var defaultConf = clone(DEFAULT_CONF);
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
        _classCallCheck(this, Renderer);

        this.previousDrawingWidth = 0;
        this.width = 0;
        this.height = 0;
        this.top = 0;
        this.left = 0;
        this.lastReflowIndex = 0;
        this.forceReflow = false;
        this.eachLine = [];
    }

    _createClass(Renderer, [{
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
        _classCallCheck(this, CTextBox);

        this.collection = new TextLayerCollection();
        this.renderer = new Renderer();
        this.operationStack = [];
    }

    _createClass(CTextBox, [{
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
                    this.operationStack.push(clone(layer));
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

export default CTextBox;
