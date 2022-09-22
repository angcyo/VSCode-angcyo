const path = require("path");
const vscode = require("vscode");

var laserPeckerParsePanel = undefined;

class LaserPeckerParsePanel {
  // 创建或者显示panel
  createOrShow(context) {
    if (laserPeckerParsePanel) {
      laserPeckerParsePanel.reveal(vscode.ViewColumn.One);
    } else {
      // Otherwise, create a new panel.
      laserPeckerParsePanel = vscode.window.createWebviewPanel(
        "LaserPeckerParsePanel",
        "LaserPecker数据解析",
        vscode.ViewColumn.One, //vscode.window.activeTextEditor
        {
          // Enable javascript in the webview
          enableScripts: true,

          localResourceRoots: [
            context.extensionUri,
            vscode.Uri.joinPath(context.extensionUri, "res"),
          ],
        }
      );
      this._extensionUri = context.extensionUri;

      laserPeckerParsePanel.onDidDispose(() => this.dispose(), null, null);
      laserPeckerParsePanel.webview.onDidReceiveMessage(
        (message) => {
          switch (message.command) {
            default:
              vscode.window.showInformationMessage(`${message.text}`);
              break;
          }
        },
        null,
        null
      );
    }

    laserPeckerParsePanel.webview.html = this.getHtmlBody();
  }

  dispose() {
    // Clean up our resources
    laserPeckerParsePanel.dispose();
    laserPeckerParsePanel = undefined;
  }

  getHtmlBody() {
    const webview = laserPeckerParsePanel.webview;

    // Local path to main script run in the webview
    const scriptPath = vscode.Uri.joinPath(
      this._extensionUri,
      "res",
      "laserPeckerParsePanel.js"
    );
    const scriptUri = webview.asWebviewUri(scriptPath);

    const imgPath = vscode.Uri.joinPath(
      this._extensionUri,
      "res",
      "angcyo.png"
    );
    const imgPathUri = webview.asWebviewUri(imgPath);

    // Local path to css styles
    const styleResetPath = vscode.Uri.joinPath(
      this._extensionUri,
      "res",
      "reset.css"
    );
    const styleMainPath = vscode.Uri.joinPath(
      this._extensionUri,
      "res",
      "main.css"
    );
    const stylesVSCodePath = vscode.Uri.joinPath(
      this._extensionUri,
      "res",
      "vscode.css"
    );

    // Uri to load styles into webview
    const stylesResetUri = webview.asWebviewUri(styleResetPath);
    const stylesMainUri = webview.asWebviewUri(styleMainPath);
    const stylesVSCodeUri = webview.asWebviewUri(stylesVSCodePath);

    // Use a nonce to only allow specific scripts to be run
    const nonce = this.getNonce();

    return `<!DOCTYPE html>
    <html lang="zh">
    <head>
        <meta charset="UTF-8">

        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self' 'unsafe-eval' ${webview.cspSource}; img-src 'self' https: http: data: ${webview.cspSource}; script-src 'nonce-${nonce}';">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <link href="${stylesResetUri}" rel="stylesheet">
				<link href="${stylesVSCodeUri}" rel="stylesheet">
        <link href="${stylesMainUri}" rel="stylesheet">

        <title>LaserPecker数据解析</title>
    </head>
    <body>
      <div class="title-wrap"><img src="${imgPathUri}" width="25""/><h1>LaserPecker数据解析</h1></div>
      <label for="data">原始数据:</label>
      <textarea id="data" name="data" placeholder="请输入原始数据..." autofocus rows="20"></textarea>
      <div class="button-wrap">
        <button id="format">格式化</button>
        <button id="formatData">格式化(仅内部data)</button>
        <button id="removeImage">格式化(去除图片字段)</button>
        <button id="extractImage">提取所有图片</button>
        <button id="base64Image">解析base64图片</button>
        <button id="clear">清空结果</button>
      </div>
      <label for="result">格式化数据:</label>
      <textarea id="result" name="result" placeholder="格式化后的数据..." rows="50" disabled></textarea>
      <div id="imageWrap" class="image-wrap"></div>
      <script nonce="${nonce}" src="${scriptUri}"></script>
    </body>
    </html>`;
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
}

exports.LaserPeckerParsePanel = new LaserPeckerParsePanel();
