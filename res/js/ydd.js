/**
 * Email:angcyo@126.com
 * @author angcyo
 * @date 2025-06-12
 */

(function () {
  const vscode = acquireVsCodeApi();
  window.vscode = vscode;
  //console.log("初始化svgParse.js", vscode, window)
  const selectFile = document.getElementById("selectFile");
  const result = document.getElementById("result");
  const fileLabel = document.getElementById("fileLabel");
  const parseResult = document.getElementById("parseResult");

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

  //解析ydd文件
  clickButton("parse", () => {
      if (selectFileBytes) {
        parseYdd(selectFileBytes);
      } else {
        result.value = "请先选择文件...";
        vscode.postMessage({
          text: "请先选择文件...",
        });
      }
    }
  );

  /**数字的精度*/
  let precision = 100;

  /**解析数据*/
  function parseYdd(bytes) {
    let reader = new BytesReader(bytes);

    let result = "";
    result += "数据头:" + reader.readAscii(4);
    reader.skipBytes(1);
    result += " 数据版本:" + reader.readUint8();

    reader.skipBytes(1);
    let elementCount = reader.readUint(2);
    result += "\n元素个数:" + elementCount;
    let extendType = reader.readUint8();
    result += " 模式:" + (extendType === 0x04 ? "平台式" :
      (extendType === 0x03 ? "滑台式" :
        (extendType === 0x02 ? "滚轴式" : (extendType === 0x01 ? "卡盘式" : "常规"))));
    result += " 位置x,y,w,h(mm):" + reader.readUint(2) / precision + " " + reader.readUint(2) / precision + " " + reader.readUint(2) / precision + " " + reader.readUint(2) / precision;
    result += " 数据总字节(Bytes):" + reader.readUint();

    for (let i = 0; i < elementCount; i++) {
      result += "\n\n元素[" + (i + 1) + "/" + elementCount + "]:";
      let desLength = reader.readUint8();
      let desBytes = reader.readBytes(desLength);
      let desReader = new BytesReader(desBytes);
      let dataType = desReader.readUint(2);
      result += "\n数据类型:" + (dataType === 0x20 ? "GCode" : (dataType === 0x10 ? "Lines" : dataType));
      result += " 位置x,y,w,h(mm):" + desReader.readUint(2) / precision + " " + desReader.readUint(2) / precision + " " + desReader.readUint(2) / precision + " " + desReader.readUint(2) / precision;
      result += " 填充密度:" + desReader.readUint(2);

      let paramsLength = reader.readUint8();
      let paramsBytes = reader.readBytes(paramsLength);
      let paramsReader = new BytesReader(paramsBytes);
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
      result += `\n内容 ${dataLength}(Bytes):` + (dataType === 0x20 ? "\n" + bytesToUtf8(dataBytes) : parseLinesData(dataBytes));
    }

    //--
    parseResult.innerHTML = result;
  }

  /**解析0x10路径数据*/
  function parseLinesData(bytes) {
    let result = "";

    let reader = new BytesReader(bytes);
    while (!reader.isOutOfBounds()) {
      let part1Reader = reader.readLengthBytes(1)
      result += "\n激光功率:" + part1Reader.readUint(2, -1);
      let type = part1Reader.readUint(1, -1);
      result += " 激光类型:" + (type === 1 ? "1064nm" : (type === 0 ? "450nm" : "-1"));
      result += " 速度:" + part1Reader.readUint(4, -1);

      let points = reader.readUint(2)
      result += `\n[${points}]`;
      for (let i = 0; i < points; i++) {
        let x = reader.readInt(2) / precision;
        let y = reader.readInt(2) / precision;
        //result += ` ${i + 1}/${points}: ${x}, ${y}`;
        result += ` (${x}, ${y})`;
      }
    }

    return result;
  }

})();

class BytesReader {
  constructor(bytes, littleEndian = true) {
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
    const bytes = new Uint8Array(this.dataView.buffer, this.offset, byteCount);
    this.offset += byteCount; // 更新偏移量
    return bytes;
  }

  // 读取ASCII字符串
  readAscii(byteCount, def = "") {
    if (this.isOutOfBounds()) {
      return def;
    }
    return new TextDecoder().decode(this.readBytes(byteCount));
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
