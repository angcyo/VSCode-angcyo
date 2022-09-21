const vscode = require("vscode");

class AngcyoViewsProvider {
  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getChildren(element) {
    //vscode.window.showInformationMessage("No dependency in empty workspace");
    //return Promise.resolve([{ label: "xxx", iconPath: "./res/angcyo.svg" }]);
    return element;
  }

  getTreeItem(element) {
    return element;
  }
}

exports.AngcyoViewsProvider = AngcyoViewsProvider;
