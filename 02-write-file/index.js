const process = require("node:process");
const readline = require("node:readline/promises");
const fs = require("fs");
const path = require("path");

const newTextPath = path.join(__dirname, "newText.txt");

async function run() {
  process.stdout.write("Hello, print text:\n");
  process.stdin.on("data", (data) => {
    const text = data.toString();
    if (text.trim() === "exit") {
      process.stdout.write("Bye, see you later");
      process.exit();
    }

    fs.appendFile(newTextPath, text, (err) => {
      if (err) throw err;
    });
  });

  process.on("SIGINT", () => {
    process.stdout.write("\nBye, see you later");
    process.exit();
  });
}

run();
