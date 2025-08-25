/**
 * Email:angcyo@126.com
 * @author angcyo
 * @date 2025-08-22
 */

/**在vscode层显示一个消息提示*/
function showVscodeMessage(text) {
  vscode.postMessage({text: text,});
}

/**监听一次*/
function listenerOnce(command, type, callback) {
  const listener = function (event) {
    if (event.data?.command === command) {
      if (type === undefined || type && event.data.type === type) {
        const data = event.data.data;
        callback(data);
      }
    }
    window.removeEventListener("message", listener);
  };
  window.addEventListener("message", listener);
}

//--

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
 * 自动持久化勾选控件
 * @param {string} id 控件的id, 也是持久化的key
 * @param {string} def 默认值
 * @param {function} onChanged 当值改变时的回调函数
 */
function initCheckbox(id, def = false, onChanged = undefined, defNotify = undefined) {
  const checkbox = document.getElementById(id);
  checkbox.addEventListener("change", (event) => {
    const value = checkbox.checked;
    localStorage.setItem(id, value);
    if (onChanged) {
      onChanged(value);
    }
  });
  checkbox.checked = localStorage.getItem(id) || def;
  if (defNotify === true) {
    if (onChanged) {
      onChanged(checkbox.checked);
    }
  }
}

/**向指定的目标发送input事件*/
function sendInputEvent(target) {
  // 创建事件对象
  const inputEvent = document.createEvent("HTMLEvents");
  // 初始化事件
  inputEvent.initEvent("input", false, false);
  // 触发事件
  target.dispatchEvent(inputEvent);
}

/**滚动到底部*/
function scrollToBottom() {
  setTimeout(() => {
    window.scrollTo(0, document.documentElement.clientHeight);
  }, 300);
}

/**可见或者隐藏控件*/
function visible(id, visible) {
  const element = document.getElementById(id);
  if (visible) {
    element.style.display = "";
  } else {
    element.style.display = "none";
  }
}

//--

/**将字节数组数据使用md5进行加密*/
function bytesToMd5(bytes) {
  return SparkMD5.ArrayBuffer.hash(new Uint8Array(bytes)).toUpperCase();
}

/**字节数组转换成utf8字符串*/
function bytesToUtf8(bytes) {
  return new TextDecoder().decode(new Uint8Array(bytes));
}

/**字节数组转换成ASCII字符串*/
function bytesToASCII(bytes) {
  let result = "";
  bytes.map((byte) => {
    result = result + byteToASCII(byte);
  });
  return result;
}

/**字符串转换成字节数组*/
function stringToBytes(str) {
  const encoder = new TextEncoder();
  return Array.from(encoder.encode(str));
}

function byteToASCII(byte) {
  switch (byte) {
    case 0x00:
      return "␀";
    case 0x01:
      return "␁";
    case 0x02:
      return "␂";
    case 0x03:
      return "␃";
    case 0x04:
      return "␄";
    case 0x05:
      return "␅";
    case 0x06:
      return "␆";
    case 0x07:
      return "␇";
    case 0x08:
      return "␈";
    case 0x09:
      return "␉";
    case 0x0A:
      return "␊";
    case 0x0B:
      return "␋";
    case 0x0C:
      return "␌";
    case 0x0D:
      return "␍";
    case 0x0E:
      return "␎";
    case 0x0F:
      return "␏";
    case 0x10:
      return "␐";
    case 0x11:
      return "␑";
    case 0x12:
      return "␒";
    case 0x13:
      return "␓";
    case 0x14:
      return "␔";
    case 0x15:
      return "␕";
    case 0x16:
      return "␖";
    case 0x17:
      return "␗";
    case 0x18:
      return "␘";
    case 0x19:
      return "␙";
    case 0x1a:
      return "␚";
    case 0x1b:
      return "␛";
    case 0x1c:
      return "␜";
    case 0x1d:
      return "␝";
    case 0x1e:
      return "␞";
    case 0x1f:
      return "␟";
    case 0x7f:
      return "␡";
    default:
      return String.fromCharCode(byte);
  }
}

//--

/**读取文件二进制数据*/
function readFileBytes(file, callback) {
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

//--

/**字节转换成可读日志字符串
 * - [bytes] 字节数组
 * - [width] 输出的字节宽度, 多少个字节占一行
 * - [outputFormat] 是否格式化输出, 例如: 4个字节一组, 8个字节一组
 * - [element] 容器元素
 * */
function bytesToLog(bytes, width, format, element) {
  let outputWidth = width || (element?.clientWidth || 0) > 1520 ? 64 : 32;
  let resultStr = "共-> " + bytes.length + " B(字节)" + ` / ${bytes.length * 8} Bit(位)\n\n`;

  //二进制
  if (bytes.length <= 1024) {
    bytes.forEach((item, index) => {
      resultStr += `${item.toString(2).toUpperCase()}  `;
    })
    resultStr += "\n";
  }

  //十六进制
  bytes.forEach((item, index) => {
    resultStr += `${item.toString(16).padStart(2, "0").toUpperCase()}  `;
    if ((index + 1) % (outputWidth || 32) === 0) {
      resultStr += "\n";
    }
  })

  //格式化输出
  if (format) {
    //字节格式化输出
    const formatList = format.split(" ");
    if (formatList) {
      resultStr += "\n\n";

      let part = 0; //当前第几组格式
      let count = 0;//当前组的字节数
      let partStr = ""; //当前组的Hex字符串

      bytes.forEach((item, index) => {
        const partCount = formatList[part];//当前组需要的字节数
        const itemStr = `${item.toString(16).padStart(2, "0").toUpperCase()}`
        if (partCount) {
          partStr += itemStr;
          count++;

          if (count >= partCount) {
            //当前字节数已够
            resultStr += partStr + "  ";
            if ((part + 1) % (outputWidth || 32) === 0) {
              resultStr += "\n";
            }

            part++;
            count = 0;
            partStr = "";
          }
        } else {
          resultStr += `${itemStr}  `;
        }
      })
    }
  }

  return resultStr;
}

/** - [bytesToLog]*/
function bytesToHex(bytes, width, element) {
  let outputWidth = width || (element?.clientWidth || 0) > 1520 ? 64 : 32;
  let resultStr = ""
  //十六进制
  bytes.forEach((item, index) => {
    resultStr += `${item.toString(16).padStart(2, "0").toUpperCase()}  `;
    if ((index + 1) % (outputWidth || 32) === 0) {
      resultStr += "\n";
    }
  })
  return resultStr;
}

/**十进制转十六进制*/
function decimalToHex(decimal, radix) {
  let rdx = radix || 16;
  const hex = (decimal < 0 ? decimal >>> 0 : decimal).toString(rdx).toUpperCase();
  if (rdx !== 16 || hex.length % 2 === 0) {
    return hex;
  }
  return hex.padStart(hex.length + 1, "0"); // 转换为十六进制
}

//--

function nowTimeString(fmt) {
  return formatDate(new Date(), fmt || "yyyy-MM-dd HH:mm:ss'SSS");
}

/**格式化时间*/
function formatDate(date, fmt) {
  const o = {
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
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substring(4 - RegExp.$1.length));
  }
  for (const k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : k === "S+" ? ("000" + o[k]).substring(3) : ("00" + o[k]).substring(("" + o[k]).length));
    }
  }
  return fmt;
}