import constant from "./common/constant.js";
import extend from "extend";
import clone from "clone";
import { TextLayer, TextLayerCollection } from "./modules/text-layer.js";
import Renderer from "./modules/renderer.js";


class CTextBox {
    constructor() {
        this.collection = new TextLayerCollection();
        this.renderer = new Renderer();
    }

    /**
     * @description 绘图
     * @param { HTMLCanvasElement | CanvasRenderingContext2D } canvasOrCtx
     * @param {RendererConfig} option
     *
     */
    draw(canvasOrCtx, option) {
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
            this.renderer.draw(ctx, this.collection, option);
        } else {
            throw Error(`Argument 1 type error, expected HTMLCanvasElement or CanvasRenderingContext2D`);
        }
    }

    line(text, conf = {}) {
        this.collection.push(new TextLayer(text, extend(conf, { forceNextLine: true })));
        return this;
    }
}

CTextBox.FORMAT_PNG = constant.OUTPUT_FORMAT_PNG;
CTextBox.FORMAT_JPG = constant.OUTPUT_FORMAT_JPG;
CTextBox.TYPE_BLOB = constant.OUTPUT_TYPE_BLOB;
CTextBox.TYPE_BASE64 = constant.OUTPUT_TYPE_BASE64;
CTextBox.VERSION = constant.VERSION;

export default CTextBox;