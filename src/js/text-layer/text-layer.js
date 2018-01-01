import extend from "extend";
import clone from "clone";

const DEFAULT_CONF = {
    fontSize: 20,
    fontFamily: "Microsoft YaHei, PingFang SC, Arial",
    lineHeight: 1.5,
    verticalAlign: "alphabetic",
    color: "rgba(0, 0, 0, 1)",
    padding: 5,
    strokeWidth: 1,
    strokeColor: null,
    backgroundColor: null,
    forceNextLine: false,
};

function integrateWithGetter(obj) {
    return Object.defineProperties(obj, {
        font: {
            get() {
                return `${this.fontSize}px ${this.fontFamily}`
            }
        }
    })
}

class TextLayer {
    constructor(text = "", conf) {
        this.textRect = [];
        let defaultConf = clone(DEFAULT_CONF);
        let currentConf = (conf && integrateWithGetter(extend(defaultConf, conf))) || defaultConf;
        currentConf.text = text;
        integrateWithGetter(this);
        return extend(this, currentConf);
    }
}

export default TextLayer;