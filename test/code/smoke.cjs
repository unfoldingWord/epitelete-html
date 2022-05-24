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
    `Instantiate EpiteletePerfHtml (${testGroup})`,
    async function (t) {
        try {
            t.plan(5)
            t.throws(() => new EpiteletePerfHtml(pk), "2 arguments");
            t.throws(() => new EpiteletePerfHtml(pk, "eBible/fra_fraLSG"), "docSetId is not present");
            const instance = new EpiteletePerfHtml(pk, "DBL/eng_engWEBBE");
            t.ok(instance);
            t.ok(instance.pk);
            t.ok(instance.docSetId);
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `Reads HTML (${testGroup})`,
    async function (t) {
        try {
            t.plan(2);
            const instance = new EpiteletePerfHtml(pk, "DBL/eng_engWEBBE");
            const bookCode = "LUK"
            const html = await instance.readHTML(bookCode);
            t.ok(html);
            t.ok(/<[a-z][\s\S]*>/i.test(html), "Contains HTML elements");
        } catch (err) {
            console.log(err);
        }
    },
);