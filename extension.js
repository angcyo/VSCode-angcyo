// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const path = require("path");
const vscode = require("vscode");
const {AngcyoViewsProvider} = require("./src/tree/angcyoViewsProvider");
const {MemoWebviewPanel} = require("./src/panel/memoWebviewPanel");
const {LpbinWebviewPanel} = require("./src/panel/lpbinWebviewPanel");
const {HttpServerWebviewPanel} = require("./src/panel/httpServerWebviewPanel");
const {TreeDataProvider} = require("./src/tree/treeDataProvider");
const {WebviewPanel} = require("./src/panel/webviewPannel");
const {
  laserPeckerAddQuotationMark,
} = require("./src/command/addQuotationMarkLaserPecker.js");
const {showInputBox} = require("vscode");

/**指定命令, 跳转指定的web panel*/
const webPanelConfig = require("./src/panel/web_panel_config.json");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log("插件激活..." + context.extensionUri); //file:///e%3A/VSCodeProjects/angcyoJs
  //console.log("插件激活..." + context.extensionPath); //e:\VSCodeProjects\angcyoJs
  console.log(context);

  //__filename
  console.log(__filename); //e:\VSCodeProjects\angcyoJs\extension.js

  //显示欢迎页
  vscode.commands.executeCommand("setContext", "angcyo.showWelcome", true);

  //读取本地配置
  const config = vscode.workspace.getConfiguration("angcyo-config");
  console.log("配置↓");
  console.log(config);
  //const defHost = "https://gitcode.net/angcyo/json/-/raw/master";
  const defHost = "https://gitlab.com/angcyo/json/-/raw/master";
  let host = config.get("host", defHost);
  //如果host为空或空字符串, 则使用默认值
  if (!host || host.length === 0) {
    host = defHost;
  }
  console.log("host->" + host);

  //
  const welcomeViewsProvider = new TreeDataProvider();
  vscode.window.registerTreeDataProvider("welcomeViews", welcomeViewsProvider);

  //
  const angcyoViewsProvider = new AngcyoViewsProvider(`${host}/angcyoUrl.json`);
  vscode.window.registerTreeDataProvider("angcyoViews", angcyoViewsProvider);

  //
  const httpViewsProvider = new TreeDataProvider(`${host}/recommendUrl.json`);
  vscode.window.registerTreeDataProvider("httpViews", httpViewsProvider);

  //svg
  const parseSvgIconPath = path.join(__filename, "..", "res", "parse.svg");

  //LaserABCUrl.json 需要在package.json 的 views 中配置, 才会显示
  //{
  //   "id": "laserABCViews",
  //   "name": "LaserABC"
  // },
  /*const laserABCViewsProvider = new TreeDataProvider(`${host}/LaserABCUrl.json`, []);
  vscode.window.registerTreeDataProvider("laserABCViews", laserABCViewsProvider);*/

  //
  const laserPeckerViewsProvider = new TreeDataProvider(`${host}/laserPeckerUrl.json`, []);
  //console.log(parseSvgIconPath);//e:\VSCodeProjects\angcyoJs\res\parse.svg
  vscode.window.registerTreeDataProvider("laserPeckerViews", laserPeckerViewsProvider);

  //注册一个刷新数据的指令
  vscode.commands.registerCommand("angcyo.refresh", () => {
    welcomeViewsProvider.refresh();
    angcyoViewsProvider.refresh();
    httpViewsProvider.refresh();
    /*laserABCViewsProvider.refresh();*/
    laserPeckerViewsProvider.refresh();
  });

  //单独刷新angcyo
  vscode.commands.registerCommand("angcyo.refresh.angcyo", () => {
    angcyoViewsProvider.refresh();
  });

  //打开网页
  vscode.commands.registerCommand("angcyo.openUrl", async (url) => {
    console.log(`命令打开url:${url}`);
    vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(`${url}`));
  });

  //httpServer
  const httpServerWebviewPanel = new HttpServerWebviewPanel();
  vscode.commands.registerCommand("angcyo.httpServer", () => {
    console.log(`httpServer`);
    httpServerWebviewPanel.createOrShow(context).then();
  });

  //angcyo.memo 备忘录
  const memoPanel = new MemoWebviewPanel();
  vscode.commands.registerCommand("angcyo.memo", () => {
    console.log(`备忘录`);
    memoPanel.createOrShow(context).then();
  });

  //Api.readFile(context, "res", "main.css");

  //注册一个指令, 用来给选中的文本添加引号, LaserPecker
  vscode.commands.registerCommand("angcyo.command.addQuotationMarkLaserPecker", () => {
    laserPeckerAddQuotationMark.addQuotationMark();
  });

  //--

  //注册命令用来打开[WebviewPanel]
  webPanelConfig.forEach((panel) => {
    let webviewPanel = new WebviewPanel(panel.viewType, panel.title, panel.scriptPath, panel.htmlPath,);
    if (panel.viewType === "angcyo.binParse") {
      webviewPanel = new LpbinWebviewPanel();
    }

    vscode.commands.registerCommand(panel.viewType, () => {
      console.log(panel.title);
      webviewPanel.createOrShow(context).then();
    });
  });

  //注册一个指令, 用来随机打开网页
  vscode.commands.registerCommand("angcyo.angcyo", () => {
    vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(`https://visitarandomwebsite.com/`));
  });

  //注册指令
  vscode.commands.registerCommand("angcyo.ncviewer", () => {
    vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(`https://ncviewer.com/`));
  });
  vscode.commands.registerCommand("angcyo.svg-path-editor", () => {
    vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(`https://yqnn.github.io/svg-path-editor/`));
  });
  vscode.commands.registerCommand("angcyo.csdn", () => {
    vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(`https://blog.csdn.net/angcyo`));
  });
  vscode.commands.registerCommand("angcyo.juejin", () => {
    vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(`https://juejin.cn/user/1398234517866856`));
  });
  vscode.commands.registerCommand("angcyo.github", () => {
    vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(`https://github.com/angcyo`));
  });
  vscode.commands.registerCommand("angcyo.qq", () => {
    vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(`http://wpa.qq.com/msgrd?v=3&uin=664738095&site=qq&menu=yes`));
  });

  //test
  /*vscode.window.showInputBox({
    title: "请输入...",
    value: "value",
    prompt: "请输入后继续操作...",
    placeHolder: "placeHolder",
  }).then(value => {
    console.log(value);
  });*/
}

// this method is called when your extension is deactivated
function deactivate() {
  vscode.window.showInformationMessage(`angcyo is deactivate~`);
}

module.exports = {
  activate, deactivate,
};
