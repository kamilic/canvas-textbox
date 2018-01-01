/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {TextLayer} layer
 * @param {Number} currentPos
 * @param {Number} maxWidth
 * @returns {{pos: number, textWidth: Number, text, nextLine: boolean}}
 * @this Renderer
 */
const DEBUG = false;

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

            do {
                pos = Math.floor(text.length / 2);
                halfPos = pos;
                text = oriText.slice(0, pos);
                addOneCharText = oriText.slice(0, pos + 1);
                addOneCharResultWidth = ctx.measureText(addOneCharText).width + this.previousDrawingWidth;
                textWidth = ctx.measureText(text).width;
                resultWidth = ctx.measureText(text).width + this.previousDrawingWidth;
            } while (resultWidth >= maxWidth);

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
    let {top, left, maxWidth} = maxWidthConfHander(maxWidthOrConf);
    let textBoxHeight = 0;
    let textBoxWidth = maxWidth;
    if (!isIncremental) {
        this.eachLine = [{
            inlineElements: []
        }];
    }

    collection.forEach((layer) => {
        ctx.save();
        ctx.font = layer.font;

        if (layer.forceNextLine) {
            nextLine.apply(this);
        }

        let currentTextPos = 0;
        let suitableText = consultForSuitableText.call(this, ctx, layer, currentTextPos, maxWidth);

        while (suitableText) {
            // let inlineBoxTop = top + lineHeight * this.currentLine;
            let inlineBoxLeft = this.previousDrawingWidth;
            let text = suitableText.text;
            let textWidth = suitableText.textWidth;

            currentTextPos = (suitableText.pos += 1);
            this.eachLine[this.eachLine.length - 1]
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
        ctx.restore();
    });

    this.eachLine.forEach((line) => {
        let inlineElements = line.inlineElements;
        let lineLineHeight = inlineElements.length > 0
            ? Math.max.apply(null, inlineElements.map((v) => getRealLineHeight(v.layer.lineHeight, v.layer.fontSize)))
            : 0;
        line.lineHeight = lineLineHeight;
        line.lineBoxX = left;
        textBoxHeight += line.lineHeight;
        line.lineBoxY = textBoxHeight;
        inlineElements.forEach((el) => {
            let layer = el.layer;
            let layerFontSize = layer.fontSize;
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

function _draw(ctx) {
    this.eachLine.forEach((line) => {
        let inlineElements = line.inlineElements;
        let lineHeight = line.lineHeight; // px
        inlineElements.forEach((el) => {
            let layer = el.layer;

            ctx.save();
            ctx.font = layer.font || ctx.font;
            // ctx.textAlign = layer.verticalAlign;
            ctx.fillStyle = layer.color || ctx.fillStyle;
            ctx.strokeStyle = layer.strokeColor || "transparent";
            ctx.lineWidth = parseInt(layer.strokeWidth) || ctx.strokeWidth;

            if (layer.backgroundColor) {
                let layerFontSize = layer.fontSize;
                let deltaY = el.deltaY;
                let paddingTop = layer.padding;
                ctx.save();
                ctx.fillStyle = layer.backgroundColor;
                ctx.fillRect(el.x, el.y + paddingTop, el.textWidth, -(layerFontSize + paddingTop));
                if (DEBUG) {
                    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
                    ctx.fillRect(el.x, el.y + deltaY, el.textWidth, -(lineHeight));
                }
                ctx.restore();
            }

            ctx.fillText(el.text, el.x, el.y);
            layer.strokeColor && ctx.strokeText(el.text, el.x, el.y);
            ctx.restore();
        });
    });
}

function maxWidthConfHander(maxWidthOrConf = 300) {
    let maxWidth;
    let top = 0;
    let left = 0;

    if (typeof maxWidthOrConf === "object") {
        maxWidth = maxWidthOrConf.maxWidth || 300;
        top = maxWidthOrConf.top || 0;
        left = maxWidthOrConf.left || 0;
    } else if (!parseInt(maxWidthOrConf)) {
        throw Error("Type maxWidth error! expect Number.");
    } else {
        maxWidth = parseInt(maxWidthOrConf) || 300;
    }
    return {top, left, maxWidth};
}

class Renderer {
    constructor() {
        this.previousDrawingWidth = 0;
        this.width = 0;
        this.height = 0;
        this.top = 0;
        this.left = 0;
        this.lastReflowIndex = 0;
        this.forceReflow = false;
        this.eachLine = [];
    }

    draw(ctx, collection, maxWidthOrConf, isReflow) {
        if (!isReflow && !this.forceReflow) {
            // partially reflow
            this.reflow(ctx, collection.slice(this.lastReflowIndex + 1), maxWidthOrConf, true);
        } else {
            reset.call(this);
            this.reflow(ctx, collection, maxWidthOrConf, false);
        }
        _draw.call(this, ctx);
    }

    reflow(ctx, collection, maxWidthOrConf, isIncremental) {
        calculate.call(this, ctx, collection, maxWidthOrConf, isIncremental);
    }

    clear(ctx) {
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
}

export default Renderer;