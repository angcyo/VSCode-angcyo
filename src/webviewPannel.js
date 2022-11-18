/**
 * Webview
 * https://code.visualstudio.com/api/extension-guides/webview
 *
 * 2022-11-8
 */

const { TextEncoder } = require("util");
const vscode = require("vscode");
const { Api } = require("./api");

/**
 * 最后一次保存的uri
 */
var lastSaveUri = null;

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
  onInitWebviewPanel() {}

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
   * 收到来自网页的消息时, 回调
   * @param {*} message
   */
  async onDidReceiveMessage(message) {
    console.log(`收到来自webview的消息↓`);
    console.log(message);

    if (message.command === undefined || message.command === "message") {
      vscode.window.showInformationMessage(`${message.text}`);
    } else if (message.command === "reveal") {
      const path = message.path;
      const uri = vscode.Uri.file(path);
      vscode.commands.executeCommand("revealFileInOS", uri);
    } else if (message.command === "save") {
      //writeFileSync(message.path, message.data);
      const path = message.path;
      const uri = vscode.Uri.file(path);
      //await vscode.workspace.fs.writeFile(uri, new Uint8Array(message.data));
      vscode.workspace.fs.writeFile(
        uri,
        new Uint8Array(message.data.split(","))
        //new TextEncoder("ISO-8859-1").encode(message.data)
      );
      vscode.window.showInformationMessage(`已保存至:${path}`);

      if (message.reveal) {
        //打开文件所在目录
        vscode.commands.executeCommand("revealFileInOS", uri);
        //__filename
        //command:revealFileInOS
      }
    } else if (message.command === "open") {
      const url = message.url;
      vscode.window.showInformationMessage(`准备打开:${url}`);
      vscode.commands.executeCommand("angcyo.openUrl", url);
    } else if (message.command === "app") {
      const url = message.url;
      vscode.window.showInformationMessage(`准备打开:${url}`);
      vscode.env.openExternal(vscode.Uri.parse(url));
    } else if (message.command === "saveAs") {
      const data = message.data;
      //console.log("保存:" + data);
      //vscode.window.showInformationMessage(`准备打开:${url}`);
      //vscode.env.openExternal(vscode.Uri.parse(url));
      //vscode.commands.executeCommand("saveAs", data);

      //let uri = this._context.extensionUri;
      //let doc = await vscode.workspace.openTextDocument(uri); // calls back into the provider
      //await vscode.window.showTextDocument(doc, { preview: false });
      const uri = await vscode.window.showSaveDialog({
        defaultUri: lastSaveUri || this._context.extensionUri,
        //saveLabel: "...saveLabel...", //保存按钮的文本
        //title: "...title...", //对话框的标题
      });
      if (uri) {
        //console.log(uri.path);
        //console.log(uri.fsPath);
        const encode = new TextEncoder("utf-8");
        vscode.workspace.fs.writeFile(uri, encode.encode(data));
        vscode.window.showInformationMessage(`已保存至:${uri.fsPath}`);
        lastSaveUri = uri;
      }
    } else if (message.command === "copy") {
      //复制内容
      const data = message.data;
      vscode.env.clipboard.writeText(data);
      vscode.window.showInformationMessage(`已复制!`);
    }
  }
}

exports.WebviewPanel = WebviewPanel;
