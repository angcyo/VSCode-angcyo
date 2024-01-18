/**
 * Email:angcyo@126.com
 * @author angcyo
 * @date 2023-3-20
 */

(function () {
  const vscode = acquireVsCodeApi();

  const selectFile = document.getElementById("selectFile");
  const host = document.getElementById("host");
  const content = document.getElementById("content");
  const sendSize = document.getElementById("sendSize");
  const sendLoopCount = document.getElementById("sendLoopCount");
  const result = document.getElementById("result");
  const imageWrap = document.getElementById("imageWrap");
  const width = document.getElementById("width");
  const height = document.getElementById("height");

  //选中的文件全路径
  var selectPath = "";
  //生成的文件路径
  var targetPath = localStorage.getItem("targetPath") || "";

  initTextInput("host", "ws://192.168.2.109:9301");
  initTextInput("content");
  initTextInput("sendSize");
  initTextInput("sendLoopCount");
  initTextInput("width");
  initTextInput("height");

  clickButton("uuid", async () => {
    const uuid = crypto.randomUUID();
    const uuid2 = uuid.replaceAll("-", "");
    const uuidUp = uuid.toUpperCase();
    const uuid2Up = uuid2.toUpperCase();
    result.innerHTML =
      nowTimeString() +
      "\n" +
      uuid +
      "\n" +
      uuid2 +
      "\n" +
      uuidUp +
      "\n" +
      uuid2Up;
  });
  clickButton("base64Encode", () => {
    const text = content.value;
    result.innerHTML = nowTimeString() + "\n" + btoa(text); //加密
  });
  clickButton("svg2AndroidVector", () => {
    parseSvg(content.value);
  });
  clickButton("base64Decode", () => {
    const text = content.value;
    result.innerHTML = nowTimeString() + "\n" + atob(text); //解密
  });

  clickButton("clear", () => {
    result.innerHTML = "";
  });

  var isConnection = false;
  var wsSocket;
  clickButton("connect", () => {
    if (wsSocket == undefined) {
      const url = host.value; //"ws://localhost:8080"

      appendResult("准备连接到:" + url);
      wsSocket = new WebSocket(url); //创建WebSocket连接

      wsSocket.onopen = function (event) {
        isConnection = true;
        appendResult("已连接到:" + url);
      };

      wsSocket.onmessage = function (event) {
        if (typeof event.data === "string") {
          appendResult("Received Message: " + event.data);
        }

        if (event.data instanceof ArrayBuffer) {
          var buffer = event.data;
          console.log("Received Buffer: " + buffer.size);
        }
      };

      wsSocket.onclose = function (event) {
        wsSocket = undefined;
        appendResult("连接被关闭!");
      };
    } else if (isConnection) {
      appendResult("已连接");
    } else {
      appendResult("正在连接中...");
    }
  });
  clickButton("disconnect", () => {
    wsSocket?.close();
    wsSocket = undefined;
    result.innerHTML = "";
  });
  clickButton("send", () => {
    const text = content.value;
    appendResult("发送:" + text);
    wrapTime("", () => {
      wsSocket?.send(text);
    });
  });
  clickButton("sendByte", () => {
    const size = sendSize.value || 1;
    sendByte("", size);
  });
  clickButton("sendLoop", () => {
    const text = content.value;
    const count = sendLoopCount.value || 1;
    for (let i = 0; i < count; i++) {
      sendString(`第${i + 1}次,`, text);
    }
  });
  clickButton("sendByteLoop", () => {
    const size = sendSize.value || 1;
    const count = sendLoopCount.value || 1;
    for (let i = 0; i < count; i++) {
      sendByte(`第${i + 1}次,`, size);
    }
  });
  clickButton("send5", () => {
    var binary = new Uint8Array(5 * 1024 * 1024);
    appendResult("发送5MB");

    wrapTime("", () => {
      wsSocket?.send(binary.buffer);
    });
  });
  clickButton("send10", () => {
    var binary = new Uint8Array(10 * 1024 * 1024);
    appendResult("发送10MB");

    wrapTime("", () => {
      wsSocket?.send(binary.buffer);
    });
  });
  clickButton("send20", () => {
    var binary = new Uint8Array(20 * 1024 * 1024);
    appendResult("发送20MB");

    wrapTime("", () => {
      wsSocket?.send(binary.buffer);
    });
  });
  clickButton("send100", () => {
    var binary = new Uint8Array(100 * 1024 * 1024);
    appendResult("发送100MB");

    wrapTime("", () => {
      wsSocket?.send(binary.buffer);
    });
  });

  clickButton("clearPng", () => {
    clearAllImage();
  });

  //pdf2png
  clickButton("pdf2png", () => {
    if (selectPath) {
      pdfToPng();
    } else {
      vscode.postMessage({
        text: "请先选择pdf文件!",
      });
    }
  });

  //调整图片宽高
  clickButton("adjustImage", () => {
    if (selectPath) {
      adjustImage();
    } else {
      vscode.postMessage({
        text: "请先选择图片文件!",
      });
    }
  });
  clickButton("base642Png", () => {
    base642Png(content.value);
  });
  clickButton("png2Base64", () => {
    if (selectPath) {
      png2Base64();
    } else {
      vscode.postMessage({
        text: "请先选择图片文件!",
      });
    }
  });

  //---
  clickButton("numberSum", () => {
    numberSum(content.value);
  });
  clickButton("uriEncode", () => {
    appendResult("UriEncode: " + encodeURI(content.value));
  });
  clickButton("uriDecode", () => {
    appendResult("UriEncode: " + decodeURI(content.value));
  });
  clickButton("toDateTime", () => {
    //将时间戳转成日期时间
    const str = content.value || new Date().getTime();
    const time = parseInt(str);
    const date = new Date(time);
    //格式化时间 YYYY-MM-DD HH:mm:ss
    const fmt = "yyyy-MM-dd HH:mm:ss.SSS";
    const text = formatDate(date, fmt);
    appendResult(str + "->" + text);
  });
  clickButton("toTimestamp", () => {
    //将日期时间转成时间戳
    const nowDateTime = new Date();
    const fmt = "yyyy-MM-dd HH:mm:ss.SSS";
    const text = content.value || formatDate(nowDateTime, fmt);
    const date = new Date(text);
    const time = date.getTime();
    appendResult(text + "->" + time);
  });
  clickButton("toHex", () => {
    //将内容的值转换成16进制
    const text = content.value || 0;
    const result = parseInt(text).toString(16).toUpperCase();
    appendResult(text + "->" + result);
  });
  clickButton("toDec", () => {
    //将内容的值转换成10进制
    const text = content.value || 0;
    const result = parseInt(text, 16).toString(10).toUpperCase();
    appendResult(text + "->" + result);
  });
  clickButton("toOct", () => {
    //将内容的值转换成8进制
    const text = content.value || 0;
    const result = parseInt(text).toString(8).toUpperCase();
    appendResult(text + "->" + result);
  });
  clickButton("toBin", () => {
    //将内容的值转换成2进制
    const text = content.value || 0;
    const result = parseInt(text).toString(2).toUpperCase();
    appendResult(text + "->" + result);
  });
  clickButton("distance", () => {
    //求两点之间的距离
    const text = content.value || 0;
    const list = getNumberList(text);
    if (list.length >= 4) {
      const x1 = list[0];
      const y1 = list[1];
      const x2 = list[2];
      const y2 = list[3];
      const distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
      appendResult(`x1:(${x1}, ${y1}) x2:(${x2}, ${y2})`);
      appendResult("距离:" + distance);
    } else {
      vscode.postMessage({
        text: "至少需要4个数字!",
      });
    }
  });

  //---

  window.addEventListener("message", (event) => {
    const message = event.data; // The json data that the extension sent
    console.log(message);
  });

  //
  window.addEventListener("error", (event) => {
    vscode.postMessage({
      text: event.message,
    });
  });

  //选择文件监听
  selectFile.addEventListener(`change`, () => {
    console.log("选择文件...↓");
    console.log(selectFile.files);

    if (selectFile.files?.length > 0) {
      selectPath = selectFile.files[0].path;
      localStorage.setItem("selectPath", selectPath);
      console.log(selectPath);

      let path;
      if (selectPath.includes(":") > 0) {
        path = selectPath.substring(0, selectPath.lastIndexOf("\\"));
      } else {
        path = selectPath.substring(0, selectPath.lastIndexOf("/"));
      }

      targetPath = path;
      localStorage.setItem("targetPath", targetPath);
      console.log(targetPath);
    }
  });

  //---

  /**发送字节数 kb */
  function sendByte(tag, size) {
    var binary = new Uint8Array(size * 1024);
    appendResult(`发送字节:${size}KB`);
    wrapTime(tag, () => {
      wsSocket?.send(binary.buffer);
    });
  }

  /**发送字符串*/
  function sendString(tag, text) {
    appendResult("发送:" + text);
    wrapTime(tag, () => {
      wsSocket?.send(text);
    });
  }

  /**
   * 点击一个按钮
   * @param {string} id
   * @param {*} action
   */
  function clickButton(id, action) {
    const element = document.getElementById(id);
    element.addEventListener("click", () => {
      action();
    });
  }

  /**
   * 自动持久化输入控件
   * @param {string} id 控件的id
   * @param {string} key 持久化的key
   */
  function initTextInput(id, def = "") {
    const input = document.getElementById(id);
    input.addEventListener(`input`, () => {
      localStorage.setItem(id, input.value);
    });
    input.value = localStorage.getItem(id) || def;
  }

  function nowTimeString(fmt) {
    return formatDate(new Date(), fmt || "yyyy-MM-dd HH:mm:ss'SSS");
  }

  //格式化时间
  function formatDate(date, fmt) {
    var o = {
      "M+": date.getMonth() + 1, //月份
      "d+": date.getDate(), //日
      "h+": date.getHours(), //小时
      "H+": date.getHours(), //小时
      "m+": date.getMinutes(), //分
      "s+": date.getSeconds(), //秒
      "q+": Math.floor((date.getMonth() + 3) / 3), //季度
      "S+": date.getMilliseconds(), //毫秒
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        (date.getFullYear() + "").substring(4 - RegExp.$1.length)
      );
    }
    for (var k in o) {
      if (new RegExp("(" + k + ")").test(fmt)) {
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length == 1
            ? o[k]
            : k === "S+"
            ? ("000" + o[k]).substring(3)
            : ("00" + o[k]).substring(("" + o[k]).length)
        );
      }
    }
    return fmt;
  }

  /**拼接返回值 */
  function appendResult(text) {
    if (result.innerHTML) {
      result.innerHTML =
        result.innerHTML + "\n" + "\n" + nowTimeString() + "\n" + text;
    } else {
      result.innerHTML = nowTimeString() + "\n" + text;
    }
  }

  function wrapTime(tag, action) {
    tick();
    action();
    appendTime(tag);
  }

  var tickTime = 0;

  function tick() {
    tickTime = new Date().getTime();
  }

  function appendTime(tag) {
    const time = new Date().getTime();
    appendResult((tag || "") + "耗时:" + (time - tickTime) + "ms");
  }

  //读取文件二进制数据
  function readFile(file, callback) {
    console.log("读取文件↓");
    console.log(file);
    const reader = new FileReader();
    reader.onload = function fileReadCompleted() {
      // 当读取完成时，内容只在`reader.result`中
      const data = new Uint8Array(reader.result);
      //const data = reader.result;
      callback(data);
    };
    reader.readAsArrayBuffer(file);
  }

  function getSaveFilePath(fileName) {
    if (selectPath.includes(":") > 0) {
      return `${targetPath}\\${fileName}`;
    } else {
      return `${targetPath}/${fileName}`;
    }
  }

  function pdfToPng() {
    const file = selectFile.files[0];
    readFile(file, (data) => {
      // Loading a document.
      const loadingTask = pdfjsLib.getDocument(data);
      console.log(loadingTask);

      loadingTask.promise
        .then(async function (pdfDocument) {
          // Request a first page
          console.log(pdfDocument);
          const numPages = pdfDocument._pdfInfo.numPages;

          //循环
          for (let i = 1; i <= numPages; i++) {
            //获取文件名
            const fileName = file.name.substring(0, file.name.lastIndexOf("."));
            const saveFilePath = getSaveFilePath(`${fileName}_${i}.png`);

            const pdfPage = await pdfDocument.getPage(i);
            // Display page on the existing canvas with 100% scale.
            const viewport = pdfPage.getViewport({ scale: 2.0 });
            //创建Canvas元素
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext("2d");
            const renderTask = pdfPage.render({
              canvasContext: ctx,
              viewport,
            });
            await renderTask.promise;
            // Convert canvas to PNG
            const dataURL = canvas.toDataURL("image/png");
            appendImage(dataURL);

            vscode.postMessage({
              command: "save",
              path: saveFilePath,
              data: dataURL,
              reveal: i == numPages, //打开保存的文件所在目录
            });
          }
        })
        .catch(function (reason) {
          const error = "Error: " + reason;
          console.error(error);
          vscode.postMessage({
            text: error,
          });
        });
    });
  }

  //通过canvas调整图片大小
  function adjustImage() {
    const w = width.value;
    const h = height.value;
    const file = selectFile.files[0];

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");

    //使用cavas绘制图片
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = function () {
      ctx.drawImage(img, 0, 0, w, h);
      // Convert canvas to PNG
      const dataURL = canvas.toDataURL("image/png");
      appendImage(dataURL);

      const fileName = file.name.substring(0, file.name.lastIndexOf("."));
      const saveFilePath = getSaveFilePath(`${fileName}_${w}_${h}.png`);
      // const saveFilePath = getSaveFilePath(
      //   `${nowTimeString("yyyy-MM-dd_HH-mm-ss")}.png`
      // );
      vscode.postMessage({
        command: "save",
        path: saveFilePath,
        data: dataURL,
        reveal: true, //打开保存的文件所在目录
      });
      URL.revokeObjectURL(img.src);
    };
  }

  //添加一个base64图片展示
  //@param base64 图片的base64
  //@param des 图片的描述
  function appendImage(base64, des) {
    if (base64) {
      //创建img容器
      const img = new Image();
      //给img容器引入base64的图片
      img.src = base64;
      //img.alt = JSON.stringify(des, null, 4);
      img.title = JSON.stringify(des, null, 4);

      //将img容器添加到html的节点中。
      imageWrap.appendChild(img);

      scrollToBottom();
    }
  }

  //清空所有图片
  function clearAllImage() {
    while (imageWrap.hasChildNodes()) {
      imageWrap.removeChild(imageWrap.firstChild);
    }
  }

  //滚动到底部
  function scrollToBottom() {
    setTimeout(() => {
      window.scrollTo(0, document.documentElement.clientHeight);
    }, 300);
  }

  //将选中的png文件转base64
  function png2Base64() {
    const file = selectFile.files[0];
    readFile(file, (data) => {
      const base64 = arrayBufferToBase64(data);
      result.innerHTML = "data:image/png;base64," + base64;
    });
  }

  function arrayBufferToBase64(buffer) {
    var binary = "";
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function base642Png(base64) {
    if (base64) {
      appendImage(base64);
    } else {
      vscode.postMessage({
        text: "base64 内容为空!",
      });
    }
  }

  //数字求和, 将文本中的正负小数数字, 求和
  function numberSum(text) {
    if (text) {
      const regex = /[-+]?[0-9]+\.?[0-9]*/g;
      const match = text.match(regex);
      if (match) {
        let sum = 0;
        for (let i = 0; i < match.length; i++) {
          const element = match[i];
          sum += parseFloat(element);
        }
        //保留2位小数
        sum = Math.round(sum * 100) / 100;
        appendResult("求和: " + sum);
      } else {
        vscode.postMessage({
          text: "没有匹配到数字!",
        });
      }
    } else {
      vscode.postMessage({
        text: "内容为空!",
      });
    }
  }

  // 从文本中获取所有数字
  function getNumberList(text) {
    const result = [];
    if (text) {
      const regex = /[-+]?[0-9]+\.?[0-9]*/g;
      const match = text.match(regex);
      if (match) {
        for (let i = 0; i < match.length; i++) {
          const element = match[i];
          result.push(parseFloat(element));
        }
      }
    }
    return result;
  }

  // 解析svg字符串
  function parseSvg(data) {
    if (data) {
      //使用svg xml数据创建dom
      var parser = new DOMParser();
      var doc = parser.parseFromString(data, "image/svg+xml");
      //获取svg节点
      const svg = doc.getElementsByTagName("svg")[0];
      const viewBox = svg.getAttribute("viewBox");
      //转成Android Svg xml
      const w = svg.getAttribute("width");
      const h = svg.getAttribute("height");
      //枚举svg节点下的所有child
      const paths = tagToAndroidPath(svg);

      var vw = w;
      var vh = h;
      if (viewBox) {
        vw = viewBox.split(" ")[2];
        vh = viewBox.split(" ")[3];
      }

      var start = `<vector xmlns:android="http://schemas.android.com/apk/res/android"
              android:width="${vw}dp"
              android:height="${vh}dp"
              android:viewportWidth="${vw}"
              android:viewportHeight="${vh}">`;
      var end = `</vector>`;
      result.value = start + paths.join("") + end;

      //释放内存
      doc = null;
      parser = null;
    } else {
      vscode.postMessage({ text: "no data" });
    }
  }

  //将常用的颜色字符串转成hex颜色值
  function colorToHex(color) {
    if (color === null || color === undefined) {
      return undefined;
    }
    if (color === "transparent" || color === "none") {
      return "#00000000";
    }
    if (color === "black") {
      return "#000000";
    }
    if (color === "white") {
      return "#ffffff";
    }
    if (color === "red") {
      return "#ff0000";
    }
    if (color === "green") {
      return "#00ff00";
    }
    if (color === "blue") {
      return "#0000ff";
    }
    if (color === "yellow") {
      return "#ffff00";
    }
    if (color === "cyan") {
      return "#00ffff";
    }
    if (color === "magenta") {
      return "#ff00ff";
    }
    if (color === "gray") {
      return "#808080";
    }
    if (color === "lightgray") {
      return "#d3d3d3";
    }
    if (color === "darkgray") {
      return "#a9a9a9";
    }
    if (color === "grey") {
      return "#808080";
    }
    if (color === "lightgrey") {
      return "#d3d3d3";
    }
    if (color === "darkgrey") {
      return "#a9a9a9";
    }

    if (color.indexOf("#") === 0) {
      return color;
    }
    var digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);
    var red = parseInt(digits[2]);
    var green = parseInt(digits[3]);
    var blue = parseInt(digits[4]);
    var rgb = blue | (green << 8) | (red << 16);
    return digits[1] + "#" + rgb.toString(16);
  }

  //将数字字符串转换成浮点型数字
  function parseFloatStr(str, def = undefined) {
    if (str === null || str === undefined) {
      return def;
    }
    return parseFloat(str);
  }

  //将svg标签转成Android的path标签
  function tagToAndroidPath(tag) {
    var paths = [];
    const child = tag;

    //标准属性
    const fillRule = child.getAttribute("fill-rule");
    const x = parseFloatStr(child.getAttribute("x"), 0);
    const y = parseFloatStr(child.getAttribute("y"), 0);
    const r = parseFloatStr(child.getAttribute("r"));
    var cx = parseFloatStr(child.getAttribute("cx"));
    var cy = parseFloatStr(child.getAttribute("cy"));
    const width = parseFloatStr(child.getAttribute("width"));
    const height = parseFloatStr(child.getAttribute("height"));
    const rx = parseFloatStr(child.getAttribute("rx")) || r;
    const ry = parseFloatStr(child.getAttribute("ry")) || rx;
    const fill = colorToHex(child.getAttribute("fill"));
    const stroke = colorToHex(child.getAttribute("stroke"));

    var fillSvg = "";
    if (fill) {
      var fillType = "nonZero";
      if (fillRule && fillRule === "evenodd") {
        fillType = "evenOdd";
      }
      fillSvg = `android:fillColor="${fill}" android:fillType="${fillType}"`;
    }
    var strokeSvg = "";
    if (stroke) {
      strokeSvg = `android:strokeColor="${stroke}" android:strokeWidth="1"`;
    } else if (!fillSvg) {
      //没有描边, 又没有填充的情况下, 默认黑色填充
      fillSvg = `android:fillColor="#333333" android:fillType="evenOdd"`;
    }

    if (child.tagName === "line") {
      const x1 = parseFloatStr(child.getAttribute("x1"), 0);
      const x2 = parseFloatStr(child.getAttribute("x2"), 0);
      const y1 = parseFloatStr(child.getAttribute("y1"), 0);
      const y2 = parseFloatStr(child.getAttribute("y2"), 0);
      var pathSvg = `android:pathData="M${x1},${y1}L${x2},${y2}"`;
      paths.push(`
                <path ${fillSvg} ${strokeSvg} ${pathSvg} />`);
    } else if (child.tagName === "path") {
      //获取path的d属性
      console.log(child);
      const d = child.getAttribute("d");

      var fillType = "nonZero";
      if (fillRule && fillRule === "evenodd") {
        fillType = "evenOdd";
      }

      var pathSvg = `android:pathData="${d}"`;

      paths.push(`
                <path ${fillSvg} ${strokeSvg} ${pathSvg} /> `);
    } else if (child.tagName === "rect" && !rx && !ry) {
      //获取path的d属性
      console.log(child);

      var pathSvg = "";
      if (rx && ry) {
        const r = x + width;
        const b = y + height;
        pathSvg = `android:pathData="M${x + rx},${y}h${
          width - rx * 2
        }Q${r},${y} ${r},${y + ry}v${height - ry * 2}Q${r},${b} ${
          r - rx
        },${b}h-${width - rx * 2}Q${x},${b} ${x},${b - ry}v-${
          height - ry * 2
        }Q${x},${y} ${x + rx},${y}z"`;
      } else {
        pathSvg = `android:pathData="M${x},${y}h${width}v${height}h-${width}z"`;
      }

      paths.push(`
                <path ${fillSvg} ${strokeSvg} ${pathSvg} />`);
    } else if (
      child.tagName === "ellipse" ||
      child.tagName === "circle" ||
      child.tagName === "rect"
    ) {
      const width = rx * 2;
      const height = ry * 2;
      const kappa = 0.5522848; // 4 * ((√(2) - 1) / 3)
      const ox = (width / 2.0) * kappa; // control point offset horizontal
      const oy = (height / 2.0) * kappa; // control point offset vertical
      //const xe = cx + width / 2.0; // x-end
      //const ye = cy + height / 2.0; // y-end

      if (child.tagName === "rect") {
        cx = x + width / 2.0;
        cy = y + height / 2.0;
      }

      var pathSvg = "";
      pathSvg = `android:pathData="M${cx - width / 2},${cy}C${cx - width / 2},${
        cy - oy
      } ${cx - ox},${cy - height / 2} ${cx},${cy - height / 2}C${cx + ox},${
        cy - height / 2
      } ${cx + width / 2},${cy - oy} ${cx + width / 2},${cy}C${
        cx + width / 2
      },${cy + oy} ${cx + ox},${cy + height / 2} ${cx},${cy + height / 2}C${
        cx - ox
      },${cy + height / 2} ${cx - width / 2},${cy + oy} ${cx - width / 2},${cy}"
              `;

      paths.push(`
              <path ${fillSvg} ${strokeSvg} ${pathSvg} />`);
    } else if (child.tagName === "g" || child.tagName === "svg") {
      const children = child.children;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const array = tagToAndroidPath(child);
        if (array) {
          paths = paths.concat(array);
        }
      }
    } else if (child.tagName === "defs") {
    } else {
      const msg = "不支持的SVG标签: " + child.tagName;
      console.log(msg);
      vscode.postMessage({ text: msg });
    }
    return paths;
  }
})();
