/**
 * Email:angcyo@126.com
 * @author angcyo
 * @date 2023-04-09
 */

(function () {
  const vscode = acquireVsCodeApi();
  //console.log("初始化HttpServer.js", vscode, window)
  const host = document.getElementById("host");
  const result = document.getElementById("result");
  const folder = document.getElementById("folder");

  host.value = "http://192.168.31.192:9200";

  clickButton("clear", () => {
    result.innerHTML = "";
  });

  clickButton("startServer", () => {
    const url = host.value;
    vscode.postMessage({
      command: "startServer",
      url: url,
    });
    vscode.postMessage({
      command: "updateUploadFolder",
      path: folder.value,
    });
  });

  clickButton("selectFolder", () => {
    vscode.postMessage({
      command: "selectFolder",
    });
  });

  clickButton("openFolder", () => {
    vscode.postMessage({
      command: "reveal",
      path: folder.value,
    });
  });

  //接收来自vscode的数据
  // Handle messages sent from the extension to the webview
  window.addEventListener("message", (event) => {
    const message = event.data; // The json data that the extension sent
    switch (message.type) {
      case "host":
        host.value = message.value;
        break;
      case "message":
        appendResult(message.value);
        break;
      case "uploadFolder":
        initTextInput("folder", message.value);
        break;
    }
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

  /**拼接返回值 */
  function appendResult(text) {
    if (result.innerHTML) {
      result.innerHTML =
        result.innerHTML + "\n" + "\n" + nowTimeString() + "\n" + text;
    } else {
      result.innerHTML = nowTimeString() + "\n" + text;
    }
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
})();
