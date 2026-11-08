// Typy veřejných dat. Datový kontrakt definují schémata a tools/atlas-data.ts,
// web z něj přebírá jen typy (při sestavení se odstraní).
export type { Focus, Place, PlacesFile, Precision, Trip, TripsFile } from "../../tools/atlas-data";

export interface Country {
  nazev: string;
  iso: string;
  vlajka: string;
}
