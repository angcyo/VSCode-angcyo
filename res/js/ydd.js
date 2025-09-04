/**
 * Email:angcyo@126.com
 * @author angcyo
 * @date 2025-06-12
 */

/**颜色索引映射表
 * https://ilda.com/resources/StandardsDocs/ILDA_IDTF14_rev011.pdf*/
const ColorIndexTable = {
  //索引: R G B
  0: [255, 16, 0],
}

function initColorInexTable() {
  //红色的
  for (let i = 0; i < 17; i++) {
    ColorIndexTable[i] = [255, Math.min(255, 16 * i), 0];
  }
  //黄色的
  for (let i = 17; i < 25; i++) {
    ColorIndexTable[i] = [Math.max(0, 256 - 32 * (i - 17)), 255, 0];
  }
  //绿色的
  for (let i = 25; i < 32; i++) {
    ColorIndexTable[i] = [0, 255, Math.min(255, 36 * (i - 24))];
  }
  //青色的
  for (let i = 32; i < 40; i++) {
    ColorIndexTable[i] = [0, Math.max(0, 256 - 28 * (i - 31)), 255];
  }
  //蓝色的
  for (let i = 40; i < 49; i++) {
    ColorIndexTable[i] = [Math.min(255, 32 * (i - 40)), 0, 255];
  }
  //品红
  for (let i = 49; i < 56; i++) {
    ColorIndexTable[i] = [255, Math.min(255, 32 * (i - 49)), 255];
  }
  //白色的
  for (let i = 56; i < 64; i++) {
    let v = Math.max(0, 256 - 32 * (i - 56));
    ColorIndexTable[i] = [255, v, v];
  }
}

(function () {
  const vscode = acquireVsCodeApi();
  window.vscode = vscode;
  //console.log("初始化svgParse.js", vscode, window)
  const selectFile = document.getElementById("selectFile");
  const result = document.getElementById("result");
  const fileLabel = document.getElementById("fileLabel");
  const parseResult = document.getElementById("parseResult");
  const wrapGCode = document.getElementById("wrapGCode");

  //init
  initCheckbox("wrapGCode", false);
  initColorInexTable();

  //选中文件的字节数据
  var selectFileBytes; //Uint8Array
  //选择文件监听
  selectFile.addEventListener(`change`, (event) => {
    console.log("选择文件...↓");
    console.log(selectFile.files);

    if (selectFile.files?.length > 0) {
      const file = selectFile.files[0];
      readFileBytes(file, (bytes) => {
        selectFileBytes = bytes;
        result.innerHTML = bytesToLog(bytes, undefined, undefined, result);
      });
    } else {
      fileLabel.textContent = "";
    }
  });

  /**触发解析ydd文件*/
  clickButton("parse", () => {
      if (selectFileBytes) {
        parseYddBytes(selectFileBytes);
      } else {
        result.value = "请先选择文件...";
        vscode.postMessage({
          text: "请先选择文件...",
        });
      }
    }
  );

  /**触发解析ild文件*/
  clickButton("parseIld", () => {
    if (selectFileBytes) {
      parseIldBytes(selectFileBytes);
    } else {
      result.value = "请先选择文件...";
      vscode.postMessage({
        text: "请先选择文件...",
      });
    }
  })

  //--

  /**ydd数字的精度*/
  let yddPrecision = 100;

  /**是否小端模式*/
  let yddLittleEndian = true;

  /**解析ydd字节数据*/
  function parseYddBytes(bytes) {
    let reader = new BytesReader(bytes, yddLittleEndian);

    let result = "";
    result += "数据头:" + reader.readAscii(4);

    let byte_length = reader.readUint8()
    let byte_length_bytes = reader.readBytes(byte_length);
    let byte_length_bytes_reader = new BytesReader(byte_length_bytes, yddLittleEndian);
    result += " 数据版本:" + byte_length_bytes_reader.readUint8();
    result += " 限制级别:" + byte_length_bytes_reader.readUint8();

    byte_length = reader.readUint8()
    byte_length_bytes = reader.readBytes(byte_length);
    byte_length_bytes_reader = new BytesReader(byte_length_bytes, yddLittleEndian);

    let elementCount = byte_length_bytes_reader.readUint(2);
    result += "\n元素个数:" + elementCount;
    let extendType = byte_length_bytes_reader.readUint8();
    result += " 模式:" + (extendType === 0x04 ? "平台式" :
      (extendType === 0x03 ? "滑台式" :
        (extendType === 0x02 ? "滚轴式" : (extendType === 0x01 ? "卡盘式" : "常规"))));
    result += " 位置x,y,w,h(mm):" + byte_length_bytes_reader.readUint(2) / yddPrecision + " " + byte_length_bytes_reader.readUint(2) / yddPrecision + " " + byte_length_bytes_reader.readUint(2) / yddPrecision + " " + byte_length_bytes_reader.readUint(2) / yddPrecision;
    result += " 数据总字节(Bytes):" + byte_length_bytes_reader.readUint();

    for (let i = 0; i < elementCount; i++) {
      result += "\n\n元素[" + (i + 1) + "/" + elementCount + "]:";
      let desLength = reader.readUint8();
      let desBytes = reader.readBytes(desLength);
      let desReader = new BytesReader(desBytes, yddLittleEndian);
      let dataType = desReader.readUint(2);
      result += "\n数据类型:" + (dataType === 0x20 ? "GCode" : (dataType === 0x10 ? "Lines" : dataType));
      result += " 位置x,y,w,h(mm):" + desReader.readUint(2) / yddPrecision + " " + desReader.readUint(2) / yddPrecision + " " + desReader.readUint(2) / yddPrecision + " " + desReader.readUint(2) / yddPrecision;
      result += " 填充密度:" + desReader.readUint(2);

      let paramsLength = reader.readUint8();
      let paramsBytes = reader.readBytes(paramsLength);
      let paramsReader = new BytesReader(paramsBytes, yddLittleEndian);
      result += "\n激光功率:" + paramsReader.readUint(2, -1);
      result += " 速度:" + paramsReader.readUint(4, -1);
      let type = paramsReader.readUint(1, -1);
      result += " 激光类型:" + (type === 1 ? "1064nm" : (type === 0 ? "450nm" : "-1"));
      result += " 激光频率:" + paramsReader.readUint(2);
      result += " 激光脉宽:" + paramsReader.readUint(2);
      result += " 重复次数:" + paramsReader.readUint(2);
      result += " 支架高度:" + paramsReader.readInt(2);

      let dataLength = reader.readUint(4);
      let dataBytes = reader.readBytes(dataLength);
      result += `\n内容 ${dataLength}(Bytes):` + (dataType === 0x20 ? "\n" + bytesToUtf8(dataBytes) : parseYddLinesData(dataBytes));
    }

    //--
    parseResult.innerHTML = result;
  }

  /**解析0x10路径数据*/
  function parseYddLinesData(bytes) {
    let result = "";

    let reader = new BytesReader(bytes, yddLittleEndian);
    while (!reader.isOutOfBounds()) {
      let part1Reader = reader.readLengthBytes(1)
      let power = part1Reader.readUint(2, -1);
      result += "\n线段->激光功率:" + power;
      let type = part1Reader.readUint(1, -1);
      result += " 激光类型:" + (type === 1 ? "1064nm" : (type === 0 ? "450nm" : "-1"));
      result += " 速度:" + part1Reader.readUint(4, -1);

      let points = reader.readUint(2)
      result += `\n[${points}个点]->`;
      for (let i = 0; i < points; i++) {
        let x = reader.readInt(2) / yddPrecision;
        let y = reader.readInt(2) / yddPrecision;
        if (wrapGCode.checked) {
          if (i === 0) {
            result += `\nG90\nG21`;
            result += `\nG0 X${x} Y${y}` + (power === -1 ? "" : ` S0`);
          }
          if (i !== 0 || i === points - 1) {
            result += `\nG1 X${x} Y${y}` + (power === -1 ? "" : ` S${power}`);
          }
        } else {
          //result += ` ${i + 1}/${points}: ${x}, ${y}`;
          result += ` (${x}, ${y})`;
        }
      }
    }

    return result;
  }

  //--

  /**是否小端模式*/
  let ildLittleEndian = false;

  /**ild gcode 数值缩放比例*/
  let ildScaleFactor = 100;

  /**解析ild字节数据
   * https://www.laserfx.com/Backstage.LaserFX.com/Standards/ILDAframes.html
   *
   * https://ilda.com/resources/StandardsDocs/ILDA_IDTF14_rev011.pdf
   * */
  function parseIldBytes(bytes) {
    let reader = new BytesReader(bytes, ildLittleEndian);
    let index = 1;
    let result = "";
    let isWrapGCode = wrapGCode.checked;

    while (!reader.isOutOfBounds()) {
      if (index > 1) {
        result += `\n\n`;
      }
      result += `[${index}] `;
      result += "数据头:" + reader.readAscii(4);//1~4
      reader.skipBytes(3);//预留 5~7

      //格式 0 – 带索引颜色的 3D 坐标
      //格式 1 – 带索引颜色的 2D 坐标
      //格式 2 – 索引颜色框架的调色板
      //格式 4 – 真彩色 3D 坐标
      //格式 5 – 真彩色二维坐标
      let formatCode = reader.readUint8();//8
      let is3D = formatCode === 0 || formatCode === 4;
      let is2D = formatCode === 1 || formatCode === 5;
      let isTrueColor = formatCode === 4 || formatCode === 5;//真彩色
      let isColor = formatCode === 2;

      result += ` [${formatCode}]` + (is3D ? "3D图像" : (is2D ? "2D图像" : (isColor ? "调色板" : "")));
      result += isTrueColor ? "(真彩)" : "";
      result += " 数据名称:" + reader.readAscii(8);//9~16
      result += " 公司名称:" + reader.readAscii(8);//17~24
      let dataCount = reader.readUint(2);//25~26
      result += (isColor ? " 记录颜色数:" : " 记录点数:") + dataCount;
      result += (isColor ? " 颜色编号:" : " 帧编号:") + reader.readUint(2, -1);//27~28
      result += (isColor ? ` 调色板:` : " 总帧数:") + reader.readUint(2, -1);//29~30
      result += " 投影仪编号:" + reader.readUint(1, -1);//31
      reader.skipBytes(1);//预留 32

      function readRGB() {
        let r = reader.readUint(1);
        let g = reader.readUint(1);
        let b = reader.readUint(1);
        //转成hex进制
        r = decimalToHex(r, 16);
        g = decimalToHex(g, 16);
        b = decimalToHex(b, 16);
        return `#${r}${g}${b}`;
      }

      //读取坐标数据 -32768~32767
      let dataIndex = 0
      let isMove = false; //是否G0过
      while (dataIndex < dataCount) {
        if (dataIndex === 0) {
          result += "\n";
        } else {
          result += " ";
        }

        if (isColor) {
          result += readRGB();
        } else {
          let x = reader.readInt(2);
          let y = reader.readInt(2);
          let z = is3D ? reader.readInt(2) : 0;

          //状态码
          let statusCode = reader.readUint(1);
          //是否开激光
          let on = ((statusCode >> 6) & 0b1) === 0;
          //是否最后的点
          let end = ((statusCode >> 7) & 0b1) === 0;
          let color = undefined;
          let colorIndex = undefined;
          //颜色索引
          if (isTrueColor) {
            color = readRGB();
          } else {
            colorIndex = reader.readUint(1);
            let rgb = ColorIndexTable[colorIndex];
            if (rgb) {
              let r = decimalToHex(rgb[0], 16);
              let g = decimalToHex(rgb[1], 16);
              let b = decimalToHex(rgb[2], 16);
              color = `#${r}${g}${b}`;
            } else {
              color = colorIndex;
            }
          }

          //output
          if (isWrapGCode) {
            x = x / ildScaleFactor;
            y = y / ildScaleFactor;
            z = z / ildScaleFactor;

            if (dataIndex === 0) {
              result += `G90\nG21`;
            }
            if (!isMove) {
              result += `\nG0 X${x} Y${y}`;
              if (is3D) {
                result += ` Z${z}`;
              }
              isMove = true;
            }
            result += `\n${on ? "G1" : "G0"} X${x} Y${y}`;
            if (is3D) {
              result += ` Z${z}`;
            }
            result += ` # ${statusCode}`;//后面的数据全部放注释
            if (!isTrueColor) {
              result += ` ${colorIndex}`;
            }
            result += ` ${color}`;
            if (end) {
              //isMove = false;
            }
          } else {
            result += `(${x}, ${y}`;
            if (is3D) {
              result += `, ${z}`;
            }
            result += " / ";
            if (!isTrueColor) {
              result += ` ${colorIndex}`;
            }
            result += ` ${color}`;
            result += ", " + (on ? "on" : "off");
            if (end) {
              result += " .";
            }
            result += " )";
          }
        }

        dataIndex++;
      }
      index++;
    }

    //--
    parseResult.innerHTML = result;
  }

})();

class BytesReader {
  constructor(bytes, littleEndian = false) {
    this.dataView = new DataView(Uint8Array.from(bytes).buffer);
    this.offset = 0;
    this.littleEndian = littleEndian;
  }

  //是否越界
  isOutOfBounds() {
    return this.offset >= this.dataView.byteLength;
  }

  // 读取任意字节数
  readBytes(byteCount, def = []) {
    if (this.isOutOfBounds()) {
      return def;
    }
    if (this.dataView.byteLength - this.offset < byteCount) {
      this.offset = this.dataView.byteLength;
      return def;
    }
    const bytes = new Uint8Array(this.dataView.buffer, this.offset, byteCount);
    this.offset += byteCount; // 更新偏移量
    return bytes;
  }

  // 读取ASCII字符串
  readAscii(byteCount, def = "") {
    if (this.isOutOfBounds()) {
      return def;
    }
    try {
      return new TextDecoder().decode(this.readBytes(byteCount));
    } catch (e) {
      return def;
    }
  }

  // 读取uint8
  readUint8(def = 0) {
    if (this.isOutOfBounds()) {
      return def;
    }
    return this.dataView.getUint8(this.offset++);
  }

  // 读取多少个字节的无符号整数
  readUint(byteCount = 4, def = 0) {
    if (this.isOutOfBounds()) {
      return def;
    }
    let result = 0;
    if (byteCount === 1) {
      result = this.dataView.getUint8(this.offset);
    }
    if (byteCount === 2) {
      result = this.dataView.getUint16(this.offset, this.littleEndian);
    }
    if (byteCount === 4) {
      result = this.dataView.getUint32(this.offset, this.littleEndian);
    }
    if (byteCount === 8) {
      result = this.dataView.getBigUint64(this.offset, this.littleEndian);
    }
    this.offset += byteCount;
    return result;
  }

  // 读取多少个字节的有符号整数
  readInt(byteCount = 4, def = 0) {
    if (this.isOutOfBounds()) {
      return def;
    }
    let result = 0;
    if (byteCount === 1) {
      result = this.dataView.getInt8(this.offset);
    }
    if (byteCount === 2) {
      result = this.dataView.getInt16(this.offset, this.littleEndian);
    }
    if (byteCount === 4) {
      result = this.dataView.getInt32(this.offset, this.littleEndian);
    }
    if (byteCount === 8) {
      result = this.dataView.getBigInt64(this.offset, this.littleEndian);
    }
    this.offset += byteCount;
    return result;
  }

  // 跳过指定字节数
  skipBytes(byteCount) {
    this.offset += byteCount;
  }

  // 读取指定长度的长度表示的字节数据
  // 返回[BytesReader]
  readLengthBytes(length = 1) {
    let byteCount = this.readInt(length)
    let bytes = this.readBytes(byteCount);
    return new BytesReader(bytes, this.littleEndian);
  }
}