#!/usr/bin/env node
"use strict";

import minimist from "minimist";
import path from "path";
import fs from "fs";
import getStdin from "get-stdin";
import { fileURLToPath } from "url";
// import util from "util";

let args = minimist(process.argv.slice(2), {
  boolean: ["help", "in"], // * in - get input from stdin
  string: ["file"],
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // * custom __dirname, because it is not available in an ES module
const BASEPATH = path.resolve(process.env.BASEPATH || __dirname); // * process.env.BASEPATH is a constant you pass when executing the script

if (args.help) {
  printHelp();
}
//* args._ is an array from minimist with inputs that doesn't know how to process (like -). Single - in node scripts usually means process stdin
else if (args.in || args._.includes("-")) {
  processStdin();
} else if (args.file) {
  readFile(path.resolve(args.file));
} else {
  printErr("incorrect usage");
}

// *****
function printHelp() {
  console.log("Usage of ex1.js");
  console.log("");
  console.log("  ex1.js --help");
  console.log("");
  console.log("--help     print out here help stuff");
  console.log("--file      process the file");
  console.log("--in, -    process stdin");
}

function printErr(message, showHelp = false) {
  console.error(message);
  showHelp && printHelp();
}

function readFile(filePath) {
  let finalFilePath = path.join(BASEPATH, filePath);
  fs.readFile(finalFilePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
    }

    data = data.toString().toUpperCase();
    console.log(data);
  });
}

function processStdin() {
  getStdin()
    .then((data) => {
      console.log(data.toString());
    })
    .catch((error) => {
      console.error(error);
    });
}
