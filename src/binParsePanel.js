const vscode = require("vscode");

var binParsePanel = undefined;

class BinParsePanel {
  // 创建或者显示panel
  createOrShow(context) {
    if (binParsePanel) {
      binParsePanel.reveal(vscode.ViewColumn.One);
    } else {
      // Otherwise, create a new panel.
      binParsePanel = vscode.window.createWebviewPanel(
        "BinParsePanel",
        "lpbin解析",
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

      binParsePanel.onDidDispose(() => this.dispose(), null, null);
      binParsePanel.webview.onDidReceiveMessage(
        (message) => {
          console.log(message);
          switch (message.command) {
            case "save":
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

    binParsePanel.webview.html = this.getHtmlBody();
  }

  dispose() {
    // Clean up our resources
    binParsePanel.dispose();
    binParsePanel = undefined;
  }

  getHtmlBody() {
    const webview = binParsePanel.webview;

    const sparkScriptPath = vscode.Uri.joinPath(
      this._extensionUri,
      "res",
      "spark-md5.min.js"
    );
    const sparkScriptUri = webview.asWebviewUri(sparkScriptPath);

    // Local path to main script run in the webview
    const scriptPath = vscode.Uri.joinPath(
      this._extensionUri,
      "res",
      "binParse.js"
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

        <title>lpbin解析</title>
    </head>
    <body>
      <div class="title-wrap"><img src="${imgPathUri}" width="25"/><h1>lpbin文件解析</h1></div>
      <label class="padding">lpbin文件生成以及解析</label>

      <div class="margin timestamp">
        <label for="timestamp">时间戳:</label>
        <input type="text" id="timestamp" name="name" required minlength="10" maxlength="13" placeholder="10位秒/13位毫秒">
        <span>-> </span>
        <label id="timestampResult" for="timestamp">~</label>

        <label for="time">时间:</label>
        <input type="text" id="time" name="name" required minlength="10" maxlength="23" placeholder="yyyy-MM-dd HH:mm:ss:SSS">
        <input type="datetime-local" id="dateTime">
        <span>-> </span>
        <label id="timeResult" for="time">~</label>
      </div>

      <div class="margin">
        <input id="selectFile" type="file" accept=".bin,.lpbin">
        <label id="fileLabel" for="selectFile"></label>
      </div>

      <div class="margin">
        <label for="data">插入的数据: (t:构建时间; v:固件版本 n:版本名称 d:版本描述 r:升级范围)</label>
        <textarea id="data" name="data" placeholder="需要插入到bin末尾的数据..." autofocus rows="6"></textarea>
      </div>

      <div class="button-wrap">
        <button id="create">生成lpbin</button>
        <button id="parse">解析lpbin</button>
      </div>

      <label for="result">解析数据:</label>
      <textarea id="result" name="result" placeholder="解析后的数据..." rows="28" disabled></textarea>

      <script nonce="${nonce}" src="${sparkScriptUri}"></script>
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

exports.BinParsePanel = new BinParsePanel();
