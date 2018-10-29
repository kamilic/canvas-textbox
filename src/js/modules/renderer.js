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
        if (resultWidth >= maxWidth) {
            let oriText = layer.text.slice(currentPos);
            let pos = oriText.length;
            let halfPos;
            let addOneCharText = oriText;
            let text = oriText;
            let addOneCharResultWidth;
            let resultWidth;
            let textWidth;
            let addOneCharTextWidth;

            // 这里用了 二分法 来不断缩减字符直到小于传入宽度
            do {
                pos = Math.floor(text.length / 2);
                halfPos = pos;
                text = oriText.slice(0, pos);
                addOneCharText = oriText.slice(0, pos + 1);
                addOneCharResultWidth = ctx.measureText(addOneCharText).width + this.previousDrawingWidth;
                textWidth = ctx.measureText(text).width;
                resultWidth = ctx.measureText(text).width + this.previousDrawingWidth;
            } while (resultWidth >= maxWidth);

            // 再用了 二分法 来不断增加字符来逼近最大绘图宽度
            while (!(resultWidth <= maxWidth && addOneCharResultWidth > maxWidth)) {
                if (halfPos === 1 && resultWidth > maxWidth) {
                    pos -= 1;
                } else {
                    halfPos = Math.ceil(halfPos / 2);
                    pos = pos + halfPos;
                }
                text = oriText.slice(0, pos);
                addOneCharText = oriText.slice(0, pos + 1);
                textWidth = ctx.measureText(text).width;
                addOneCharTextWidth = ctx.measureText(addOneCharText).width;
                addOneCharResultWidth = addOneCharTextWidth + this.previousDrawingWidth;
                resultWidth = textWidth + this.previousDrawingWidth;
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