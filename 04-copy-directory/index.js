const path = require("path");
const fs = require("fs");

const originalFileName = "files";
const copyFileName = "files-copy";

const filesPath = path.join(__dirname, originalFileName);
const copyFilesPath = path.join(__dirname, copyFileName);

const helper = (pathToFile) => {
  const curPath = path.join(filesPath, ...pathToFile);
  const copyPath = path.join(copyFilesPath, ...pathToFile);
  fs.readdir(curPath, (err, files) => {
    if (err) console.log(err);
    files.forEach((file) => {
      const filePath = path.join(curPath, file);
      fs.stat(filePath, (err, stats) => {
        if (err) console.log(Error(err));
        if (stats.isFile()) {
          fs.copyFile(
            path.join(curPath, file),
            path.join(copyPath, file),
            () => {}
          );
        } else {
          fs.mkdir(path.join(copyPath, file), { recursive: true }, (err) => {
            if (err) throw err;
          });
          helper([...pathToFile, file]);
        }
      });
    });
  });
};

fs.rm(copyFilesPath, { recursive: true, force: true }, () => {
  fs.mkdir(copyFilesPath, { recursive: true }, (err) => {
    if (err) throw err;
    helper([]);
  });
});
