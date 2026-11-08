import { lstatSync, readdirSync } from "node:fs";

const directory = new URL("../public/data", import.meta.url);
const exists = lstatSync(directory, { throwIfNoEntry: false }) !== undefined;

if (exists && readdirSync(directory).length > 0) {
  console.error("public/data musí zůstat prázdná, dokud nebude zavedená validace datového schématu.");
  process.exitCode = 1;
} else {
  console.log("Veřejná data zatím nejsou připravená k publikaci.");
}
