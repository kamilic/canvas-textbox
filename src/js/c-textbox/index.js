import constant from "../common/constant.js";
import extend from "extend";
import clone from "clone";
import TextLayerCollection from "../text-layer-collection/index.js";
import TextLayer from "../text-layer/text-layer.js";
import Renderer from "../renderer/index.js";

function _draw(ctx, collection, maxWidth) {

}

class CTextBox {
    constructor() {
        this.collection = new TextLayerCollection();
        this.renderer = new Renderer();
        this.operationStack = [];
    }
    
    draw(canvasOrCtx, maxWidthOrConf = 300, isReflow = true) {
        let canvas = null;
        let ctx = null;
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
            throw Error(`Argument 1 type error, expected HTMLCanvasElement or CanvasRenderingContext2D`);
        }
    }

    output(canvas, type, format) {

    }

    put(text, conf) {
        this.collection.push(new TextLayer(text, conf));
        return this;
    }

    line(text, conf = {}) {
        this.collection.push(new TextLayer(text, extend(conf, {forceNextLine: true})));
        return this;
    }

    undo(level = 1) {
        let layers = new TextLayerCollection();
        while (level--) {
            let layer = this.collection.pop();
            if (layer) {
                layers.push(layer);
                this.operationStack.push(clone(layer));
            } else {
                break;
            }
        }
        return layers;
    }

    redo(level = 1) {
        while (level--) {
            let layer = this.operationStack.pop();
            if (layer) {
                this.collection.push(layer);
            } else {
                break;
            }
        }
        return this;
    }
}

CTextBox.FORMAT_PNG = constant.OUTPUT_FORMAT_PNG;
CTextBox.FORMAT_JPG = constant.OUTPUT_FORMAT_JPG;
CTextBox.TYPE_BLOB = constant.OUTPUT_TYPE_BLOB;
CTextBox.TYPE_BASE64 = constant.OUTPUT_TYPE_BASE64;


export default CTextBox;