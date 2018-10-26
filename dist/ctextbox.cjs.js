'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _classCallCheck = _interopDefault(require('babel-runtime/helpers/classCallCheck'));
var _createClass = _interopDefault(require('babel-runtime/helpers/createClass'));
var extend = _interopDefault(require('extend'));
var clone = _interopDefault(require('clone'));
var _Object$getPrototypeOf = _interopDefault(require('babel-runtime/core-js/object/get-prototype-of'));
var _possibleConstructorReturn = _interopDefault(require('babel-runtime/helpers/possibleConstructorReturn'));
var _inherits = _interopDefault(require('babel-runtime/helpers/inherits'));
var extend$1 = _interopDefault(require('node.extend'));
var _typeof = _interopDefault(require('babel-runtime/helpers/typeof'));

var constant = {
    OUTPUT_TYPE_BASE64: 1,
    OUTPUT_TYPE_BLOB: 2,
    OUTPUT_FORMAT_PNG: "image/png",
    OUTPUT_FORMAT_JPG: "image/jpg"
};

/**
 * @description 文字图层的集合
 */
var TextLayerCollection = function (_Array) {
    _inherits(TextLayerCollection, _Array);

    function TextLayerCollection() {
        _classCallCheck(this, TextLayerCollection);

        return _possibleConstructorReturn(this, (TextLayerCollection.__proto__ || _Object$getPrototypeOf(TextLayerCollection)).call(this));
    }

    return TextLayerCollection;
}(Array);

/**
 * @description 图层的基础属性
 * @typedef {Object} TextLayerConfigure
 * 
 */
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

/**
 * @description 文字图层的集合
 */
var TextLayer = function () {
    /**
     * 
     * @param {String} text 
     * @param {TextLayerConfigure} conf 
     */
    function TextLayer() {
        var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
        var conf = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : clone(DEFAULT_CONF);

        _classCallCheck(this, TextLayer);

        this.textRect = [];
        conf.text = text;
        extend$1(this, DEFAULT_CONF, conf);
    }

    _createClass(TextLayer, [{
        key: "font",
        get: function get() {
            return this.fontSize + "px " + this.fontFamily;
        }
    }]);

    return TextLayer;
}();

var DEBUG = false;

/**
 * @description 绘图配置
 * @typedef {Object} RendererConfig
 * @param {Number} option.width - 绘图框宽度
 * @param {Number} option.top - 绘图框所在位置
 * @param {Number} option.left - 绘图框所在位置
 * @param {Number} option.autoHeight - 根据算出来的画布高度来设定 canvas 高度
 */

/**
 * @description 协商与传入宽度最适合的字符串以及一些位置信息
 * @param {CanvasRenderingContext2D} ctx
 * @param {TextLayer} layer
 * @param {Number} currentPos
 * @param {Number} maxWidth
 * @return {SuitableTextResult | null}
 */
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

            // 这里用了 二分法 来不断缩减字符直到小于传入宽度
            do {
                pos = Math.floor(_text.length / 2);
                halfPos = pos;
                _text = oriText.slice(0, pos);
                addOneCharText = oriText.slice(0, pos + 1);
                addOneCharResultWidth = ctx.measureText(addOneCharText).width + this.previousDrawingWidth;
                _textWidth = ctx.measureText(_text).width;
                _resultWidth = ctx.measureText(_text).width + this.previousDrawingWidth;
            } while (_resultWidth >= maxWidth);

            // 再用了 二分法 来不断增加字符来逼近最大绘图宽度
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

            /**
             * @description 计算与宽度最佳匹配行的数据结构
             * @typedef {Object} SuitableTextResult
             * @param {Number} pos - 
             * @param {Number} textWidth
             * @param {String} text
             * @param {Boolean} nextLine
             */
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
    } else {
        return null;
    }
}

/**
 * @private
 * @description 对 TextLayerCollection 遍历并根据给予的最大宽度最优匹配计算，最后获得所有可供 canvas 处理的位置信息和内容信息
 * @this Renderer
 * @param {CanvasRenderingContext2D} ctx
 * @param {TextLayerCollection} collection
 * @param {RendererConfig} config
 */
function calculate(ctx, collection, config) {
    var _this = this;

    var _Renderer$configHandl = Renderer.configHandler(config),
        top = _Renderer$configHandl.top,
        left = _Renderer$configHandl.left,
        maxWidth = _Renderer$configHandl.maxWidth;

    var textBoxHeight = 0;
    var textBoxWidth = maxWidth;

    if (!config.isIncremental) {
        this.eachLine = [{
            inlineElements: []
        }];
    }

    // 遍历 collection 中的每个子层，把子层的文本切成一个个合适长度的文本段
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
            return Renderer.getRealLineHeight(v.layer.lineHeight, v.layer.fontSize);
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

/**
 * @private
 * @description 核心绘图方法
 * @param {CanvasRenderingContext2D} ctx
 * @param {RendererConfig} config
 */
function _draw(ctx, config) {
    if (config.autoHeight) {
        ctx.canvas.height = this.height;
    }

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
            var paddingTop = layer.padding;

            if (layer.backgroundColor) {
                var layerFontSize = layer.fontSize;
                var deltaY = el.deltaY;
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

function nextLine() {
    this.previousDrawingWidth = 0;
    this.currentLine += 1;
    this.eachLine[this.eachLine.length] = {
        inlineElements: []
    };
}

var Renderer = function () {
    function Renderer() {
        _classCallCheck(this, Renderer);

        this.previousDrawingWidth = 0;
        this.currentLine = 1;
        this.width = 0;
        this.height = 0;
        this.top = 0;
        this.left = 0;
        this.lastReflowIndex = 0;
        this.eachLine = [];
    }

    /**
     * @description 获取宽度与位置的的配置
     * @param config
     * @return {RendererConfig}
     */


    _createClass(Renderer, [{
        key: "draw",


        /**
         * @description 绘图
         * @param {CanvasRenderingContext2D} ctx 
         * @param {TextLayerCollection} collection 
         * @param {RendererConfig} config 
         */
        value: function draw(ctx, collection) {
            var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
                width: 300,
                reflow: false,
                top: 0,
                left: 0,
                autoHeight: false,
                isIncremental: false
            };


            // 判断是否只做增量重排
            if (config.isIncremental) {
                // partially reflow
                this.reflow(ctx, collection.slice(this.lastReflowIndex + 1), config);
            } else {
                this.reset(this);
                this.reflow(ctx, collection, config);
            }

            _draw.call(this, ctx, config);
        }

        /**
         * @description 图层重排，重新根据 collection 来计算出各行子元素所在位置以及内容宽度
         * @param {CanvasRenderingContext2D} ctx 
         * @param {TextLayerCollection} collection 
         * @param {RendererConfig} config 
         */

    }, {
        key: "reflow",
        value: function reflow(ctx, collection) {
            var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
                width: 300,
                top: 0,
                left: 0,
                autoHeight: false,
                // 增量绘图
                isIncremental: false
            };

            calculate.call(this, ctx, collection, config, config.isIncremental);
        }

        /**
         * @description 重置 renderer 的执行上下文变量
         */

    }, {
        key: "reset",
        value: function reset() {
            this.previousDrawingWidth = 0;
            this.currentLine = 1;
            this.width = 0;
            this.height = 0;
            this.top = 0;
            this.left = 0;
            this.lastReflowIndex = 0;
            this.eachLine = [];
        }

        /**
         * 
         * @param {CanvasRenderingContext2D} ctx 
         */

    }, {
        key: "clear",
        value: function clear(ctx) {
            ctx.clearRect(this.top, this.left, this.width, this.height);
        }
    }], [{
        key: "configHandler",
        value: function configHandler(config) {
            var maxWidth = void 0;
            var top = 0;
            var left = 0;
            var autoHeight = false;

            if ((typeof config === "undefined" ? "undefined" : _typeof(config)) === "object") {
                maxWidth = config.maxWidth || 300;
                top = config.top || 0;
                left = config.left || 0;
                autoHeight = !!config.autoHeight;
            } else if (!parseInt(config)) {
                throw Error("Type maxWidth error! expect Number.");
            } else {
                maxWidth = parseInt(config) || 300;
            }

            return { top: top, left: left, maxWidth: maxWidth, autoHeight: autoHeight };
        }

        /**
         * @description 获取真实行高 - 把一些倍数行高转换成真实 px 的行高
         * @param { Number } lineHeight
         * @param { Number } fontSize
         * @return { Number }
         */

    }, {
        key: "getRealLineHeight",
        value: function getRealLineHeight(lineHeight, fontSize) {
            if (typeof lineHeight === "number") {
                return parseFloat((lineHeight * fontSize).toFixed(2));
            } else if (typeof lineHeight === "string") {
                return parseInt(lineHeight);
            }
        }
    }]);

    return Renderer;
}();

var CTextBox = function () {
    function CTextBox() {
        _classCallCheck(this, CTextBox);

        this.collection = new TextLayerCollection();
        this.renderer = new Renderer();
    }

    /**
     * @description 绘图
     * @param { HTMLCanvasElement | CanvasRenderingContext2D } canvasOrCtx
     * @param {RendererConfig} option
     *
     */


    _createClass(CTextBox, [{
        key: "draw",
        value: function draw(canvasOrCtx, option) {
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
                this.renderer.draw(ctx, this.collection, option);
            } else {
                throw Error("Argument 1 type error, expected HTMLCanvasElement or CanvasRenderingContext2D");
            }
        }
    }, {
        key: "line",
        value: function line(text) {
            var conf = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            this.collection.push(new TextLayer(text, extend(conf, { forceNextLine: true })));
            return this;
        }
    }]);

    return CTextBox;
}();

CTextBox.FORMAT_PNG = constant.OUTPUT_FORMAT_PNG;
CTextBox.FORMAT_JPG = constant.OUTPUT_FORMAT_JPG;
CTextBox.TYPE_BLOB = constant.OUTPUT_TYPE_BLOB;
CTextBox.TYPE_BASE64 = constant.OUTPUT_TYPE_BASE64;

module.exports = CTextBox;
