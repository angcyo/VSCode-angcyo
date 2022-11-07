const path = require("path");
const vscode = require("vscode");
require("isomorphic-fetch");

class Api {
  //获取网址列表
  async fetchUrlChildrenList(api) {
    const req = await fetch(api);
    const josn = await req.json();

    return this.buildTreeItem(josn.data);
  }

  //构建vs treeItem
  buildTreeItem(beanList) {
    if (beanList) {
      const childrenList = beanList
        .filter((item) => item.enable == undefined || item.enable)
        .map((item) => {
          const treeItem = {
            label: item.label,
            iconPath: path.join(__filename, "..", "..", "res", "folder.svg"),
            tooltip: item.url,
            description: item.description,
            childList: item.childList,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
          };
          if (item.url) {
            //url网页数据
            treeItem.collapsibleState = vscode.TreeItemCollapsibleState.None;
            treeItem.iconPath = path.join(
              __filename,
              "..",
              "..",
              "res",
              "web.svg"
            );
            treeItem.command = {
              command: "angcyo.openUrl",
              title: "",
              arguments: [item.url],
            };
          } else if (item.command) {
            //command指令数据
            treeItem.command = item.command;
            treeItem.childList = undefined;
            treeItem.collapsibleState = vscode.TreeItemCollapsibleState.None;
            if (item.icon) {
              //有图标
              treeItem.iconPath = path.join(
                __filename,
                "..",
                "..",
                "res",
                item.icon
              );
            }
          }
          return treeItem;
        });
      return childrenList;
    }
  }
}

exports.Api = new Api();
