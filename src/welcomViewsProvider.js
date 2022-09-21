const vscode = require("vscode");

class WelcomViewsProvider {
  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getChildren(element) {
    return element;
  }

  getTreeItem(element) {
    return element;
  }
}

exports.WelcomViewsProvider = WelcomViewsProvider;
