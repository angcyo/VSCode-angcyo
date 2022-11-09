/**
 * Email:angcyo@126.com
 * @author angcyo
 * @date 2022/10/12
 */

(function () {
  //const vscode = acquireVsCodeApi()
  //console.log("初始化svgParse.js", vscode, window)
  const dataText = document.getElementById("data");
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
    viewBoxText.value = `0 0 ${width} ${height}`;
    localStorage.setItem("viewBox", viewBoxText.value);
  }

  //更新边框显示
  function updateBorder() {
    if (showBorder.checked) {
      svgWrap.firstChild.style.borderStyle = "solid";
    } else {
      svgWrap.firstChild.style.borderStyle = "hidden";
    }
  }

  //持久化
  showBorder.checked = localStorage.getItem("showBorder") === "1";
  widthText.value = localStorage.getItem("width") || 100;
  heightText.value = localStorage.getItem("height") || 100;
  viewBoxText.value = localStorage.getItem("viewBox") || "0 0 100 100";

  dataText.value = localStorage.getItem("data");
  dataText.addEventListener("input", () => {
    localStorage.setItem("data", dataText.value);

    //直接触发解析
    parseButton.click();
  });

  //
  widthText.addEventListener("input", () => {
    updateViewBoxText();
    localStorage.setItem("width", widthText.value);
  });
  heightText.addEventListener("input", () => {
    updateViewBoxText();
    localStorage.setItem("height", heightText.value);
  });

  viewBoxText.addEventListener("input", () => {
    localStorage.setItem("viewBox", viewBoxText.value);
  });
  showBorder.addEventListener("change", () => {
    updateBorder();
    localStorage.setItem("showBorder", showBorder.checked ? "1" : "0");
  });

  parseButton.addEventListener("click", () => {
    const svgText = dataText.value.trim();
    let svgTag = undefined;
    if (svgText.startsWith("<")) {
      //标签
      svgTag = svgText;
    } else {
      //路径数据
      const width = widthText.value.trim();
      const height = heightText.value.trim();
      const viewBox = viewBoxText.value.trim();
      svgTag = `<svg width="${width}" height="${height}" viewBox="${viewBox}" ><path d="${svgText}" stroke='red'></path></svg>`;
    }

    svgWrap.innerHTML = svgTag;
    updateBorder();
  });

  // 创建事件对象
  var event = document.createEvent("HTMLEvents");
  // 初始化事件
  event.initEvent("input", false, false);
  // 触发事件
  dataText.dispatchEvent(event);
})();
