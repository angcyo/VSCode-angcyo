// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const path = require("path");
const vscode = require("vscode");
const { AngcyoViewsProvider } = require("./src/angcyoViewsProvider");
const { MemoWebviewPanel } = require("./src/memoWebviewPanel");
const { TreeDataProvider } = require("./src/treeDataProvider");
const { WebviewPanel } = require("./src/webviewPannel");
const {
  laserPeckerAddQuotationMark,
} = require("./src/addQuotationMarkLaserPecker.js");

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
        label: "lp工程文件数据解析",
        iconPath: parseSvgIconPath,
        command: {
          command: "angcyo.laserPeckerParse",
        },
        tooltip: "LaserPecker工程文件数据解析",
        //description: item.url,
      },
      {
        label: "lp蓝牙指令数据解析",
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
        label: "lpbin文件创建及解析",
        iconPath: parseSvgIconPath,
        command: {
          command: "angcyo.binParse",
        },
        tooltip: "lpbin文件创建及解析",
        //description: item.url,
      },
      {
        label: "lp自动雕刻",
        iconPath: parseSvgIconPath,
        command: {
          command: "angcyo.autoEngrave",
        },
        tooltip: "LaserPecker自动雕刻",
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

  //设备直连
  const deviceConnectPanel = new WebviewPanel(
    "angcyo.deviceConnect",
    "设备直连",
    "res/js/deviceConnect.js",
    "res/html/deviceConnect.html"
  );
  vscode.commands.registerCommand("angcyo.deviceConnect", () => {
    console.log(`设备直连`);
    deviceConnectPanel.createOrShow(context);
  });

  //日志分析
  const logParsePanel = new WebviewPanel(
    "angcyo.logParse",
    "日志分析",
    "res/js/logParse.js",
    "res/html/logParse.html"
  );
  vscode.commands.registerCommand("angcyo.logParse", () => {
    console.log(`日志分析`);
    logParsePanel.createOrShow(context);
  });

  //js工具
  const jsToolsPanel = new WebviewPanel(
    "angcyo.jsTools",
    "js工具",
    "res/js/jsTools.js",
    "res/html/jsTools.html"
  );
  vscode.commands.registerCommand("angcyo.jsTools", () => {
    console.log(`js工具`);
    jsToolsPanel.createOrShow(context);
  });

  //LaserPecker数据解析
  const laserPeckerPanel = new WebviewPanel(
    "angcyo.laserPeckerParse",
    "LaserPecker工程文件数据解析",
    "res/js/lpProject.js",
    "res/html/lpProject.html"
  );
  vscode.commands.registerCommand("angcyo.laserPeckerParse", () => {
    console.log(`LaserPecker工程文件数据解析`);
    laserPeckerPanel.createOrShow(context);
  });

  //LaserPecker蓝牙指令解析
  const laserPeckerBlePanel = new WebviewPanel(
    "angcyo.laserPeckerBleParse",
    "LaserPecker蓝牙指令解析",
    "res/js/lpBle.js",
    "res/html/lpBle.html"
  );
  vscode.commands.registerCommand("angcyo.laserPeckerBleParse", () => {
    console.log(`LaserPecker蓝牙指令解析`);
    laserPeckerBlePanel.createOrShow(context);
  });

  //Svg解析
  const svgParsePanel = new WebviewPanel(
    "angcyo.svgParse",
    "Svg解析",
    "res/js/svgParse.js",
    "res/html/svgParse.html"
  );
  vscode.commands.registerCommand("angcyo.svgParse", () => {
    console.log(`Svg解析`);
    svgParsePanel.createOrShow(context);
  });

  //lpbin解析
  const lpBinPanel = new WebviewPanel(
    "angcyo.binParse",
    "lpbin文件创建及解析",
    "res/js/lpBin.js",
    "res/html/lpBin.html"
  );
  vscode.commands.registerCommand("angcyo.binParse", () => {
    console.log(`lpbin文件创建及解析`);
    lpBinPanel.createOrShow(context);
  });

  //lp自动雕刻
  const autoEngravePanel = new WebviewPanel(
    "angcyo.autoEngrave",
    "lp自动雕刻",
    "res/js/autoEngrave.js",
    "res/html/autoEngrave.html"
  );
  vscode.commands.registerCommand("angcyo.autoEngrave", () => {
    console.log(`lp自动雕刻`);
    autoEngravePanel.createOrShow(context);
  });

  //angcyo.memo 备忘录
  const memoPanel = new WebviewPanel(
    "angcyo.memo",
    "记一下, 备忘录",
    "res/js/memo.js",
    "res/html/memo.html"
  );
  vscode.commands.registerCommand("angcyo.memo", () => {
    console.log(`备忘录`);
    memoPanel.createOrShow(context);
  });

  //Api.readFile(context, "res", "main.css");

  //注册一个指令, 用来给选中的文本添加引号, LaserPecker
  vscode.commands.registerCommand(
    "angcyo.command.addQuotationMarkLaserPecker",
    () => {
      laserPeckerAddQuotationMark.addQuotationMark();
    }
  );
}

// this method is called when your extension is deactivated
function deactivate() {
  vscode.window.showInformationMessage(`angcyo is deactivate~`);
}

module.exports = {
  activate,
  deactivate,
};
