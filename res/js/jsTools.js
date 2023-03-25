/**
 * Email:angcyo@126.com
 * @author angcyo
 * @date 2023-3-20
 */

(function () {
  const vscode = acquireVsCodeApi();

  const host = document.getElementById("host");
  const content = document.getElementById("content");
  const sendSize = document.getElementById("sendSize");
  const result = document.getElementById("result");

  initTextInput("host", "ws://192.168.2.109:9301");
  initTextInput("content");
  initTextInput("sendSize");

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

  var isConnection = false;
  var wsSocket;
  clickButton("connect", () => {
    if (wsSocket == undefined) {
      const url = host.value; //"ws://localhost:8080"
      wsSocket = new WebSocket(url); //创建WebSocket连接

      wsSocket.onopen = function (event) {
        isConnection = true;
        appendResult("Connection open ...");
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
        appendResult("Connection closed.");
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
    var binary = new Uint8Array(size * 1024 * 1024);
    appendResult(`发送字节:${size}MB`);
    wrapTime("", () => {
      wsSocket?.send(binary.buffer);
    });
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

  //---

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

  function nowTimeString() {
    return formatDate(new Date(), "yyyy-MM-dd HH:mm:ss'SSS");
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
})();
