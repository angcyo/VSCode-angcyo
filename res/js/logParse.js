/**
 * Email:angcyo@126.com
 * @author angcyo
 * @date 2022/11/17
 */

(function () {
  const vscode = acquireVsCodeApi();
  //console.log("初始化logParse.js", vscode, window)
  const info = document.getElementById("info");
  const content = document.getElementById("content");
  initTextInput("host", "http://192.168.31.191:9200/");
  initTextInput("scheme");
  initTextInput("lines", 20);

  //调用的接口记录, 用来back
  const fetchList = [];

  clickButton("back", async () => {
    fetchList.pop();
    renderApiContent(fetchList.pop());
  });

  clickButton("fetch", async () => {
    renderApiContent(localStorage.getItem("host") || "");
  });

  clickButton("clearContent", () => {
    content.innerHTML = "...";
  });

  clickButton("logFolder", () => {
    renderApiContent("log");
  });

  clickButton("httpFolder", () => {
    renderApiContent("http");
  });

  clickButton("engraveFolder", () => {
    renderApiContent("engrave");
  });

  clickButton("fontFolder", () => {
    renderApiContent("fonts");
  });

  clickButton("crashFolder", () => {
    renderApiContent("crash");
  });

  clickButton("transferFolder", () => {
    renderApiContent("transfer");
  });

  clickButton("projectFolder", () => {
    renderApiContent("project");
  });

  clickButton("vectorFolder", () => {
    renderApiContent("vector");
  });

  //---

  clickButton("clearInfo", () => {
    info.innerHTML = "...";
  });

  clickButton("l", async () => {
    renderApiInfo("/log/l.log");
  });

  clickButton("device", async () => {
    renderApiInfo("/log/device.log");
  });

  clickButton("ble", async () => {
    renderApiInfo("/log/ble.log");
  });

  clickButton("engrave", async () => {
    renderApiInfo("/log/engrave.log");
  });

  clickButton("error", async () => {
    renderApiInfo("/log/error.log");
  });

  clickButton("log", async () => {
    renderApiInfo("/log/log.log");
  });

  clickButton("crash", async () => {
    const name = formatDate(new Date(), "yyyy-MM-dd");
    renderApiInfo(`/crash/${name}.log`, -100);
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
   * 请求一个接口, 并将接口的返回值渲染出来
   * @param {string} api
   */
  async function renderApiContent(api, push = true) {
    const host = localStorage.getItem("host") || "";
    let url = api;
    if (api && api.startsWith("http") && api.includes(":")) {
      url = api;
    } else {
      if (api.startsWith("/")) {
        url = host + api;
      } else {
        const scheme = localStorage.getItem("scheme") || "";
        url = host + "/" + scheme + "/" + api;
      }
    }
    const text = await fetchText(url);
    //console.log(text);
    //content.innerText = text;
    content.innerHTML = text.replaceAll("\n", "<br>");
    hookATag(content);
    if (text && push) {
      fetchList.push(url);
    }
  }

  /**
   * 请求一个接口, 并将接口的返回值渲染出来
   * @param {string} log
   * @param {number} sliceLine
   */
  async function renderApiInfo(
    log,
    sliceLine = -parseInt(localStorage.getItem("lines") || "20")
  ) {
    const host = localStorage.getItem("host") || "";
    const scheme = localStorage.getItem("scheme") || "";
    const url = host + scheme + log;

    let text = await fetchText(url);
    text = text.split("\n").slice(sliceLine).join("\n");
    info.innerHTML = text.replaceAll("\n", "<br>");
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

  function hookATag(element) {
    const aList = element.querySelectorAll("a");
    aList.forEach((e) => {
      e.addEventListener("click", async ({ target }) => {
        //console.dir(target);
        const href = target.getAttribute("href");
        renderApiContent(href, true);
      });
    });
  }

  /**
   * 请求网络
   * @param {string} api
   * @returns
   */
  async function fetchText(api) {
    if (api && api.startsWith("http")) {
      try {
        vscode.postMessage({
          text: "请求:" + api,
        });
        const req = await fetch(api);
        const text = await req.text();
        return text;
      } catch (error) {
        //console.dir(error);
        vscode.postMessage({
          text: "请求异常:" + error,
        });
      }
    } else {
      vscode.postMessage({
        text: "无效的服务器地址:" + api,
      });
    }
  }

  //

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
