const path = require("path");
const vscode = require("vscode");
const os = require("os");
require("isomorphic-fetch");

class Api {
  //获取网址列表
  async fetchUrlChildrenList(api) {
    const req = await fetch(api);
    try {
      const json = await req.json();
      
      return this.buildTreeItem(json.data);
    } catch (e) {
      console.error(`获取网址列表失败:${api}`, e);
      //如果获取失败, 返回空数组
      return [];
    }
  }
  
  //构建vs treeItem
  buildTreeItem(beanList) {
    if (beanList) {
      return beanList
        .filter((item) => item.enable === undefined || item.enable === true)
        .map((item) => {
          const treeItem = {
            label: item.label,
            iconPath: path.join(__filename, "..", "..", "res", "folder.svg"),
            tooltip: item.tooltip || item.url,
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
            treeItem.iconPath = path.join(
              __filename,
              "..",
              "..",
              "res",
              item.icon || "parse.svg"
            );
            
          }
          return treeItem;
        });
    }
  }
  
  /**
   * 读取文件内容
   * "res", "main.css"
   */
  async readFile(context, ...pathSegments) {
    const uri = vscode.Uri.joinPath(context.extensionUri, ...pathSegments);
    const data = await vscode.workspace.fs.readFile(uri);
    const dataStr = Buffer.from(data).toString("utf8");
    //console.log(dataStr);
    console.log(`读取文件:${uri} :${dataStr.length}bytes`);
    return dataStr;
  }
  
  //进行get请求
  async httpGet(url, headers) {
    console.log(`httpGet:${url}`);
    const req = await fetch(url, {
      method: "GET",
      headers: {
        ...(headers || {}),
      },
    });
    console.log(`httpGet:${req.status}`);
    // //判断请求是否成功
    // if (req.status === 200) {
    //   return "";
    // }
    return await req.text();
  }
  
  //进行post请求
  async httpPost(url, body, token, headers) {
    console.log(`httpPost:${url}`);
    //判断body是否是json类型
    let isJsonBody = false;
    
    try {
      JSON.parse(body);
      isJsonBody = true;
    } catch (error) {
      isJsonBody = false;
    }
    
    let contentType = "text/plain";
    if (isJsonBody) {
      contentType = "application/json";
    }
    
    const req = await fetch(url, {
      method: "POST",
      body: body,
      headers: {
        "Content-Type": contentType,
        token: token,
        ...(headers || {}),
      },
    });
    return await req.text();
  }
  
  //进行head请求, 判断[url]是有有效
  async httpHead(url, headers) {
    try {
      const req = await fetch(url, {
        method: "HEAD",
        headers: {
          ...(headers || {}),
        },
      });
      return req.status === 200;
    } catch (error) {
      return false;
    }
  }
  
  // blob 类型, file也是一种blob类型
  async postFile(url, blob, fileName) {
    //使用fetch发送文件
    const formData = new FormData();
    formData.append("file", blob, fileName || "unknown.temp");
    const req = await fetch(url, {
      method: "POST",
      body: formData,
      // headers: {
      //   "Content-Type": "multipart/form-data",
      // },
    });
    return await req.text();
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
          alias.address.startsWith("192") &&
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
  
  // 从html文本中, 解析出数据
  parseHtmlText(text) {
    //通过css选择器, 选择元素
    const cheerio = require("cheerio");
    const $ = cheerio.load(text);
    const list = [];
    $("a").each((index, element) => {
      const $element = $(element);
      const href = $element.attr("href");
      const title = $element.text();
      list.push({title, href});
    });
  }
}

exports.Api = new Api();
