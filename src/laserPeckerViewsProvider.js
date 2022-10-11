const path = require("path");
const vscode = require("vscode");
const { Api } = require("./api");

class LaserPeckerViewsProvider {
  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getChildren(element) {
    if (element == undefined) {
      return Promise.resolve(this.getChildrenList());
    } else if (element.childList) {
      return Promise.resolve(Api.buildTreeItem(element.childList));
    } else {
      return element;
    }
  }

  getTreeItem(element) {
    return element;
  }

  async getChildrenList() {
    const def = [
      {
        label: "LP文件解析",
        iconPath: path.join(__filename, "..", "..", "res", "parse.svg"),
        command: {
          command: "angcyo.laserPeckerParse",
        },
        tooltip: "LaserPecker文件格式数据解析",
        //description: item.url,
      },
      {
        label: "LP指令解析",
        iconPath: path.join(__filename, "..", "..", "res", "parse.svg"),
        command: {
          command: "angcyo.laserPeckerBleParse",
        },
        tooltip: "LaserPecker蓝牙指令数据解析",
        //description: item.url,
      },
      {
        label: "Svg解析",
        iconPath: path.join(__filename, "..", "..", "res", "parse.svg"),
        command: {
          command: "angcyo.svgParse",
        },
        tooltip: "Svg数据解析",
        //description: item.url,
      },
    ];
    const urlItems = await Api.fetchUrlChildrenList(
      `https://gitcode.net/angcyo/json/-/raw/master/laserPeckerUrl.json`
    );
    return [...def, ...urlItems];
  }
}

exports.LaserPeckerViewsProvider = LaserPeckerViewsProvider;
