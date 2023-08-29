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
  var selectPath = localStorage.getItem("selectPath") || "";
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
          console.error("Error: " + reason);
          vscode.postMessage({
            text: reason,
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

      const saveFilePath = getSaveFilePath(
        `${nowTimeString("yyyy-MM-dd_HH-mm-ss")}.png`
      );
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
})();
