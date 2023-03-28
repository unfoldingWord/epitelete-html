const path = require("path");
const fse = require("fs-extra");
const {UWProskomma} = require("uw-proskomma");
const EpiteleteHtml = require("../src/index").default;
const beautify = require('js-beautify').html;

const args = process?.argv?.slice(3)
const pk = new UWProskomma();

console.log("Loading source to proskomma...");
const succinctJson = fse.readJsonSync(path.resolve(path.join(__dirname, "..", "test", "test_data", "fra_lsg_succinct.json")));
const docSetId = "eBible/fra_fraLSG";
pk.loadSuccinctDocSet(succinctJson);

export const generatePerfHtml = async () => {
  const instance = new EpiteleteHtml({proskomma: pk, docSetId});
  const bookCode = (args[0] || "psa").toUpperCase();
  if (! args[0]) 
    console.log("\u001B[33m", `No book code provided, generating perfHtml for ${bookCode} instead...`, "\u001B[0m")
   else 
    console.log(`Generating perfHtml file...`);
  
  const perfHtml = await instance.readHtml(bookCode);
  const sequenceId = (args[1] === "main" || !args[1]) ? perfHtml.mainSequenceId : args[1];

  const output = {
    content: sequenceId ? beautify(perfHtml.sequencesHtml[sequenceId]) : JSON.stringify(perfHtml, undefined, 2),
    ext: sequenceId ? "html" : "json"
  };

  const dir = path.resolve(__dirname, "..", "test", "test_data", "generated");
  if (! fse.pathExistsSync(dir)) 
    fse.mkdirSync(dir);
  
  const safeDocSetId = instance.docSetId.replace("/", "-");
  const fileName = `${bookCode}-${safeDocSetId}-${sequenceId && `${sequenceId}-`}perfhtml_v${perfHtml.schema.structure_version}.${output.ext}`;
  const filePath = path.resolve(dir, fileName);
  fse.writeFileSync(filePath, output.content, {encoding: 'utf8'});
  console.log("\u001B[32m", `✔ HTML file generated for ${bookCode} at ${filePath}`, "\u001B[0m");
};

if (process?.argv?.length) generatePerfHtml();
