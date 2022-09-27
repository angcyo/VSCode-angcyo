const path = require("path");
const vscode = require("vscode");

var laserPeckerParseBlePanel = undefined;

class LaserPeckerParseBlePanel {
  // 创建或者显示panel
  createOrShow(context) {
    if (laserPeckerParseBlePanel) {
      laserPeckerParseBlePanel.reveal(vscode.ViewColumn.One);
    } else {
      // Otherwise, create a new panel.
      laserPeckerParseBlePanel = vscode.window.createWebviewPanel(
        "LaserPeckerBleParsePanel",
        "LaserPecker指令解析",
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

      laserPeckerParseBlePanel.onDidDispose(() => this.dispose(), null, null);
      laserPeckerParseBlePanel.webview.onDidReceiveMessage(
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

    laserPeckerParseBlePanel.webview.html = this.getHtmlBody();
  }

  dispose() {
    // Clean up our resources
    laserPeckerParseBlePanel.dispose();
    laserPeckerParseBlePanel = undefined;
  }

  getHtmlBody() {
    const webview = laserPeckerParseBlePanel.webview;

    // Local path to main script run in the webview
    const scriptPath = vscode.Uri.joinPath(
      this._extensionUri,
      "res",
      "laserPeckerBleParse.js"
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

        <title>LaserPecker指令解析</title>
    </head>
    <body>
      <div class="title-wrap"><img src="${imgPathUri}" width="25"/><h1>LaserPecker指令解析</h1></div>
      <label for="data">指令数据:</label>
      <textarea id="data" name="data" placeholder="请输入指令数据..." autofocus rows="3"></textarea>
      <div class="button-wrap">
        <button id="parse">解析指令</button>
        <button id="parseResult">解析返回值</button>
      </div>
      <label for="result">解析数据:</label>
      <textarea id="result" name="result" placeholder="解析后的数据..." rows="28" disabled></textarea>
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

exports.laserPeckerParseBlePanel = new LaserPeckerParseBlePanel();
