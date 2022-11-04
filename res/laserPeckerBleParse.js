// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

//从字符串中读取十六进制字符
class HexReader {
  constructor(data) {
    //数据
    this.data = data;
    this.length = data.length;

    //当前读取的偏移字符
    this.offset = 0;
  }

  //读取几个字节的数据, 并且返回整数
  readInt(len) {
    const data = this.readString(len || 1);
    if (data) {
      return parseInt(data, 16);
    }
  }

  //读取几个字节的字符数据
  readString(len) {
    const start = this.offset;
    const end = start + (len || 1) * 2;
    if (this.length >= end) {
      //没有超范围
      this.offset = end;
      return this.data.slice(start, end);
    }
  }

  //剩下的字节十六进制
  lastByte() {
    //当前第几个字节
    const current = this.offset / 2;
    //工作的字节数
    const sum = this.length / 2;

    let result = "";
    for (let i = current; i < sum; i++) {
      //从0开始计算 -1
      //去除3个固定字节 -3
      result += `\nD${i - 1 - 3} ${this.readString(1)}`;
    }

    //校验和
    const check = this.sunCheck();
    if (check) {
      result += `\n计算出的校验和:${check}`;
    }
    return result;
  }

  //校验和
  sunCheckValue() {
    if (this.length >= 3 * 2) {
      //包含长度字节
      this.offset = 6;
      let sum = 0;
      let int = this.readInt();
      console.log(sum, int);
      while (int !== undefined) {
        sum += int;
        int = this.readInt();
        console.log(sum, int);
      }
      return sum.toString(16).padStart(4, "0").toUpperCase();
    } else {
      return "";
    }
  }

  //校验和
  sunCheck() {
    if (this.length >= 3 * 2) {
      //包含长度字节
      this.offset = 4;
      const len = this.readInt(); //数据的总字节数, 字符数需要手动*2
      const needLength = len * 2 + 3 * 2;
      if (this.length >= needLength) {
        //有效的数据长度
        const dataStr = this.data.slice(6, needLength - 4);
        const reader = new HexReader(dataStr);
        let sum = 0;
        let int = reader.readInt();
        console.log(sum, int);
        while (int !== undefined) {
          sum += int;
          int = reader.readInt();
          console.log(sum, int);
        }
        const sumCheck = sum.toString(16).toUpperCase().padStart(4, "0");
        const sumCheckRead = this.data.slice(needLength - 4, needLength);
        let verify;
        if (sumCheck === sumCheckRead) {
          verify = "√";
        } else {
          verify = "×";
        }
        return `${sumCheck} 实际:${sumCheckRead} ${verify}`;
      } else {
        return `字节长度不匹配(包含头字节):请求总长度${
          needLength / 2
        } 实际总长度${this.length / 2}`;
      }
    }
  }
}

// 脚本内容

(function () {
  const vscode = acquireVsCodeApi();
  console.log("初始化laserPeckerParseBlePanel.js", vscode, window);

  const dataText = document.getElementById("data");
  const resultText = document.getElementById("result");
  const parseButton = document.getElementById("parse");
  const parseResultButton = document.getElementById("parseResult");
  const parseWorkStateResultButton = document.getElementById(
    "parseWorkStateResult"
  );
  const parseSettingResultButton =
    document.getElementById("parseSettingResult");
  const completeButton = document.getElementById("complete");

  function formatValue() {
    const data = dataText.value.toUpperCase().replace(/\s/g, "");
    if (data && data.startsWith("AABB")) {
      return data;
    } else {
      vscode.postMessage({
        text: "无效的指令",
      });
      return undefined;
    }
  }

  //持久化
  dataText.value = localStorage.getItem("laserPeckerParseBleData");
  dataText.addEventListener("change", () => {
    localStorage.setItem("laserPeckerParseBleData", dataText.value);
  });

  //解析发送的指令
  parseButton.addEventListener("click", (event) => {
    const data = formatValue();
    if (data) {
      resultText.value = formatData(data) + "\n" + parseData(data);
    }
  });
  //解析指令返回的数据
  parseResultButton.addEventListener("click", (event) => {
    const data = formatValue();
    if (data) {
      resultText.value =
        formatData(data) + "\n" + parseResultData(data, false, false);
    }
  });
  //解析工作状态指令返回的数据
  parseWorkStateResultButton.addEventListener("click", (event) => {
    const data = formatValue();
    if (data) {
      resultText.value =
        formatData(data) + "\n" + parseResultData(data, true, false);
    }
  });
  //解析设置状态指令返回的数据
  parseSettingResultButton.addEventListener("click", (event) => {
    const data = formatValue();
    if (data) {
      resultText.value =
        formatData(data) + "\n" + parseResultData(data, false, true);
    }
  });
  completeButton.addEventListener("click", (event) => {
    let data = dataText.value.toUpperCase().replace(/\s/g, "");
    if (data) {
      //转成大写, 并且去除所有空格
      const head = "AABB"; //指令头
      let len = (data.length / 2 + 2).toString(16); //指令长度
      len = len.padStart(2, "0").toUpperCase();
      data = `${head}${len}${data}`;
      const reader = new HexReader(data);
      const reslut = `${data}${reader.sunCheckValue()}`;
      resultText.value = `${reslut}\n${formatData(reslut)}`;
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

  //滚动到底部
  function scrollToBottom() {
    setTimeout(() => {
      window.scrollTo(0, document.documentElement.clientHeight);
    }, 300);
  }

  //格式化数据, 每个2个字符加入一个空格
  function formatData(data) {
    let result = "";
    for (let i = 0; i < data.length; i++) {
      result += data[i];
      if (i % 2 === 1) result += " ";
    }
    return result;
  }

  //指令解析
  function parseData(data) {
    const reader = new HexReader(data);
    let result = "";
    let read;

    read = reader.readString(2);
    if (read !== undefined) {
      result += `数据头: ${read} `;

      read = reader.readInt(1);
      if (read !== undefined) {
        result += `长度: ${read} `;

        read = reader.readString(1);
        if (read !== undefined) {
          result += `功能码: ${read} ${parseFuncCode(read, reader)}`;
        }

        //last
        result += reader.lastByte();
      }
    }
    return result;
  }

  //翻译功能码
  //[func] 十六进制功能码字符
  function parseFuncCode(func, reader) {
    let result = "";
    let state;
    switch (func) {
      case "00":
        result = "查询指令 \n";
        state = reader.readInt(1);
        switch (state) {
          case 0:
            result += "查询工作状态 ";
            break;
          case 1:
            result += "查询文件列表 ";
            break;
          case 2:
            result += "查询设置状态 ";
            break;
          case 3:
            result += "查询版本 ";
            break;
          case 4:
            result += "查询安全码与用户帐号 ";
            break;
          default:
            result += `未知:${state} `;
            break;
        }
        break;
      case "01":
        result = "打印指令 \n";
        state = reader.readInt(1);
        switch (state) {
          case 1:
            result += "从头开始打印文件 ";
            break;
          case 2:
            result += "继续打印文件 ";
            break;
          case 3:
            result += "结束打印 ";
            break;
          case 4:
            result += "暂停打印 ";
            break;
          default:
            result += `未知:${state} `;
            break;
        }
        result += `\nD1 激光强度(1~100): ${reader.readInt(1)}`;
        result += `\nD2 打印速度: ${reader.readInt(1)}`;
        result += `\nD3~6 文件索引: ${reader.readInt(4)}`;
        result += `\nD7~8 x: ${reader.readInt(2)}`;
        result += `\nD9~10 y: ${reader.readInt(2)}`;
        result += `\nD11 custom: ${reader.readInt(1)}`;
        result += `\nD12 打印次数: ${reader.readInt(1)}`;
        result += `\nD13 激光类型(1为1064nm激光，0为450nm激光): ${reader.readInt(
          1
        )}`;
        result += `\nD14~15 物体直径(mm): ${reader.readInt(2)}`;
        result += `\nD16 雕刻精度(1~5): ${reader.readInt(1)}`;
        break;
      case "02":
        result = "打印预览指令 \n";
        state = reader.readInt(1);
        switch (state) {
          case 1:
            result += "预览flash内存中的图片 ";
            result += `\nD1~4 文件索引: ${reader.readInt(4)}`;
            break;
          case 2:
            result += "范围预览 ";
            result += `\nD1~2 宽: ${reader.readInt(2)}`;
            result += `\nD3~4 高: ${reader.readInt(2)}`;
            result += `\nD5~6 x: ${reader.readInt(2)}`;
            result += `\nD7~8 y: ${reader.readInt(2)}`;
            result += `\nD9 custom: ${reader.readInt(1)}`;
            result += `\nD10 分辨率: ${reader.readInt(1)}`;
            result += `\nD11 预览光功率(1~10): ${reader.readInt(1)}`;
            result += `\nD12~13 物理直径(mm): ${reader.readInt(2)}`;
            break;
          case 3:
            result += "结束预览打印 ";
            break;
          case 4:
            result += "第三轴暂停预览 ";
            break;
          case 5:
            result += "第三轴继续预览 ";
            break;
          case 6:
            result += "电动支架升降控制指令 ";
            result += `\nD1 支架方向(0:下 1:上): ${reader.readInt(1)}`;
            result += `\nD2~4 升降步数: ${reader.readInt(3)}`;
            break;
          case 7:
            result += "显示中心点 ";
            break;
          case 8:
            result += "为4角点预览方式 ";
            result += `\nD1~2 点1的x: ${reader.readInt(2)}`;
            result += `\nD3~4 点1的y: ${reader.readInt(2)}`;
            result += `\nD5~6 点2的x: ${reader.readInt(2)}`;
            result += `\nD7~8 点2的y: ${reader.readInt(2)}`;
            result += `\nD9 custom: ${reader.readInt(1)}`;
            result += `\nD10 分辨率: ${reader.readInt(1)}`;
            result += `\nD11 预览光功率(1~10): ${reader.readInt(1)}`;
            result += `\nD12~13 点3的x: ${reader.readInt(2)}`;
            result += `\nD14~15 点3的y: ${reader.readInt(2)}`;
            result += `\nD16~17 点4的x: ${reader.readInt(2)}`;
            result += `\nD18~19 点4的y: ${reader.readInt(2)}`;
            break;
          default:
            result += `未知:${state} `;
            break;
        }
        break;
      case "04":
        result = "调焦指令\n";
        state = reader.readInt(1);
        switch (state) {
          case 1:
            result += "手动调焦状态 ";
            break;
          case 2:
            result += "自动调焦状态 ";
            break;
          case 3:
            result += "退出调焦 ";
            break;
          default:
            result += `未知:${state} `;
            break;
        }
        break;
      case "05":
        result = "文件传输指令\n";
        state = reader.readInt(1);
        switch (state) {
          case 1:
            result += "传输文件 ";
            result += `\nD1~4 数据大小(字节): ${reader.readInt(4)}`;
            break;
          case 2:
            result += "传输结束 ";
            break;
          case 4:
            result += "擦除所有文件 ";
            break;
          case 6:
            result += "擦除单个文件 ";
            result += `\nD1~4 文件索引: ${reader.readInt(4)}`;
            break;
          default:
            result += `未知:${state} `;
            break;
        }
        break;
      case "06":
        result = "设置指令";
        break;
      case "07":
        result = "显示屏固件升级指令";
        break;
      case "DD":
        result = "固件升级指令";
        break;
      case "0F":
        result = "出厂设置指令\n";
        state = reader.readInt(1);
        // 0xd0
        switch (state) {
          case 1:
            result += "手动调焦 ";
            break;
          case 2:
            result += "自动归零点 ";
            break;
          case 3:
            result += "退出调焦 ";
            break;
          case 4:
            result += "有较正范围预览 ";
            break;
          case 5:
            result += "无较正范围预览 ";
            break;
          case 6:
            result += "测试打印 ";
            break;
          case 7:
            result += "清除帐号 ";
            break;
          case 8:
            result += "较正数据传输完成 ";
            break;
          case 9:
            result += "激光点跳至指定AD值 ";
            break;
          case 0x0a:
            result += "激光点跳到指定坐标 ";
            break;
          case 0x0b:
            result += "激光点预览功率设置 ";
            break;
          case 0x0c:
            result += "显示物理中心点 ";
            break;
          case 0x0d:
            result += "重置出厂代码标志位 ";
            break;
          case 0x0e:
            result += "红光指示与1064nm光切换 ";
            break;
          case 0xd0:
            result += "9个点坐标数据 ";
            break;
          default:
            result += `未知:${state} `;
            break;
        }
        break;
      case "FF":
        result = "退出指令";
        break;
      default:
        result = "未知指令";
        break;
    }
    return result;
  }

  //指令返回值解析
  function parseResultData(data, parseWorkState, parseSetting) {
    const reader = new HexReader(data);
    let result = "";
    let read;

    read = reader.readString(2);
    if (read !== undefined) {
      result += `数据头: ${read} `;

      read = reader.readInt(1);
      if (read !== undefined) {
        result += `长度: ${read} `;

        read = reader.readString(1);
        if (read !== undefined) {
          result += `功能码: ${read} `;
          if (parseWorkState) {
            result += parseWorkStateResult(read, reader);
          } else if (parseSetting) {
            result += parseSettingResult(read, reader);
          } else {
            result += parseResultFuncCode(read, reader);
          }
        }

        //last
        result += reader.lastByte();
      }
    }
    return result;
  }

  function parseResultFuncCode(func, reader) {
    let result = "";
    switch (func) {
      case "00":
        result = "查询指令";
        break;
      case "01":
        result = "打印指令";
        break;
      case "02":
        result = "打印预览指令";
        break;
      case "04":
        result = "调焦指令";
        break;
      case "05":
        result = "文件传输指令";
        break;
      case "06":
        result = "设置指令";
        break;
      case "07":
        result = "显示屏固件升级指令";
        break;
      case "DD":
        result = "固件升级指令";
        break;
      case "0F":
        result = "出厂设置指令";
        break;
      case "FF":
        result = "退出指令";
        break;
      default:
        result = "未知指令";
        break;
    }
    return result;
  }

  //解析工作状态指令返回数据
  function parseWorkStateResult(func, reader) {
    let result = "";
    if (func == "00") {
      result = "查询指令";
    } else {
      result = "未知指令";
    }

    result += " 查询工作状态 ";

    const mode = reader.readInt(1);
    result += `\n工作模式: `;
    switch (mode) {
      case 0x01:
        result += `打印模式`;
        break;
      case 0x02:
        result += `打印预览模式`;
        break;
      case 0x04:
        result += `调焦模式`;
        break;
      case 0x05:
        result += `文件下载模式`;
        break;
      case 0x06:
        result += `空闲模式`;
        break;
      case 0x07:
        result += `关机模式`;
        break;
      case 0x08:
        result += `设置模式`;
        break;
      case 0x09:
        result += `出厂模式`;
        break;
      default:
        result += `未知:${mode}`;
        break;
    }

    const workState = reader.readInt(1);
    result += `\n当前模式工作状态(工作中，暂停，结束。): ${workState}`;

    result += `\n打印进度: ${reader.readInt(1)}%`;
    result += `\n激光强度: ${reader.readInt(1)}%`;
    result += `\n打印速度: ${reader.readInt(1)}%`;

    const error = reader.readInt(1);
    result += `\n错误状态: `;
    switch (error) {
      case 0:
        result += `无错误`;
        break;
      case 1:
        result += `不处于安全状态，且自由模式没开。`;
        break;
      case 2:
        result += `打印超过边界报警`;
        break;
      case 3:
        result += `激光工作温度报警`;
        break;
      case 4:
        result += `打印过程中移动设备报警`;
        break;
      case 5:
        result += `打印过程中遮挡激光报警`;
        break;
      case 6:
        result += `打印数据错误`;
        break;
      case 7:
        result += `文件编号查询错误`;
        break;
      case 8:
        result += `陀螺仪自检错误`;
        break;
      case 9:
        result += `flash自检错误`;
        break;
      default:
        result += `未知错误:${error}`;
        break;
    }

    result += `\n文件索引: ${reader.readInt(4)}`;
    result += `\n工作温度: ${reader.readInt(1)}`;
    result += `\ncustom: ${reader.readInt(1)}`;
    result += `\nZ轴连接状态(0:未连接 1:连接): ${reader.readInt(1)}`;
    result += `\n打印次数: ${reader.readInt(1)}`;

    const mState = reader.readInt(1);
    result += `\n工作模式选择位: `;
    switch (mState) {
      case 0:
        result += `5W激光`;
        break;
      case 1:
        result += `10W激光`;
        break;
      case 2:
        result += `单色笔模式`;
        break;
      case 3:
        result += `刀切割模式`;
        break;
      case 4:
        result += `彩绘模式`;
        break;
      case 5:
        result += `CNC模式`;
        break;
      default:
        result += `未知模式:${mState}`;
        break;
    }

    result += `\nR轴连接状态: ${reader.readInt(1)}`;
    result += `\nS轴连接状态: ${reader.readInt(1)}`;

    return result;
  }

  function parseSettingResult(func, reader) {
    let result = "";
    if (func == "00") {
      result = "查询指令";
    } else {
      result = "未知指令";
    }

    result += " 查询设置状态 ";

    result += `\n自由模式(0:关闭 1:打开): ${reader.readInt(1)}`;
    result += `\n工作提示音(0:关闭 1:打开): ${reader.readInt(1)}`;
    result += `\n连续预览(0:关闭 1:打开): ${reader.readInt(1)}`;
    result += `\nGCode预览(0:关闭 1:打开): ${reader.readInt(1)}`;
    result += `\n安全状态(0:关闭 1:打开): ${reader.readInt(1)}`;
    result += `\ncustom: ${reader.readInt(1)}`;
    result += `\nZ轴(0:关闭 1:打开): ${reader.readInt(1)}`;
    result += `\nZ轴方向(0:直板 1:圆柱): ${reader.readInt(1)}`;
    result += `\n触摸按键(0:关闭 1:打开): ${reader.readInt(1)}`;
    result += `\n测距红外只是光(0:关闭 1:打开): ${reader.readInt(1)}`;
    result += `\n一键打印(0:关闭 1:打开): ${reader.readInt(1)}`;
    result += `\nR轴(0:关闭 1:打开): ${reader.readInt(1)}`;
    result += `\nS轴(0:关闭 1:打开): ${reader.readInt(1)}`;
    result += `\n旋转方向(0:反转 1:正转): ${reader.readInt(1)}`;
    result += `\n激光功率选择(0:app 1:指令): ${reader.readInt(1)}`;
    result += `\nstate: ${reader.readInt(1)}`;

    return result;
  }
})();
