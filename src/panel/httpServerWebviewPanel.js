const vscode = require("vscode");
const os = require("os");
const { WebviewPanel } = require("./webviewPannel");
const { Api } = require("../api");

//http服务
class HttpServerWebviewPanel extends WebviewPanel {
  constructor() {
    super(
      "angcyo.httpServer",
      "Http服务",
      "res/js/httpServer.js",
      "res/html/httpServer.html"
    );

    this.initServer();
  }

  initServer() {
    this.osname = "Win";
    //vscode.env.isWindows ? (this.osname = "Win") : (this.osname = "Mac");
    //process.platform === "win32"
    // const os = require("os");
    if (os.platform() === "win32") {
      this.osname = "Win";
    } else {
      this.osname = "Mac";
    }

    //默认接收文件服务的端口
    this.port = 9200;
    //UDP关播服务的端口, 用关播把url地址发出去
    this.broadcastPort = 9999;
    //广播地址
    this.broadcastAddress = "255.255.255.255";
    this.ip = this.getLocalIp();
    this.url = "http://" + this.ip + ":" + this.port;

    const folder = vscode.workspace
      .getConfiguration("angcyo-httpServer")
      .get(`uploadFolder${this.osname}`, undefined);
    this.updateFolder(folder, true);
  }

  updateFolder(folder, notify) {
    if (folder) {
      this.folder = folder;
    } else if (
      vscode.workspace.workspaceFolders &&
      vscode.workspace.workspaceFolders.length > 0
    ) {
      this.folder = vscode.workspace.workspaceFolders[0].uri.fsPath;
    } else {
      this.folder = os.homedir(); // //this._context.extensionPath;
    }
    vscode.workspace
      .getConfiguration("angcyo-httpServer")
      .update(`uploadFolder${this.osname}`, this.folder); //入库, 同时也会在线存储

    if (notify) {
      this.postMessage({
        type: "uploadFolder",
        value: this.folder,
      }); //发送默认存储路径到webview
    }
  }

  onInitWebviewPanel() {
    super.onInitWebviewPanel();
    //发送数据到webview
    setTimeout(() => {
      this.postMessage({
        type: "host",
        value: this.url,
      }); //发送本机ip到webview
      this.postMessage({
        type: "uploadFolder",
        value: this.folder,
      }); //发送默认存储路径到webview
    }, 600); //延迟600毫秒, 兼容性能慢的电脑
  }

  onDidReceiveMessage(message) {
    super.onDidReceiveMessage(message);
    switch (message.command) {
      case "startServer":
        this.broadcastUrl(); //广播url地址
        this.startServer(); //启动服务
        break;
      case "selectFolder":
        const options = {
          defaultUri: vscode.Uri.file(this.folder),
          canSelectMany: false,
          canSelectFiles: false,
          canSelectFolders: true,
          title: "选择保存的文件路径",
          openLabel: "选择路径",
        };
        vscode.window.showOpenDialog(options).then((uri) => {
          if (uri && uri[0]) {
            this.updateFolder(uri[0].fsPath, true);
            console.log(`Selected folder: ${this.folder}`);
          }
        });
        break;
      case "updateUploadFolder":
        this.updateFolder(message.path, false);
        break;
    }
  }

  /**
   * 获取本机ip
   */
  getLocalIp() {
    return Api.getLocalIp();
  }

  dispose() {
    super.dispose();
    this.broadcastClient?.close();
    this.broadcastClient = null;

    this.httpServerClient?.close();
    this.httpServerClient = null;
  }

  /**
   * 使用UDP广播发送url地址
   */
  broadcastUrl() {
    if (this.broadcastClient) {
      //已经开始了广播
      return;
    }

    if (this.webviewPanel == null || this.webviewPanel == undefined) {
      //页面已经关闭了
      return;
    }

    const dgram = require("dgram");
    const client = dgram.createSocket("udp4");
    this.broadcastClient = client;
    client.on("error", (err) => {
      console.log(`Socket error: ${err}`);
    });
    //广播的内容
    const message = {
      url: this.url,
    };
    const port = this.broadcastPort;
    const address = this.broadcastAddress;
    client.bind(port, () => {
      //console.log(`Socket bind: ${port}`);

      client.setBroadcast(true);
      client.send(JSON.stringify(message), port, address, (err) => {
        client.close();
        this.broadcastClient = null;
        if (err) {
          console.log(err);
        } else {
          //console.log(`Message sent to ${address}:${port}`);
        }

        setTimeout(() => {
          this.broadcastUrl();
        }, 1000);
      });
    });
  }

  /**开始一个文件接收服务 */
  startServer() {
    if (this.httpServerClient) {
      //已经开始了广播,证明服务也已经启动了
      this.postMessage({
        type: "message",
        value: "服务已启动: " + this.url + " ->" + this.folder,
      });
      return;
    }

    const http = require("http");
    const url = require("url");
    const formidable = require("formidable");

    const server = http.createServer((req, res) => {
      console.log("收到请求:" + req.url);
      this.postMessage({
        type: "message",
        value: "收到请求: " + req.url,
      });

      const pathname = url.parse(req.url).pathname;
      if (pathname === "/body") {
        let requestBody = "";
        req.on("data", (chunk) => {
          requestBody += chunk.toString();
        });
        req.on("end", () => {
          console.log(`Request body: ${requestBody}`);
          this.postMessage({
            type: "message",
            value: requestBody,
          });
          res.end("success");
        });
      } else if (pathname === "/uploadFile") {
        // parse a file upload
        const form = formidable({});

        form.parse(req, (err, fields, files) => {
          if (err) {
            res.writeHead(err.httpCode || 400, {
              "Content-Type": "text/plain",
            });
            res.end(String(err));
            return;
          }

          const oldPathUri = vscode.Uri.file(files.file.filepath);
          const newPathUri = vscode.Uri.file(
            this.folder + "/" + files.file.originalFilename
          );
          vscode.workspace.fs
            .rename(oldPathUri, newPathUri, {
              overwrite: true,
            })
            .then((err) => {
              if (err) {
                console.error(err);
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Internal Server Error");
                return;
              }
              console.log("File saved successfully");
              res.writeHead(200, { "Content-Type": "text/plain" });
              res.end("File saved successfully");

              this.postMessage({
                type: "message",
                value: newPathUri.fsPath,
              });
            });
        });
      }
    });
    this.httpServerClient = server;
    server.on("error", (err) => {
      this.httpServerClient = null;
      console.log(`Server error: ${err}`);
      this.postMessage({
        type: "message",
        value: err.message,
      });
    });
    server.on("close", () => {
      this.httpServerClient = null;
      console.log(`Server closed`);
      this.postMessage({
        type: "message",
        value: "Server closed",
      });
    });
    server.listen(this.port, () => {
      const log = `Server running at ${this.url} ->${this.folder}`;
      console.log(log);
      this.postMessage({
        type: "message",
        value: log,
      });
    });
  }
}

exports.HttpServerWebviewPanel = HttpServerWebviewPanel;
