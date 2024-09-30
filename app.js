import express from "express";
import path from "path";

import { Worker } from "worker_threads";

const app = express();

app.get("/", (req, res) => {
  res.send("all okk");
});

const runWorker = (workerData) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.resolve("./", "resizeWorker.js"));
    worker.postMessage(workerData);

    worker.on("message", (message) => {
      if (message.success) {
        resolve(Buffer.from(message.image));
      } else {
        // res.status(500).send("internal server error::" + message.error);
        reject(message.error);
      }

      worker.terminate();
    });

    // Handle worker errors
    worker.on("error", (error) => {
      console.error({ error });
      reject(error);
      // res.status(500).send("internal server error");
      worker.terminate();
    });

    // Handle if the worker exits unexpectedly
    worker.on("exit", (code) => {
      // console.log({ code });
      if (code !== 0) {
        // console.error(`Worker stopped with exit code ${code}`);
        reject(new Error(`Worker stopped with exit code ${code}`));
        worker.terminate();
        // res.status(500).send("internal server error");
      }
    });
  });
};

app.get("/image-resize", async (req, res) => {
  const { imageUrl, width } = req.query;

  if (!imageUrl || !width) {
    res.status(400).send("invalid query");
  }

  const widthInt = parseInt(width);

  const image = await runWorker({ imageUrl, widthInt });
  console.log({ image });

  res.set("Content-Type", "image/jpeg");
  res.status(200).send(image);
  return;

  const worker = new Worker(path.resolve("./", "resizeWorker.js"));
  worker.postMessage({ imageUrl, widthInt });

  worker.on("message", (message) => {
    if (message.success) {
      res.set("Content-Type", "image/jpeg");
      res.status(200).send(Buffer.from(message.image));
      console.log(Buffer.from(message.image));
    } else {
      res.status(500).send("internal server error::" + message.error);
    }

    // Terminate the worker after the task is done
    worker.terminate();
  });

  // // Handle worker errors
  worker.on("error", (error) => {
    console.error(error);
    res.status(500).send("internal server error");
    worker.terminate();
  });

  // Handle if the worker exits unexpectedly
  worker.on("exit", (code) => {
    console.log({ code });
    if (code !== 0) {
      console.error(`Worker stopped with exit code ${code}`);
      worker.terminate();
      // res.status(500).send("internal server error");
    }
  });

  // try {
  //   const imageResponse = await axios({
  //     url: imageUrl,
  //     responseType: "arraybuffer",
  //   });

  //   const imageResize = await sharp(imageResponse.data)
  //     .resize(widthInt)
  //     .toBuffer();

  //   // console.log({ imageResize });

  //   res.set("Content-Type", "image/jpeg");
  //   console.log({ imageResize });
  //   res.status(200).send(imageResize);
  // } catch (error) {
  //   // console.log(error);
  //   res.status(500).send("internal server error::" + JSON.stringify(error));
  // }
});

// app.get("/image-resize", async (req, res) => {
//   const { imageUrl, width } = req.query;

//   // Validate query parameters
//   if (!imageUrl || !width) {
//     return res.status(400).send("invalid query");
//   }

//   const widthInt = parseInt(width);
//   if (isNaN(widthInt) || widthInt <= 0) {
//     return res.status(400).send("invalid width parameter");
//   }

//   // Create a new Worker for each image resizing task
//   const worker = new Worker(path.resolve("./", "resizeWorker.js"));

//   // Send the image URL and width to the worker
//   worker.postMessage({ imageUrl, widthInt });

//   // Handle message from the worker
//   worker.on("message", (message) => {
//     if (message.success) {
//       console.log({ message });
//       // Successfully resized the image
//       res.set("Content-Type", "image/jpeg");
//       res.status(200).send(message.image);
//     } else {
//       // Failed to resize the image
//       res.status(500).send("internal server error: " + message.error);
//     }

//     // Terminate the worker after the task is done
//     worker.terminate();
//   });

//   // Handle worker errors
//   worker.on("error", (error) => {
//     console.error(error);
//     res.status(500).send("internal server error");
//     worker.terminate();
//   });

//   // Handle if the worker exits unexpectedly
//   // worker.on("exit", (code) => {
//   //   if (code !== 0) {
//   //     console.error(`Worker stopped with exit code ${code}`);
//   //     res.status(500).send("internal server error");
//   //   }
//   // });
// });

app.listen(5001, () => {
  console.log("listening on port:: 5001");
});
