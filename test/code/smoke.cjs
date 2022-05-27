const test = require("tape");
const path = require("path");
const fse = require("fs-extra");
const {UWProskomma} = require("uw-proskomma");
const EpiteletePerfHtml = require("../../src/index").default;

const testGroup = "Smoke";

const pk = new UWProskomma();
// const succinctJson = fse.readJsonSync(path.resolve(path.join(__dirname, "..", "test_data", "fra_lsg_succinct.json")));
const succinctJson = fse.readJsonSync(path.resolve(path.join(__dirname, "..", "test_data", "eng_engWEBBE_succinct.json")));
pk.loadSuccinctDocSet(succinctJson);

test(
    `Instantiate Class (${testGroup})`,
    async function (t) {
        try {
            t.plan(4)
            t.throws(() => new EpiteletePerfHtml({proskomma: pk, docSetId: "DBL/fra_fraLSG"}), "docSetId is not present");
            const instance = new EpiteletePerfHtml({proskomma: pk, docSetId: "DBL/eng_engWEBBE"});
            t.ok(instance);
            t.ok(instance.proskomma);
            t.ok(instance.docSetId);
        } catch (err) {
            console.log(err);
        }
    },
);
