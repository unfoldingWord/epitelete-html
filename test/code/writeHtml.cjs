const test = require("tape");
const path = require("path");
const fse = require("fs-extra");
const {UWProskomma} = require("uw-proskomma");
const { fail } = require("assert");
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
            try {
                await instance.writeHTML(bookCode, html.mainSequenceId, html);
                t.pass();
            } catch (e) {
                t.fail();
            }
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `writeHTML consistency (${testGroup})`,
    async function (t) {
        try {
            const instance = new EpiteletePerfHtml(pk, "DBL/eng_engWEBBE");
            const bookCode = "LUK"
            const html = await instance.readHTML(bookCode);
            t.ok(html);
            try {
                const newHtml = await instance.writeHTML(bookCode, html.mainSequenceId, html);
                const newHtmlSequence = newHtml.sequenceHtml[html.mainSequenceId];
                const oldHtmlSequence = html.sequenceHtml[html.mainSequenceId];
                t.equal(newHtmlSequence, oldHtmlSequence);
                t.pass();
            } catch (e) {
                t.fail();
            }
        } catch (err) {
            console.log(err);
        }
        t.end();
    },
);

test(
    `writeHTML returns changes (${testGroup})`,
    async function (t) {
        try {
            const instance = new EpiteletePerfHtml(pk, "DBL/eng_engWEBBE");
            const bookCode = "LUK"
            const html = await instance.readHTML(bookCode);
            t.ok(html);
            //Change html sequence:
            const editedHtmlSequence = html.sequenceHtml[html.mainSequenceId].replace(/"verses">1<\/span>/, '"verses">1</span>Pequeña cigüeña dócil. ');
            html.sequenceHtml[html.mainSequenceId] = editedHtmlSequence;
            const newHtml = await instance.writeHTML(bookCode, html.mainSequenceId, html);
            const newHtmlSequence = newHtml.sequenceHtml[newHtml.mainSequenceId];
            t.ok(/Pequeña cigüeña dócil. /.test(newHtmlSequence));
        } catch (err) {
            console.log(err);
        }
        t.end();
    },
);
