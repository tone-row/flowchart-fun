#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { Command } from "commander";
import generate from "./generate";

// import { generate } from "./generate";
const program = new Command();

program
  .requiredOption("-i, --input <input>", "input text file")
  .requiredOption("-o, --output <output>", "output svg file");

program.parse(process.argv);

const { input, output } = program.opts();
const outputPath = path.resolve(process.cwd(), output);

const text = fs.readFileSync(path.resolve(process.cwd(), input), "utf-8");

generate({ text, outputPath });
