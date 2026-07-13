import { readFile } from "node:fs/promises";

const file = process.argv[2];
if (!file) throw new Error("Pass an example JSON file");

const value = JSON.parse(await readFile(file, "utf8"));
console.log(JSON.stringify(value, null, 2));
