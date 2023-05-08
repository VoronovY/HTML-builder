const fs = require("fs");
const path = require("path");
const process = require("process");

const textPath = path.join(__dirname, "text.txt");
const readableStream = fs.createReadStream(textPath, "UTF-8");

readableStream.on("data", (chunk) => process.stdout.write(chunk));
readableStream.on("end", () => process.stdout.write("\n"));
readableStream.on("error", (err) => {
  process.stdout.write("При выполнении кода возникла ошибка:\n");
  process.stdout.write(err.toString());
});
