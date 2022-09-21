// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const { AngcyoViewsProvider } = require("./src/angcyoViewsProvider");
const { HttpViewsProvider } = require("./src/httpViewsProvider");
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

  vscode.window.registerTreeDataProvider(
    "welcomeViews",
    new WelcomViewsProvider()
  );
  vscode.window.registerTreeDataProvider(
    "angcyoViews",
    new AngcyoViewsProvider()
  );
  vscode.window.registerTreeDataProvider("httpViews", new HttpViewsProvider());
  vscode.window.registerTreeDataProvider(
    "laserPeckerViews",
    new LaserPeckerViewsProvider()
  );

  //打开网页
  vscode.commands.registerCommand("angcyo.openUrl", async (url) => {
    console.log(`命令打开url:${url}`);
    vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(`${url}`));
  });
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
