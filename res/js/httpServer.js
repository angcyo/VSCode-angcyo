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
  const httpUrl = document.getElementById("httpUrl");
  const httpBody = document.getElementById("httpBody");
  const lpUserName = document.getElementById("lpUserName");
  const lpPassword = document.getElementById("lpPassword");
  const lpBody = document.getElementById("lpBody");
  const linkWrap = document.getElementById("linkWrap");
  const lpTime = document.getElementById("lpTime");

  let lpToken = localStorage.getItem("lpToken");

  initTextInput("host", "http://192.168.31.192:9200");
  initTextInput("folder", "E:/uploadFiles");
  initTextInput("httpUrl", "http://www.baidu.com/");
  initTextInput("httpBody", "");
  initTextInput("lpUserName", "angcyo@126.com");
  initTextInput("lpPassword", "angcyo");
  initTextInput(
    "lpBody",
    JSON.stringify(
      {
        id: null,
        nickname: "",
        mobile: "",
        email: "",
      },
      null,
      4
    )
  );
  initTextInput("lpTime", nowTimeString("yyyy-MM-dd"));

  clickButton("clear", () => {
    result.innerHTML = "";
  });

  clickButton("startServer", () => {
    const url = host.value;
    vscode.postMessage({
      command: "updateUploadFolder",
      path: folder.value,
    });
    vscode.postMessage({
      command: "startServer",
      url: url,
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

  clickButton("httpGet", () => {
    const url = httpUrl.value;
    httpGet(url);
  });
  clickButton("httpPost", () => {
    const url = httpUrl.value;
    const body = httpBody.value;
    httpPost(url, body);
  });

  //---LP

  clickButton("lpLogin", () => {
    const url = "https://server.hingin.com/login";
    const body = {
      mobile: "",
      email: lpUserName.value,
      credential: lpPassword.value,
      code: "",
    };
    httpPost(url, JSON.stringify(body), "lpLogin");
  });

  clickButton("lpUserInfo", () => {
    const url = "https://server.hingin.com/user/getUserInfo";
    const body = lpBody.value;
    httpPost(url, body, "lpUserInfo");
  });

  clickButton("lpFetchLog", () => {
    const body = lpBody.value;
    if (body) {
      const json = JSON.parse(body);
      appendOssLogLinks(json.id, json.nickname);
    }
  });

  clickButton("lpClearLink", () => {
    clearLink();
  });

  //---

  //接收来自vscode的数据
  // Handle messages sent from the extension to the webview
  window.addEventListener("message", (event) => {
    const message = event.data; // The json data that the extension sent
    const uuid = message.uuid;
    console.log(`收到来自vscode的消息↓`);
    console.log(message);

    switch (message.type) {
      case "host":
        host.value = message.value;
        break;
      case "message":
        appendResult(message.value);
        break;
      case "uploadFolder":
        folder.value = message.value;
        //触发input事件
        const inputEvent = new Event("input");
        folder.dispatchEvent(inputEvent);
        break;
      case "response":
        if (uuid === "ossLogLink") {
          const url = message.url;
          const link = document.getElementById(url);
          if (link) {
            if (message.value) {
              link.innerText = link.innerText + "✅";
            } else {
              link.innerText = link.innerText + "❌";
            }
          }
        } else {
          updateResult(message.value);
          if (message.value) {
            const json = JSON.parse(message.value);
            if (uuid === "lpLogin") {
              lpToken = json.data.token;
              localStorage.setItem("lpToken", lpToken);
            } else if (uuid === "lpUserInfo") {
              json.data.forEach((element) => {
                appendOssLogLinks(element.id, element.nickname);
              });
            }
          }
        }
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
    input.value = tryJsonParse(localStorage.getItem(id) || def);
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

  function updateResult(text) {
    console.log(text);
    console.log(tryJsonParse(text));
    result.innerHTML = tryJsonParse(text);
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

  //尝试使用json格式字符串
  function tryJsonParse(text) {
    try {
      return JSON.stringify(JSON.parse(text), null, 4);
    } catch (e) {
      return text;
    }
  }

  //进行get请求
  //[uuid] 消息类型, 用来区分返回值
  function httpGet(url, uuid) {
    vscode.postMessage({
      command: "request",
      uuid: uuid,
      url: url,
    });
  }

  //进行post请求
  //[uuid] 消息类型, 用来区分返回值
  function httpPost(url, body, uuid) {
    vscode.postMessage({
      command: "request",
      uuid: uuid,
      method: "POST",
      url: url,
      body: body,
      token: lpToken,
    });
  }

  //进行head请求, 判断[url]是有有效
  function httpHead(url, uuid) {
    vscode.postMessage({
      command: "request",
      uuid: uuid,
      method: "HEAD",
      url: url,
    });
  }

  function clearLink() {
    linkWrap.innerHTML = "";
  }

  //向一个div元素中追加a标签
  function appendLink(url, label) {
    linkWrap.innerHTML =
      linkWrap.innerHTML +
      `<a id="${url}" href="${url}" target="_blank" title="${url}">${label}</a>`;
    httpHead(url, "ossLogLink");
    //<a href="http://www.baidu.com" target="_blank">百度</a>
    //<a href="http://www.google.com" target="_blank">谷歌</a>
    //<a href="http://www.bing.com" target="_blank">必应</a>
  }

  function appendOssLogLink(userId, userName, time) {
    const base = `https://laserpecker-prod.oss-cn-hongkong.aliyuncs.com/log/${time}`;
    const key1 = userId;
    const key2 = `${userId}_${userName}`;
    const key3 = `${userName}`;
    appendLink(`${base}/${key1}/${time}.zip`, time + "|" + key1);
    appendLink(`${base}/${key2}/${time}.zip`, time + "|" + key2);
    appendLink(`${base}/${key3}/${time}.zip`, time + "|" + key3);
  }

  function appendOssLogLinks(userId, userName) {
    const time = lpTime.value;
    //使用空格分割时间
    const timeArray = time.split(" ");
    //遍历时间
    timeArray.forEach((time) => {
      if (time) {
        appendOssLogLink(userId, userName, time);
      }
    });
  }
})();
