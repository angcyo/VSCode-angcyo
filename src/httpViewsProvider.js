const vscode = require("vscode");
const { Api } = require("./api");
class HttpViewsProvider {
  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  async getChildren(element) {
    return Promise.resolve(
      Api.fetchUrlChildrenList(
        `https://gitcode.net/angcyo/json/-/raw/master/recommendUrl.json`
      )
    );
  }

  getTreeItem(element) {
    return element;
  }
}

exports.HttpViewsProvider = HttpViewsProvider;
