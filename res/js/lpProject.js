// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {
  const vscode = acquireVsCodeApi();
  console.log("初始化laserPeckerParsePanel.js", vscode, window);

  const dataText = document.getElementById("data");
  const resultText = document.getElementById("result");
  const formatButton = document.getElementById("format");
  const formatOptionsButton = document.getElementById("formatOptions");
  const formatJsonStringButton = document.getElementById("formatJsonString");
  const formatDataButton = document.getElementById("formatData");
  const formatStringButton = document.getElementById("formatString");
  const formatCavnasButton = document.getElementById("formatCavnas");
  const removeImageButton = document.getElementById("removeImage");
  const extractImageButton = document.getElementById("extractImage");
  const base64ImageButton = document.getElementById("base64Image");
  const clearButton = document.getElementById("clear");

  const imageWrap = document.getElementById("imageWrap");

  //持久化
  dataText.value = localStorage.getItem("data");
  dataText.addEventListener("input", () => {
    localStorage.setItem("data", dataText.value);
  });
  //持久化
  resultText.value = localStorage.getItem("result");
  resultText.addEventListener("change", () => {
    localStorage.setItem("result", resultText.value);
  });

  //
  formatButton.addEventListener("click", (event) => {
    resultText.value = JSON.stringify(JSON.parse(dataText.value), null, 4);
    localStorage.setItem("result", resultText.value);
  });
  clearButton.addEventListener("click", (event) => {
    resultText.value = "";
    clearAllImage();
    localStorage.setItem("result", resultText.value);
  });
  formatStringButton.addEventListener("click", (event) => {
    const string = JSON.parse(dataText.value);
    const obj = JSON.parse(string);
    resultText.value = JSON.stringify(obj, null, 4);
    localStorage.setItem("result", resultText.value);
  });
  formatDataButton.addEventListener("click", (event) => {
    const dataString = JSON.parse(dataText.value).data;
    const data = JSON.parse(dataString);
    resultText.value = JSON.stringify(data, null, 4);
    localStorage.setItem("result", resultText.value);
  });
  formatCavnasButton.addEventListener("click", (event) => {
    const canvasString = JSON.parse(dataText.value).canvas;
    const canvas = JSON.parse(canvasString);
    resultText.value = JSON.stringify(canvas, null, 4);
    localStorage.setItem("result", resultText.value);
  });
  formatOptionsButton.addEventListener("click", (event) => {
    const dataString = JSON.parse(dataText.value).laserOptions;
    const data = JSON.parse(dataString);
    resultText.value = JSON.stringify(data, null, 4);
    localStorage.setItem("result", resultText.value);
  });
  formatJsonStringButton.addEventListener("click", (event) => {
    resultText.value = JSON.parse(dataText.value);
    localStorage.setItem("result", resultText.value);
  });
  removeImageButton.addEventListener("click", (event) => {
    const data = JSON.parse(dataText.value);
    delete data.preview_img;
    const dataString = data.data || data.objects;
    const array = JSON.parse(dataString);
    array.forEach((item) => {
      delete item.imageOriginal;
      delete item.src;
    });

    delete data.data;
    delete data.objects;
    const newData = {
      ...data,
      data: array,
    };
    resultText.value = JSON.stringify(newData, null, 4);
    localStorage.setItem("result", resultText.value);
  });
  extractImageButton.addEventListener("click", (event) => {
    clearAllImage();
    resultText.value = "";
    const data = JSON.parse(dataText.value);
    var count = 0;
    if (data.preview_img && data.preview_img.trim().startsWith("data:")) {
      appendImage(data.preview_img);
      count++;
      resultText.value = `${resultText.value}\n\n${data.preview_img}`;
    }
    delete data.preview_img;

    const dataString = data.data;
    if (dataString) {
      const array = JSON.parse(dataString);
      array.forEach((item) => {
        const imageOriginal = item.imageOriginal;
        const src = item.src;

        delete item.imageOriginal;
        delete item.src;

        if (imageOriginal && imageOriginal.trim().startsWith("data:")) {
          appendImage(imageOriginal, item);
          count++;
          resultText.value = `${resultText.value}\n\n${imageOriginal}`;
        }
        if (src && src.trim().startsWith("data:")) {
          appendImage(src, item);
          count++;
          resultText.value = `${resultText.value}\n\n${src}`;
        }
      });
      vscode.postMessage({
        text: `提取到${count}张图片`,
      });
    } else {
      vscode.postMessage({
        text: "未识别到[data]字段",
      });
    }
    localStorage.setItem("result", resultText.value);
  });
  base64ImageButton.addEventListener("click", (event) => {
    if (dataText.value && dataText.value.trim().startsWith("data:")) {
      clearAllImage();
      appendImage(dataText.value.trim());
    } else {
      vscode.postMessage({
        text: "无效的图片数据",
      });
    }
  });

  //
  window.addEventListener("message", (event) => {
    const message = event.data; // The json data that the extension sent
    console.log("message->", message);
  });

  //
  window.addEventListener("error", (event) => {
    vscode.postMessage({
      text: event.message,
    });
  });

  //清空所有图片
  function clearAllImage() {
    while (imageWrap.hasChildNodes()) {
      imageWrap.removeChild(imageWrap.firstChild);
    }
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

  //滚动到底部
  function scrollToBottom() {
    setTimeout(() => {
      window.scrollTo(0, document.documentElement.clientHeight);
    }, 300);
  }
})();
