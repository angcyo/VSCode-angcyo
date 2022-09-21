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
    const imgPath = vscode.Uri.joinPath(
      this._extensionUri,
      "res",
      "angcyo.png"
    );
    console.log(imgPath);

    const path2 = `https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif`;
    //`https://gitee.com/angcyo/res/raw/master/image/qq/qq_group_132.png`;

    const webview = laserPeckerParsePanel.webview;

    // // Local path to main script run in the webview
    // const scriptPathOnDisk = vscode.Uri.joinPath(
    //   this._extensionUri,
    //   "res",
    //   "laserPeckerParsePanel.js"
    // );

    // // And the uri we use to load this script in the webview
    // const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

    // Uri to load styles into webview
    const imgPathUri = webview.asWebviewUri(imgPath);

    console.log(imgPathUri);

    return `<!DOCTYPE html>
    <html lang="zh">
    <head>
        <meta charset="UTF-8">

        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource}; https:;">

        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>LaserPecker数据解析</title>
    </head>
    <body>
        <h1 id="lines-of-code-counter">angcyo test</h1>
        <img src="${imgPathUri}" width="300" />
        <img src="${path2}" width="300" />
    </body>
    </html>`;
  }
}

exports.LaserPeckerParsePanel = new LaserPeckerParsePanel();
