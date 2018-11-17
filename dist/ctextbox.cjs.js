'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _classCallCheck = _interopDefault(require('babel-runtime/helpers/classCallCheck'));
var _createClass = _interopDefault(require('babel-runtime/helpers/createClass'));
var extend = _interopDefault(require('extend'));
var clone = _interopDefault(require('clone'));
var _Object$getPrototypeOf = _interopDefault(require('babel-runtime/core-js/object/get-prototype-of'));
var _possibleConstructorReturn = _interopDefault(require('babel-runtime/helpers/possibleConstructorReturn'));
var _inherits = _interopDefault(require('babel-runtime/helpers/inherits'));
var _typeof = _interopDefault(require('babel-runtime/helpers/typeof'));

var constant = {
    OUTPUT_TYPE_BASE64: 1,
    OUTPUT_TYPE_BLOB: 2,
    OUTPUT_FORMAT_PNG: "image/png",
    OUTPUT_FORMAT_JPG: "image/jpg",
    VERSION: "1.0.0"
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
 * @typedef { Object } TextLayerConfigure
 * @property { Number } fontSize - 字体大小
 * @property { String } fontFamily - 字体类型
 * @property { String | Number } lineHeight - 行高，支持倍数（数字类型）与像素（需传入形如 '12px' 的字符串)
 * @property { String } verticalAlign - canvas 的 textBaseline 属性，只支持传入 "alphabetic|top|hanging|middle|ideographic|bottom"
 * @property { String } color - css 支持的颜色表达字符串
 * @property { Number } strokeWidth - canvas 的 strokeWidth 属性，文字边框宽度
 * @property { String } strokeColor - canvas 的 strokeColor 属性，文字边框的颜色
 * @property { String } backgroundColor - 文字背景颜色
 * @property { Boolean } forceNextLine - 该图层是否强制换行
 */
var DEFAULT_CONF = {
	fontSize: 20,
	fontFamily: 'Microsoft YaHei, PingFang SC, Arial',
	lineHeight: 1.5,
	verticalAlign: 'alphabetic',
	color: 'rgba(0, 0, 0, 1)',
	/** 
     * @deprecated 
     * */
	paddingTop: 0,
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
     * @param { String } text 
     * @param { TextLayerConfigure } conf 
     */
	function TextLayer() {
		var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
		var conf = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : clone(DEFAULT_CONF);

		_classCallCheck(this, TextLayer);

		this.textRect = [];
		conf.text = text;
		extend(this, DEFAULT_CONF, conf);
	}

	_createClass(TextLayer, [{
		key: 'font',
		get: function get() {
			return this.fontSize + 'px ' + this.fontFamily;
		}
	}]);

	return TextLayer;
}();

var DEBUG = false;

/**
 * @description 绘图配置
 * @typedef { Object } RendererConfig
 * @property { Number } option.width - 绘图框宽度
 * @property { Number } option.top - 绘图框所在位置
 * @property { Number } option.left - 绘图框所在位置
 * @property { Number } option.autoHeight - 根据算出来的画布高度来设定 canvas 高度
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
        // 对于那些很长的段落，我们可以猜想一下它相对较长的子串，来避免过长的切割导致性能低下
        var sourceTextLengthGuessing = Math.floor(maxWidth / Math.floor(ctx.measureText('x').width));
        var _text = layer.text.slice(currentPos, currentPos + sourceTextLengthGuessing);

        if (_text.length > 0) {
            var oriText = _text;
            // let text = oriText;
            var pos = _text.length;
            var halfPos = Math.floor(_text.length / 2);
            var addOneCharText = oriText;
            var nextChar = "";
            var nextCharWidth = 0;
            var _textWidth = Math.floor(ctx.measureText(_text).width);
            var addOneCharTextWidth = _textWidth;
            var _resultWidth = this.previousDrawingWidth + _textWidth;
            var addOneCharResultWidth = _resultWidth;
            var computedProcess = _resultWidth <= maxWidth; // false -> minus processing.
            var deltaPos = halfPos;

            if (_resultWidth >= maxWidth) {
                do {
                    if (computedProcess) {
                        pos = pos + deltaPos;
                    } else {
                        pos = pos - deltaPos;
                    }

                    addOneCharText = oriText.slice(0, pos + 1);
                    _text = addOneCharText.slice(0, -1);
                    nextChar = addOneCharText.slice(-1);
                    nextCharWidth = Math.floor(ctx.measureText(nextChar).width);
                    _textWidth = Math.floor(ctx.measureText(_text).width);
                    addOneCharTextWidth = _textWidth + nextCharWidth;
                    addOneCharResultWidth = addOneCharTextWidth + this.previousDrawingWidth;
                    _resultWidth = _textWidth + this.previousDrawingWidth;

                    deltaPos = Math.floor(deltaPos / 2);

                    if (deltaPos === 0) {
                        break;
                    }

                    computedProcess = _resultWidth <= maxWidth;

                    // 最完美的结果是，加一个字就超过长度，不加就刚刚好
                } while (!(_resultWidth <= maxWidth && addOneCharResultWidth > maxWidth));

                return {
                    pos: currentPos + pos - 1,
                    textWidth: _textWidth,
                    text: _text,
                    nextLine: true
                };
            } else {
                return {
                    pos: currentPos + _text.length - 1,
                    textWidth: _textWidth,
                    text: _text,
                    nextLine: false
                };
            }
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

    collection.forEach(function (layer) {
        ctx.save();
        ctx.font = layer.font;
        var eachLine = _this.eachLine;
        var eachLineStartIndex = _this.eachLine.length;
        var currentTextPos = 0;

        if (layer.forceNextLine) {
            nextLine.apply(_this);
        }

        var suitableText = consultForSuitableText.call(_this, ctx, layer, currentTextPos, maxWidth);

        // 把长文字分行
        while (suitableText) {
            // let inlineBoxTop = top + lineHeight * this.currentLine;
            var inlineBoxLeft = _this.previousDrawingWidth;
            var text = suitableText.text;
            var textWidth = suitableText.textWidth;

            currentTextPos = suitableText.pos += 1;
            eachLine[eachLine.length - 1].inlineElements.push({
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

        if (eachLine[eachLineStartIndex]) {
            // 标记行开始, 用于 padding-top
            eachLine[eachLineStartIndex].lineBefore = true;

            // 标记行结束
            if (eachLine.length - eachLineStartIndex > 1) {
                eachLine[eachLine.length - 1].lineAfter = true;
            } else {
                eachLine[eachLineStartIndex].lineAfter = true;
            }
        }

        ctx.restore();
    });

    this.eachLine.forEach(function (line) {
        var inlineElements = line.inlineElements;
        var lineLineHeight = inlineElements.length > 0 ? Math.max.apply(null, inlineElements.map(function (v) {
            return Renderer.getRealLineHeight(v.layer.lineHeight, v.layer.fontSize);
        })) : 0;
        var paddingTop = line.lineBefore && inlineElements.length > 0 ? Math.max.apply(null, inlineElements.map(function (v) {
            return v.layer.paddingTop || 0;
        })) : 0;

        line.lineHeight = lineLineHeight + (line.lineBefore ? paddingTop : 0);
        line.lineBoxX = left;
        textBoxHeight += line.lineHeight;
        line.lineBoxY = textBoxHeight;
        inlineElements.forEach(function (el) {
            var layer = el.layer;
            var layerFontSize = layer.fontSize;
            // 应用 css 的行高规则，（行高 - 字体大小）除以 2 分别分配给字体的上下两部分
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
 * @description 核心绘图方法
 * @param {CanvasRenderingContext2D} ctx
 * @private
 */
function _draw(ctx, config) {
    if (config.autoHeight) {
        ctx.canvas.height = this.height + config.top;
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

            if (layer.backgroundColor) {
                var paddingTop = layer.paddingTop || 0;
                var layerFontSize = layer.fontSize;
                var deltaY = el.deltaY;
                ctx.save();
                ctx.fillStyle = layer.backgroundColor;
                ctx.fillRect(el.x, el.y + paddingTop + deltaY + config.top, el.textWidth, -(layerFontSize + paddingTop + deltaY));

                if (DEBUG) {
                    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
                    ctx.fillRect(el.x, el.y + deltaY + config.top, el.textWidth, -lineHeight);
                }

                ctx.restore();
            }

            ctx.fillText(el.text, el.x, el.y + config.top);
            layer.strokeColor && ctx.strokeText(el.text, el.x, el.y + config.top);
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
        key: 'draw',


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
        key: 'reflow',
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
        key: 'reset',
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
        key: 'clear',
        value: function clear(ctx) {
            ctx.clearRect(this.top, this.left, this.width, this.height);
        }
    }], [{
        key: 'configHandler',
        value: function configHandler(config) {
            var maxWidth = void 0;
            var top = 0;
            var left = 0;
            var autoHeight = false;

            if ((typeof config === 'undefined' ? 'undefined' : _typeof(config)) === "object") {
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
        key: 'getRealLineHeight',
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

/**
 * @description 绘图配置
 * @typedef {Object} RendererConfig
 * @param {Number} option.width - 绘图框宽度
 * @param {Number} option.top - 绘图框所在位置
 * @param {Number} option.left - 绘图框所在位置
 * @param {Number} option.autoHeight - 根据算出来的画布高度来设定 canvas 高度
 */

var CTextBox = function () {
    function CTextBox() {
        _classCallCheck(this, CTextBox);

        this.collection = new TextLayerCollection();
        this.renderer = new Renderer();
    }

    /**
     * @description 绘图
     * @param { HTMLCanvasElement | CanvasRenderingContext2D } canvasOrCtx
     * @param { RendererConfig } option
     *
     */


    _createClass(CTextBox, [{
        key: 'draw',
        value: function draw(canvasOrCtx, option) {
            var canvas = null;
            var ctx = null;

            if (canvasOrCtx instanceof HTMLCanvasElement) {
                canvas = canvasOrCtx;
            } else if (canvasOrCtx instanceof CanvasRenderingContext2D) {
                ctx = canvasOrCtx;
            }

            if (canvas) {
                ctx = canvasOrCtx.getContext('2d');
            }

            if (ctx) {
                this.renderer.draw(ctx, this.collection, option);
            } else {
                throw Error('Argument 1 type error, expected HTMLCanvasElement or CanvasRenderingContext2D');
            }
        }
    }, {
        key: 'line',
        value: function line(text) {
            var conf = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            this.collection.push(new TextLayer(text, extend(conf, { forceNextLine: true })));
            return this;
        }
    }, {
        key: 'put',
        value: function put(text) {
            var conf = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            this.collection.push(new TextLayer(text, conf));
            return this;
        }
    }]);

    return CTextBox;
}();

CTextBox.FORMAT_PNG = constant.OUTPUT_FORMAT_PNG;
CTextBox.FORMAT_JPG = constant.OUTPUT_FORMAT_JPG;
CTextBox.TYPE_BLOB = constant.OUTPUT_TYPE_BLOB;
CTextBox.TYPE_BASE64 = constant.OUTPUT_TYPE_BASE64;
CTextBox.VERSION = constant.VERSION;

module.exports = CTextBox;
