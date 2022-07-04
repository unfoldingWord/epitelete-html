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
            t.plan(24);
            const instance = new EpiteletePerfHtml({proskomma: pk, docSetId: "DBL/eng_engWEBBE"});
            const bookCode = "LUK"
            const html = await instance.readHtml(bookCode);
            t.ok(html);
            t.ok("docSetId" in html);
            t.ok("mainSequenceId" in html);
            t.ok("schema" in html);
            t.ok("structure" in html.schema);
            t.ok("structure_version" in html.schema);
            t.ok("constraints" in html.schema);
            t.ok("metadata" in html);
            t.ok("translation" in html.metadata);
            t.ok("id" in html.metadata.translation);
            t.ok("selectors" in html.metadata.translation);
            t.ok("tags" in html.metadata.translation);
            t.ok("properties" in html.metadata.translation);
            t.ok("document" in html.metadata);
            t.ok("tags" in html.metadata.document);
            t.ok("properties" in html.metadata.document);
            t.ok("id" in html.metadata.document);
            t.ok("bookCode" in html.metadata.document);
            t.ok("ide" in html.metadata.document);
            t.ok("h" in html.metadata.document);
            t.ok("toc" in html.metadata.document);
            t.ok("toc2" in html.metadata.document);
            t.ok("toc3" in html.metadata.document);
            t.ok("sequencesHtml" in html);
        } catch (err) {
            console.log(err);
        }
        t.end();
    },
);
