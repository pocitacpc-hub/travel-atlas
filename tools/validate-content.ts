import { checkPublic, loadCatalog } from "./atlas-data";
import { readPublicData } from "./public-data";

try {
  const catalog = loadCatalog();
  const publicData = readPublicData();
  if (publicData) {
    const { trips, places } = checkPublic(...publicData, catalog);
    console.log(`Veřejná data odpovídají schématu: ${trips.cesty.length} cest, ${places.mista.length} míst.`);
  } else {
    console.log("Číselníky jsou platné. Veřejná data zatím nejsou připravená k publikaci.");
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : "Kontrola obsahu selhala.");
  process.exitCode = 1;
}
