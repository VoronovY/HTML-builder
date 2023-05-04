const fs = require('node:fs');
const path = require('path');
const process = require('process');

const textPath = path.join(__dirname, 'text.txt');
const readableStream = fs.createReadStream(textPath, 'UTF-8');
readableStream.on('data', chunk => process.stdout.write(chunk));
