/**
 * Email:angcyo@126.com
 * @author angcyo
 * @date 2024-2-26
 */

(function () {
  const vscode = acquireVsCodeApi();
  const resultElement = document.getElementById("result");
  const urlElement = document.getElementById("url");
  const headersElement = document.getElementById("headers");
  const sleepElement = document.getElementById("sleep");
  const levelElement = document.getElementById("level");
  const provinceElement = document.getElementById("province");

  initTextInput(
    "url",
    "https://www.stats.gov.cn/sj/tjbz/tjyqhdmhcxhfdm/2023/index.html"
  );
  initTextInput("headers");
  initTextInput("sleep", "10");
  initTextInput("level", "3");
  initTextInput("province");

  //监听header输入改变, 自动json格式化
  headersElement.addEventListener("input", () => {
    headersElement.value = tryJsonParse(headersElement.value);
  });

  //监听文本输入改变, 自动json格式化
  provinceElement.addEventListener("input", () => {
    provinceElement.value = tryJsonParse(provinceElement.value);
  });

  //接收来自vscode的数据
  // Handle messages sent from the extension to the webview
  window.addEventListener("message", (event) => {
    const message = event.data; // The json data that the extension sent
    const uuid = message.uuid;
    const url = message.url;
    console.log(`收到来自vscode的消息↓`);
    console.log(message);

    switch (message.type) {
      case "response":
        if (message.error) {
          notify(`请求失败:` + url);
          appendResult(`请求失败:` + url);
        }
        const text = message.value;
        if (text) {
          if (uuid === "getProvinceList") {
            resultElement.innerHTML = tryJsonFormat(
              parseProvinceList(url, text)
            );
          } else if (uuid === "getCityList") {
            resultElement.innerHTML = tryJsonFormat(parseCityList(url, text));
          } else if (uuid === "getCountyList") {
            resultElement.innerHTML = tryJsonFormat(parseCountyList(url, text));
          } else if (uuid === "getTownList") {
            resultElement.innerHTML = tryJsonFormat(parseTownList(url, text));
          } else if (uuid === "getVillageList") {
            resultElement.innerHTML = tryJsonFormat(
              parseVillageList(url, text)
            );
          } else if (uuid === "getFullList") {
            lastResolveFunc(text);
          } else {
            resultElement.innerHTML = text;
          }
        }
        break;
    }
  });

  clickButton("get", () => {
    httpGet(urlElement.value);
  });

  clickButton("getProvinceList", () => {
    httpGet(urlElement.value, "getProvinceList");
  });
  clickButton("getCityList", () => {
    httpGet(urlElement.value, "getCityList");
  });
  clickButton("getCountyList", () => {
    httpGet(urlElement.value, "getCountyList");
  });
  clickButton("getTownList", () => {
    httpGet(urlElement.value, "getTownList");
  });
  clickButton("getVillageList", () => {
    httpGet(urlElement.value, "getVillageList");
  });
  clickButton("getFullList", () => {
    getFullList();
  });
  clickButton("getPCCList", () => {
    getFullList(3);
  });
  clickButton("getLevelList", () => {
    getFullList(getLevel());
  });
  clickButton("getProvinceLevelList", () => {
    getProvinceLevelList();
  });

  function getSleepTime() {
    return parseInt(sleepElement.value) || 100;
  }

  function getLevel() {
    return parseInt(levelElement.value) || 3;
  }

  // 获取请求头对象数据
  function getHeaderData() {
    try {
      return JSON.parse(headersElement.value);
    } catch (e) {
      return undefined;
    }
  }
  // 获取指定的省份对象数据
  function getProvinceData() {
    try {
      return JSON.parse(provinceElement.value);
    } catch (e) {
      return undefined;
    }
  }

  async function getProvinceLevelList() {
    const province = getProvinceData();
    if (province) {
      if (province.href) {
        const level = getLevel();
        const msg = `正在请求[${province.name}]\n解析会很耗时, 请稍后...`;
        notify(msg);
        resultElement.innerHTML = "";
        appendResult(msg);
        const uuid = "getFullList";
        await getProvinceList(province, level, uuid);
        removeArrayObjKey([province], "href");
        resultElement.innerHTML = tryJsonFormat(province);
        notify(`[${province.name}]请求完成`);
      } else {
        notify("省份信息的href属性未指定");
      }
    } else {
      notify("未指定省份信息");
    }
  }

  // ------网页内容解析提取---

  //获取所有区划信息
  async function getFullList(level) {
    const url = urlElement.value;
    const msg = `正在请求:${url}\n解析会很耗时, 请稍后...`;
    notify(msg);
    resultElement.innerHTML = "";
    appendResult(msg);
    const uuid = "getFullList";
    httpGet(url, uuid);
    let htmlText = await asyncAction();
    const provinceList = parseProvinceList(url, htmlText);
    for (let i = 0; i < provinceList.length; i++) {
      const province = provinceList[i]; //省份
      getProvinceList(province, level, uuid);
    }
    resultElement.innerHTML = tryJsonFormat(
      removeArrayObjKey(provinceList, "href")
    );
    notify("请求完成");
  }

  //获取指定省份下所有区划信息
  // [province] 省份信息
  // [level] 区划级别
  async function getProvinceList(province, level, uuid) {
    let htmlText;
    if (level > 1 && province.href) {
      appendResult(`正在请求:${province.href}`);
      httpGet(province.href, uuid);
      htmlText = await asyncAction();
      const cityList = parseCityList(province.href, htmlText); //城市
      province.children = cityList;

      await sleep(getSleepTime());
      for (let j = 0; j < cityList.length; j++) {
        const city = cityList[j];
        if (level > 2 && city.href) {
          appendResult(`正在请求:${city.href}`);
          httpGet(city.href, uuid);
          htmlText = await asyncAction();
          const countyList = parseCountyList(city.href, htmlText); //区县
          city.children = countyList;

          await sleep(getSleepTime());
          for (let k = 0; k < countyList.length; k++) {
            const county = countyList[k];
            if (level > 3 && county.href) {
              appendResult(`正在请求:${county.href}`);
              httpGet(county.href, uuid);
              htmlText = await asyncAction();
              const townList = parseTownList(county.href, htmlText); //乡镇
              county.children = townList;

              await sleep(getSleepTime());
              for (let l = 0; l < townList.length; l++) {
                const town = townList[l];
                if (level > 4 && town.href) {
                  appendResult(`正在请求:${town.href}`);
                  httpGet(town.href, uuid);
                  htmlText = await asyncAction();
                  const villageList = parseVillageList(town.href, htmlText); //村庄
                  town.children = villageList;

                  await sleep(getSleepTime());
                }
              }
            }
          }
        }
      }
    }
  }

  //休眠
  function sleep(time) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, time || 1000);
    });
  }

  //获取所有省份信息
  //[url] 网页地址
  function parseProvinceList(url, htmlText) {
    //获取url去除最后一个/后的内容
    const baseUrl = url.split("/").slice(0, -1).join("/");
    const dom = new DOMParser().parseFromString(htmlText, "text/html");
    const provinceElementList = dom.querySelectorAll(".provincetr");
    const result = [];
    provinceElementList.forEach((provinceLineElement) => {
      //获取a标签的href属性和文本
      const aElementList = provinceLineElement.querySelectorAll("a");
      //遍历a标签集合
      if (aElementList) {
        aElementList.forEach((aElement) => {
          let href = aElement.getAttribute("href");
          if (href) {
            href = baseUrl + "/" + href;
          }
          const province = {
            name: aElement.innerText,
            href: href,
          };
          padProvinceProperty(province);
          result.push(province);
        });
      }
    });
    return result;
  }

  //获取所有城市信息
  //[url] 对应的城市url
  function parseCityList(url, htmlText) {
    return parseGovTrTdList(url, htmlText, ".citytr");
  }

  //获取所有城市下区域信息
  function parseCountyList(url, htmlText) {
    return parseGovTrTdList(url, htmlText, ".countytr");
  }

  //获取所有城镇信息
  function parseTownList(url, htmlText) {
    return parseGovTrTdList(url, htmlText, ".towntr");
  }

  //获取所有村庄信息
  function parseVillageList(url, htmlText) {
    return parseGovTrTdList(url, htmlText, ".villagetr", "td");
  }

  //获取网页中的tr/td列表数据
  function parseGovTrTdList(url, htmlText, cssQuery, infoQuery) {
    //获取url去除最后一个/后的内容
    const baseUrl = url.split("/").slice(0, -1).join("/");
    const dom = new DOMParser().parseFromString(htmlText, "text/html");
    const elementList = dom.querySelectorAll(cssQuery);
    const result = [];
    elementList.forEach((lineElement) => {
      const aElementList = lineElement.querySelectorAll(infoQuery || "a");
      //第一个a标签是代码, 第二个a标签是名称
      if (aElementList.length >= 2) {
        const first = aElementList[0];
        const last = aElementList[aElementList.length - 1];
        let href = last.getAttribute("href");
        if (href) {
          href = baseUrl + "/" + href;
        }
        result.push(
          removeObjNullValue({
            code: first.innerText,
            name: last.innerText,
            href: href,
          })
        );
      }
    });
    return result;
  }

  //删除对象中的null值
  function removeObjNullValue(obj) {
    Object.keys(obj).forEach((key) => {
      if (obj[key] === null) {
        delete obj[key];
      }
    });
    return obj;
  }

  //遍历删除数组中对象中的指定key
  function removeArrayObjKey(array, key) {
    array.map((obj) => {
      //如果obj是数组, 则递归删除
      if (Array.isArray(obj)) {
        removeArrayObjKey(obj, key);
      }
      //如果是对象
      if (typeof obj === "object") {
        delete obj[key];
        //如果children是数组, 则递归删除
        if (Array.isArray(obj.children)) {
          removeArrayObjKey(obj.children, key);
        }
      }
    });
    return array;
  }

  function htmlGetText(htmlText, cssQuery) {
    const dom = new DOMParser().parseFromString(htmlText, "text/html");
    const elements = dom.querySelectorAll(cssQuery);
    const result = [];
    elements.forEach((element) => {
      //获取a标签的href属性
      result.push({
        name: element.innerText,
        href: element.querySelector("a")?.getAttribute("href"),
      });
    });
    return tryJsonFormat(result);
  }

  // end------网页内容解析提取---

  let lastResolveFunc = null;
  let lastRejectFunc = null;

  //创建一个异步回调, 并支持await语法
  function asyncAction() {
    return new Promise((resolve, reject) => {
      lastResolveFunc = resolve;
      lastRejectFunc = reject;
    });
  }

  //尝试使用json格式对象
  function tryJsonFormat(obj) {
    try {
      return JSON.stringify(obj, null, 4);
    } catch (e) {
      return obj;
    }
  }

  //尝试使用json解析并格式化,返回json字符串
  function tryJsonParse(text) {
    try {
      return JSON.stringify(JSON.parse(text), null, 4);
    } catch (e) {
      return text;
    }
  }

  //进行get请求
  //[uuid] 消息类型, 用来区分返回值
  function httpGet(url, uuid) {
    vscode.postMessage({
      command: "request",
      headers: tryJsonParse(headersElement.value),
      uuid: uuid || url,
      url: url,
    });
  }

  /**
   * 自动持久化输入控件
   * @param {string} id 控件的id
   * @param {string} key 持久化的key
   */
  function initTextInput(id, def = "") {
    const input = document.getElementById(id);
    input.addEventListener(`input`, () => {
      localStorage.setItem(id, input.value);
    });
    input.value = localStorage.getItem(id) || def;
  }

  /**
   * 点击一个按钮
   * @param {string} id
   * @param {*} action
   */
  function clickButton(id, action) {
    const element = document.getElementById(id);
    element.addEventListener("click", () => {
      action();
    });
  }

  /**拼接返回值 */
  function appendResult(text) {
    if (resultElement.innerHTML) {
      resultElement.innerHTML =
        resultElement.innerHTML + "\n" + "\n" + nowTimeString() + "\n" + text;
    } else {
      resultElement.innerHTML = nowTimeString() + "\n" + text;
    }
  }

  //发送通知给VSCode
  function notify(text) {
    vscode.postMessage({
      text: text,
    });
  }

  function nowTimeString(fmt) {
    return formatDate(new Date(), fmt || "yyyy-MM-dd HH:mm:ss'SSS");
  }

  //格式化时间
  function formatDate(date, fmt) {
    var o = {
      "M+": date.getMonth() + 1, //月份
      "d+": date.getDate(), //日
      "h+": date.getHours(), //小时
      "H+": date.getHours(), //小时
      "m+": date.getMinutes(), //分
      "s+": date.getSeconds(), //秒
      "q+": Math.floor((date.getMonth() + 3) / 3), //季度
      "S+": date.getMilliseconds(), //毫秒
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        (date.getFullYear() + "").substring(4 - RegExp.$1.length)
      );
    }
    for (var k in o) {
      if (new RegExp("(" + k + ")").test(fmt)) {
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length == 1
            ? o[k]
            : k === "S+"
            ? ("000" + o[k]).substring(3)
            : ("00" + o[k]).substring(("" + o[k]).length)
        );
      }
    }
    return fmt;
  }

  //补齐省份code
  function padProvinceProperty(province) {
    const code = province.code;
    if (code) {
      return;
    }
    const text = province.name;
    if (text === "北京市") {
      province["code"] = "11";
    } else if (text === "天津市") {
      province["code"] = "12";
    } else if (text === "河北省") {
      province["code"] = "13";
    } else if (text === "山西省") {
      province["code"] = "14";
    } else if (text === "内蒙古自治区") {
      province["code"] = "15";
    } else if (text === "辽宁省") {
      province["code"] = "21";
    } else if (text === "吉林省") {
      province["code"] = "22";
    } else if (text === "黑龙江省") {
      province["code"] = "23";
    } else if (text === "上海市") {
      province["code"] = "31";
    } else if (text === "江苏省") {
      province["code"] = "32";
    } else if (text === "浙江省") {
      province["code"] = "33";
    } else if (text === "安徽省") {
      province["code"] = "34";
    } else if (text === "福建省") {
      province["code"] = "35";
    } else if (text === "江西省") {
      province["code"] = "36";
    } else if (text === "山东省") {
      province["code"] = "37";
    } else if (text === "河南省") {
      province["code"] = "41";
    } else if (text === "湖北省") {
      province["code"] = "42";
    } else if (text === "湖南省") {
      province["code"] = "43";
    } else if (text === "广东省") {
      province["code"] = "44";
    } else if (text === "广西壮族自治区") {
      province["code"] = "45";
    } else if (text === "海南省") {
      province["code"] = "46";
    } else if (text === "重庆市") {
      province["code"] = "50";
    } else if (text === "四川省") {
      province["code"] = "51";
    } else if (text === "贵州省") {
      province["code"] = "52";
    } else if (text === "云南省") {
      province["code"] = "53";
    } else if (text === "西藏自治区") {
      province["code"] = "54";
    } else if (text === "陕西省") {
      province["code"] = "61";
    } else if (text === "甘肃省") {
      province["code"] = "62";
    } else if (text === "青海省") {
      province["code"] = "63";
    } else if (text === "宁夏回族自治区") {
      province["code"] = "64";
    } else if (text === "新疆维吾尔自治区") {
      province["code"] = "65";
    } else if (text === "台湾省") {
      province["code"] = "71";
    } else if (text === "香港特别行政区") {
      province["code"] = "81";
    } else if (text === "澳门特别行政区") {
      province["code"] = "82";
    }
  }
})();
