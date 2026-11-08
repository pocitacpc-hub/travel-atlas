import { join } from "node:path";
import { root } from "./atlas-data";

export const flagPackage = join(root, "node_modules", "flag-icons");

/** Cesta ke zdrojovému SVG vlajky z číselníku (`flags/4x3/xx.svg`) v balíčku flag-icons. */
export const flagSource = (vlajka: string) => join(flagPackage, ...vlajka.split("/"));
