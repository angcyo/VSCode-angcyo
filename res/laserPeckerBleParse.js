// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

//从字符串中读取十六进制字符
class HexReader {

  constructor(data) {
    //数据
    this.data = data
    this.length = data.length

    //当前读取的偏移字符
    this.offset = 0
  }

  //读取几个字节的数据, 并且返回整数
  readInt(len) {
    const data = this.readString(len || 1)
    if (data) {
      return parseInt(data, 16)
    }
  }

  //读取几个字节的字符数据
  readString(len) {
    const start = this.offset
    const end = start + (len || 1) * 2
    if (this.length >= end) {
      //没有超范围
      this.offset = end
      return this.data.slice(start, end)
    }
  }

  //剩下的字节十六进制
  lastByte() {
    //当前第几个字节
    const current = this.offset / 2
    //工作的字节数
    const sum = this.length / 2

    let result = ''
    for (let i = current; i < sum; i++) {
      //从0开始计算 -1
      //去除3个固定字节 -3
      result += `\nD${i - 1 - 3} ${this.readString(1)}`
    }

    //校验和
    const check = this.sunCheck()
    if (check) {
      result += `\n计算出的校验和:${check}`
    }
    return result
  }

  //校验和
  sunCheck() {
    if (this.length >= 3 * 2) {
      //包含长度字节
      this.offset = 4
      const len = this.readInt() //数据的总字节数, 字符数需要手动*2
      const needLength = len * 2 + 3 * 2
      if (this.length >= needLength) {
        //有效的数据长度
        const dataStr = this.data.slice(6, needLength)
        const reader = new HexReader(dataStr)
        let sum = 0
        let int = reader.readInt()
        console.log(sum, int)
        while (int !== undefined) {
          sum += int
          int = reader.readInt()
          console.log(sum, int)
        }
        return `${sum.toString(16)} 实际:${this.data.slice(needLength - 4, needLength)}`
      } else {
        return `字符长度不匹配:请求长度${needLength} 实际长度${this.length}`
      }
    }
  }
}

(function () {
  const vscode = acquireVsCodeApi()
  console.log("初始化laserPeckerParseBlePanel.js", vscode, window)

  const dataText = document.getElementById("data")
  const resultText = document.getElementById("result")
  const parseButton = document.getElementById("parse")
  const parseResultButton = document.getElementById("parseResult")

  //解析发送的指令
  parseButton.addEventListener("click", (event) => {
    const data = dataText.value.toUpperCase().replace(/\s/g, "")
    if (data && data.startsWith("AABB")) {
      resultText.value = formatData(data) + "\n" + parseData(data)
    } else {
      vscode.postMessage({
        text: "无效的指令",
      })
    }
  })
  //解析指令返回的数据
  parseResultButton.addEventListener("click", (event) => {
    const data = dataText.value.toUpperCase().replace(/\s/g, "")
    if (data && data.startsWith("AABB")) {
      resultText.value = formatData(data) + "\n" + parseResultData(data)
    } else {
      vscode.postMessage({
        text: "无效的数据",
      })
    }
  })

  //
  window.addEventListener("message", (event) => {
    const message = event.data // The json data that the extension sent
    console.log("message->", message)
  })

  //
  window.addEventListener("error", (event) => {
    vscode.postMessage({
      text: event.message,
    })
  })

  //滚动到底部
  function scrollToBottom() {
    setTimeout(() => {
      window.scrollTo(0, document.documentElement.clientHeight)
    }, 300)
  }

  //格式化数据, 每个2个字符加入一个空格
  function formatData(data) {
    let result = ""
    for (let i = 0; i < data.length; i++) {
      result += data[i]
      if (i % 2 === 1) result += ' '
    }
    return result
  }

  //指令解析
  function parseData(data) {
    const reader = new HexReader(data)
    let result = ''
    let read

    read = reader.readString(2)
    if (read !== undefined) {
      result += `文件头: ${read} `

      read = reader.readInt(1)
      if (read !== undefined) {
        result += `长度: ${read} `

        read = reader.readString(1)
        if (read !== undefined) {
          result += `功能码: ${read}/${parseFuncCode(read, reader)}`
        }

        //last
        result += reader.lastByte()
      }
    }
    return result
  }

  //翻译功能码
  //[func] 十六进制功能码字符
  function parseFuncCode(func, reader) {
    let result = ''
    let state
    switch (func) {
      case '00' :
        result = '查询指令 \n'
        state = reader.readInt(1)
        switch (state) {
          case 0:
            result += '查询工作状态 '
            break
          case 1:
            result += '查询文件列表 '
            break
          case 2:
            result += '查询设置状态 '
            break
          case 3:
            result += '查询版本 '
            break
          case 4:
            result += '查询安全码与用户帐号 '
            break
          default:
            result += `未知:${state} `
            break
        }
        break
      case '01' :
        result = '打印指令 \n'
        state = reader.readInt(1)
        switch (state) {
          case 1:
            result += '从头开始打印文件 '
            break
          case 2:
            result += '继续打印文件 '
            break
          case 3:
            result += '结束打印 '
            break
          case 4:
            result += '暂停打印 '
            break
          default:
            result += `未知:${state} `
            break
        }
        break
      case '02' :
        result = '打印预览指令 \n'
        state = reader.readInt(1)
        switch (state) {
          case 1:
            result += '预览flash内存中的图片 '
            break
          case 2:
            result += '范围预览 '
            break
          case 3:
            result += '结束预览打印 '
            break
          case 4:
            result += '第三轴暂停预览 '
            break
          case 5:
            result += '第三轴继续预览 '
            break
          case 6:
            result += '电动支架升降控制指令 '
            break
          case 7:
            result += '显示中心点 '
            break
          case 8:
            result += '为4角点预览方式 '
            break
          default:
            result += `未知:${state} `
            break
        }
        break
      case '04' :
        result = '调焦指令\n'
        state = reader.readInt(1)
        switch (state) {
          case 1:
            result += '手动调焦状态 '
            break
          case 2:
            result += '自动调焦状态 '
            break
          case 3:
            result += '退出调焦 '
            break
          default:
            result += `未知:${state} `
            break
        }
        break
      case '05' :
        result = '文件传输指令\n'
        state = reader.readInt(1)
        switch (state) {
          case 1:
            result += '传输文件 '
            break
          case 2:
            result += '传输结束 '
            break
          case 4:
            result += '擦除所有文件 '
            break
          case 6:
            result += '擦除单个文件 '
            break
          default:
            result += `未知:${state} `
            break
        }
        break
      case '06' :
        result = '设置指令'
        break
      case '07' :
        result = '显示屏固件升级指令'
        break
      case 'DD' :
        result = '固件升级指令'
        break
      case '0F' :
        result = '出厂设置指令\n'
        state = reader.readInt(1)
        // 0xd0
        switch (state) {
          case 1:
            result += '手动调焦 '
            break
          case 2:
            result += '自动归零点 '
            break
          case 3:
            result += '退出调焦 '
            break
          case 4:
            result += '有较正范围预览 '
            break
          case 5:
            result += '无较正范围预览 '
            break
          case 6:
            result += '测试打印 '
            break
          case 7:
            result += '清除帐号 '
            break
          case 8:
            result += '较正数据传输完成 '
            break
          case 9:
            result += '激光点跳至指定AD值 '
            break
          case 0x0a:
            result += '激光点跳到指定坐标 '
            break
          case 0x0b:
            result += '激光点预览功率设置 '
            break
          case 0x0c:
            result += '显示物理中心点 '
            break
          case 0x0d:
            result += '重置出厂代码标志位 '
            break
          case 0x0e:
            result += '红光指示与1064nm光切换 '
            break
          case 0xd0:
            result += '9个点坐标数据 '
            break
          default:
            result += `未知:${state} `
            break
        }
        break
      case 'FF' :
        result = '退出指令'
        break
      default:
        result = '未知指令'
        break
    }
    return result
  }

  //指令返回值解析
  function parseResultData(data) {
    const reader = new HexReader(data)
    let result = ''
    let read

    read = reader.readString(2)
    if (read !== undefined) {
      result += `文件头: ${read} `

      read = reader.readInt(1)
      if (read !== undefined) {
        result += `长度: ${read} `

        read = reader.readString(1)
        if (read !== undefined) {
          result += `功能码: ${read}/${parseResultFuncCode(read, reader)}`
        }

        //last
        result += reader.lastByte()
      }
    }
    return result
  }

  function parseResultFuncCode(func, reader) {
    let result = ''
    switch (func) {
      case '00' :
        result = '查询指令'
        break
      case '01' :
        result = '打印指令'
        break
      case '02' :
        result = '打印预览指令'
        break
      case '04' :
        result = '调焦指令'
        break
      case '05' :
        result = '文件传输指令'
        break
      case '06' :
        result = '设置指令'
        break
      case '07' :
        result = '显示屏固件升级指令'
        break
      case 'DD' :
        result = '固件升级指令'
        break
      case '0F' :
        result = '出厂设置指令'
        break
      case 'FF' :
        result = '退出指令'
        break
      default:
        result = '未知指令'
        break
    }
    return result
  }

})()
