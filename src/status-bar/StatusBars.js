/**
 * 状态栏管理
 *
 * @author: angcyo@126.com
 * @date: 2016/9/23
 * */
const vscode = require("vscode");

/** @type {vscode.StatusBarItem | undefined} */
let activeTextStatusBarItem = undefined;

class StatusBars {

  constructor() {
  }

  //region 状态栏item

  /**创建一个有效文本计算状态栏item*/
  showActiveTextStatusBarItem(context) {
    const subscriptions = context.subscriptions;
    if (activeTextStatusBarItem === undefined) {
      const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
      //item.id = "angcyo.activeTextStatusBarItem";
      item.name = "angcyo";
      item.command = "angcyo.qq";
      item.tooltip = new vscode.MarkdownString(`欢迎使用! by angcyo.\n - [CSDN](https://blog.csdn.net/angcyo)\n - [Github](https://github.com/angcyo)\n - [掘金](https://juejin.cn/user/1398234517866856)\n - [QQ咨询](http://wpa.qq.com/msgrd?v=3&uin=664738095&site=qq&menu=yes)\n\n${vscode.version}`);

      /*const item2 = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
      item2.text = "test";
      item2.show();*/
      subscriptions.push(item);
      activeTextStatusBarItem = item;

      // register some listener that make sure the status bar
      // item always up-to-date
      subscriptions.push(vscode.window.onDidChangeActiveTextEditor(_updateActiveTextStatusBarItem));
      subscriptions.push(vscode.window.onDidChangeTextEditorSelection(_updateActiveTextStatusBarItem));
    }
    _updateActiveTextStatusBarItem();
  }

  //endregion 状态栏item
}

/**更新[activeTextStatusBarItem]
 * 图标 - [octicon](https://octicons.github.com)
 * */
function _updateActiveTextStatusBarItem() {
  const editor = vscode.window.activeTextEditor;
  //获取选中的文本字符串
  const text = editor ? editor.document.getText(editor.selection) : undefined;
  if (activeTextStatusBarItem) {
    if (text) {
      //字符串转utf8字节数组
      const bytes = new TextEncoder().encode(text);
      activeTextStatusBarItem.text = `${text.length}[${_formatBytes(bytes.length)}]`;
    } else {
      //activeTextStatusBarItem.text = `$(heart) ${vscode.version}`;
      activeTextStatusBarItem.text = `$(zap) ${vscode.version}`;
      // activeTextStatusBarItem.text = `$(flame) ${vscode.version}`;
    }
    activeTextStatusBarItem.show();
  }
}

/**格式化字节大小*/
function _formatBytes(bytes) {
  const B = 1024;
  const digits = 2;
  if (bytes < B) {
    return bytes + " B";
  } else if (bytes < B * B) {
    return (bytes / B).toFixed(digits) + " KB";
  } else if (bytes < B * B * B) {
    return (bytes / B / B).toFixed(digits) + " MB";
  } else if (bytes < B * B * B * B) {
    return (bytes / B / B / B).toFixed(digits) + " GB";
  } else if (bytes < B * B * B * B * B) {
    return (bytes / B / B / B / B).toFixed(digits) + " TB";
  } else if (bytes < B * B * B * B * B * B) {
    return (bytes / B / B / B / B / B).toFixed(digits) + " PB";
  }
  return (bytes / B / B / B / B / B / B).toFixed(digits) + " EB";
}

exports.statusBars = new StatusBars();