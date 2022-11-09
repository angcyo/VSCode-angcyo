/**
 * Email:angcyo@126.com
 * @author angcyo
 * @date 2022/11/05
 */

(function () {
  const vscode = acquireVsCodeApi();
  //console.log("初始化svgParse.js", vscode, window)

  const memoWrapElement = document.getElementById("memoWrap");

  //初始化
  window.addEventListener("load", (event) => {
    let memoListHtml = "";
    const count = 10;

    for (let index = 1; index <= count; index++) {
      memoListHtml += `<div class="margin memo-wrap">
        <label for="memo${index}">${index}:</label>
        <textarea id="memo${index}" name="memo${index}" placeholder="这个需要记一下..." autofocus rows="2"></textarea>
      </div>`;
    }

    memoWrapElement.innerHTML = memoListHtml;

    for (let index = 1; index <= count; index++) {
      configEdit(index);
    }
  });

  //index 从[1~10]
  function configEdit(index) {
    const element = document.getElementById(`memo${index}`);
    element.addEventListener(`input`, () => {
      console.log(element.value);

      //将数据发送给vscode
      vscode.postMessage({
        command: "input",
        index: index,
        value: element.value,
      });
    });
  }

  //接收来自vscode的数据
  // Handle messages sent from the extension to the webview
  window.addEventListener("message", (event) => {
    const message = event.data; // The json data that the extension sent
    switch (message.type) {
      case "memo":
        const value = message.value;
        const index = message.index;

        const element = document.getElementById(`memo${index}`);
        element.value = value;
        return;
    }
  });
})();
