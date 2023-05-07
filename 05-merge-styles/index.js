const path = require("path");
const fs = require("fs/promises");

const cssBundlePath = path.join(__dirname, "project-dist", "bundle.css");
const startedPath = path.join(__dirname, "styles");

const helper = async (startPath, endPath) => {
  const files = await fs.readdir(startPath, { withFileTypes: true });
  try {
    for await (let file of files) {
      const curFilePath = path.join(startPath, file.name);
      if (!file.isFile()) {
        continue;
      }
      if (path.extname(curFilePath) === ".css") {
        const fd = await fs.open(curFilePath);
        const readableStream = fd.createReadStream();
        readableStream.on("data", (data) => {
          fs.appendFile(endPath, data, (err) => {
            if (err) throw err;
          });
        });
      }
    }
  } catch (err) {
    console.log(err);
  }
};

const createCssBundle = async (startPath, endPath) => {
  await fs.writeFile(endPath, "");
  helper(startPath, endPath);
};

createCssBundle(startedPath, cssBundlePath);
