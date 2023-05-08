const path = require("path");
const fs = require("fs/promises");

const originalFileName = "assets";
const copyFileName = "assets";

const buildPath = path.join(__dirname, "project-dist");
const cssBundlePath = path.join(buildPath, "style.css");
const startStylesPath = path.join(__dirname, "styles");
const filesPath = path.join(__dirname, originalFileName);
const copyFilesPath = path.join(buildPath, copyFileName);
const htmlTemplatePath = path.join(__dirname, "template.html");
const pathToComponents = path.join(__dirname, "components");
let componentsHash = {};

const createTemplateHash = async (pathToComponents) => {
  const componentsHash = {};
  try {
    const files = await fs.readdir(pathToComponents);
    for (const file of files) {
      const pathToFile = path.join(pathToComponents, file);
      const fileStat = await fs.stat(pathToFile);
      if (fileStat.isFile() && path.extname(file).slice(1) === "html") {
        const data = await fs.readFile(pathToFile, "utf-8");
        const dotIdx = file.lastIndexOf(".");
        let fileName = file;
        if (dotIdx > -1) {
          fileName = file.slice(0, dotIdx);
        }
        componentsHash[fileName] = data;
      }
    }
  } catch (error) {
    console.error(error);
  }
  return componentsHash;
};

const changeTemplateToLayout = (layout, componentsHash) => {
  let keys = Object.keys(componentsHash);
  let result = "";
  let left = 0;
  let right = 0;

  while (right < layout.length) {
    if (layout[left] === "{" && layout[left + 1] === "{") {
      let currentKey = "";
      while (layout[right] !== "}" && right < layout.length) {
        if (layout[right] !== "{") currentKey += layout[right];
        right++;
      }
      if (layout[right] === "}" && layout[right + 1] === "}") {
        currentKey = currentKey.trim();
        result += componentsHash[currentKey] ? componentsHash[currentKey] : "";
      }
      right += 2;
      left = right;
    } else {
      result += layout[left];
      left++;
      right++;
    }
  }

  return result;
};

const createHtmlFromTemplte = async (
  templatePath,
  buildPath,
  componentsHash
) => {
  let resultLayout = "";
  const fd = await fs.open(templatePath);
  const stream = await fd.createReadStream("utf-8");
  stream.on("data", (data) => {
    const newStr = data.toString();
    resultLayout += data;
  });
  stream.on("end", () => {
    const newLayout = changeTemplateToLayout(resultLayout, componentsHash);
    const pathName = path.join(buildPath, "index.html");
    fs.appendFile(pathName, newLayout, "utf-8");
  });
};

const helperCssBundle = async (startPath, endPath) => {
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
  helperCssBundle(startPath, endPath);
};

const copyFile = async (pathToFile, pathToCopyFile) => {
  const files = await fs.readdir(pathToFile);
  try {
    for await (let file of files) {
      const filePath = path.join(pathToFile, file);
      const copyFilePath = path.join(pathToCopyFile, file);
      const stat = await fs.stat(filePath);
      if (stat.isFile()) {
        fs.copyFile(filePath, copyFilePath);
      } else {
        await fs.mkdir(copyFilePath, { recursive: true });
        copyFile(filePath, copyFilePath);
      }
    }
  } catch (err) {
    console.log(err);
  }
};

async function run(path) {
  const hash = await createTemplateHash(pathToComponents);
  await fs.rm(path, { recursive: true, force: true });
  await fs.mkdir(buildPath);
  await createHtmlFromTemplte(htmlTemplatePath, buildPath, hash);
  await createCssBundle(startStylesPath, cssBundlePath);
  await copyFile(filesPath, copyFilesPath);
}

run(buildPath);
