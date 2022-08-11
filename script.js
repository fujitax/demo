async function main() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
      },
    });
    <video id="video" autoplay playsinline />
    const video = document.getElementById("video");
    const offscreen = document.createElement("canvas");
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      video.play();
      const canvas = document.getElementById("rendering");
      canvas.width = offscreen.width = video.videoWidth;
      canvas.height = offscreen.height = video.videoHeight;
      const renderingCtx = canvas.getContext("2d");
      const offscreenCtx = offscreen.getContext("2d");
      
      const trimOriginalSize = document.createElement("canvas");
      const trimOriginalSizeCtx = trimOriginalSize.getContext("2d");
      const foundRect = document.getElementById("found");
      const foundRectCtx = foundRect.getContext("2d");
      
      foundRect.onclick = () => {
        const base64 = trimOriginalSize.toDataURL("image/jpeg");
        navigator.clipboard.writeText(base64);
        alert(base64);
      };
      
      const trimFromVideo = (x, y, width, height) => {
        trimOriginalSize.width = width;
        trimOriginalSize.height = height;
        trimOriginalSizeCtx.drawImage(offscreen, x, y, width, height, 0, 0, width, height);
        
        foundRectCtx.drawImage(offscreen, x, y, width, height, 0, 0, foundRect.width, foundRect.height);
      };
      
      const tick = () => {
        try {
          offscreenCtx.drawImage(video, 0, 0);
          let src = cv.imread(offscreen);
          let dst = new cv.Mat();
          cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
          cv.threshold(dst, dst, 0, 255, cv.THRESH_OTSU);
          let contours = new cv.MatVector();
          let hierarchy = new cv.Mat();
          cv.findContours(dst, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_TC89_L1);

          dst.delete();
          dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
          for (let i = 0; i < contours.size(); i++) {
            const area = cv.contourArea(contours.get(i), false);
            if (area > 15000) {
              let approx = new cv.Mat();
              cv.approxPolyDP(contours.get(i), approx, 0.01 * cv.arcLength(contours.get(i), true), true);
              if (approx.size().width === 1 && approx.size().height === 4) {
                cv.drawContours(dst, contours, i, new cv.Scalar(255, 0, 0, 255), 4, cv.LINE_8, hierarchy, 100);
                const {x, y , width, height} = cv.boundingRect(contours.get(i));
                trimFromVideo(x, y , width, height);
              } else {
                cv.drawContours(dst, contours, i, new cv.Scalar(0, 255, 0, 255), 1, cv.LINE_8, hierarchy, 100);
              }
              approx.delete();
            }
          }

          cv.imshow(canvas, dst);
          src.delete();
          dst.delete();
          hierarchy.delete();
          contours.delete();
        } catch (e) {
          console.error(e);
          if (e.stack) {
            console.log(e.stack);
          }
        } finally {
          window.requestAnimationFrame(tick);
        }
      };
      tick();
    };

  } catch (e) {
    console.error(e);
  }
}

main()
