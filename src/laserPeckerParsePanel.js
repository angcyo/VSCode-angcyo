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

    // // Local path to main script run in the webview
    // const scriptPathOnDisk = vscode.Uri.joinPath(
    //   this._extensionUri,
    //   "res",
    //   "laserPeckerParsePanel.js"
    // );
    // const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

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

    return `<!DOCTYPE html>
    <html lang="zh">
    <head>
        <meta charset="UTF-8">

        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource}; https:;">

        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <link href="${stylesResetUri}" rel="stylesheet">
				<link href="${stylesMainUri}" rel="stylesheet">
				<link href="${stylesVSCodeUri}" rel="stylesheet">

        <title>LaserPecker数据解析</title>
    </head>
    <body>
      <p><h1>LaserPecker数据解析</h1><img src="${imgPathUri}" width="40"/></p>
        <textarea id="data" name="data" style="width:100%">
          It was a dark and stormy night...
        </textarea>
    </body>
    </html>`;
  }
}

exports.LaserPeckerParsePanel = new LaserPeckerParsePanel();
