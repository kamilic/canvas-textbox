import extend from 'extend';
import clone from 'clone';

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
const DEFAULT_CONF = {
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
export class TextLayer {
	/**
     * 
     * @param { String } text 
     * @param { TextLayerConfigure } conf 
     */
	constructor(text = '', conf = clone(DEFAULT_CONF)) {
		this.textRect = [];
		conf.text = text;
		extend(this, DEFAULT_CONF, conf);
	}

	get font() {
		return `${this.fontSize}px ${this.fontFamily}`;
	}
}

export default {
	TextLayer,
	TextLayerCollection
};
