// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {
  console.log("初始化laserPeckerParsePanel.js", window)

  const dataText = document.getElementById("data")
  const resultText = document.getElementById("result")
  const formatButton = document.getElementById("format")
  const formatDataButton = document.getElementById("formatData")
  const removeImageButton = document.getElementById("removeImage")
  const extractImageButton = document.getElementById("extractImage")
  const imageWrap = document.getElementById("imageWrap")

  //
  formatButton.addEventListener("click", (event) => {
    resultText.value = JSON.stringify(JSON.parse(dataText.value), null, 4)
  })
  formatDataButton.addEventListener("click", (event) => {
    const dataString = JSON.parse(dataText.value).data
    const data = JSON.parse(dataString)
    resultText.value = JSON.stringify(data, null, 4)
  })
  removeImageButton.addEventListener("click", (event) => {
    const data = JSON.parse(dataText.value)
    delete data.preview_img
    const dataString = data.data
    const array = JSON.parse(dataString)
    array.forEach((item) => {
      delete item.imageOriginal
      delete item.src
    })

    delete data.data
    const newData = {
      ...data,
      data: array
    }
    resultText.value = JSON.stringify(newData, null, 4)
  })
  extractImageButton.addEventListener("click", (event) => {
    clearAllImage()
    const data = JSON.parse(dataText.value)
    appendImage(data.preview_img)
    delete data.preview_img

    const dataString = data.data
    const array = JSON.parse(dataString)
    array.forEach((item) => {
      const imageOriginal = item.imageOriginal
      const src = item.src

      delete item.imageOriginal
      delete item.src

      appendImage(imageOriginal, item)
      appendImage(src, item)
    })
  })

  //
  window.addEventListener("message", (event) => {
    const message = event.data // The json data that the extension sent
    console.log("message->", message)
  })

  //清空所有图片
  function clearAllImage() {
    while (imageWrap.hasChildNodes()) {
      imageWrap.removeChild(imageWrap.firstChild)
    }
  }

  //添加一个base64图片展示
  function appendImage(base64, des) {
    if (base64) {
      //创建img容器
      const img = new Image()
      //给img容器引入base64的图片
      img.src = base64
      img.alt = JSON.stringify(des, null, 4)
      img.title = img.alt

      //将img容器添加到html的节点中。
      imageWrap.appendChild(img)
    }
  }

})()
