const vscode = require("vscode");
const { Api } = require("./api");
const path = require("path");
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
      return this.getTopChildrenList();
    }
  }

  getTreeItem(element) {
    return element;
  }

  //获取有效的备忘录数量
  getMemoCount() {
    //let count = 0;
    // for (let index = 0; index < 10; index++) {
    //   const value = vscode.workspace
    //     .getConfiguration("angcyo-memo")
    //     .get(`memo${index + 1}`, "");

    //   if (value) {
    //     count++;
    //   }
    // }
    //return count;

    const memoJson = vscode.workspace
      .getConfiguration("angcyo-memo")
      .get(`memo`, "");
    let memo = {};
    if (memoJson) {
      memo = JSON.parse(memoJson);
    }
    return Object.keys(memo).length;
  }

  async getTopChildrenList() {
    //总共的数量
    const count = this.getMemoCount();
    let description;
    if (count) {
      description = `共:${count}`;
    } else {
      description = "备忘录";
    }
    const last = [
      {
        label: "记一下",
        iconPath: path.join(__filename, "..", "..", "res", "memo.svg"),
        command: {
          command: "angcyo.memo",
        },
        tooltip: "备忘录, 记一下",
        description: description,
      },
    ];
    const urlItems = await Api.fetchUrlChildrenList(
      `https://gitcode.net/angcyo/json/-/raw/master/angcyoUrl.json`
    );
    return [...urlItems, ...last];
  }
}

exports.AngcyoViewsProvider = AngcyoViewsProvider;
