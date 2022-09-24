const path = require("path");
const vscode = require("vscode");

class LaserPeckerViewsProvider {
  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getChildren(element) {
    return Promise.resolve([
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
    ]);
  }

  getTreeItem(element) {
    return element;
  }
}

exports.LaserPeckerViewsProvider = LaserPeckerViewsProvider;
