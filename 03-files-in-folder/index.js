const fs = require("fs");
const path = require("path");
const process = require("process");

const folderPath = path.join(__dirname, "secret-folder");

const printFileInfo = (name, ext, size) => {
  const text = `${name} - ${ext} - ${size}kb\n`;
  process.stdout.write(text);
};

fs.readdir(folderPath, (err, files) => {
  if (err) console.log(err);
  else {
    files.forEach((file) => {
      const curPath = path.join(folderPath, file);
      fs.stat(curPath, (err, stats) => {
        if (err) {
          throw Error(err);
        } else {
          if (stats.isFile()) {
            const extension = path
              .extname(path.join(folderPath, file))
              .slice(1);
            const { size } = stats;
            const convertedSize = size * 0.0009765625;
            const dotIdx = file.lastIndexOf(".");
            let fileName = file;
            if (dotIdx > -1) {
              fileName = file.slice(0, dotIdx);
            }
            printFileInfo(fileName, extension, convertedSize);
          }
        }
      });
    });
  }
});
