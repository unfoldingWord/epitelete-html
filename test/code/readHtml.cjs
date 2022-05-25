const test = require("tape");
const path = require("path");
const fse = require("fs-extra");
const {UWProskomma} = require("uw-proskomma");
const EpiteletePerfHtml = require("../../src/index").default;

const testGroup = "readHtml";

const pk = new UWProskomma();
// const succinctJson = fse.readJsonSync(path.resolve(path.join(__dirname, "..", "test_data", "fra_lsg_succinct.json")));
const succinctJson = fse.readJsonSync(path.resolve(path.join(__dirname, "..", "test_data", "eng_engWEBBE_succinct.json")));
pk.loadSuccinctDocSet(succinctJson);

test(
    `Reads HTML (${testGroup})`,
    async function (t) {
        try {
            t.plan(12);
            const instance = new EpiteletePerfHtml(pk, "DBL/eng_engWEBBE");
            const bookCode = "LUK"
            const html = await instance.readHTML(bookCode);
            t.ok(html);
            t.ok("docSetId" in html);
            t.ok("mainSequenceId" in html);
            t.ok("headers" in html);
            t.ok("id" in html.headers);
            t.ok("bookCode" in html.headers);
            t.ok("ide" in html.headers);
            t.ok("h" in html.headers);
            t.ok("toc" in html.headers);
            t.ok("toc2" in html.headers);
            t.ok("toc3" in html.headers);
            t.ok("sequenceHtml" in html);
        } catch (err) {
            console.log(err);
        }
    },
);
