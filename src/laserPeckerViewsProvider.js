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
    return Promise.resolve([]);
  }

  getTreeItem(element) {
    return element;
  }
}

exports.LaserPeckerViewsProvider = LaserPeckerViewsProvider;
