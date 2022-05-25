const test = require("tape");
const path = require("path");
const fse = require("fs-extra");
const {UWProskomma} = require("uw-proskomma");
const EpiteletePerfHtml = require("../../src/index").default;

const testGroup = "writeHtml";

const pk = new UWProskomma();
// const succinctJson = fse.readJsonSync(path.resolve(path.join(__dirname, "..", "test_data", "fra_lsg_succinct.json")));
const succinctJson = fse.readJsonSync(path.resolve(path.join(__dirname, "..", "test_data", "eng_engWEBBE_succinct.json")));
pk.loadSuccinctDocSet(succinctJson);

test(
    `writeHTML doesn't die (${testGroup})`,
    async function (t) {
        try {
            t.plan(2);
            const instance = new EpiteletePerfHtml(pk, "DBL/eng_engWEBBE");
            const bookCode = "LUK"
            const html = await instance.readHTML(bookCode);
            t.ok(html);
            t.doesNotThrow(() => instance.writeHTML(html));
        } catch (err) {
            console.log(err);
        }
    },
);
