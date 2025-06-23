/**
 * Tree Data Provider
 * https://code.visualstudio.com/api/extension-guides/tree-view
 *
 * 2022-11-8
 */

const vscode = require("vscode");
const {Api} = require("../api");
const path = require("path");

/**空item*/
const emptyItem = {
  label: "暂无数据",
};

class TreeDataProvider {
  /**
   * 构造函数
   * @param {*} url 请求的服务器地址
   * @param {*} headerItems 顶级的头部item
   * @param {*} footerItems 顶级的尾部item
   */
  constructor(url, headerItems, footerItems) {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    this.url = url;
    this.headrItems = headerItems;
    this.footreItems = footerItems;
  }
  
  refresh() {
    this._onDidChangeTreeData.fire();
  }
  
  async getChildren(element) {
    if (element === undefined) {
      const children = await this.getTopChildren();
      if (this.url !== undefined && children.length === 0) {
        //如果没有数据, 返回一个空的item
        return [emptyItem];
      }
      return Promise.resolve(children);
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
    //debugger;
    if (this.url) {
      const urlItems = await this.getUrlItems();
      return [...(this.headrItems || []), ...urlItems, ...(this.footreItems || []),].filter((item) => item.enable === undefined || item.enable === true);
    } else {
      return [...(this.headrItems || []), ...(this.footreItems || [])].filter((item) => item.enable === undefined || item.enable === true);
    }
  }
  
  async getUrlItems() {
    return await Api.fetchUrlChildrenList(this.url);
  }
}

exports.TreeDataProvider = TreeDataProvider;
