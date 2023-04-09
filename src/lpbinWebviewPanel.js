const vscode = require("vscode");
const { WebviewPanel } = require("./webviewPannel");

//lpbin固件文件生成及解析
class LpbinWebviewPanel extends WebviewPanel {
  constructor() {
    super(
      "angcyo.binParse",
      "lpbin文件创建及解析",
      "res/js/lpBin.js",
      "res/html/lpBin.html"
    );
  }

  onInitWebviewPanel() {
    super.onInitWebviewPanel();
    //发送数据到webview
    //设备config
    fetch(
      "https://gitee.com/angcyo/file/raw/master/LaserPeckerPro/lpbin_device_config.json?time=" +
        new Date().getTime()
    )
      .then((res) => res.text())
      .then((text) => {
        this.webviewPanel.webview.postMessage({
          type: "device",
          value: text,
        });
      });
  }
}

exports.LpbinWebviewPanel = LpbinWebviewPanel;
