/**
 * Email:angcyo@126.com
 * @author angcyo
 * @date 2022/11/17
 */

(function () {
  const vscode = acquireVsCodeApi();
  //console.log("初始化logParse.js", vscode, window)
  const result = document.getElementById("result");
  const bodyInput = document.getElementById("body");
  initTextInput("host", "http://192.168.31.191:9200/");
  initTextInput("body", "", true);
  initTextInput("content", "hello!");
  initSelectFile();

  clickButton("deviceInfo", async () => {
    renderApiContent("/device");
  });

  clickButton("openScheme", async () => {
    renderApiContent("/scheme", {
      method: "POST",
      body: JSON.parse(localStorage.getItem("body")),
    });
  });

  clickButton("save", async () => {
    vscode.postMessage({
      command: "saveAs",
      data: result.innerHTML?.replaceAll("<br>", "\n"),
    });
  });

  clickButton("copy", async () => {
    vscode.postMessage({
      command: "copy",
      data: result.innerHTML?.replaceAll("<br>", "\n"),
    });
  });

  //记录已经聊天的账号
  const chatList = [];

  clickButton("whatsApp", async () => {
    const body = localStorage.getItem("body");
    const list = body.split("\n");
    let first = list.shift().replaceAll(" ", "");
    const regexp = /[0-9]*/g;
    first = first.match(regexp).join("");

    const newBody = list.join("\n");
    bodyInput.value = newBody;

    // 创建事件对象
    const inputEvent = document.createEvent("HTMLEvents");
    // 初始化事件
    inputEvent.initEvent("input", false, false);
    // 触发事件
    bodyInput.dispatchEvent(inputEvent);

    if (first) {
      chatList.push(first);
      result.innerHTML = chatList.join("<br>");

      const content = localStorage.getItem("content");

      //const api = `https://api.whatsapp.com/send/?phone=${first}`;
      const api = `whatsapp://send/?phone=${first}&text=${encodeURI(content)}`;
      //window.open(`whatsapp://send/?phone=${first}`);

      vscode.postMessage({
        command: "app",
        url: api,
      });
    } else {
      vscode.postMessage({
        text: "无效的账号!",
      });
    }
  });

  clickButton("gcodeAdjust", async () => {
    const json = getRequestBody();
    if (json) {
      const content = localStorage.getItem("content") || "";
      if (content) {
        json.content = content;
        renderApiContent("/gcodeAdjust", {
          method: "POST",
          body: json,
        });
      } else {
        vscode.postMessage({
          text: "无效的请求内容!",
        });
      }
    }
  });

  clickButton("bitmapToGCode", async () => {
    const json = getRequestBody();
    if (json) {
      const content = localStorage.getItem("selectImageData") || "";
      if (content) {
        json.content = content;
        renderApiContent("/bitmapToGCode", {
          method: "POST",
          body: json,
        });
      } else {
        vscode.postMessage({
          text: "请选择图片!",
        });
      }
    }
  });

  clickButton("batchAddCallLogs", async () => {
    const body = localStorage.getItem("body");
    if (body) {
      renderApiContent("/batchAddCallLogs", {
        method: "POST",
        body: body,
      });
    } else {
      vscode.postMessage({
        text: "无效的请求参数!",
      });
    }
  });

  clickButton("batchAddContacts", async () => {
    const body = localStorage.getItem("body");
    if (body) {
      renderApiContent("/batchAddContacts", {
        method: "POST",
        body: body,
      });
    } else {
      vscode.postMessage({
        text: "无效的请求参数!",
      });
    }
  });

  //---

  /**
   * 获取请求体json
   */
  function getRequestBody() {
    const body = localStorage.getItem("body");
    try {
      const json = JSON.parse(body);
      return json;
    } catch (error) {
      vscode.postMessage({
        text: "无效的请求参数:" + body,
      });
    }
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
  function initTextInput(id, def = "", json = false) {
    const input = document.getElementById(id);
    if (!localStorage.getItem(id) && def) {
      localStorage.setItem(id, def);
    }
    input.addEventListener(`input`, () => {
      if (json) {
        try {
          const format = JSON.stringify(JSON.parse(input.value), null, 4);
          input.value = format;
        } catch (error) {}
      }
      localStorage.setItem(id, input.value);
      console.log(input.value);
    });
    input.value = localStorage.getItem(id) || def;
  }

  function initSelectFile() {
    const element = document.getElementById("select-file");

    //选择文件监听
    element.addEventListener(`change`, () => {
      if (element.files?.length > 0) {
        const file = element.files[0];
        //图片
        readFileBase64(file, (base64) => {
          //console.log(base64);
          localStorage.setItem("selectImageData", base64); //保存选中的图片数据
        });
      }
    });
  }

  function readFileBase64(file, callback) {
    const reader = new FileReader();
    reader.onload = function fileReadCompleted() {
      // 当读取完成时，内容只在`reader.result`中
      callback(reader.result);
    };
    reader.readAsDataURL(file);
  }

  /**
   * 请求一个接口, 并将接口的返回值渲染出来
   * @param {string} api
   */
  async function renderApiContent(api, config = undefined) {
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
    const text = await fetchText(url, config);
    //console.log(text);
    //content.innerText = text;
    result.innerHTML = text?.replaceAll("\n", "<br>");
  }

  /**
   * 请求网络
   * @param {string} api
   * @returns
   */
  async function fetchText(api, config = undefined) {
    if (api && api.startsWith("http")) {
      try {
        vscode.postMessage({
          text: "请求:" + api,
        });
        let req = undefined;
        if (config) {
          let reqConfig = undefined;
          if (typeof config.body == "string") {
            reqConfig = {
              ...config,
              body: config.body,
            };
          } else {
            reqConfig = {
              ...config,
              body: JSON.stringify(config.body),
            };
          }
          console.log(reqConfig);
          req = await fetch(api, reqConfig);
        } else {
          req = await fetch(api);
        }

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
})();
