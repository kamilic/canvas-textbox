# canvas-textbox
[![travisCI](https://www.travis-ci.org/kamilic/canvas-textbox.svg?branch=master)](https://www.travis-ci.org/kamilic/canvas-textbox) [![codecov](https://codecov.io/gh/kamilic/canvas-textbox/branch/master/graph/badge.svg)](https://codecov.io/gh/kamilic/canvas-textbox)  

带自动断句换行的 canvas 文本展示框，主要解决中文文本在 canvas 上不能进行换行的问题。

## Usage

```javascript
let tb = new Ctextbox();
let canvas = document.getElementById("mycanvas");
tb.put("hello world", {
    fontFamily: "Arial",
    fontSize: 22,
    lineHeight: 1.5,
    color: "rgba(0, 255, 0, 1)",
    strokeWidth: 1,
    strokeColor: "rgba(0, 0, 255, 1)"
}).put("   - append to ", {
    fontFamily: "Arial",
    fontSize: 28,
    lineHeight: 1.5,
    strokeWidth: 1,
    backgroundColor: 'red',
    strokeColor: "rgba(0, 0, 255, 1)"
}).put("tototototo next line --------------> ", {
    fontFamily: "Arial",
    fontSize: 28,
    lineHeight: 1.5,
    strokeWidth: 1,
    backgroundColor: 'red',
    strokeColor: "rgba(0, 0, 255, 1)"
}).line("a long text a long text a long text a long text a long text a long text a long text ", {
    backgroundColor: "rgba(0, 255, 0, 1)",
}).draw(canvas, {
    top: 50,
    left: 50,
    maxWidth: 500,
    autoHeight: true
});
```



## API

#### Ctextbox.put(text, conf)

插入一个文字图层。

| PARAMS | TYPE               | DESCRIPTIONS | required |
| ------ | ------------------ | ------------ | -------- |
| text   | String             | 输入文本         | true     |
| conf   | TextLayerConfigure | 该行文本的样式设置    | true     |

##### Return 

Ctextbox



#### Ctextbox.line(text, conf)

插入一个文字段落图层，与 ```put``` 方法相比，这个会做强制换行处理。

| PARAMS | TYPE               | DESCRIPTIONS | required |
| ------ | ------------------ | ------------ | -------- |
| text   | String             | 输入文本         | true     |
| conf   | TextLayerConfigure | 该行文本的样式设置    | true     |

##### Return

Ctextbox



#### Ctextbox.draw(canvasOrCtx, conf)

插入一个文字图层。

| PARAMS      | TYPE                                     | DESCRIPTIONS | required |
| ----------- | ---------------------------------------- | ------------ | -------- |
| canvasOrCtx | HTMLCanvasElement \| CanvasRenderingContext2D | 输入文本         | true     |
| conf        | RendererConfig                           | 该行文本的样式设置    | true     |

##### Return

Ctextbox



## Classes

#### TextLayerConfigure

##### type

Object

##### properties

| PARAMS          | TYPE             | DESCRIPTIONS                        |
| --------------- | ---------------- | ----------------------------------- |
| fontSize        | Number           | 字体大小                                |
| fontFamily      | String           | 字体类型                                |
| lineHeight      | String \| Number | 行高，支持倍数（数字类型）与像素（需传入形如 '12px' 的字符串) |
| color           | String           | css 支持的颜色表达字符串                      |
| strokeWidth     | Number           | canvas 的 strokeWidth 属性，文字边框宽度      |
| strokeColor     | String           | canvas 的 strokeColor 属性，文字边框的颜色     |
| backgroundColor | String           | 文字背景颜色                              |
| forceNextLine   | Boolean          | 该图层是否强制换行                           |

##### 

#### RendererConfig

##### type

Object

##### properties

| PARAMS     | TYPE   | DESCRIPTIONS            |
| ---------- | ------ | ----------------------- |
| width      | Number | 绘图框宽度                   |
| top        | Number | 绘图框所在位置                 |
| left       | Number | 绘图框所在位置                 |
| autoHeight | Number | 根据算出来的画布高度来设定 canvas 高度 |



## Demo

你可以查看 [./test/index.html](https://github.com/kamilic/canvas-textbox/blob/master/test/index.html) 中的小例子