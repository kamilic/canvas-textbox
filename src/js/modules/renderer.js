import { DEBUG } from '../common/config';

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
    let text = layer.text.slice(currentPos);
    let textWidth = ctx.measureText(text).width;
    let resultWidth = textWidth + this.previousDrawingWidth;

    if (text.length > 0) {
        // 对于那些很长的段落，我们可以猜想一下它相对较长的子串，来避免过长的切割导致性能低下
        let sourceTextLengthGuessing = Math.floor(maxWidth / Math.floor(ctx.measureText('x').width));
        let text = layer.text.slice(currentPos, currentPos + sourceTextLengthGuessing);

        if (text.length > 0) {
            let oriText = text;
            // let text = oriText;
            let pos = text.length;
            let halfPos = Math.floor(text.length / 2);
            let addOneCharText = oriText;
            let nextChar = "";
            let nextCharWidth = 0;
            let textWidth = Math.floor(ctx.measureText(text).width);
            let addOneCharTextWidth = textWidth;
            let resultWidth = this.previousDrawingWidth + textWidth;
            let addOneCharResultWidth = resultWidth;
            let computedProcess = resultWidth <= maxWidth; // false -> minus processing.
            let deltaPos = halfPos;

            if (resultWidth >= maxWidth) {
                do {
                    if (computedProcess) {
                        pos = pos + deltaPos;
                    } else {
                        pos = pos - deltaPos;
                    }

                    addOneCharText = oriText.slice(0, pos + 1);
                    text = addOneCharText.slice(0, -1);
                    nextChar = addOneCharText.slice(-1);
                    nextCharWidth = Math.floor(ctx.measureText(nextChar).width);
                    textWidth = Math.floor(ctx.measureText(text).width);
                    addOneCharTextWidth = textWidth + nextCharWidth;
                    addOneCharResultWidth = addOneCharTextWidth + this.previousDrawingWidth;
                    resultWidth = textWidth + this.previousDrawingWidth;

                    deltaPos = Math.floor(deltaPos / 2);

                    if (deltaPos === 0) {
                        break;
                    }

                    computedProcess = resultWidth <= maxWidth;

                // 最完美的结果是，加一个字就超过长度，不加就刚刚好
                } while (!(resultWidth <= maxWidth && addOneCharResultWidth > maxWidth));

                return {
                    pos: currentPos + pos - 1,
                    textWidth,
                    text,
                    nextLine: true
                }
            } else {
                return {
                    pos: currentPos + text.length - 1,
                    textWidth,
                    text,
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
    let { top, left, maxWidth } = Renderer.configHandler(config);
    let textBoxHeight = 0;
    let textBoxWidth = maxWidth;

    if (!config.isIncremental) {
        this.eachLine = [{
            inlineElements: []
        }];
    }

    collection.forEach((layer) => {
        ctx.save();
        ctx.font = layer.font;
        let eachLine = this.eachLine;
        let eachLineStartIndex = this.eachLine.length;
        let currentTextPos = 0;

        if (layer.forceNextLine) {
            nextLine.apply(this);
        }

        let suitableText = consultForSuitableText.call(this, ctx, layer, currentTextPos, maxWidth);

        // 把长文字分行
        while (suitableText) {
            // let inlineBoxTop = top + lineHeight * this.currentLine;
            let inlineBoxLeft = this.previousDrawingWidth;
            let text = suitableText.text;
            let textWidth = suitableText.textWidth;

            currentTextPos = (suitableText.pos += 1);
            eachLine[eachLine.length - 1]
                .inlineElements
                .push({
                    layer: layer,
                    // inlineBoxTop,
                    inlineBoxLeft,
                    text,
                    textWidth
                });
            this.previousDrawingWidth += suitableText.textWidth;

            if (suitableText.nextLine) {
                nextLine.apply(this);
            }

            suitableText = consultForSuitableText.call(this, ctx, layer, currentTextPos, maxWidth);
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

    this.eachLine.forEach((line) => {
        let inlineElements = line.inlineElements;
        let lineLineHeight = inlineElements.length > 0 ?
            Math.max.apply(null, inlineElements.map((v) => Renderer.getRealLineHeight(v.layer.lineHeight, v.layer.fontSize))) :
            0;
        let paddingTop = line.lineBefore && inlineElements.length > 0 ?
            Math.max.apply(null, inlineElements.map((v) => v.layer.paddingTop || 0)) : 0;

        line.lineHeight = lineLineHeight + line.lineBefore ? paddingTop : 0;
        line.lineBoxX = left;
        textBoxHeight += line.lineHeight;
        line.lineBoxY = textBoxHeight;
        inlineElements.forEach((el) => {
            let layer = el.layer;
            let layerFontSize = layer.fontSize;
            // 应用 css 的行高规则，（行高 - 字体大小）除以 2 分别分配给字体的上下两部分
            let deltaY = parseFloat(((lineLineHeight - layerFontSize) / 2).toFixed(2));

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

function nextLine() {
    this.previousDrawingWidth = 0;
    this.currentLine += 1;
    this.eachLine[this.eachLine.length] = {
        inlineElements: []
    };
}

class Renderer {

    constructor() {
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
    static configHandler(config) {
        let maxWidth;
        let top = 0;
        let left = 0;
        let autoHeight = false;

        if (typeof config === "object") {
            maxWidth = config.maxWidth || 300;
            top = config.top || 0;
            left = config.left || 0;
            autoHeight = !!config.autoHeight;
        } else if (!parseInt(config)) {
            throw Error("Type maxWidth error! expect Number.");
        } else {
            maxWidth = parseInt(config) || 300;
        }


        return { top, left, maxWidth, autoHeight };
    }

    /**
     * @description 获取真实行高 - 把一些倍数行高转换成真实 px 的行高
     * @param { Number } lineHeight
     * @param { Number } fontSize
     * @return { Number }
     */
    static getRealLineHeight(lineHeight, fontSize) {
        if (typeof lineHeight === "number") {
            return parseFloat((lineHeight * fontSize).toFixed(2));
        } else if (typeof lineHeight === "string") {
            return parseInt(lineHeight);
        }
    }

    /**
     * @description 绘图
     * @param {CanvasRenderingContext2D} ctx 
     * @param {TextLayerCollection} collection 
     * @param {RendererConfig} config 
     */
    draw(ctx, collection, config = {
        width: 300,
        reflow: false,
        top: 0,
        left: 0,
        autoHeight: false,
        isIncremental: false
    }) {

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
    reflow(ctx, collection, config = {
        width: 300,
        top: 0,
        left: 0,
        autoHeight: false,
        // 增量绘图
        isIncremental: false
    }) {
        calculate.call(this, ctx, collection, config, config.isIncremental);
    }

    /**
     * @description 重置 renderer 的执行上下文变量
     */
    reset() {
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
    clear(ctx) {
        ctx.clearRect(this.top, this.left, this.width, this.height);
    }
}

export default Renderer;