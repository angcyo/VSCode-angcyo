/**
 * Email:angcyo@126.com
 * @author angcyo
 * @date 2022/11/09
 */

(function () {
  const vscode = acquireVsCodeApi();

  const dataElement = document.getElementById("data");
  const postButton = document.getElementById("post");
  const hostInput = document.getElementById("host");
  const fileSelectWrap = document.getElementById("file-select-wrap");
  const imageFilterWrap = document.getElementById("image-filter-wrap");
  const textInputWrap = document.getElementById("text-input-wrap");

  //localStorage.removeItem("json"); //debug

  const jsonStr =
    localStorage.getItem("json") ||
    JSON.stringify({
      mtype: 10012,
      left: 0,
      top: 0,
      width: 10,
      height: 10,
      scaleX: 1,
      scaleY: 1,
      angle: 0,
      paintStyle: 1,
      imageFilter: 1,
      inverse: false,
      printPower: 100,
      printDepth: 3,
      printCount: 1,
      printPrecision: 1,
      printType: 0,
    });

  //持久化
  const json = JSON.parse(jsonStr);
  dataElement.value = JSON.stringify(json, null, 4);
  hostInput.value = localStorage.getItem("host");

  //init
  initMtypeElement();
  initTextInput();
  initFrameElement(json);
  initSelectFile(json);
  initPaintStyle();
  initOtherStyle();
  initEngraveParams();

  onJsonChange();

  //发送请求
  postButton.addEventListener("click", async () => {
    let jsonBody = dataElement.value;

    try {
      const json = JSON.parse(jsonBody);
      switch (json.mtype) {
        case 10010:
          //如果类型是图片
          json.imageOriginal = localStorage.getItem("selectImageData");
          break;
        case 10004:
        case 10020:
          //如果类型是svg/gcode
          json.data = localStorage.getItem("selectVectorData");
          break;
      }
      jsonBody = JSON.stringify(json);
    } catch (error) {
      vscode.postMessage({
        text: "无效的请求体!",
      });
      return;
    }

    const api = hostInput.value;
    if (api) {
      vscode.postMessage({
        text: "正在请求...",
      });
      const req = await fetch(api, {
        method: "POST",
        body: jsonBody,
      });
      const text = await req.text();
      //console.log(text);

      vscode.postMessage({
        text: text,
      });
    } else {
      vscode.postMessage({
        text: "无效的服务器地址:" + api,
      });
    }
  });

  hostInput.addEventListener("input", async () => {
    localStorage.setItem("host", hostInput.value);
  });

  //---

  function onJsonChange() {
    if (json.mtype == 10010) {
      //显示图片相关属性
      fileSelectWrap.style.display = "block";
      imageFilterWrap.style.display = "block";
    } else if (json.mtype == 10004 || json.mtype == 10020) {
      //Svg GCode
      fileSelectWrap.style.display = "block";
      imageFilterWrap.style.display = "none";
    } else {
      fileSelectWrap.style.display = "none";
      imageFilterWrap.style.display = "none";
    }

    if (json.mtype == 10001 || json.mtype == 10015 || json.mtype == 10016) {
      //显示文本相关属性
      textInputWrap.style.display = "block";
      if (!json.lineSpacing) {
        json.lineSpacing = 0.2;
      }
      if (!json.charSpacing) {
        json.charSpacing = 0.2;
      }
      if (!json.fontSize) {
        json.fontSize = 10;
      }
    } else {
      textInputWrap.style.display = "none";
    }

    if (json.mtype == 10007) {
      //多边形
      if (!json.side) {
        json.side = 3;
      }
    }

    if (json.mtype == 10009) {
      //星星
      if (!json.side) {
        json.side = 5;
      }
      if (!json.depth) {
        json.depth = 40;
      }
    }

    dataElement.value = JSON.stringify(json, null, 4);
    localStorage.setItem("json", dataElement.value);
  }

  /**
   * 初始化类型mtype
   * @returns
   */
  function initMtypeElement() {
    const wrapElement = document.getElementById("mtype-wrap");
    const map = [
      {
        value: 10010,
        label: "图片",
      },
      {
        value: 10001,
        label: "文本",
      },
      {
        value: 10015,
        label: "二维码",
      },
      {
        value: 10016,
        label: "条形码",
      },
      {
        value: 10005,
        label: "矩形",
      },
      {
        value: 10006,
        label: "椭圆",
      },
      {
        value: 10008,
        label: "线条",
      },
      {
        value: 10007,
        label: "多边形",
      },
      {
        value: 10009,
        label: "星星",
      },
      {
        value: 10012,
        label: "爱心",
      },
      // {
      //   value: 10013,
      //   label: "单线字",
      // },
      // {
      //   value: 10002,
      //   label: "钢笔",
      // },
      // {
      //   value: 10003,
      //   label: "画笔",
      // },
      {
        value: 10004,
        label: "SVG",
      },
      {
        value: 10020,
        label: "GCode",
      },
    ];
    let html = `<label>数据类型:</label>`;
    map.forEach((item) => {
      html += `<label class="inline-flex"><input type="radio" name="mtype" value="${item.value}" />${item.label}</label>`;
    });
    wrapElement.innerHTML = html;

    //mtype
    initRadioIntInput("mtype");
    initImageFilterElement();
  }

  function initImageFilterElement() {
    const wrapElement = document.getElementById("image-filter-wrap");
    const map = [
      {
        value: 1,
        label: "黑白",
      },
      {
        value: 2,
        label: "印章",
      },
      {
        value: 3,
        label: "灰度",
      },
      {
        value: 4,
        label: "版画",
      },
      {
        value: 5,
        label: "抖动",
      },
      {
        value: 6,
        label: "GCode",
      },
    ];
    let html = `<label>图片滤镜:</label>`;
    map.forEach((item) => {
      html += `<label class="inline-flex"><input type="radio" name="imageFilter" value="${item.value}" />${item.label}</label>`;
    });
    wrapElement.innerHTML = html;

    //imageFilter
    initRadioIntInput("imageFilter");
  }

  /**
   * 监听坐标信息改变
   * @param {json} json
   */
  function initFrameElement(json) {
    initFloatInput("left");
    initFloatInput("top");
    initFloatInput("width");
    initFloatInput("height");
    initFloatInput("scaleX");
    initFloatInput("scaleY");
    initFloatInput("angle");
  }

  /**
   * 初始化一个整型输入框
   * @param {string} id
   */
  function initIntInput(id) {
    const input = document.getElementById(id);
    input.value = json[id];
    input.addEventListener("input", (event) => {
      if (event.target.value) {
        json[id] = parseInt(event.target.value);
      } else {
        delete json[id];
      }
      onJsonChange();
    });
  }

  /**
   * 初始化一个浮点输入框
   * @param {string} id
   */
  function initFloatInput(id, defValue) {
    const input = document.getElementById(id);
    if (json[id] == undefined) {
      input.value = defValue || "";
    } else {
      input.value = json[id];
    }

    input.addEventListener("input", (event) => {
      if (event.target.value) {
        json[id] = parseFloat(event.target.value);
      } else {
        delete json[id];
      }
      onJsonChange();
    });
  }

  /**
   * 初始化一个int类型的单选组件
   * @param {string} key
   */
  function initRadioIntInput(key) {
    const elementList = document.querySelectorAll(`input[name=${key}]`);
    elementList.forEach((element) => {
      element.addEventListener("change", (event) => {
        json[key] = parseInt(event.target.value);
        onJsonChange();
      });

      if (json[key] == element.value) {
        element.checked = true;
      }
    });
  }

  function initSelectFile(json) {
    const select = document.getElementById("select-file");
    const image = document.getElementById("image");

    image.src = localStorage.getItem("selectImageData") || "";
    image.style.display = "none";

    //选择文件监听
    select.addEventListener(`change`, () => {
      if (select.files?.length > 0) {
        const file = select.files[0];

        if (json.mtype == 10010) {
          //图片
          readFileBase64(file, (base64) => {
            //console.log(base64);
            image.src = base64;
            image.style.display = "block";
            localStorage.setItem("selectImageData", base64); //保存选中的图片数据
          });
        } else if (json.mtype == 10004 || json.mtype == 10020) {
          //svg 和 gcode
          readFileString(file, (text) => {
            //console.log(text);
            localStorage.setItem("selectVectorData", text); //保存选中的图片数据
          });
        }
      }
    });
  }

  function initTextInput() {
    const textInput = document.getElementById("text-input");
    textInput.addEventListener(`input`, () => {
      if (event.target.value) {
        json.text = event.target.value;
      } else {
        delete json.text;
      }
      onJsonChange();
    });
    textInput.value = json.text || "";

    initFloatInput("charSpacing", 0.2);
    initFloatInput("lineSpacing", 0.2);
    initFloatInput("fontSize", 10);
  }

  function readFileBase64(file, callback) {
    const reader = new FileReader();
    reader.onload = function fileReadCompleted() {
      // 当读取完成时，内容只在`reader.result`中
      callback(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function readFileString(file, callback) {
    const reader = new FileReader();
    reader.onload = function fileReadCompleted() {
      // 当读取完成时，内容只在`reader.result`中
      callback(reader.result);
    };
    reader.readAsText(file);
  }

  /**
   * paintStyle
   */
  function initPaintStyle() {
    initRadioIntInput("paintStyle");
  }

  function initOtherStyle() {
    //反色
    const inverse = document.getElementById("inverse");
    inverse.addEventListener("change", (event) => {
      json.inverse = event.target.checked;
      onJsonChange();
    });
    inverse.checked = json.inverse === true;
  }

  function initEngraveParams() {
    initIntInput("printPower");
    initIntInput("printDepth");
    initIntInput("printCount");
    initIntInput("printPrecision");
    initRadioIntInput("printType");
  }
})();
