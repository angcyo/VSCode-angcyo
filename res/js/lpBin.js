/**
 * Email:angcyo@126.com
 * @author angcyo
 * @date 2022/11/03
 */

(function () {
  const vscode = acquireVsCodeApi();
  //console.log("初始化svgParse.js", vscode, window)
  const selectFile = document.getElementById("selectFile");
  const create = document.getElementById("create");
  const parse = document.getElementById("parse");
  const result = document.getElementById("result");
  const fileLabel = document.getElementById("fileLabel");
  const dataElement = document.getElementById("data");
  const dateTimeElement = document.getElementById("dateTime");
  const deviceButtonWrap = document.getElementById("deviceButtonWrap");

  //2个路径
  var selectPath = "";
  var targetPath = localStorage.getItem("targetPath") || "";

  const jsonStr =
    localStorage.getItem("createBinJson") ||
    JSON.stringify({
      v: 100,
      n: "版本名称",
      d: "版本描述",
      r: "100~999",
    });
  dataElement.value = jsonStr;

  //接收来自vscode的数据
  // Handle messages sent from the extension to the webview
  window.addEventListener("message", (event) => {
    const message = event.data; // The json data that the extension sent
    switch (message.type) {
      case "device":
        const deviceList = JSON.parse(message.value);
        console.log(deviceList);

        deviceList?.forEach((item) => {
          const button = document.createElement("button");
          button.innerHTML = item.name;
          deviceButtonWrap.appendChild(button);

          button.addEventListener("click", () => {
            try {
              const itemJson = item;
              delete itemJson.name;
              const json = {
                ...JSON.parse(dataElement.value),
                ...itemJson,
              };
              dataElement.value = JSON.stringify(json, null, 4);
            } catch (error) {
              console.dir(error);
              vscode.postMessage({
                text: error.message,
              });
            }
          });
        });
        return;
    }
  });

  //
  fileLabel.addEventListener("click", () => {
    if (selectPath) {
      //打开文件所在目录
      vscode.postMessage({
        command: "reveal",
        path: selectPath,
      });
    }
  });

  //选择文件监听
  selectFile.addEventListener(`change`, () => {
    console.log("选择文件...↓");
    console.log(selectFile.files);

    if (selectFile.files?.length > 0) {
      selectPath = selectFile.files[0].path;
      localStorage.setItem("selectPath", selectPath);
      console.log(selectPath);

      const path = selectPath.substring(0, selectPath.lastIndexOf("."));
      targetPath = `${path}.lpbin`;
      console.log(targetPath);

      readFileMd5(selectFile.files[0], (md5) => {
        console.log(md5);

        fileLabel.innerHTML = `文件路径: ${selectPath}<br>生成路径: ${targetPath} (会覆盖同名文件)`;

        try {
          const json = JSON.parse(dataElement.value);
          if (selectPath.toLowerCase().endsWith(".bin")) {
            json.t = new Date().getTime();
            json.md5 = md5;
          } else {
            delete json.t;
            delete json.md5;
          }
          dataElement.value = JSON.stringify(json, null, 4);
        } catch (error) {
          console.dir(error);
        }
      });
    } else {
      fileLabel.textContent = "";
    }
  });

  //生成lpbin文件
  create.addEventListener("click", (event) => {
    if (selectFile.files?.length > 0) {
      const path = selectFile.files[0].path;
      if (path.toLowerCase().endsWith(".lpbin")) {
        vscode.postMessage({
          text: "已经是lpbin格式文件!",
        });
        return;
      }

      let data = undefined;
      try {
        data = JSON.parse(dataElement.value);
      } catch {}

      if (data) {
        //格式化json
        dataElement.value = JSON.stringify(data, null, 4);
        readFile(selectFile.files[0], (data) => {
          //result.value = data.join(",");
          //const dataString = new TextDecoder("ISO-8859-1").decode(data);

          let dataU8Array = data;
          let newDataU8Array = createData();
          let resultU8Array = [];

          dataU8Array = Array.prototype.slice.call(dataU8Array);
          newDataU8Array = Array.prototype.slice.call(newDataU8Array);

          resultU8Array = dataU8Array.concat(newDataU8Array);

          result.value = resultU8Array.join(",");

          vscode.postMessage({
            command: "save",
            path: targetPath,
            data: result.value,
            reveal: true, //打开保存的文件所在目录
          });
        });
        //持久化
        delete data.t;
        delete data.md5;
        localStorage.setItem("createBinJson", JSON.stringify(data, null, 4));
      } else {
        vscode.postMessage({
          text: "Json数据格式异常,请检查输入...",
        });
      }
    } else {
      result.value = "请先选择文件...";
      vscode.postMessage({
        text: "请先选择文件...",
      });
    }
  });

  //解析lpbin文件
  parse.addEventListener("click", (event) => {
    if (selectFile.files?.length > 0) {
      const path = selectFile.files[0].path;
      if (path.toLowerCase().endsWith(".lpbin")) {
        readFile(selectFile.files[0], (data) => {
          const dataU8 = data.join(",");
          const dataString = new TextDecoder("utf8").decode(data);
          //将u8数据转成十六进制
          const hex = Array.prototype.map
            .call(data, (x) => ("00" + x.toString(16).toUpperCase()).slice(-2))
            .join(" ");

          result.value = dataU8 + "\n\n" + hex + "\n\n" + dataString;

          const dataLength = data.byteLength;
          const lengthU8Array = data.slice(dataLength - 4);
          //追加的数据总长度
          const length = readIntFromUint8Array(lengthU8Array);

          //校验头, 2个字节
          const dataStartIndex = dataLength - length + 2;
          const headU8Array = data.slice(dataLength - length, dataStartIndex);

          const head = readHexFromUint8Array(headU8Array);
          //console.log(headU8Array);
          //console.log(head);
          if (head == "AABB") {
            const jsonU8Array = data.slice(dataStartIndex, dataLength - 4);
            const json = readStringFromUint8Array(jsonU8Array);
            console.log(json);

            dataElement.value = JSON.stringify(JSON.parse(json), null, 4);

            vscode.postMessage({
              text: `解析成功, 总长度:${length}bytes`,
            });
            vscode.postMessage({
              text: json,
            });
          } else {
            vscode.postMessage({
              text: "不合法的数据格式, 滚犊子...",
            });
          }
        });
      } else {
        vscode.postMessage({
          text: "请选择lpbin格式文件!",
        });
      }
    } else {
      result.value = "请先选择文件...";
      vscode.postMessage({
        text: "请先选择文件...",
      });
    }
  });

  //读取文件二进制数据
  function readFile(file, callback) {
    console.log("读取文件↓");
    console.log(file);
    const reader = new FileReader();
    reader.onload = function fileReadCompleted() {
      // 当读取完成时，内容只在`reader.result`中
      const data = new Uint8Array(reader.result);
      //const data = reader.result;
      callback(data);
    };
    reader.readAsArrayBuffer(file);
  }

  function readFileMd5(file, callback) {
    const reader = new FileReader();
    reader.onload = function fileReadCompleted() {
      // 当读取完成时，内容只在`reader.result`中
      const md5 = SparkMD5.hashBinary(reader.result);
      callback(md5);
    };
    reader.readAsBinaryString(file);
  }

  // 创建数据
  function createData() {
    let headU8Array = new Uint8Array([parseInt("AA", 16), parseInt("BB", 16)]);
    //console.log(headU8Array);//[170, 187] [65,65,66,66]

    const encoder = new TextEncoder("utf-8");
    const json = JSON.stringify(JSON.parse(dataElement.value));
    let jsonU8Array = encoder.encode(json);

    const length = headU8Array.byteLength + jsonU8Array.byteLength + 4;

    headU8Array = Array.prototype.slice.call(headU8Array);
    jsonU8Array = Array.prototype.slice.call(jsonU8Array);

    let resultU8Array = headU8Array.concat(jsonU8Array);

    const buffer = new ArrayBuffer(4);
    const dataView = new DataView(buffer);
    dataView.setUint32(0, length);
    const lengthU8Array = Array.prototype.slice.call(
      new Uint8Array(dataView.buffer)
    );
    resultU8Array = resultU8Array.concat(lengthU8Array);
    console.log(lengthU8Array);
    return resultU8Array;
  }

  //从[Uint8Array]中读取int数据
  function readIntFromUint8Array(uint8Array) {
    const buffer = new ArrayBuffer(uint8Array.byteLength);
    const dataView = new DataView(buffer);
    for (var i in uint8Array) {
      dataView.setUint8(parseInt(i), uint8Array[i]);
    }
    return dataView.getUint32(0);
  }

  //从[Uint8Array]中读取hex数据
  function readHexFromUint8Array(uint8Array) {
    return uint8Array
      .reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "")
      .toUpperCase();
    // return Array.prototype.map
    //   .call(uint8Array, (x) => ("00" + x.toString(16)).slice(-2))
    //   .join(" ");
  }

  //从[Uint8Array]中读取string数据
  function readStringFromUint8Array(uint8Array) {
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(uint8Array);
  }

  //时间戳测试...
  const timestampElement = document.getElementById("timestamp");
  const timestampResult = document.getElementById("timestampResult");
  const timeElement = document.getElementById("time");
  const timeResult = document.getElementById("timeResult");
  const fmt = "yyyy-MM-dd HH:mm:ss";

  timestampElement.addEventListener("input", () => {
    let timestamp = timestampElement.value;
    if (timestamp.length == 10) {
      timestamp = `${timestamp}000`;
    }

    if (timestamp.length == 13) {
      const date = new Date(parseInt(timestamp));
      timestampResult.textContent = formatDate(date, fmt);
    }
  });

  timeElement.addEventListener("input", () => {
    let timestamp = timeElement.value;

    const date = new Date(timestamp);
    timeResult.textContent = date.getTime();
  });

  dateTimeElement.addEventListener(`input`, (event) => {
    //console.log(event);
    const date = new Date(event.target.value);
    timeResult.textContent = date.getTime();
  });

  const date = new Date();
  timestampElement.value = date.getTime();
  timeElement.value = formatDate(date, fmt);
  dateTimeElement.value = formatDate(date, fmt).replace(" ", "T");

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

  // 创建事件对象
  const inputEvent = document.createEvent("HTMLEvents");
  // 初始化事件
  inputEvent.initEvent("input", false, false);
  // 触发事件
  timestampElement.dispatchEvent(inputEvent);
  timeElement.dispatchEvent(inputEvent);
})();
