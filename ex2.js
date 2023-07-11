#!/usr/bin/env node
"use strict";

import minimist from "minimist";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { Transform } from "stream";
// import util from "util";

let args = minimist(process.argv.slice(2), {
  boolean: ["help", "in", "out"], // * in - get input from stdin
  string: ["file"],
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // * custom __dirname, because it is not available in an ES module
const BASEPATH = path.resolve(process.env.BASEPATH || __dirname); // * process.env.BASEPATH is a constant you pass when executing the script
const OUTFILE = path.join(BASEPATH, "out.txt");

if (args.help) {
  printHelp();
} else if (args.in || args._.includes("-")) {
  processFile(process.stdin);
} else if (args.file) {
  let myReadStream = fs.createReadStream(path.join(BASEPATH, args.file));
  processFile(myReadStream);
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
  console.log("--out      print to stdout");
}

function printErr(message, showHelp = false) {
  console.error(message);
  showHelp && printHelp();
}

function processFile(inStream) {
  let outStream = inStream; // * this inStream is a readable

  // * this upperCaseStream is a writable
  let upperCaseStream = new Transform({
    transform(chunk, encoding, next) {
      this.push(chunk.toString().toUpperCase());
      next();
    },
  });

  outStream = outStream.pipe(upperCaseStream);

  let targetStream;

  if (args.out) {
    targetStream = process.stdout;
  } else {
    targetStream = fs.createWriteStream(OUTFILE);
  }

  outStream.pipe(targetStream);
}
