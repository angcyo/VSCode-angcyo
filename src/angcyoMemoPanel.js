const vscode = require("vscode");

var angcyoMemoPanel = undefined;

class AngcyoMemoPanel {
  // 创建或者显示panel
  createOrShow(context) {
    if (angcyoMemoPanel) {
      angcyoMemoPanel.reveal(vscode.ViewColumn.One);
    } else {
      // Otherwise, create a new panel.
      angcyoMemoPanel = vscode.window.createWebviewPanel(
        "AngcyoMemoPanel",
        "备忘录",
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

      angcyoMemoPanel.onDidDispose(() => this.dispose(), null, null);

      //接收来自webview的数据
      angcyoMemoPanel.webview.onDidReceiveMessage(
        (message) => {
          console.log(message);
          switch (message.command) {
            case "input":
              const index = message.index;
              const value = message.value;

              const memoJson = vscode.workspace
                .getConfiguration("angcyo-memo")
                .get(`memo`, "");
              let memo = {};
              if (memoJson) {
                memo = JSON.parse(memoJson);
              }
              if (value) {
                memo[`memo${index}`] = value;
              } else {
                delete memo[`memo${index}`];
              }

              vscode.workspace
                .getConfiguration("angcyo-memo")
                .update(`memo`, JSON.stringify(memo), true);

              break;
            default:
              vscode.window.showInformationMessage(`${message.text}`);
              break;
          }
        },
        null,
        null
      );
    }

    angcyoMemoPanel.webview.html = this.getHtmlBody();

    //发送数据到webview
    const memoJson = vscode.workspace
      .getConfiguration("angcyo-memo")
      .get(`memo`, "");
    let memo = {};
    if (memoJson) {
      memo = JSON.parse(memoJson);
    }

    for (let index = 1; index <= 10; index++) {
      angcyoMemoPanel.webview.postMessage({
        type: "memo",
        index: index,
        value: memo[`memo${index}`] || "",
      });
    }
  }

  dispose() {
    // Clean up our resources
    angcyoMemoPanel.dispose();
    angcyoMemoPanel = undefined;
  }

  getHtmlBody() {
    const webview = angcyoMemoPanel.webview;

    // Local path to main script run in the webview
    const scriptPath = vscode.Uri.joinPath(
      this._extensionUri,
      "res",
      "memo.js"
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

        <title>AngcyoMemoPanel</title>
    </head>
    <body>
      <div class="title-wrap"><img src="${imgPathUri}" width="25"/><h1>备忘录</h1></div>

      <div id="memoWrap"></div>

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

exports.AngcyoMemoPanel = new AngcyoMemoPanel();
