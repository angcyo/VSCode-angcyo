/**
 * Email:angcyo@126.com
 * @author angcyo
 * @date 2022/10/12
 */

(function () {
  //const vscode = acquireVsCodeApi()
  //console.log("初始化svgParse.js", vscode, window)
  const dataText = document.getElementById("data");
  const dataText2 = document.getElementById("data2");
  const dataText3 = document.getElementById("data3");
  const dataText4 = document.getElementById("data4");
  const widthText = document.getElementById("width");
  const heightText = document.getElementById("height");
  const viewBoxText = document.getElementById("viewBox");
  const parseButton = document.getElementById("parse");
  const svgWrap = document.getElementById("svgWrap");
  const showBorder = document.getElementById("showBorder");

  //更新viewBox的大小
  function updateViewBoxText() {
    const width = widthText.value.trim();
    const height = heightText.value.trim();
    if (!viewBoxText.value) {
      viewBoxText.value = `0 0 ${width || 1024} ${height || 1024}`;
      localStorage.setItem("viewBox", viewBoxText.value);
    }
  }

  //更新边框显示
  function updateBorder() {
    if (svgWrap.firstChild) {
      if (showBorder.checked) {
        svgWrap.firstChild.style.borderStyle = "solid";
      } else {
        svgWrap.firstChild.style.borderStyle = "hidden";
      }
    }
  }

  //持久化
  showBorder.checked = localStorage.getItem("showBorder") === "1";
  widthText.value = localStorage.getItem("width") || 100;
  heightText.value = localStorage.getItem("height") || 100;
  viewBoxText.value = localStorage.getItem("viewBox") || "0 0 1024 1024";

  dataText.value = localStorage.getItem("data");
  dataText.addEventListener("input", () => {
    localStorage.setItem("data", dataText.value);

    //直接触发解析
    parseButton.click();
  });

  dataText2.value = localStorage.getItem("data2");
  dataText2.addEventListener("input", () => {
    localStorage.setItem("data2", dataText2.value);

    //直接触发解析
    parseButton.click();
  });
  initTextInput("data3", "", () => {
    //直接触发解析
    parseButton.click();
  });
  initTextInput("data4", "", () => {
    //直接触发解析
    parseButton.click();
  });

  //监听事件
  widthText.addEventListener("input", () => {
    updateViewBoxText();
    localStorage.setItem("width", widthText.value);

    //直接触发解析
    parseButton.click();
  });
  heightText.addEventListener("input", () => {
    updateViewBoxText();
    localStorage.setItem("height", heightText.value);

    //直接触发解析
    parseButton.click();
  });

  viewBoxText.addEventListener("input", () => {
    localStorage.setItem("viewBox", viewBoxText.value);

    //直接触发解析
    parseButton.click();
  });
  showBorder.addEventListener("change", () => {
    updateBorder();
    localStorage.setItem("showBorder", showBorder.checked ? "1" : "0");
  });

  //解析按钮
  parseButton.addEventListener("click", () => {
    //debugger;
    const svgText = dataText.value.trim();
    const svgText2 = dataText2.value.trim();
    const svgText3 = dataText3.value.trim();
    const svgText4 = dataText4.value.trim();

    svgWrap.innerHTML = "";

    appendSvgText(svgText, "red");//R
    appendSvgText(svgText2, "green");//G
    appendSvgText(svgText3, "blue");//B
    appendSvgText(svgText4, "purple");//P

    updateBorder();
  });

  //隐藏parseButton
  parseButton.style.display = "none";

  // 创建事件对象
  const event = document.createEvent("HTMLEvents");
  // 初始化事件
  event.initEvent("input", false, false);
  // 触发事件
  dataText.dispatchEvent(event);

  function appendSvgTag(svgTag) {
    svgWrap.innerHTML = svgWrap.innerHTML + svgTag;
  }

  function appendSvgText(svgText, stroke, fill) {
    if (!svgText) {
      return;
    }
    if (svgText.startsWith("<svg")) {
      //标签
      appendSvgTag(`<div class="frame">${svgText}</div>`);
    } else {
      const width = widthText.value.trim();
      const height = heightText.value.trim();
      const viewBox = viewBoxText.value.trim();
      const svgStart = `<svg width="${width}" height="${height}" viewBox="${viewBox}" class="frame" xmlns="http://www.w3.org/2000/svg">`;
      const svgEnd = `</svg>`;

      if (svgText.startsWith("<")) {
        const svg = `${svgStart}${svgText}${svgEnd}`
        appendSvgTag(`<div class="frame">${svg}</div>`);
      } else if (svgText) {
        //路径数据
        //使用换行分割文本
        const svgTextList = svgText.split("\n");
        svgTextList.forEach((value, index) => {
          stroke = stroke || "red";
          fill = fill || "none";

          value.split(";").forEach((attrs, index) => {
            const [key, value] = attrs.split("=");
            if (key === "s") {
              stroke = value || stroke;
            } else if (key === "f") {
              fill = value || fill;
            }
          });
          appendSvgTag(`${svgStart}<path d="${value}" stroke='${stroke}' fill='${fill}'></path>${svgEnd}`);
        });
      }
    }
  }

  //--

  /**
   * 自动持久化输入控件
   * @param {string} id 控件的id, 也是持久化的key
   * @param {string} def 默认值
   * @param {function} onChanged 当值改变时的回调函数
   */
  function initTextInput(id, def = "", onChanged = undefined, defNotify = undefined) {
    const input = document.getElementById(id);
    input.addEventListener(`input`, () => {
      const value = input.value;
      localStorage.setItem(id, value);
      if (onChanged) {
        onChanged(value);
      }
    });
    input.value = localStorage.getItem(id) || def;
    if (defNotify === true) {
      if (onChanged) {
        onChanged(input.value);
      }
    }
  }

  /**
   * 点击一个按钮
   * @param {string} id
   * @param {*} action
   */
  function clickButton(id, action) {
    const element = document.getElementById(id);
    element.addEventListener("click", (event) => {
      action && action(event);
    });
  }
})();
