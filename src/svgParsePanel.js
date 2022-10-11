const vscode = require("vscode");

var svgParsePanel = undefined;

class SvgParsePanel {
  // 创建或者显示panel
  createOrShow(context) {
    if (svgParsePanel) {
      svgParsePanel.reveal(vscode.ViewColumn.One);
    } else {
      // Otherwise, create a new panel.
      svgParsePanel = vscode.window.createWebviewPanel(
        "SvgParsePanel",
        "Svg解析",
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

      svgParsePanel.onDidDispose(() => this.dispose(), null, null);
      svgParsePanel.webview.onDidReceiveMessage(
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

    svgParsePanel.webview.html = this.getHtmlBody();
  }

  dispose() {
    // Clean up our resources
    svgParsePanel.dispose();
    svgParsePanel = undefined;
  }

  getHtmlBody() {
    const webview = svgParsePanel.webview;

    // Local path to main script run in the webview
    const scriptPath = vscode.Uri.joinPath(
      this._extensionUri,
      "res",
      "svgParse.js"
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

        <title>Svg解析</title>
    </head>
    <body>
      <div class="title-wrap"><img src="${imgPathUri}" width="25"/><h1>Svg数据解析</h1></div>
      <label for="data">Svg数据(纯路径数据或者Svg标签数据):</label>

      <div class="propertyWrap">
        <label for="width">width:</label><input id="width" type="text" value="100">
        <label for="height">height:</label><input id="height" type="text" value="100">
        <label for="viewBox">viewBox:</label><input id="viewBox" type="text" value="0 0 100 100">
        <label for="showBorder">显示边框:</label><input id="showBorder" type="checkbox">
      </div>

      <textarea id="data" name="data" style="width:100%" placeholder="请输入Svg数据..." autofocus rows="20"></textarea>
      <div class="button-wrap" style="display: flex; margin-top: 1rem; margin-bottom: 1rem">
        <button id="parse">解析</button>
      </div>
      <label>输出结果:</label>
      <div id="svgWrap" class="svg-wrap" style="margin-top: 1rem; margin-bottom: 1rem">
      </div>
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

exports.SvgParsePanel = new SvgParsePanel();
