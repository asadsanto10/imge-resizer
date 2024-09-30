// resizeWorker.js
import axios from "axios";
import sharp from "sharp";
import { parentPort } from "worker_threads";

parentPort.on("message", async (data) => {
  const { imageUrl, widthInt } = data;

  try {
    const imageResponse = await axios({
      url: imageUrl,
      responseType: "arraybuffer",
    });

    const imageResize = await sharp(imageResponse.data)
      .resize(widthInt)
      .jpeg() // Convert to JPEG format
      .toBuffer();

    parentPort.postMessage({ success: true, image: imageResize });
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  }
});
