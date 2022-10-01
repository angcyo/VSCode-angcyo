// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const { AngcyoViewsProvider } = require("./src/angcyoViewsProvider");
const { HttpViewsProvider } = require("./src/httpViewsProvider");
const { laserPeckerParseBlePanel } = require("./src/laserPeckerParseBlePanel");
const { LaserPeckerParsePanel } = require("./src/laserPeckerParsePanel");
const { LaserPeckerViewsProvider } = require("./src/laserPeckerViewsProvider");
const { WelcomViewsProvider } = require("./src/welcomViewsProvider");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log("插件激活...");
  console.log(context);

  //显示欢迎页
  vscode.commands.executeCommand("setContext", "angcyo.showWelcome", true);

  const welcomViewsProvider = new WelcomViewsProvider();
  vscode.window.registerTreeDataProvider("welcomeViews", welcomViewsProvider);

  const angcyoViewsProvider = new AngcyoViewsProvider();
  vscode.window.registerTreeDataProvider("angcyoViews", angcyoViewsProvider);

  const httpViewsProvider = new HttpViewsProvider();
  vscode.window.registerTreeDataProvider("httpViews", httpViewsProvider);

  const laserPeckerViewsProvider = new LaserPeckerViewsProvider();
  vscode.window.registerTreeDataProvider(
    "laserPeckerViews",
    laserPeckerViewsProvider
  );

  //注册一个刷新数据的指令
  vscode.commands.registerCommand("angcyo.refresh", () => {
    welcomViewsProvider.refresh();
    angcyoViewsProvider.refresh();
    httpViewsProvider.refresh();
    laserPeckerViewsProvider.refresh();
  });

  //打开网页
  vscode.commands.registerCommand("angcyo.openUrl", async (url) => {
    console.log(`命令打开url:${url}`);
    vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(`${url}`));
  });

  //LaserPecker数据解析
  vscode.commands.registerCommand("angcyo.laserPeckerParse", () => {
    console.log(`LaserPecker数据解析`);
    LaserPeckerParsePanel.createOrShow(context);
  });

  //LaserPecker蓝牙指令解析
  vscode.commands.registerCommand("angcyo.laserPeckerBleParse", () => {
    console.log(`LaserPecker蓝牙指令解析`);
    laserPeckerParseBlePanel.createOrShow(context);
  });
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
