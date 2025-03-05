/**
 * Webview
 * https://code.visualstudio.com/api/extension-guides/webview
 *
 * 2022-11-8
 */

const { TextEncoder } = require("util");
const vscode = require("vscode");
const { Api } = require("./api");
const figlet = require("figlet");
const QRCode = require('qrcode')
const QrCode = require('qrcode-reader');
const { Jimp } = require("jimp");

/**
 * 最后一次保存的uri
 */
let lastSaveUri = null;

class WebviewPanel {
  /**
   *
   * @param {string} viewType 注册类型, 需要和json中声明的匹配一致
   * @param {string} title tab上下显示的标题
   * @param {string} scriptPath 需要注入的脚本路径 `res/main.js`
   * @param {string[]} htmlPath  webview内容的文件路径
   */
  constructor(viewType, title, scriptPath, ...htmlPath) {
    this.viewType = viewType;
    this.title = title;
    this.scriptPath = scriptPath;
    this.htmlPath = htmlPath;
  }

  /**
   *
   * @param {*} context 创建或者直接显示
   */
  async createOrShow(context) {
    this._context = context;
    if (this.webviewPanel) {
      //如果已经存在, 则直接显示
      this.webviewPanel.reveal(vscode.ViewColumn.Active);
      return;
    }

    this.webviewPanel = vscode.window.createWebviewPanel(
      this.viewType,
      this.title,
      vscode.ViewColumn.Active, //vscode.window.activeTextEditor
      {
        // Enable javascript in the webview
        enableScripts: true,

        retainContextWhenHidden: true,

        localResourceRoots: [
          context.extensionUri,
          vscode.Uri.joinPath(context.extensionUri, "res"),
        ],
      }
    );

    //监听需要销毁时
    this.webviewPanel.onDidDispose(() => this.dispose(), null, null);

    //监听来自webview的消息
    this.webviewPanel.webview.onDidReceiveMessage(
      (message) => {
        this.onDidReceiveMessage(message);
      },
      null,
      null
    );

    //加载内容
    this.webviewPanel.webview.html = await this.getHtmlBody(context);

    //init
    this.onInitWebviewPanel();
  }

  /**
   * 销毁回调
   */
  dispose() {
    // Clean up our resources
    this.webviewPanel.dispose();
    this.webviewPanel = undefined;
    console.log(`${this.viewType} ${this.title} 销毁!`);
  }

  /**
   * 创建之后的初始化操作
   */
  onInitWebviewPanel() {
  }

  /**
   * 获取webview的内容
   */
  async getHtmlBody(context) {
    const dataStr = await Api.readFile(context, ...this.htmlPath);
    return this.resolveHtmlString(context, dataStr);
  }

  /**
   * 替换网页内容上的资源占位
   * @param {vscode.ExtensionContext} context
   * @param {string} htmlString 网页内容字符串
   */
  resolveHtmlString(context, htmlString) {
    const webview = this.webviewPanel.webview;

    htmlString = this.replaceHtmlString(
      htmlString,
      "cspSource",
      webview.cspSource
    );

    htmlString = this.replaceHtmlString(htmlString, "title", this.title);

    // Use a nonce to only allow specific scripts to be run
    const nonce = this.getNonce();
    htmlString = this.replaceHtmlString(htmlString, "nonce", nonce);

    const extensionUri = context.extensionUri;
    const uri = vscode.Uri;

    // Local path to main script run in the webview
    if (this.scriptPath) {
      const scriptPath = uri.joinPath(extensionUri, this.scriptPath);
      const scriptUri = webview.asWebviewUri(scriptPath);
      htmlString = this.replaceHtmlString(htmlString, "script", scriptUri);
    }

    const angcyoPath = uri.joinPath(extensionUri, "res/angcyo.png");
    const angcyoUri = webview.asWebviewUri(angcyoPath);
    htmlString = this.replaceHtmlString(htmlString, "angcyo", angcyoUri);

    // Local path to css styles
    const resetPath = uri.joinPath(extensionUri, "res/css/reset.css");
    // Uri to load styles into webview
    const resetUri = webview.asWebviewUri(resetPath);
    htmlString = this.replaceHtmlString(htmlString, "reset", resetUri);

    const mainPath = uri.joinPath(extensionUri, "res/css/main.css");
    const mainUri = webview.asWebviewUri(mainPath);
    htmlString = this.replaceHtmlString(htmlString, "main", mainUri);

    const codePath = uri.joinPath(extensionUri, "res/css/vscode.css");
    const codeUri = webview.asWebviewUri(codePath);
    htmlString = this.replaceHtmlString(htmlString, "vscode", codeUri);

    //md5 的js
    const sparkPath = uri.joinPath(extensionUri, "res/js/spark-md5.min.js");
    const sparkUri = webview.asWebviewUri(sparkPath);
    htmlString = this.replaceHtmlString(htmlString, "spark", sparkUri);

    //pdf 的js
    const pdfPath = uri.joinPath(extensionUri, "res/js/pdf.min.js");
    const pdfUri = webview.asWebviewUri(pdfPath);
    htmlString = this.replaceHtmlString(htmlString, "pdf", pdfUri);

    //pdfWorker 的js
    const pdfWorkerPath = uri.joinPath(
      extensionUri,
      "res/js/pdf.worker.min.js"
    );
    const pdfWorkerUri = webview.asWebviewUri(pdfWorkerPath);
    htmlString = this.replaceHtmlString(htmlString, "pdfWorker", pdfWorkerUri);

    //figlet.min.js
    const figletPath = uri.joinPath(extensionUri, "res/js/figlet.min.js");
    const figletUri = webview.asWebviewUri(figletPath);
    htmlString = this.replaceHtmlString(htmlString, "figlet", figletUri);

    return htmlString;
  }

  /**
   * 替换字符串中的占位字符
   * @param {string} string 原始字符串
   * @param {string} reg 占位字符,不包含{{}}.
   * @param {string | any} value 需要替换成的值
   *
   */
  replaceHtmlString(string, reg, value) {
    return string.replace(new RegExp(`{{\s*${reg}\s*}}`, "gi"), value);
  }

  getNonce() {
    let text = "";
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  /**
   * 发送消息到webview
   * @param {*} params
   */
  postMessage(params) {
    this.webviewPanel?.webview?.postMessage(params);
  }

  /**
   * 收到来自网页的消息时, 回调
   * @param {*} message
   */
  async onDidReceiveMessage(message) {
    console.log(`收到来自webview的消息↓`);
    console.log(message);

    const command = message.command;
    const type = message.type;
    if (command === undefined || command === "message") {
      vscode.window.showInformationMessage(`${message.text}`);
    } else if (command === "reveal") {
      const path = message.path;
      const uri = vscode.Uri.file(path);
      vscode.commands.executeCommand("revealFileInOS", uri);
    } else if (command === "save") {
      //writeFileSync(message.path, message.data);
      const path = message.path;
      const uri = vscode.Uri.file(path);
      //await vscode.workspace.fs.writeFile(uri, new Uint8Array(message.data));

      this.writeDataToFile(uri, type, message.data);
      vscode.window.showInformationMessage(`已保存至:${path}`);

      if (message.reveal) {
        //打开文件所在目录
        vscode.commands.executeCommand("revealFileInOS", uri);
        //__filename
        //command:revealFileInOS
      }
    } else if (command === "open") {
      const url = message.url;
      vscode.window.showInformationMessage(`准备打开:${url}`);
      vscode.commands.executeCommand("angcyo.openUrl", url);
    } else if (command === "app") {
      const url = message.url;
      vscode.window.showInformationMessage(`准备打开:${url}`);
      vscode.env.openExternal(vscode.Uri.parse(url));
    } else if (command === "saveAs") {
      const data = message.data;
      //console.log("保存:" + data);
      //vscode.window.showInformationMessage(`准备打开:${url}`);
      //vscode.env.openExternal(vscode.Uri.parse(url));
      //vscode.commands.executeCommand("saveAs", data);

      //let uri = this._context.extensionUri;
      //let doc = await vscode.workspace.openTextDocument(uri); // calls back into the provider
      //await vscode.window.showTextDocument(doc, { preview: false });


      let path = message.path;
      if (!path) {
        if (message.name) {
          const uri = lastSaveUri || this._context.extensionUri;
          path = uri?.path + "/" + message.name;
        }
      }
      const pathUri = path ? vscode.Uri.file(path) : null;

      const uri = await vscode.window.showSaveDialog({
        defaultUri: pathUri || lastSaveUri || this._context.extensionUri,
        //saveLabel: "...saveLabel...", //保存按钮的文本
        title: message.title, //对话框的标题
      });
      if (uri) {
        //console.log(uri.path);
        //console.log(uri.fsPath);
        this.writeDataToFile(uri, type, data);
        vscode.window.showInformationMessage(`已保存至:${uri.fsPath}`);
        lastSaveUri = uri;

        if (message.reveal) {
          //打开文件所在目录
          vscode.commands.executeCommand("revealFileInOS", uri);
          //__filename
          //command:revealFileInOS
        }
      }
    } else if (command === "copy") {
      //复制内容
      const data = message.data;
      vscode.env.clipboard.writeText(data);
      vscode.window.showInformationMessage(`已复制!`);
    } else if (command === "httpPostFile") {
      //群发文件
      console.log(`群发文件↓`);
      await this.httpPostFile(message.port, message.path);
    } else if (command === "request") {
      //网络请求
      const url = message.url;
      const method = message.method;
      const body = message.body;
      const uuid = message.uuid;
      const token = message.token;
      const headersStr = message.headers;
      let headers = {};
      if (headersStr) {
        try {
          headers = JSON.parse(headersStr);
        } catch (error) {
        }
      }

      if (method && method.toLowerCase() === "post") {
        const data = await Api.httpPost(url, body, token, headers);
        this.postMessage({
          type: "response",
          value: data,
          uuid: uuid,
          url: url,
        });
      } else if (method && method.toLowerCase() === "head") {
        const data = await Api.httpHead(url, headers);
        this.postMessage({
          type: "response",
          value: data,
          uuid: uuid,
          url: url,
        });
      } else {
        //捕捉异常
        try {
          const data = await Api.httpGet(url, headers);
          this.postMessage({
            type: "response",
            value: data,
            uuid: uuid,
            url: url,
          });
        } catch (error) {
          console.log(error);
          this.postMessage({
            type: "response",
            error: error,
            uuid: uuid,
            url: url,
          });
        }
      }
    } else if (command === "figfont") {
      if (type === "fonts") {
        await figlet.fonts((err, fonts) => {
          if (err) {
            vscode.window.showInformationMessage(`${err}`);
            return;
          }
          this.postMessage({
            command: command,
            type: type,
            data: fonts,
          });
        });
      } else {
        /*figlet(message.data || message.text, (err, data) => {
          if (err) {
            vscode.window.showInformationMessage(`${err}`);
            return;
          }
          this.postMessage({
            command: command,
            data: data,
          });
        });*/
        figlet.text(
          message.data || message.text,
          {
            font: message.font || "Standard",
            horizontalLayout: "default",
            verticalLayout: "default",
            width: undefined,
            whitespaceBreak: false,
          },
          (err, data) => {
            if (err) {
              vscode.window.showInformationMessage(`${err}`);
              return;
            }
            this.postMessage({
              command: command,
              data: data,
            });
          }
        );
      }
      //console.log(`figfont...↑`);
    } else if (command === "qrcode") {
      //二维码
      if (type === "decoder") {
        //解码base64的二维码图片
        const qr = new QrCode();
        qr.callback = (err, value) => {
          if (err) {
            vscode.window.showInformationMessage(`${err}`);
            return;
          }
          this.postMessage({
            command: command,
            type: type,
            data: value.result,
          });
        };
        // 去掉 Base64 前缀
        const base64Data = message.data.split(',')[1];
        // 将 Base64 编码的字符串转换为 Buffer
        const buffer = Buffer.from(base64Data, 'base64');

        // 使用 Jimp 处理图像
        Jimp.read(buffer)
          .then(image => {
            // 解析二维码
            qr.decode(image.bitmap);
          })
          .catch(err => {
            vscode.window.showInformationMessage(`${err}`);
          });
      } else {
        QRCode.toDataURL(message.data, { errorCorrectionLevel: 'H' }, (err, url) => {
          //data:image/png;base64,xxx
          this.postMessage({
            command: command,
            type: type,
            data: url,
          });
        });
      }
    } else {
      console.log(`未知的命令↑`);
    }
  }

  //写入数据到文件
  writeDataToFile(uri, type, data) {
    if (typeof data !== "string") {
      console.log(`数据不是字符串类型`);
      return;
    }
    if (type === "u8s") {
      //数据类型是uint8,uint8,uint8,...组成的字符串
      vscode.workspace.fs.writeFile(
        uri,
        new Uint8Array(data.split(","))
        //new TextEncoder("ISO-8859-1").encode(message.data)
      );
    } else {
      const isBase64 = data.startsWith("data:");
      if (type === "base64" || isBase64) {
        //base64
        const base64 = data.split(",")[1];
        const buffer = Buffer.from(base64, "base64");
        vscode.workspace.fs.writeFile(uri, buffer);
      } else {
        const encode = new TextEncoder("utf-8");
        vscode.workspace.fs.writeFile(uri, encode.encode(data));
      }
    }

  }

  //局域网内, 群发发送文件
  //[path] 文件路径
  //[portAndIpRange] 端口号 和ip范围~分割. `9200 100~200`
  async httpPostFile(portAndIpRange, path) {
    //使用fetch发送文件
    const port = portAndIpRange.split(" ")[0] || 9200;
    const ipRange = portAndIpRange.split(" ")[1];

    let ipRangeStart = 1;
    let ipRangeEnd = 255;
    if (ipRange) {
      ipRangeStart = parseInt(ipRange.split("~")[0]);
      ipRangeEnd = parseInt(ipRange.split("~")[1]);
    }

    const ip = Api.getLocalIp();

    //await vscode.workspace.fs.writeFile(uri, data);
    //vscode.Uri.file;

    //从path路径中读取文件数据
    const uri = vscode.Uri.file(path);
    const data = await vscode.workspace.fs.readFile(uri);

    //blob类型
    const blob = new Blob([data], { type: "application/octet-stream" });

    //从路径中获取文件名
    const fileNameWin = path.split("\\").pop();
    //兼容mac/window
    const fileNameMac = path.split("/").pop();
    const fileName = fileNameWin || fileNameMac;

    //获取ip最后一个.前面的部分
    const ipPrefix = ip.split(".").slice(0, 3).join(".");
    //遍历局域网ip
    for (let i = ipRangeStart; i <= ipRangeEnd; i++) {
      const url = `http://${ipPrefix}.${i}:${port}/uploadFile`;

      this.postMessage({
        type: "message",
        value: `发送文件: ${decodeURI(path)} -> ${url}`,
      });

      Api.postFile(url, blob, fileName)
        .then((result) => {
          this.postMessage({
            type: "message",
            value: `${url} <- ${result}`,
          });
        })
        .catch((error) => {
          console.log(error);
          this.postMessage({
            type: "message",
            value: `${url} <- ${error}`,
          });
        });
    }
  }
}

exports.WebviewPanel = WebviewPanel;
