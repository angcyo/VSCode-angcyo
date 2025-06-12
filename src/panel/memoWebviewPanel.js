const vscode = require("vscode");
const { WebviewPanel } = require("./webviewPannel");

class MemoWebviewPanel extends WebviewPanel {
  constructor() {
    super(
      "angcyo.memo",
      "记一下, 备忘录",
      "res/js/memo.js",
      "res/html/memo.html"
    );
  }

  onInitWebviewPanel() {
    super.onInitWebviewPanel();
    //发送数据到webview
    const memoJson = vscode.workspace
      .getConfiguration("angcyo-memo")
      .get(`memo`, "");
    let memo = {};
    if (memoJson) {
      memo = JSON.parse(memoJson);
    }

    for (let index = 1; index <= 10; index++) {
      this.webviewPanel.webview.postMessage({
        type: "memo",
        index: index,
        value: memo[`memo${index}`] || "",
      });
    }
  }

  onDidReceiveMessage(message) {
    super.onDidReceiveMessage(message);
    switch (message.command) {
      //输入改变
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

        //入库保存
        vscode.workspace
          .getConfiguration("angcyo-memo")
          .update(`memo`, JSON.stringify(memo), true);

        //刷新Views, RPC通信需要时间, 延迟之后才能读到保存后的数据
        setTimeout(() => {
          vscode.commands.executeCommand("angcyo.refresh.angcyo");
        }, 60);

        break;
    }
  }
}

exports.MemoWebviewPanel = MemoWebviewPanel;
