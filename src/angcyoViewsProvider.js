const vscode = require("vscode");
const { Api } = require("./api");

class AngcyoViewsProvider {
  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  async getChildren(element) {
    if (element && element.childList) {
      return Promise.resolve(Api.buildTreeItem(element.childList));
    } else {
      return Promise.resolve(
        Api.fetchUrlChildrenList(
          `https://gitcode.net/angcyo/json/-/raw/master/angcyoUrl.json`
        )
      );
    }
  }

  getTreeItem(element) {
    return element;
  }
}

exports.AngcyoViewsProvider = AngcyoViewsProvider;
