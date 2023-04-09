const vscode = require("vscode");
const os = require("os");
const { WebviewPanel } = require("./webviewPannel");

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
    //默认接收文件服务的端口
    this.port = 9200;
    //UDP关播服务的端口, 用关播把url地址发出去
    this.broadcastPort = 9999;
    //广播地址
    this.broadcastAddress = "255.255.255.255";
    this.ip = this.getLocalIp();
    this.url = "http://" + this.ip + ":" + this.port;
  }

  onInitWebviewPanel() {
    super.onInitWebviewPanel();
    //发送数据到webview
    this.postMessage({
      type: "host",
      value: this.url,
    }); //发送本机ip到webview
  }

  onDidReceiveMessage(message) {
    super.onDidReceiveMessage(message);
    switch (message.command) {
      case "startServer":
        if (this.broadcastClient) {
          //已经开始了广播,证明服务也已经启动了
          break;
        }
        this.broadcastUrl(); //广播url地址
        this.startServer(); //启动服务
        break;
    }
  }

  /**
   * 获取本机ip
   */
  getLocalIp() {
    const networkInterfaces = os.networkInterfaces();

    let ip = "";
    for (const name in networkInterfaces) {
      const iface = networkInterfaces[name];
      for (let i = 0; i < iface.length; i++) {
        const alias = iface[i];
        if (
          alias.family === "IPv4" &&
          alias.address !== "127.0.0.1" &&
          !alias.internal
        ) {
          ip = alias.address;
          break;
        }
      }
      if (ip) break;
    }
    return ip;
  }

  dispose() {
    super.dispose();
    this.broadcastClient?.close();
    this.broadcastClient = null;
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
      console.log(`Socket bind: ${port}`);

      client.setBroadcast(true);
      client.send(JSON.stringify(message), port, address, (err) => {
        client.close();
        this.broadcastClient = null;
        if (err) {
          console.log(err);
        } else {
          console.log(`Message sent to ${address}:${port}`);
        }

        setTimeout(() => {
          this.broadcastUrl();
        }, 1000);
      });
    });
  }

  /**开始一个文件接收服务 */
  startServer() {
    const http = require("http");
    const url = require("url");

    const server = http.createServer((req, res) => {
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
        // this.postMessage({
        //     type: "message",
        //     value: newPath,
        //   });
        //   res.end("success:" + newPath);

        vscode.window.showSaveDialog();
        res.end("success:");
      }
    });
    server.listen(this.port, () => {
      const log = `Server running at ${this.url}`;
      console.log(log);
      this.postMessage({
        type: "message",
        value: log,
      });
    });
  }
}

exports.HttpServerWebviewPanel = HttpServerWebviewPanel;
