/**
 * Email:angcyo@126.com
 * @author angcyo
 * @date 2025-07-02
 */

/**16位CRC校验表*/
const _crc16table = [
  0x0000,
  0xC0C1,
  0xC181,
  0x0140,
  0xC301,
  0x03C0,
  0x0280,
  0xC241,
  0xC601,
  0x06C0,
  0x0780,
  0xC741,
  0x0500,
  0xC5C1,
  0xC481,
  0x0440,
  0xCC01,
  0x0CC0,
  0x0D80,
  0xCD41,
  0x0F00,
  0xCFC1,
  0xCE81,
  0x0E40,
  0x0A00,
  0xCAC1,
  0xCB81,
  0x0B40,
  0xC901,
  0x09C0,
  0x0880,
  0xC841,
  0xD801,
  0x18C0,
  0x1980,
  0xD941,
  0x1B00,
  0xDBC1,
  0xDA81,
  0x1A40,
  0x1E00,
  0xDEC1,
  0xDF81,
  0x1F40,
  0xDD01,
  0x1DC0,
  0x1C80,
  0xDC41,
  0x1400,
  0xD4C1,
  0xD581,
  0x1540,
  0xD701,
  0x17C0,
  0x1680,
  0xD641,
  0xD201,
  0x12C0,
  0x1380,
  0xD341,
  0x1100,
  0xD1C1,
  0xD081,
  0x1040,
  0xF001,
  0x30C0,
  0x3180,
  0xF141,
  0x3300,
  0xF3C1,
  0xF281,
  0x3240,
  0x3600,
  0xF6C1,
  0xF781,
  0x3740,
  0xF501,
  0x35C0,
  0x3480,
  0xF441,
  0x3C00,
  0xFCC1,
  0xFD81,
  0x3D40,
  0xFF01,
  0x3FC0,
  0x3E80,
  0xFE41,
  0xFA01,
  0x3AC0,
  0x3B80,
  0xFB41,
  0x3900,
  0xF9C1,
  0xF881,
  0x3840,
  0x2800,
  0xE8C1,
  0xE981,
  0x2940,
  0xEB01,
  0x2BC0,
  0x2A80,
  0xEA41,
  0xEE01,
  0x2EC0,
  0x2F80,
  0xEF41,
  0x2D00,
  0xEDC1,
  0xEC81,
  0x2C40,
  0xE401,
  0x24C0,
  0x2580,
  0xE541,
  0x2700,
  0xE7C1,
  0xE681,
  0x2640,
  0x2200,
  0xE2C1,
  0xE381,
  0x2340,
  0xE101,
  0x21C0,
  0x2080,
  0xE041,
  0xA001,
  0x60C0,
  0x6180,
  0xA141,
  0x6300,
  0xA3C1,
  0xA281,
  0x6240,
  0x6600,
  0xA6C1,
  0xA781,
  0x6740,
  0xA501,
  0x65C0,
  0x6480,
  0xA441,
  0x6C00,
  0xACC1,
  0xAD81,
  0x6D40,
  0xAF01,
  0x6FC0,
  0x6E80,
  0xAE41,
  0xAA01,
  0x6AC0,
  0x6B80,
  0xAB41,
  0x6900,
  0xA9C1,
  0xA881,
  0x6840,
  0x7800,
  0xB8C1,
  0xB981,
  0x7940,
  0xBB01,
  0x7BC0,
  0x7A80,
  0xBA41,
  0xBE01,
  0x7EC0,
  0x7F80,
  0xBF41,
  0x7D00,
  0xBDC1,
  0xBC81,
  0x7C40,
  0xB401,
  0x74C0,
  0x7580,
  0xB541,
  0x7700,
  0xB7C1,
  0xB681,
  0x7640,
  0x7200,
  0xB2C1,
  0xB381,
  0x7340,
  0xB101,
  0x71C0,
  0x7080,
  0xB041,
  0x5000,
  0x90C1,
  0x9181,
  0x5140,
  0x9301,
  0x53C0,
  0x5280,
  0x9241,
  0x9601,
  0x56C0,
  0x5780,
  0x9741,
  0x5500,
  0x95C1,
  0x9481,
  0x5440,
  0x9C01,
  0x5CC0,
  0x5D80,
  0x9D41,
  0x5F00,
  0x9FC1,
  0x9E81,
  0x5E40,
  0x5A00,
  0x9AC1,
  0x9B81,
  0x5B40,
  0x9901,
  0x59C0,
  0x5880,
  0x9841,
  0x8801,
  0x48C0,
  0x4980,
  0x8941,
  0x4B00,
  0x8BC1,
  0x8A81,
  0x4A40,
  0x4E00,
  0x8EC1,
  0x8F81,
  0x4F40,
  0x8D01,
  0x4DC0,
  0x4C80,
  0x8C41,
  0x4400,
  0x84C1,
  0x8581,
  0x4540,
  0x8701,
  0x47C0,
  0x4680,
  0x8641,
  0x8201,
  0x42C0,
  0x4380,
  0x8341,
  0x4100,
  0x81C1,
  0x8081,
  0x4040
];

(function () {
  const vscode = acquireVsCodeApi();

  const binInput = document.getElementById("binInput");
  const octInput = document.getElementById("octInput");
  const decInput = document.getElementById("decInput");
  const decInput2 = document.getElementById("decInput2");
  const hexInput = document.getElementById("hexInput");
  const hexInput2 = document.getElementById("hexInput2");
  const utfInput = document.getElementById("utfInput");
  const uriInput = document.getElementById("uriInput");
  const base64Input = document.getElementById("base64Input");
  const result = document.getElementById("result");

  const selectFile = document.getElementById("selectFile");
  const hexResult = document.getElementById("hexResult");
  const bytesStartIndex = document.getElementById("bytesStartIndex");
  const bytesEndIndex = document.getElementById("bytesEndIndex");
  const bytesReadCount = document.getElementById("bytesReadCount");
  const bytesOutputFormat = document.getElementById("bytesOutputFormat");

  //-
  const defDec = "0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15";
  initTextInput("binInput", decimalStrToHex(defDec, 2), (value) => {
    if (value) {
      onDecInputChanged(hexStrToDec(value, 2), [binInput]);
    }
  });
  initTextInput("octInput", decimalStrToHex(defDec, 8), (value) => {
    if (value) {
      onDecInputChanged(hexStrToDec(value, 8), [octInput]);
    }
  });
  initTextInput("decInput", defDec, (value) => {
    //console.log("decInput value:", value);
    if (value) {
      onDecInputChanged(value, [decInput]);
    }
  });
  initTextInput("hexInput", decimalStrToHex(defDec, 16), (value) => {
    //console.log("hexInput value:", value);
    if (value) {
      onDecInputChanged(hexStrToDec(value), [hexInput]);
    }
  });
  initTextInput("utfInput", "", (value) => {
    //console.log("hexInput value:", value);
    onUtfInputChanged(value, [utfInput]);
  });
  initTextInput("uriInput", "", (value) => {
    //console.log("hexInput value:", value);
    if (value) {
      try {
        const str = decodeURIComponent(value);
        onUtfInputChanged(str, [uriInput]);
      } catch (e) {
        // ignore
      }
    }
  });
  initTextInput("base64Input", "", (value) => {
    //console.log("hexInput value:", value);
    if (value) {
      //解码base64字符
      try {
        const str = atob(value);
        onUtfInputChanged(str, [base64Input]);
      } catch (e) {
        // ignore
        vscode.postMessage({
          text: e.toString(),
        });
      }
    }
  });
  //--
  var selectFileBytes; //Uint8Array
  initTextInput("bytesStartIndex", "0", (value) => {
    if (value) {
      //读取的开始位置
      calcBytesOutput();
    }
  });
  initTextInput("bytesEndIndex", "0", (value) => {
    if (value) {
      //读取到指定位置的字节
      calcBytesOutput(true);
    }
  });
  initTextInput("bytesReadCount", "1", (value) => {
    if (value) {
      //读取指定数量的字节
      calcBytesOutput();
    }
  });
  initTextInput("bytesOutputFormat", "", (value) => {
    //读取指定数量的字节
    calcBytesOutput();
  });
  initSelectFile("selectFile", (file) => {
    visibleHexControlInputElement(file || selectFileBytes);
    if (file) {
      readFileBytes(file, (bytes) => {
        //console.log(`${bytes.length}B`)
        //debugger;
        selectFileBytes = bytes;
        updateHexContentResult(bytes);
        calcBytesOutput();
      });
    }
  });
  initTextInput("decInput2", "", (value) => {
    //console.log("hexInput value:", value);
    visibleHexControlInputElement(value || selectFileBytes);
    if (value) {
      //debugger;
      const bytes = new Uint8Array(hexStrToBytes(decimalStrToHex(value)));
      selectFileBytes = bytes;
      updateHexContentResult(bytes);
      calcBytesOutput();
    }
  }, true);
  initTextInput("hexInput2", "", (value) => {
    //console.log("hexInput value:", value);
    visibleHexControlInputElement(value || selectFileBytes);
    if (value) {
      //debugger;
      const bytes = new Uint8Array(hexStrToBytes(value));
      selectFileBytes = bytes;
      updateHexContentResult(bytes);
      calcBytesOutput();
    }
  }, true);

  clickButton("selectFileLabel", (event) => {
    vscode.postMessage({
      command: "open",
      url: "https://en.wikipedia.org/wiki/List_of_file_signatures",
    });
    event.preventDefault();
  });

  /**控制字节输入相关元素的可见性*/
  function visibleHexControlInputElement(v) {
    visible("hexResultWrap", v)
    visible("bytesStartIndexWrap", v)
    visible("bytesEndIndexWrap", v)
    visible("bytesReadCountWrap", v)
    visible("bytesOutputFormatWrap", v)
  }

  //--

  /**当十进制输入框改变时的处理逻辑*/
  function onDecInputChanged(value, ignoreInput = [decInput]) {
    if (!value) {
      return;
    }

    if (!ignoreInput.includes(binInput)) {
      binInput.value = decimalStrToHex(value, 2);
      localStorage.setItem("binInput", binInput.value);
    }

    if (!ignoreInput.includes(octInput)) {
      octInput.value = decimalStrToHex(value, 8);
      localStorage.setItem("octInput", octInput.value);
    }

    if (!ignoreInput.includes(decInput)) {
      decInput.value = value;
      localStorage.setItem("decInput", decInput.value);
    }

    if (!ignoreInput.includes(hexInput)) {
      hexInput.value = decimalStrToHex(value, 16);
      localStorage.setItem("hexInput", hexInput.value);
    }

    if (!ignoreInput.includes(utfInput)) {
      const bytes = decimalStrToBytes(value);
      onUtfInputChanged(bytesToUtf8(bytes), [decInput, ...ignoreInput])
    }

    updateResult(value);
  }

  /**当utf文本输入框改变时的处理逻辑*/
  function onUtfInputChanged(value, ignoreInput = [utfInput]) {
    if (!value) {
      return;
    }

    const bytes = stringToBytes(value);
    const decStr = bytesToDecimalStr(bytes);
    const hexStr = decimalStrToHex(decStr);
    const uriStr = encodeURIComponent(value);

    if (!ignoreInput.includes(decInput)) {
      decInput.value = decStr;
      localStorage.setItem("decInput", decInput.value);

      onDecInputChanged(decStr, [utfInput, decInput])
    }

    if (!ignoreInput.includes(hexInput)) {
      hexInput.value = hexStr;
      localStorage.setItem("hexInput", hexInput.value);
    }

    if (!ignoreInput.includes(utfInput)) {
      utfInput.value = value;
      localStorage.setItem("utfInput", utfInput.value);
    }

    if (!ignoreInput.includes(uriInput)) {
      uriInput.value = uriStr;
      localStorage.setItem("uriInput", uriInput.value);
    }

    updateResult(decInput.value);
  }

  //--

  /*clickButton("clear", () => {
    result.innerHTML = "";
  });*/

  /**使用十进制字符串值, 更新返回框内容*/
  function updateResult(decimalStr) {
    const bytes = decimalStrToBytes(decimalStr);

    let resultStr = "共->" + bytes.length + " B(字节)" + ` ${bytes.length * 8} Bit(位)\n\n`;

    const littleHex = decimalStrToLittleEndianHex(decimalStr);

    resultStr += "Int32(BE): " + decimalStr + "  ";
    resultStr += "Int32(LE): " + hexStrToDec(littleHex) + "\n\n";

    resultStr += "Hex(BE): " + decimalStrToHex(decimalStr) + "  ";
    resultStr += "Hex(LE): " + littleHex + "\n\n";

    resultStr += bytesToEncryptLog(bytes) + "\n\n";
    resultStr += "utf8字符MD5:\n" + textToMd5(utfInput.value) + "\n\n";
    resultStr += "utf8字符Base64:\n" + textToBase64(utfInput.value) + "\n\n";

    result.innerHTML = resultStr;
  }

  /**将字节数组输出成十六进制字符*/
  function updateHexContentResult(bytes) {
    hexResult.innerHTML = bytesToLog(bytes);
  }

  /**字节数组转换成加密字符串日志*/
  function bytesToEncryptLog(bytes) {
    let resultStr = "";
    const checkSum = calcCheckSum(bytes)
    resultStr += "字节校验和(Int32): " + checkSum + "  ";
    resultStr += "字节校验和(Hex): " + decimalStrToHex(`${checkSum}`) + "\n\n";

    const crc16 = calcCrc16(bytes)
    resultStr += "字节crc16校验和(Int32): " + crc16 + "  ";
    resultStr += "字节crc16校验和(Hex): " + decimalStrToHex(`${crc16}`) + "\n\n";

    resultStr += `(${bytes.length}B)字节utf8:\n` + bytesToUtf8(bytes) + "\n\n";
    resultStr += `(${bytes.length}B)字节ASCII:\n` + bytesToASCII(bytes) + "\n\n";

    resultStr += `(${bytes.length}B)字节MD5:\n` + bytesToMd5(bytes) + "\n\n";
    resultStr += `(${bytes.length}B)字节Base64:\n` + byteArrayToBase64(bytes);

    //debugger;
    bytesToGzip(bytes, (gzip) => {
      //gzip
      if (result.innerHTML?.includes("字节Gzip") === false) {
        //debugger;
        const gzipHex = bytesToDecimalStr(gzip, 16, "");
        result.innerHTML = result.innerHTML + `(${gzip.length}B)字节Gzip(Hex):
` + gzipHex;
      }
    });

    return resultStr;
  }

  /**字节转换成可读日志字符串
   * - [bytes] 字节数组
   * - [width] 输出的字节宽度, 多少个字节占一行
   * - [outputFormat] 是否格式化输出, 例如: 4个字节一组, 8个字节一组
   * */
  function bytesToLog(bytes, width, outputFormat = false) {
    let outputWidth = width || hexResult.clientWidth > 1520 ? 64 : 32;
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
    if (outputFormat) {
      const format = bytesOutputFormat.value;
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
    }

    return resultStr;
  }

  /**将字节转换成数组日志*/
  function bytesToNumberLog(bytes) {
    //debugger;
    let resultStr = "";

    function buffer(fillLength) {
      let fillBytes = [...bytes];
      while (fillBytes.length < fillLength) {
        fillBytes.unshift(0);
      }
      return new DataView(Uint8Array.from(fillBytes).buffer);
    }

    /*let testBytes = new Uint8Array([0x89]);
    let dView = new DataView(testBytes.buffer);
    let i1 = dView.getInt8(0);
    let i2 = dView.getUint8(0);

    debugger;*/

    //无符号
    resultStr += "无符号-> Uint8: " + buffer(1).getUint8(0) + "  ";

    resultStr += "Uint16(BE): " + buffer(2).getUint16(0, false) + "  ";
    resultStr += "Uint16(LE): " + buffer(2).getUint16(0, true) + "  ";

    resultStr += "Uint32(BE): " + buffer(4).getUint32(0, false) + "  ";
    resultStr += "Uint32(LE): " + buffer(4).getUint32(0, true) + "  ";

    resultStr += "BigUint64(BE): " + buffer(8).getBigUint64(0, false) + "  ";
    resultStr += "BigUint64(LE): " + buffer(8).getBigUint64(0, true) + "\n\n";

    //有符号
    resultStr += "有符号-> Int8: " + buffer(1).getInt8(0) + "  ";

    resultStr += "Int16(BE): " + buffer(2).getInt16(0, false) + "  ";
    resultStr += "Int16(LE): " + buffer(2).getInt16(0, true) + "  ";

    resultStr += "Int32(BE): " + buffer(4).getInt32(0, false) + "  ";
    resultStr += "Int32(LE): " + buffer(4).getInt32(0, true) + "  ";

    resultStr += "BigInt64(BE): " + buffer(8).getBigInt64(0, false) + "  ";
    resultStr += "BigInt64(LE): " + buffer(8).getBigInt64(0, true) + "\n\n";

    //浮点
    resultStr += "浮点-> Float32(BE): " + buffer(4).getFloat32(0, false) + "  ";
    resultStr += "Float32(LE): " + buffer(4).getFloat32(0, true) + "  ";

    resultStr += "Float64(BE): " + buffer(8).getFloat64(0, false) + "  ";
    resultStr += "Float64(LE): " + buffer(8).getFloat64(0, true) + "\n\n";

    resultStr += bytesToEncryptLog(bytes) + "\n\n";

    return resultStr;
  }

  /**十进制字符串转换成十六进制字符串
   * [value] 数字字符串
   * [fromNumRadix] 数字字符串中的数字是几进制, 默认10
   * [toRadix] 需要输出几进制的字符串, 默认16
   * */
  function decimalStrToHex(value, toRadix, fromNumRadix) {
    let rdx = toRadix || 16;
    let numRdx = fromNumRadix || 10;
    if (value) {
      //使用空格分隔
      let hexStr = "";
      value.split(" ").forEach((item) => {
        if (item) {
          const num = parseInt(item, numRdx);
          if (isNaN(num)) {
            hexStr += ".. ";
          } else {
            const hexValue = decimalToHex(num, rdx);
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
  function hexStrToDec(value, radix) {
    if (value) {
      //使用空格分隔
      let decStr = "";
      value.split(" ").forEach((item) => {
        if (item) {
          const num = hexToDecimal(item, radix);
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
  function decimalToHex(decimal, radix) {
    let rdx = radix || 16;
    const hex = decimal.toString(rdx).toUpperCase();
    if (rdx !== 16 || hex.length % 2 === 0) {
      return hex;
    }
    return hex.padStart(hex.length + 1, "0"); // 转换为十六进制
  }

  /**十六进制转十进制*/
  function hexToDecimal(hex, radix) {
    return parseInt(hex, radix || 16); // 转换为十进制
  }

  /**将十进制转换成小端序十六进制*/
  function decimalToLittleEndianHex(decimal, radix) {
    let rdx = radix || 16;
    const hex = decimalToHex(decimal, rdx);
    let step = rdx === 16 ? 2 : 1;
    let littleEndianHex = "";
    for (let i = 0; i < hex.length; i += step) {
      littleEndianHex = hex.substring(i, i + step) + littleEndianHex;
    }
    return littleEndianHex;
  }

  /**十进制字符串转换成字节数组
   * [decimalStr] 十进制字符串, 十六进制字符串
   * [radix] : [decimalStr]中的数字是几进制
   * */
  function decimalStrToBytes(decimalStr, radix) {
    if (!decimalStr) {
      return [];
    }
    let rdx = radix || 10;
    const hex = decimalStrToHex(decimalStr, 16, rdx).replaceAll(" ", "").trim();
    return hexStrToBytes(hex);
  }

  /**十六进制字符串转换成字节数组
   * [Array]*/
  function hexStrToBytes(hexStr) {
    if (!hexStr) {
      return [];
    }
    const hex = hexStr.replaceAll(" ", "").trim();
    //debugger;
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

  /**字节数组转换成十进制数字字符串*/
  function bytesToDecimalStr(bytes, radix, space) {
    let result = "";
    bytes.map((byte) => {
      result = result + decimalToHex(byte, radix) + (space === undefined ? " " : space);
    });
    return result;
  }

  //--

  /**字节数组计算校验和*/
  function calcCheckSum(bytes) {
    let sum = 0;
    for (let i = 0; i < bytes.length; i++) {
      sum += bytes[i];
    }
    return sum;
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

  /**选中文件回调, 回调第一个文件对象
   * @param {string} id 控件的id
   * @param {function} callback 选中回调第一个文件对象, 否则undefined
   * */
  function initSelectFile(id, callback) {
    const input = document.getElementById(id);
    input.addEventListener("change", () => {
      const files = input.files;
      if (files.length === 0) {
        callback && callback(undefined);
      } else {
        console.log(`选择文件[${files.length}]↓`);
        console.log(files);
        const file = files[0];
        callback && callback(file);
      }
    });
  }

  //---

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

  /**将文本字符数据使用md5进行加密*/
  function textToMd5(text) {
    return SparkMD5.hash(text).toUpperCase();
  }

  /**将文本字符数据使用base64进行加密*/
  function textToBase64(text) {
    try {
      return btoa(text);
    } catch (e) {
      //debugger;
      return e.toString();
    }
  }

  /**将字节数组数据使用md5进行加密*/
  function bytesToMd5(bytes) {
    return SparkMD5.ArrayBuffer.hash(new Uint8Array(bytes)).toUpperCase();
  }

  /**将字节数组数据使用base64进行加密*/
  function byteArrayToBase64(byteArray) {
    // 创建一个字符串，保存字节数组中的字符
    let binaryString = '';
    // 遍历字节数组，将每个字节转换为对应的字符
    for (let i = 0; i < byteArray.length; i++) {
      binaryString += String.fromCharCode(byteArray[i]);
    }
    // 使用 btoa() 将二进制字符串转换为 Base64
    return textToBase64(binaryString);
  }

  /**将字节数组进行gzip压缩, 使用浏览器自带[CompressionStream]处理*/
  function bytesToGzip(bytes, callback) {
    // 将输入转换为流
    const inputStream = new Response(bytes).body;
    // 创建 Gzip 压缩流
    const gzipStream = new CompressionStream('gzip');
    // 管道输入流到压缩流
    const compressedStream = inputStream.pipeThrough(gzipStream);

    // 读取压缩后的数据
    const compressedResponse = new Response(compressedStream);
    compressedResponse.arrayBuffer().then(function (result) {
      callback && callback(new Uint8Array(result));
    }); // 返回 ArrayBuffer
  }

  //--crc16

  /**字节数组计算crc16*/
  function calcCrc16(bytes) {
    let crc = 0;
    for (let i = 0; i < bytes.length; i++) {
      crc = (crc >> 8) ^ _crc16table[(crc ^ bytes[i]) & 0xFF];
    }
    return crc;
  }

  //--

  /**
   * 读取文件字节数据
   * @param {File} file 文件对象
   * @param {function} callback 文件字节数据回调函数
   * */
  function readFileBytes(file, callback) {
    console.log("读取文件↓");
    console.log(file);
    const reader = new FileReader();
    reader.onload = function fileReadCompleted() {
      // 当读取完成时，内容只在`reader.result`中
      const data = new Uint8Array(reader.result);
      //const data = reader.result;
      callback && callback(data);
    };
    reader.readAsArrayBuffer(file);
  }

  //--

  /**计算字节输出内容
   * [priorityEndIndex] 是否优先使用end进行读取字节*/
  function calcBytesOutput(priorityEndIndex) {
    let start = bytesStartInt();
    let end = bytesEndInt();
    let count = bytesCountInt();

    //读取到的字节数组
    let bytes;

    //debugger;
    if (selectFileBytes && start !== undefined) {
      //开始读取的字节索引
      let max = selectFileBytes.length;
      if (priorityEndIndex && end !== undefined) {
        //
        if (end < 0) {
          end = max + end;
        }
        end = Math.min(end, max);
      } else {
        //debugger;
        if (count === undefined || count === 0) {
          count = max;
        }
        end = start + (count || 0);
        end = Math.min(end, max);
      }
      bytes = selectFileBytes.subarray(start, end);
    }

    //读取字节
    if (bytes) {
      result.innerHTML = bytesToLog(bytes, undefined, true) + "\n\n" + bytesToNumberLog(bytes);
    }
  }

  function bytesStartInt() {
    return strToIntOrNull(bytesStartIndex.value);
  }

  function bytesEndInt() {
    return strToIntOrNull(bytesEndIndex.value);
  }

  function bytesCountInt() {
    return strToIntOrNull(bytesReadCount.value);
  }

  function strToIntOrNull(value) {
    if (value) {
      try {
        return parseInt(value);
      } catch (e) {
        return undefined;
      }
    }
    return undefined;
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
})();
