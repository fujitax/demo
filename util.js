/**
 * Canvas合成
 *
 * @param {string} base 合成結果を描画するcanvas(id)
 * @param {array} asset 合成する素材canvas(id)
 * @return {void}
 */
async function concatCanvas(base, asset){
  const canvas = document.querySelector(base);
  const ctx = canvas.getContext("2d");

  for(let i=0; i<asset.length; i++){
    const image1 = await getImagefromCanvas(asset[i]);
    ctx.drawImage(image1, 0, 0, canvas.width, canvas.height);
  }
}

/**
 * Canvasを画像として取得
 *
 * @param {string} id  対象canvasのid
 * @return {object}
 */
function getImagefromCanvas(id){
  return new Promise((resolve, reject) => {
    const image = new Image();
    const ctx = document.querySelector(id).getContext("2d");
    image.onload = () => resolve(image);
    image.onerror = (e) => reject(e);
    image.src = ctx.canvas.toDataURL();
  });
}


/**
 * Canvasを画像としてダウンロード
 *
 * @param {string} id          対象とするcanvasのid
 * @param {string} [type]      画像フォーマット
 * @param {string} [filename]  DL時のデフォルトファイル名
 * @return {void}
 */
function canvasDownload(id, type="image/png", filename="photo"){
  const blob    = getBlobFromCanvas(id, type);       // canvasをBlobデータとして取得
  const dataURI = window.URL.createObjectURL(blob);  // Blobデータを「URI」に変換

  // JS内部でクリックイベントを発動→ダウンロード
  const event = document.createEvent("MouseEvents");
  event.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  const a = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
  a.href = dataURI;         // URI化した画像
  a.download = filename;    // デフォルトのファイル名
  a.dispatchEvent(event);   // イベント発動
}

/**
  * 現状のCanvasを画像データとして返却
  *
  * @param {string}  id     対象とするcanvasのid
  * @param {string}  [type] MimeType
  * @return {blob}
  */
function getBlobFromCanvas(id, type="image/png"){
  const canvas = document.querySelector(id);
  const base64 = canvas.toDataURL(type);              // "data:image/png;base64,iVBORw0k～"
  const tmp  = base64.split(",");                     // ["data:image/png;base64,", "iVBORw0k～"]
  const data = atob(tmp[1]);                          // 右側のデータ部分(iVBORw0k～)をデコード
  const mime = tmp[0].split(":")[1].split(";")[0];    // 画像形式(image/png)を取り出す

  // Blobのコンストラクタに食わせる値を作成
  let buff = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    buff[i] = data.charCodeAt(i);
  }

  return(
    new Blob([buff], { type: mime })
  );
}