// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const path = require("path");
const vscode = require("vscode");
const { AngcyoMemoPanel } = require("./src/angcyoMemoPanel");
const { AngcyoViewsProvider } = require("./src/angcyoViewsProvider");
const { BinParsePanel } = require("./src/binParsePanel");
const { LaserPeckerParseBlePanel } = require("./src/laserPeckerParseBlePanel");
const { LaserPeckerParsePanel } = require("./src/laserPeckerParsePanel");
const { SvgParsePanel } = require("./src/svgParsePanel");
const { TreeDataProvider } = require("./src/treeDataProvider");

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
  console.log(__filename);

  //显示欢迎页
  vscode.commands.executeCommand("setContext", "angcyo.showWelcome", true);

  //
  const welcomViewsProvider = new TreeDataProvider();
  vscode.window.registerTreeDataProvider("welcomeViews", welcomViewsProvider);

  //
  const angcyoViewsProvider = new AngcyoViewsProvider();
  vscode.window.registerTreeDataProvider("angcyoViews", angcyoViewsProvider);

  //
  const httpViewsProvider = new TreeDataProvider(
    "https://gitcode.net/angcyo/json/-/raw/master/recommendUrl.json"
  );
  vscode.window.registerTreeDataProvider("httpViews", httpViewsProvider);

  //
  const parseSvgIconPath = path.join(__filename, "..", "res", "parse.svg");
  const laserPeckerViewsProvider = new TreeDataProvider(
    `https://gitcode.net/angcyo/json/-/raw/master/laserPeckerUrl.json`,
    [
      {
        label: "LP文件解析",
        iconPath: parseSvgIconPath,
        command: {
          command: "angcyo.laserPeckerParse",
        },
        tooltip: "LaserPecker文件格式数据解析",
        //description: item.url,
      },
      {
        label: "LP指令解析",
        iconPath: parseSvgIconPath,
        command: {
          command: "angcyo.laserPeckerBleParse",
        },
        tooltip: "LaserPecker蓝牙指令数据解析",
        //description: item.url,
      },
      {
        label: "Svg解析",
        iconPath: parseSvgIconPath,
        command: {
          command: "angcyo.svgParse",
        },
        tooltip: "Svg数据解析",
        //description: item.url,
      },
      {
        label: "lpbin解析",
        iconPath: parseSvgIconPath,
        command: {
          command: "angcyo.binParse",
        },
        tooltip: "lpbin解析",
        //description: item.url,
      },
    ]
  );
  //console.log(parseSvgIconPath);//e:\VSCodeProjects\angcyoJs\res\parse.svg
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

  //单独刷新angcyo
  vscode.commands.registerCommand("angcyo.refresh.angcyo", () => {
    angcyoViewsProvider.refresh();
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
    LaserPeckerParseBlePanel.createOrShow(context);
  });

  //Svg解析
  vscode.commands.registerCommand("angcyo.svgParse", () => {
    console.log(`Svg解析`);
    SvgParsePanel.createOrShow(context);
  });

  //lpbin解析
  vscode.commands.registerCommand("angcyo.binParse", () => {
    console.log(`lpbin解析`);
    BinParsePanel.createOrShow(context);
  });

  //angcyo.memo 备忘录
  vscode.commands.registerCommand("angcyo.memo", () => {
    console.log(`备忘录`);
    AngcyoMemoPanel.createOrShow(context);
  });
}

// this method is called when your extension is deactivated
function deactivate() {
  vscode.window.showInformationMessage(`angcyo is deactivate~`);
}

module.exports = {
  activate,
  deactivate,
};
