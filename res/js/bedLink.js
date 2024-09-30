/**
 * Email:angcyo@126.com
 * @author angcyo
 * @date 2024-09-30
 */

(function () {
  const vscode = acquireVsCodeApi();
  //console.log("bedLink.js", vscode, window)
  const userName = document.getElementById("userName");
  const warehouseName = document.getElementById("warehouseName");
  const branchName = document.getElementById("branchName");
  const filePath = document.getElementById("filePath");
  const linkResultWrap = document.getElementById("linkResultWrap");

  initTextInput("userName", "angcyo", (value) => {
    resetBedResultLink();
  });
  initTextInput("warehouseName", "file", (value) => {
    resetBedResultLink();
  });
  initTextInput("branchName", "master", (value) => {
    resetBedResultLink();
  });
  initTextInput(
    "filePath",
    "BackManage/BackManage-1.2.0_pre_pretest_app.apk",
    (value) => {
      resetBedResultLink();
    }
  );
  resetBedResultLink();

  // 重置图床结果的链接
  function resetBedResultLink() {
    clearResultLink();

    const userNameValue = userName.value;
    const warehouseNameValue = warehouseName.value;
    const branchNameValue = branchName.value;
    const filePathValue = filePath.value;

    //2024-9-30 可以上传大文件, 但是无法下载10MB以上大文件.
    appendResultLink(
      `https://gitee.com/${userNameValue}/${warehouseNameValue}/raw/${branchNameValue}/${filePathValue}`
    );
    //无法上传>=10MB的文件, 文件大小不能超过 10M
    appendResultLink(
      `https://raw.gitcode.com/${userNameValue}/${warehouseNameValue}/raw/${branchNameValue}/${filePathValue}`
    );
    //2024-9-26 服务更新之后, 需要授权才能访问
    appendResultLink(
      `https://gitcode.net/${userNameValue}/${warehouseNameValue}/-/raw/${branchNameValue}/${filePathValue}`
    );
    //无限制
    appendResultLink(
      `https://gitlab.com/${userNameValue}/${warehouseNameValue}/-/raw/${branchNameValue}/${filePathValue}`
    );
    //需要外网
    appendResultLink(
      `https://raw.githubusercontent.com/${userNameValue}/${warehouseNameValue}/${branchNameValue}/${filePathValue}`
    );
  }

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
  function initTextInput(id, def = "", onInputAction, onChangeAction) {
    const input = document.getElementById(id);
    input.addEventListener(`input`, () => {
      localStorage.setItem(id, input.value);
      if (onInputAction) {
        onInputAction(input.value);
      }
    });
    input.addEventListener(`change`, () => {
      localStorage.setItem(id, input.value);
      if (onChangeAction) {
        onChangeAction(input.value);
      }
    });
    input.value = tryJsonParse(localStorage.getItem(id) || def);
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

  //尝试使用json格式字符串
  function tryJsonParse(text) {
    try {
      return JSON.stringify(JSON.parse(text), null, 4);
    } catch (e) {
      return text;
    }
  }

  function clearResultLink() {
    linkResultWrap.innerHTML = "";
  }

  //向一个div元素中追加a标签
  function appendResultLink(url, label) {
    label = label || url;
    linkResultWrap.innerHTML =
      linkResultWrap.innerHTML +
      `<p class="margin"><a href="${url}" target="_blank" title="${url}">${label}</a><button id="${label}" class="ml">复制</button></p>`;
    //<a href="http://www.baidu.com" target="_blank">百度</a>
    //<a href="http://www.google.com" target="_blank">谷歌</a>
    //<a href="http://www.bing.com" target="_blank">必应</a>

    setTimeout(() => {
      clickButton(label, async () => {
        vscode.postMessage({
          command: "copy",
          data: url,
        });
      });
    });
  }
})();
