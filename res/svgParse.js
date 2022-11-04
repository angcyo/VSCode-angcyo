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
  dataText.value = localStorage.getItem("svgData");
  dataText.addEventListener("change", () => {
    localStorage.setItem("svgData", dataText.value);
  });

  //
  widthText.addEventListener("input", () => {
    updateViewBoxText();
  });
  heightText.addEventListener("input", () => {
    updateViewBoxText();
  });
  showBorder.addEventListener("change", () => {
    updateBorder();
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
})();
