const path = require("path");
require("isomorphic-fetch");

class Api {
  async fetchUrlChildrenList(api) {
    const req = await fetch(api);
    const josn = await req.json();

    const childrenList = josn.data
      .filter((item) => item.enable)
      .map((item) => {
        return {
          label: item.label,
          iconPath: path.join(__filename, "..", "..", "res", "web.svg"),
          command: {
            command: "angcyo.openUrl",
            title: "",
            arguments: [item.url],
          },
          tooltip: item.url,
          //description: item.url,
        };
      });
    return childrenList;
  }
}

exports.Api = new Api();
