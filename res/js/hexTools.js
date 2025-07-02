/**
 * Email:angcyo@126.com
 * @author angcyo
 * @date 2025-07-02
 */

(function () {
  const vscode = acquireVsCodeApi();
  
  const decInput = document.getElementById("decInput");
  const hexInput = document.getElementById("hexInput");
  const utfInput = document.getElementById("utfInput");
  const result = document.getElementById("result");
  
  const defDec = "0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15";
  initTextInput("decInput", defDec, (value) => {
    //console.log("decInput value:", value);
    if (value) {
      hexInput.value = decimalStrToHex(value);
      localStorage.setItem("hexInput", hexInput.value);
      
      const bytes = decimalStrToBytes(value);
      utfInput.value = bytesToUtf8(bytes);
      localStorage.setItem("utfInput", utfInput.value);
      
      updateResult(value);
    }
  });
  initTextInput("hexInput", decimalStrToHex(defDec), (value) => {
    //console.log("hexInput value:", value);
    if (value) {
      decInput.value = hexStrToDec(value);
      localStorage.setItem("decInput", decInput.value);
      
      updateResult(decInput.value);
    }
  });
  initTextInput("utfInput", "", (value) => {
    //console.log("hexInput value:", value);
    if (value) {
      const bytes = stringToBytes(value);
      const decStr = bytesToDecimalStr(bytes);
      const hexStr = decimalStrToHex(decStr);
      
      decInput.value = decStr;
      hexInput.value = hexStr;
      
      localStorage.setItem("decInput", decInput.value);
      localStorage.setItem("hexInput", hexInput.value);
      
      updateResult(decInput.value);
    }
  });
  
  /*clickButton("clear", () => {
    result.innerHTML = "";
  });*/
  
  /**使用十进制字符串值, 更新返回框内容*/
  function updateResult(decimalStr) {
    let resultStr = "";
    
    const littleHex = decimalStrToLittleEndianHex(decimalStr);
    
    resultStr += "十进制(大端):\n" + decimalStr + "\n\n";
    resultStr += "十进制(小端):\n" + hexStrToDec(littleHex) + "\n\n";
    
    resultStr += "十六进制(大端):\n" + decimalStrToHex(decimalStr) + "\n\n";
    resultStr += "十六进制(小端):\n" + littleHex + "\n\n";
    
    result.innerHTML = resultStr;
  }
  
  /**十进制字符串转换成十六进制字符串*/
  function decimalStrToHex(value) {
    if (value) {
      //使用空格分隔
      let hexStr = "";
      value.split(" ").forEach((item) => {
        if (item) {
          const num = parseInt(item);
          if (isNaN(num)) {
            hexStr += ".. ";
          } else {
            const hexValue = decimalToHex(num);
            hexStr += hexValue + " ";
          }
        } else {
          hexStr += item;
        }
      });
      return hexStr;
    }
    return "";
  }
  
  /**十进制字符串转换成小端十六进制字符串*/
  function decimalStrToLittleEndianHex(value) {
    if (value) {
      //使用空格分隔
      let hexStr = "";
      value.split(" ").forEach((item) => {
        if (item) {
          const num = parseInt(item);
          if (isNaN(num)) {
            hexStr += ".. ";
          } else {
            const hexValue = decimalToLittleEndianHex(num);
            hexStr += hexValue + " ";
          }
        } else {
          hexStr += item;
        }
      });
      return hexStr;
    }
    return "";
  }
  
  //--
  
  /**十六进制字符串转换成十进制字符串*/
  function hexStrToDec(value) {
    if (value) {
      //使用空格分隔
      let decStr = "";
      value.split(" ").forEach((item) => {
        if (item) {
          const num = hexToDecimal(item);
          if (isNaN(num)) {
            decStr += ".. ";
          } else {
            decStr += num + " ";
          }
        } else {
          decStr += item;
        }
      });
      return decStr;
    }
    return "";
  }
  
  //--
  
  /**十进制转十六进制*/
  function decimalToHex(decimal) {
    const hex = decimal.toString(16).toUpperCase();
    if (hex.length % 2 === 0) {
      return hex;
    }
    return hex.padStart(hex.length + 1, "0"); // 转换为十六进制
  }
  
  /**十六进制转十进制*/
  function hexToDecimal(hex) {
    return parseInt(hex, 16); // 转换为十进制
  }
  
  /**将十进制转换成小端序十六进制*/
  function decimalToLittleEndianHex(decimal) {
    const hex = decimalToHex(decimal);
    let littleEndianHex = "";
    for (let i = 0; i < hex.length; i += 2) {
      littleEndianHex = hex.substring(i, i + 2) + littleEndianHex;
    }
    return littleEndianHex;
  }
  
  /**十进制字符串转换成字节数组*/
  function decimalStrToBytes(decimalStr) {
    if (!decimalStr) {
      return [];
    }
    const hex = decimalStrToHex(decimalStr).replace(" ", "").trim();
    //每2个字符为一组, 转换成字节数组
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
      const byteStr = hex.substring(i, i + 2);
      const byte = parseInt(byteStr, 16);
      if (!isNaN(byte)) {
        bytes.push(byte);
      } else {
        bytes.push(0); // 如果转换失败, 使用0填充
      }
    }
    return bytes;
  }
  
  /**字节数组转换成utf8字符串*/
  function bytesToUtf8(bytes) {
    return new TextDecoder().decode(new Uint8Array(bytes));
  }
  
  /**字符串转换成字节数组*/
  function stringToBytes(str) {
    const encoder = new TextEncoder();
    return Array.from(encoder.encode(str));
  }
  
  /**字节数组转换成十进制数字字符串*/
  function bytesToDecimalStr(bytes) {
    return bytes.map((byte) => byte.toString()).join(" ");
  }
  
  //---
  
  window.addEventListener("message", (event) => {
    const message = event.data; // The json data that the extension sent
    console.log(message);
  });
  
  //
  window.addEventListener("error", (event) => {
    showMessage(event.message);
  });
  
  /**在vscode上显示一个消息通知*/
  function showMessage(text) {
    vscode.postMessage({
      text: text,
    });
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
   * @param {string} id 控件的id, 也是持久化的key
   * @param {string} def 默认值
   * @param {function} onChanged 当值改变时的回调函数
   */
  function initTextInput(id, def = "", onChanged = undefined) {
    const input = document.getElementById(id);
    input.addEventListener(`input`, () => {
      const value = input.value;
      localStorage.setItem(id, value);
      if (onChanged) {
        onChanged(value);
      }
    });
    input.value = localStorage.getItem(id) || def;
  }
  
  function nowTimeString(fmt) {
    return formatDate(new Date(), fmt || "yyyy-MM-dd HH:mm:ss'SSS");
  }
  
  //格式化时间
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
  
  /**拼接返回值*/
  function appendResult(text) {
    if (result.innerHTML) {
      result.innerHTML = result.innerHTML + "\n" + "\n" + nowTimeString() + "\n" + text;
    } else {
      result.innerHTML = nowTimeString() + "\n" + text;
    }
  }
  
  function wrapTime(tag, action) {
    tick();
    action();
    appendTime(tag);
  }
  
  var tickTime = 0;
  
  function tick() {
    tickTime = new Date().getTime();
  }
  
  function appendTime(tag) {
    const time = new Date().getTime();
    appendResult((tag || "") + "耗时:" + (time - tickTime) + "ms");
  }
  
  /**滚动到底部*/
  function scrollToBottom() {
    setTimeout(() => {
      window.scrollTo(0, document.documentElement.clientHeight);
    }, 300);
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
})();
