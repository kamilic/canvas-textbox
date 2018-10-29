import extend from "node.extend";
import clone from "clone";

/**
 * @description 文字图层的集合
 */
export class TextLayerCollection extends Array {
    constructor() {
        super();
    }
}

/**
 * @description 图层的基础属性
 * @typedef {Object} TextLayerConfigure
 * 
 */
const DEFAULT_CONF = {
    fontSize: 20,
    fontFamily: "Microsoft YaHei, PingFang SC, Arial",
    lineHeight: 1.5,
    verticalAlign: "alphabetic",
    color: "rgba(0, 0, 0, 1)",
    paddingTop: 5,
    strokeWidth: 1,
    strokeColor: null,
    backgroundColor: null,
    forceNextLine: false,
};

/**
 * @description 文字图层的集合
 */
export class TextLayer {
    /**
     * 
     * @param {String} text 
     * @param {TextLayerConfigure} conf 
     */
    constructor(text = "", conf = clone(DEFAULT_CONF)) {
        this.textRect = [];
        conf.text = text;
        extend(this, DEFAULT_CONF, conf);
    }

    get font() {
        return `${this.fontSize}px ${this.fontFamily}`
    }
}


export default {
    TextLayer,
    TextLayerCollection
};