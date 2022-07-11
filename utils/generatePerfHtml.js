const path = require("path");
const fse = require("fs-extra");
const {UWProskomma} = require("uw-proskomma");
const EpiteletePerfHtml = require("../src/index").default;
const beautify = require('js-beautify').html;

const args = process?.argv?.slice(3)
const pk = new UWProskomma();

console.log("Loading source to proskomma...");
const succinctJson = fse.readJsonSync(path.resolve(path.join(__dirname, "..", "test", "test_data", "fra_lsg_succinct.json")));
const docSetId = "eBible/fra_fraLSG";
// const succinctJson = fse.readJsonSync(path.resolve(path.join(__dirname, "..", "test", "test_data", "eng_engWEBBE_succinct.json")));
// const docSetId = "DBL/eng_engWEBBE";
pk.loadSuccinctDocSet(succinctJson);

export const generatePerfHtml = async () => {
  const instance = new EpiteletePerfHtml({proskomma: pk, docSetId});
  const bookCode = (args[0] || "psa").toUpperCase();
  if (! args[0]) 
    console.log("\u001B[33m", `No book code provided, generating perfHtml for ${bookCode} instead...`, "\u001B[0m")
   else 
    console.log(`Generating perfHtml file...`);
  
  const perfHtml = await instance.readHtml(bookCode);
  const sequenceId = args[1] || perfHtml.mainSequenceId;
  const dir = path.resolve(__dirname, "..", "test", "test_data", "generated");
  if (! fse.pathExistsSync(dir)) 
    fse.mkdirSync(dir);
  
  const safeDocSetId = instance.docSetId.replace("/", "-");
  const fileName = `${bookCode}-${safeDocSetId}-perf_v${perfHtml.schema.structure_version}.html`;
  const filePath = path.resolve(dir, fileName);
  fse.writeFileSync(filePath, beautify(perfHtml.sequencesHtml[sequenceId]), {encoding: 'utf8'});
  console.log("\u001B[32m", `✔ HTML file generated for ${bookCode} at ${filePath}`, "\u001B[0m");
};

if (process?.argv?.length) generatePerfHtml();
