/**
 * Email:angcyo@126.com
 * @author angcyo
 * @date 2025-06-12
 */

(function () {
  const vscode = acquireVsCodeApi()
  //console.log("初始化svgParse.js", vscode, window)
  const selectFile = document.getElementById("selectFile")
  const create = document.getElementById("create")
  const parse = document.getElementById("parse")
  const result = document.getElementById("result")
  const fileLabel = document.getElementById("fileLabel")
  const dataElement = document.getElementById("data")
  const dateTimeElement = document.getElementById("dateTime")
  const deviceButtonWrap = document.getElementById("deviceButtonWrap")

  //--
  const rawVersionInput = document.getElementById("rawVersionInput")
  const rawVersionInputHex = document.getElementById("rawVersionInputHex")
  const testVersionInput = document.getElementById("testVersionInput")
  const testVersionResultInput = document.getElementById("testVersionResultInput")
  //--
  const testFlag = document.getElementById("testFlag")
  const productFlag = document.getElementById("productFlag")
  const productNumberFlag = document.getElementById("productNumberFlag")
  const versionInput = document.getElementById("versionInput")
  const versionRangeInput = document.getElementById("versionRangeInput")
  const versionDesInput = document.getElementById("versionDesInput")

  //2个路径
  let selectPath = ""
  let targetPath = localStorage.getItem("ydBinTargetPath") || ""
  let createVerifyCode = undefined

  const jsonStr = localStorage.getItem("ydBinCreateBinJson") || JSON.stringify({
    v: 100, n: "版本名称", d: "版本描述", r: "100~999",
  })
  dataElement.value = jsonStr

  //--
  initTextInput("rawVersionInput", "", (value) => {
    rawVersionInputHex.value = decimalToHex(value)
  })
  initTextInput("rawVersionInputHex", "", (value) => {
    rawVersionInput.value = hexToDecimal(value)
  })
  //解析版本信息
  clickButton("parseRawVersion", () => {
    const version = new FirmwareVersion(rawVersionInput.value)
    result.value = `${nowTimeString()}\n` +
      `固件类型->Dec: ${version.test} / Hex: ${decimalToHex(version.test)}\n` +
      `产品型号->Dec: ${version.product} / Hex: ${decimalToHex(version.product)}\n` +
      `产品编号->Dec: ${version.number} / Hex: ${decimalToHex(version.number)}\n` +
      `版本号->Dec: ${version.version} / Hex: ${decimalToHex(version.version)}\n` +
      `语义版本->Dec: ${version.versionStr()} / Hex: ${version.versionHexStr()}\n`
  })
  //解析版本信息并填充到输入框
  clickButton("parseVersionFill", () => {
    const version = new FirmwareVersion(hexToDecimal(rawVersionInputHex.value) || rawVersionInput.value)
    testFlag.value = version.test
    productFlag.value = version.product
    productNumberFlag.value = version.number
    versionInput.value = version.versionStr()
    updateCustomJsonInput()
  })
  initTextInput("testVersionInput", "", (value) => {
    testVersionResultInput.value = semVerToInt(value)
  })
  initTextInput("testVersionResultInput", "", (value) => {
    testVersionInput.value = intToSemVerTo(value)
  })
  //--
  initTextInput("testFlag", "", (value) => {
    updateCustomJsonInput()
  })
  initTextInput("productFlag", "", (value) => {
    updateCustomJsonInput()
  })
  initTextInput("productNumberFlag", "", (value) => {
    updateCustomJsonInput()
  })
  initTextInput("versionInput", "", (value) => {
    updateCustomJsonInput()
  })
  initTextInput("versionRangeInput", "0.0.0~15.15.255", (value) => {
    updateCustomJsonInput()
  })
  initTextInput("versionDesInput", "- 1. \n- 2. \n- 3.", (value) => {
    updateCustomJsonInput()
  })

  //--

  /**根据输入框的值, 创建自定义的json数据*/
  function updateCustomJsonInput() {
    const version = new FirmwareVersion(0)
    version.test = parseInt(testFlag.value || "0")
    version.product = parseInt(productFlag.value || "0")
    version.number = parseInt(productNumberFlag.value || "0")
    version.version = semVerToInt(versionInput.value || "0")
    const v = version.toRaw()
    const versionStr = `v${versionInput.value}`

    const ranges = (versionRangeInput.value || "0~0").split("~")
    version.version = semVerToInt(ranges[0])
    const fv = version.toRaw()
    version.version = semVerToInt(ranges[1])
    const tv = version.toRaw()

    //版本名称
    let name = version.product === 1 ? "G" : version.product === 2 ? "Y" : ""
    name += `${version.number.toString().padStart(2, "0")}`
    name += ` ${versionStr}`
    name += version.test === 1 ? `(内测版)` : ""
    const json = {
      ...JSON.parse(dataElement.value),
      ...{
        t: new Date().getTime(),
        v: v,
        r: `${fv}~${tv}`,
        n: name,
        d: `${versionStr} 更新描述:\n${versionDesInput.value.replaceAll(/\\\\/g, '\\')}`,
      },
    }
    dataElement.value = JSON.stringify(json, null, 4)
  }

  function dataObj() {
    try {
      return JSON.parse(dataElement.value)
    } catch (e) {
      return undefined
    }
  }

  //--

  //接收来自vscode的数据
  // Handle messages sent from the extension to the webview
  window.addEventListener("message", (event) => {
    const message = event.data // The json data that the extension sent
    switch (message.type) {
      case "response":
        if (message.uuid === "ydb_config") {
          //https://gitee.com/angcyo/file/raw/master/LaserABC/ydb_config.json
          const jsonObj = JSON.parse(message.value)
          console.log(jsonObj)
          //--
          createVerifyCode = jsonObj.createVerifyCode
          const deviceList = jsonObj.deviceVersionConfig

          deviceList?.forEach((item) => {
            const button = document.createElement("button")
            button.innerHTML = item.name
            deviceButtonWrap.appendChild(button)

            button.addEventListener("click", () => {
              try {
                const itemJson = item
                delete itemJson.name
                const json = {
                  ...JSON.parse(dataElement.value), ...itemJson,
                }
                dataElement.value = JSON.stringify(json, null, 4)
              } catch (error) {
                console.dir(error)
                vscode.postMessage({
                  text: error.message,
                })
              }
            })
          })
        }
        return
    }
  })

  //
  fileLabel.addEventListener("click", () => {
    if (selectPath) {
      //打开文件所在目录
      vscode.postMessage({
        command: "reveal", path: selectPath,
      })
    }
  })

  //选择文件监听
  selectFile.addEventListener(`change`, (event) => {
    console.log("选择文件...↓")
    console.log(selectFile.files)

    if (selectFile.files?.length > 0) {
      const file = selectFile.files[0]
      //获取文件路径
      selectPath = file.path
      localStorage.setItem("selectPath", selectPath)
      console.log(selectPath)

      const name = file.path || file.name
      const newName = name.substring(0, name.lastIndexOf("."))
      targetPath = `${newName}.ydb`
      console.log(targetPath)

      readFileMd5(file, (md5) => {
        console.log(md5)

        if (selectPath) {
          fileLabel.innerHTML = `文件路径: ${selectPath}<br>生成路径: ${targetPath} (会覆盖同名文件)`
        } else {
          fileLabel.innerHTML = `文件名: ${name}<br>生成名: ${targetPath}`
        }

        try {
          updateCustomJsonInput()
          const json = JSON.parse(dataElement.value)
          if (name.toLowerCase().endsWith(".bin")) {
            json.t = new Date().getTime()
            json.md5 = md5
          } else {
            delete json.t
            delete json.md5
          }
          dataElement.value = JSON.stringify(json, null, 4)
        } catch (error) {
          console.dir(error)
        }
      })
    } else {
      fileLabel.textContent = ""
    }
  })

  //生成ydb文件
  create.addEventListener("click", (event) => {
    if (selectFile.files?.length > 0) {
      const file = selectFile.files[0]
      const name = file.path || file.name
      //debugger;
      if (name.toLowerCase().endsWith(".ydb")) {
        vscode.postMessage({
          text: "已经是ydb格式文件!",
        })
        return
      }

      //create data fn
      function createFn() {
        let data = undefined
        try {
          data = JSON.parse(dataElement.value)
        } catch {
        }

        if (data) {
          //格式化json
          dataElement.value = JSON.stringify(data, null, 4)
          readFile(file, (data) => {
            //result.value = data.join(",");
            //const dataString = new TextDecoder("ISO-8859-1").decode(data);

            let dataU8Array = data
            let customU8Array = createData()
            let resultU8Array = []

            dataU8Array = Array.prototype.slice.call(dataU8Array)
            customU8Array = Array.prototype.slice.call(customU8Array)

            resultU8Array = dataU8Array.concat(customU8Array)

            result.value = resultU8Array.join(",")

            if (selectPath) {
              vscode.postMessage({
                command: "save", type: "u8s",//数据类型是uint8,uint8,uint8,...组成的字符串
                path: targetPath, data: result.value, reveal: true, //打开保存的文件所在目录
              })
            } else {
              vscode.postMessage({
                command: "saveAs", type: "u8s", name: targetPath, data: result.value, reveal: true, //打开保存的文件所在目录
              })
            }
          })
          //持久化
          delete data.t
          delete data.md5
          localStorage.setItem("ydBinCreateBinJson", JSON.stringify(data, null, 4))
        } else {
          vscode.postMessage({
            text: "Json数据格式异常,请检查输入...",
          })
        }
      }

      //检查是否需要验证
      if (createVerifyCode === undefined || !createVerifyCode.value) {
        createFn()
      } else {
        listenerOnce("input", undefined, (inputValue) => {
          if (inputValue === createVerifyCode.value) {
            createFn()
          } else {
            vscode.postMessage({
              text: "输入有误, 已终止!",
            })
          }
        })
        vscode.postMessage({
          command: "input", ...createVerifyCode, value: undefined,
        })
      }
    } else {
      result.value = "请先选择文件..."
      vscode.postMessage({
        text: "请先选择文件...",
      })
    }
  })

  //解析ydb文件
  parse.addEventListener("click", (event) => {
    if (selectFile.files?.length > 0) {
      const file = selectFile.files[0]
      const name = file.path || file.name
      if (name.toLowerCase().endsWith(".ydb")) {
        readFile(file, (data) => {
          const dataU8 = data.join(",")
          const dataString = new TextDecoder("utf8").decode(data)
          //将u8数据转成十六进制
          const hex = Array.prototype.map
            .call(data, (x) => ("00" + x.toString(16).toUpperCase()).slice(-2))
            .join(" ")

          //log
          result.value = dataU8 + "\n\n" + hex + "\n\n" + dataString

          //开始解析
          const dataLength = data.byteLength
          const footerU8Array = data.slice(dataLength - 2)
          if (footerU8Array[0] === "Y".charCodeAt(0) && footerU8Array[1] === "D".charCodeAt(0)) {
          } else {
            vscode.postMessage({
              text: "[1]校验不通过, 滚犊子...",
            })
            return
          }

          const lengthU8Array = data.slice(dataLength - 4 - 2)
          //追加的数据总长度
          const length = readIntFromUint8Array(lengthU8Array)
          if (length <= 0) {
            vscode.postMessage({
              text: "[2]校验不通过, 滚犊子...",
            })
            return
          }
          try {
            const jsonU8Array = data.slice(dataLength - length - 4 - 2, dataLength - 4 - 2)
            const json = readStringFromUint8Array(jsonU8Array)
            console.log(json)

            dataElement.value = JSON.stringify(JSON.parse(json), null, 4)

            vscode.postMessage({
              text: `解析成功, 总长度:${length}bytes`,
            })
            vscode.postMessage({
              text: json,
            })
          } catch (e) {
            vscode.postMessage({
              text: "数据异常, 滚犊子...",
            })
          }
        })
      } else {
        vscode.postMessage({
          text: "请选择ydb格式文件!",
        })
      }
    } else {
      result.value = "请先选择文件..."
      vscode.postMessage({
        text: "请先选择文件...",
      })
    }
  })

  //读取文件二进制数据
  function readFile(file, callback) {
    console.log("读取文件↓")
    console.log(file)
    const reader = new FileReader()
    reader.onload = function fileReadCompleted() {
      // 当读取完成时，内容只在`reader.result`中
      const data = new Uint8Array(reader.result)
      //const data = reader.result;
      callback(data)
    }
    reader.readAsArrayBuffer(file)
  }

  function readFileMd5(file, callback) {
    const reader = new FileReader()
    reader.onload = function fileReadCompleted() {
      // 当读取完成时，内容只在`reader.result`中
      const md5 = SparkMD5.hashBinary(reader.result)
      callback(md5)
    }
    reader.readAsBinaryString(file)
  }

  // 创建ydb自定义的数据
  // [json]+[length]+[YD]
  function createData() {
    let footerU8Array = new Uint8Array(["Y".charCodeAt(0), "D".charCodeAt(0)])
    //console.log(footerU8Array);//89 68

    const encoder = new TextEncoder("utf-8")
    const json = JSON.parse(dataElement.value)
    json.t = new Date().getTime()
    const jsonStr = JSON.stringify(json)
    let jsonU8Array = encoder.encode(jsonStr)

    const length = jsonU8Array.byteLength
    const buffer = new ArrayBuffer(4)
    const dataView = new DataView(buffer)
    dataView.setUint32(0, length)
    const lengthU8Array = Array.prototype.slice.call(new Uint8Array(dataView.buffer))

    //result
    let resultU8Array = []
    //原始数据+json字符串
    resultU8Array = resultU8Array.concat(jsonU8Array)
    //+4个字节描述的长度
    resultU8Array = resultU8Array.concat(lengthU8Array)
    //+YD
    resultU8Array = resultU8Array.concat(footerU8Array)
    //console.log(lengthU8Array);
    return resultU8Array
  }

  //从[Uint8Array]中读取int数据
  function readIntFromUint8Array(uint8Array) {
    const buffer = new ArrayBuffer(uint8Array.byteLength)
    const dataView = new DataView(buffer)
    for (const i in uint8Array) {
      dataView.setUint8(parseInt(i), uint8Array[i])
    }
    return dataView.getUint32(0)
  }

  //从[Uint8Array]中读取hex数据
  function readHexFromUint8Array(uint8Array) {
    return uint8Array
      .reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "")
      .toUpperCase()
    // return Array.prototype.map
    //   .call(uint8Array, (x) => ("00" + x.toString(16)).slice(-2))
    //   .join(" ");
  }

  //从[Uint8Array]中读取string数据
  function readStringFromUint8Array(uint8Array) {
    const decoder = new TextDecoder("utf-8")
    return decoder.decode(uint8Array)
  }

  //--

  /**语义化版本 1.0.0 转换成int
   * [semVerToInt]
   * [intToSemVerTo]
   * */
  function semVerToInt(semVer) {
    const [major, minor, patch] = semVer.split(".")
    return ((parseInt(major || "0") & 0b1111) << 12) +
      ((parseInt(minor || "0") & 0b1111) << 8) +
      (parseInt(patch || "0") & 0b11111111)
  }

  /**
   * [semVerToInt]
   * [intToSemVerTo]
   * */
  function intToSemVerTo(value) {
    const major = bits(value, 12, 4)
    const minor = bits(value, 8, 4)
    const patch = bits(value, 0, 8)
    return `${major}.${minor}.${patch}`
  }

  //时间戳测试...
  const timestampElement = document.getElementById("timestamp")
  const timestampResult = document.getElementById("timestampResult")
  const timeElement = document.getElementById("time")
  const timeResult = document.getElementById("timeResult")
  const fmt = "yyyy-MM-dd HH:mm:ss"

  timestampElement.addEventListener("input", () => {
    let timestamp = timestampElement.value
    if (timestamp.length === 10) {
      timestamp = `${timestamp}000`
    }

    if (timestamp.length === 13) {
      const date = new Date(parseInt(timestamp))
      timestampResult.textContent = formatDate(date, fmt)
    }
  })

  timeElement.addEventListener("input", () => {
    let timestamp = timeElement.value

    const date = new Date(timestamp)
    timeResult.textContent = date.getTime()
  })

  dateTimeElement.addEventListener(`input`, (event) => {
    //console.log(event);
    const date = new Date(event.target.value)
    timeResult.textContent = date.getTime()
  })

  const date = new Date()
  timestampElement.value = date.getTime()
  timeElement.value = formatDate(date, fmt)
  dateTimeElement.value = formatDate(date, fmt).replace(" ", "T")

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
    }
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substring(4 - RegExp.$1.length))
    }
    for (var k in o) {
      if (new RegExp("(" + k + ")").test(fmt)) {
        fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substring(("" + o[k]).length))
      }
    }
    return fmt
  }

  /**监听一次*/
  function listenerOnce(command, type, callback) {
    const listener = function (event) {
      if (event.data?.command === command) {
        if (type === undefined || type && event.data.type === type) {
          const data = event.data.data
          callback(data)
        }
      }
      window.removeEventListener("message", listener)
    }
    window.addEventListener("message", listener)
  }

  // 创建事件对象
  const inputEvent = document.createEvent("HTMLEvents")
  // 初始化事件
  inputEvent.initEvent("input", false, false)
  // 触发事件
  timestampElement.dispatchEvent(inputEvent)
  timeElement.dispatchEvent(inputEvent)

  //请求配置列表
  vscode.postMessage({
    command: "request",
    uuid: "ydb_config",
    url: "https://gitee.com/angcyo/file/raw/master/LaserABC/ydb_config.json?time=" + new Date().getTime(),
  })
})()


class FirmwareVersion {

  /**通过4字节int创建版本信息*/
  constructor(data) {
    this.raw = data
    this.test = bits(data, 30, 2)
    this.product = bits(data, 24, 6)
    this.number = bits(data, 16, 8)
    this.version = bits(data, 0, 16)
    //--
    this.major = bits(data, 12, 4)
    this.minor = bits(data, 8, 4)
    this.patch = bits(data, 0, 8)
  }

  versionStr() {
    return `${this.major}.${this.minor}.${this.patch}`
  }

  versionHexStr() {
    return `${decimalToHex(this.major)}.${decimalToHex(this.minor)}.${decimalToHex(this.patch)}`
  }

  /**反向转成4字节int*/
  toRaw() {
    return ((this.test & 0b11) << 30) +
      ((this.product & 0b111111) << 24) +
      ((this.number & 0b11111111) << 16) +
      ((this.version & 0b1111111111111111))
  }
}