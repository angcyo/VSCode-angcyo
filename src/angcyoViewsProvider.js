const vscode = require("vscode");
const path = require("path");
const { TreeDataProvider } = require("./treeDataProvider");
class AngcyoViewsProvider extends TreeDataProvider {
  constructor() {
    super("https://gitcode.net/angcyo/json/-/raw/master/angcyoUrl.json");
  }

  async getTopChildren() {
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
        label: "设备直连",
        iconPath: path.join(__filename, "..", "..", "res", "parse.svg"),
        command: {
          command: "angcyo.deviceConnect",
        },
        tooltip: "设备直连通信",
      },
      {
        label: "日志分析",
        iconPath: path.join(__filename, "..", "..", "res", "parse.svg"),
        command: {
          command: "angcyo.logParse",
        },
        tooltip: "日志数据分析",
      },
      {
        label: "js工具",
        iconPath: path.join(__filename, "..", "..", "res", "parse.svg"),
        command: {
          command: "angcyo.jsTools",
        },
        tooltip: "js工具",
      },
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
    const urlItems = await this.getUrlItems();
    return [...urlItems, ...last];
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
}

exports.AngcyoViewsProvider = AngcyoViewsProvider;
