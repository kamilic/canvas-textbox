# canvas-textbox
[![travisCI](https://www.travis-ci.org/kamilic/demo.svg?branch=master)](https://www.travis-ci.org/kamilic/demo) [![codecov](https://codecov.io/gh/kamilic/demo/branch/master/graph/badge.svg)](https://codecov.io/gh/kamilic/demo)  
带自动断句换行的 canvas 文本展示框。

### Usage 
```javascript
import Ctextbox from "ctextbox";
let tb = new Ctextbox();
let canvas = document.getElementById("mycanvas");
tb.put("hello world", {
    fontFamily: "Arial",
    fontSize : 22,
    lineHeight: 1.5,
    color: "rgba(0, 255, 0, 1)",
    padding: 5,
    strokeWidth: 1,
    strokeColor: "rgba(0, 0, 255, 1)"
})
.line("a long text a long text a long text a long text a long text a long text a long text ", {
	 backgroundColor: "rgba(0, 255, 0, 1)",
})
.draw(canvas, {
    top: 50,
    left : 50,
    maxWidth : 200
});
```