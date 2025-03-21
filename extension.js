// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const path = require("path");
const vscode = require("vscode");
const {AngcyoViewsProvider} = require("./src/angcyoViewsProvider");
const {MemoWebviewPanel} = require("./src/memoWebviewPanel");
const {LpbinWebviewPanel} = require("./src/lpbinWebviewPanel");
const {HttpServerWebviewPanel} = require("./src/httpServerWebviewPanel");
const {TreeDataProvider} = require("./src/treeDataProvider");
const {WebviewPanel} = require("./src/webviewPannel");
const {
  laserPeckerAddQuotationMark,
} = require("./src/addQuotationMarkLaserPecker.js");
const {showInputBox} = require("vscode");

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

  //
  const parseSvgIconPath = path.join(__filename, "..", "res", "parse.svg");
  const laserPeckerViewsProvider = new TreeDataProvider(
    `${host}/laserPeckerUrl.json`,
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
    welcomeViewsProvider.refresh();
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
    "JS工具",
    "res/js/jsTools.js",
    "res/html/jsTools.html"
  );
  vscode.commands.registerCommand("angcyo.jsTools", () => {
    console.log(`JS工具`);
    jsToolsPanel.createOrShow(context);
  });
  //爬虫工具
  const crawlerToolsPanel = new WebviewPanel(
    "angcyo.crawlerTools",
    "爬虫工具",
    "res/js/crawlerTools.js",
    "res/html/crawlerTools.html"
  );
  vscode.commands.registerCommand("angcyo.crawlerTools", () => {
    console.log(`爬虫工具`);
    crawlerToolsPanel.createOrShow(context);
  });
  //httpServer
  const httpServerWebviewPanel = new HttpServerWebviewPanel();
  vscode.commands.registerCommand("angcyo.httpServer", () => {
    console.log(`httpServer`);
    httpServerWebviewPanel.createOrShow(context);
  });
  //bedLink
  const bedLinkPanel = new WebviewPanel(
    "angcyo.bedLink",
    "图床链接",
    "res/js/bedLink.js",
    "res/html/bedLink.html"
  );
  vscode.commands.registerCommand("angcyo.bedLink", () => {
    console.log(`bedLink`);
    bedLinkPanel.createOrShow(context);
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
  const lpBinPanel = new LpbinWebviewPanel();
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
  const memoPanel = new MemoWebviewPanel();
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
  activate,
  deactivate,
};
