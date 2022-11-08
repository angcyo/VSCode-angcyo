/**
 * Tree Data Provider
 * https://code.visualstudio.com/api/extension-guides/tree-view
 *
 * 2022-11-8
 */

const vscode = require("vscode");
const { Api } = require("./api");

class TreeDataProvider {
  /**
   * 构造函数
   * @param {*} url 请求的服务器地址
   * @param {*} headrItems 顶级的头部item
   * @param {*} footreItems 顶级的尾部item
   */
  constructor(url, headrItems, footreItems) {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    this.url = url;
    this.headrItems = headrItems;
    this.footreItems = footreItems;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  async getChildren(element) {
    if (element == undefined) {
      return Promise.resolve(this.getTopChildren());
    } else if (element.childList) {
      return Promise.resolve(Api.buildTreeItem(element.childList));
    } else {
      return element;
    }
  }

  getTreeItem(element) {
    return element;
  }

  /**
   * 获取顶级目录结构
   */
  async getTopChildren() {
    if (this.url) {
      const urlItems = await this.getUrlItems();
      return [
        ...(this.headrItems || []),
        ...urlItems,
        ...(this.footreItems || []),
      ];
    } else {
      return [...(this.headrItems || []), ...(this.footreItems || [])];
    }
  }

  async getUrlItems() {
    return await Api.fetchUrlChildrenList(this.url);
  }
}

exports.TreeDataProvider = TreeDataProvider;
