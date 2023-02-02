/**
 * 给选中的文本添加引号, LaserPecker
 * 2023-2-2
 */

const vscode = require("vscode");

class LaserPeckerAddQuotationMark {
  addQuotationMark() {
    const { document, selection, edit } = vscode.window.activeTextEditor;

    //获取操作的文本, 选中的文本
    const text = document.getText(selection);

    if (text) {
      var newText = "";
      text.split("\n").forEach((value) => {
        value = value.replace("\r", "");
        if (value) {
          newText += `"${value}",\n`;
        } else {
          newText += `${value}\n`;
        }
      });
      edit((editBuilder) => {
        editBuilder.replace(selection, newText);
      });
    } else {
      vscode.window.showErrorMessage("未选中文本内容,请先选择文本.");
    }
  }
}

exports.laserPeckerAddQuotationMark = new LaserPeckerAddQuotationMark();
