// Veřejná data se vkládají do webu při sestavení. Kontrolu obsahu dělá npm run check
// (schéma, security lint), web je proto čte bez další validace.
import countriesJson from "../../data/zeme.json";
import placesJson from "../../public/data/mista.json";
import tripsJson from "../../public/data/cesty.json";
import type { Country, Place, PlacesFile, Trip, TripsFile } from "./model";
import { computeStats, placeVisits } from "./stats";

const tripsFile = tripsJson as unknown as TripsFile;
const placesFile = placesJson as unknown as PlacesFile;
const countryList = countriesJson as Country[];

const countryByCode = new Map(countryList.map((c) => [c.iso, c]));
export const countryName = (code: string) => countryByCode.get(code)?.nazev ?? code;

export const dataAsOf = tripsFile.dataAsOf;
export const trips: readonly Trip[] = tripsFile.cesty;
export const places: readonly Place[] = placesFile.mista;
export const tripById = new Map(trips.map((t) => [t.id, t]));
export const placeById = new Map(places.map((p) => [p.id, p]));

export const stats = computeStats(trips, countryName, dataAsOf);
export const visits = placeVisits(trips, places);
