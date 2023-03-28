const path = require("path");
const fse = require("fs-extra");
const {UWProskomma} = require("uw-proskomma");
const EpiteleteHtml = require("../src/index").default;
const beautify = require('js-beautify').html;
import html2bcvPatch from "../src/html2bcvPatch";
import mergeBcvPatch2perf from "../src/mergeBcvPatch2perf";

const args = process?.argv?.slice(3)
const pk = new UWProskomma();

console.log("Loading source to proskomma...");
const succinctJson = fse.readJsonSync(path.resolve(path.join(__dirname, "..", "test", "test_data", "fra_lsg_succinct.json")));
const docSetId = "eBible/fra_fraLSG";
pk.loadSuccinctDocSet(succinctJson);

export const generateBcvPatch = async () => {
  const instance = new EpiteleteHtml({proskomma: pk, docSetId});
  const bookCode = (args[0] || "psa").toUpperCase();
  if (! args[0]) 
    console.log("\u001B[33m", `No book code provided, generating perfHtml for ${bookCode} instead...`, "\u001B[0m")
   else 
    console.log(`Generating perfHtml file...`);
  
  const perfHtml = await instance.readHtml(bookCode);
  const sequenceId = (args[1] === "main" || !args[1]) ? perfHtml.mainSequenceId : args[1];
 
  const bcvBookId = bookCode.toLowerCase()
  const chapter = 1
  const bcvQuery = { 
    book: { 
      [bcvBookId]: {
        ch: { 
              [chapter] : { /* v: { 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {} } */ },
              2 : {  } 
            }
      }
    } 
  }
  // ch: { [chapter] : { v: { 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {}, 8: {}, 9: {}, 10: {},
  // 11: {}, 12: {}, 13: {}, 14: {}, 15: {}, 16: {}, 17: {}, 18: {}, 19: {}, 20: {} } } } 
  const jsonPatch = html2bcvPatch(perfHtml, sequenceId, bcvQuery)
  console.dir(jsonPatch, { depth: null })

  // console.log("\u001B[32m", `✔ Bcv patch object for ${bookCode} chapter ${chapter} verses 1 and 2`, "\u001B[0m");
  console.log("\u001B[32m", `✔ Bcv patch object for ${bookCode} chapter ${chapter}`, "\u001B[0m");

  const prevPerf = await instance.readPerf(bookCode, {})
  const perf = mergeBcvPatch2perf(prevPerf, jsonPatch, sequenceId);
  await instance.writePerf(bookCode, sequenceId, perf, {});
  const perfHtmlEdited = await instance.readHtml(bookCode, {});
  const output = {
    content: sequenceId ? beautify(perfHtmlEdited.sequencesHtml[sequenceId]) : JSON.stringify(perfHtmlEdited, undefined, 2),
    ext: sequenceId ? "html" : "json"
  };

  const dir = path.resolve(__dirname, "..", "test", "test_data", "generated");
  if (! fse.pathExistsSync(dir)) 
    fse.mkdirSync(dir);
  
  const safeDocSetId = instance.docSetId.replace("/", "-");
  const fileName = `${bookCode}-${safeDocSetId}-${sequenceId && `${sequenceId}-`}perfhtml_edited_v${perfHtml.schema.structure_version}.${output.ext}`;
  const filePath = path.resolve(dir, fileName);
  fse.writeFileSync(filePath, output.content, {encoding: 'utf8'});
  console.log("\u001B[32m", `✔ HTML file generated for ${bookCode} at ${filePath}`, "\u001B[0m");
};

if (process?.argv?.length) generateBcvPatch();
