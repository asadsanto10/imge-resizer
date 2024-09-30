// imageWorker.js
import axios from "axios";
import sharp from "sharp";
import { parentPort, workerData } from "worker_threads";

(async () => {
  try {
    const { imageUrl, width } = workerData;
    const imageResponse = await axios({
      url: imageUrl,
      responseType: "arraybuffer",
    });

    const imageResize = await sharp(imageResponse.data)
      .resize(width)
      .toBuffer();

    parentPort.postMessage({ status: "success", data: imageResize });
  } catch (error) {
    parentPort.postMessage({ status: "error", error: error.message });
  }
})();
