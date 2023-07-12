#!/usr/bin/env node
"use strict";

import minimist from "minimist";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { Transform } from "stream";
import zlib from "zlib";
// import util from "util";

let args = minimist(process.argv.slice(2), {
  boolean: ["help", "in", "out", "compress", "uncompress"], // * in - get input from stdin
  string: ["file"],
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // * custom __dirname, because it is not available in an ES module
const BASEPATH = path.resolve(process.env.BASEPATH || __dirname); // * process.env.BASEPATH is a constant you pass when executing the script
let OUTFILE = path.join(BASEPATH, "out.txt");

if (args.help) {
  printHelp();
} else if (args.in || args._.includes("-")) {
  processFile(process.stdin)
    .then(() => {
      console.log("");
      console.log("Completed processing stdin");
    })
    .catch((err) => console.error(err));
} else if (args.file) {
  let myReadStream = fs.createReadStream(path.join(BASEPATH, args.file));
  processFile(myReadStream)
    .then(() => {
      console.log("");
      console.log("Completed processing file");
    })
    .catch((err) => console.error(err));
} else {
  printErr("incorrect usage");
}

// *****
function printHelp() {
  console.log("Usage of ex3.js");
  console.log("");
  console.log("  ex3.js --help");
  console.log("");
  console.log("--help          print out here help stuff");
  console.log("--file           process the file");
  console.log("--in, -         process stdin");
  console.log("--out           print to stdout");
  console.log("--compress      compress output file");
  console.log("--uncompress    uncompress input file");
}

function printErr(message, showHelp = false) {
  console.error(message);
  showHelp && printHelp();
}

function streamComplete(stream) {
  return new Promise((resolve, reject) => {
    stream.on("end", () => {
      resolve();
    });
    // stream.on("end", resolve);
  });
}

async function processFile(inStream) {
  let outStream = inStream; // * this inStream is a readable

  // * this upperCaseStream is a writable
  let upperCaseStream = new Transform({
    transform(chunk, encoding, next) {
      this.push(chunk.toString().toUpperCase());
      next();
    },
  });

  outStream = outStream.pipe(upperCaseStream);

  if (args.compress) {
    let gzipStream = zlib.createGzip();
    outStream = outStream.pipe(gzipStream);
    OUTFILE = String(OUTFILE) + ".gz";
  }

  if (args.uncompress) {
    let unzippedStream = zlib.createGunzip();
    outStream = outStream.pipe(unzippedStream);
  }

  let targetStream;
  if (args.out) {
    targetStream = process.stdout;
  } else {
    targetStream = fs.createWriteStream(OUTFILE);
  }

  outStream.pipe(targetStream);

  await streamComplete(outStream);
}
