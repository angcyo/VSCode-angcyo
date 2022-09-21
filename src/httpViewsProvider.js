const vscode = require("vscode");
const path = require("path");

class HttpViewsProvider {
  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getChildren(element) {
    console.log("加载http children↓");
    console.log(element);
    //vscode.window.showInformationMessage("No dependency in empty workspace");
    return Promise.resolve([
      {
        label: "xxx",
        iconPath: path.join(__filename, "..", "..", "res", "web.svg"),
      },
    ]);
  }

  getTreeItem(element) {
    console.log("加载http tree item↓");
    console.log(element);
    return element;
  }
}

exports.HttpViewsProvider = HttpViewsProvider;
