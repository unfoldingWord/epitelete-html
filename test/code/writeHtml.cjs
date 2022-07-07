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
    `writeHtml doesn't die (${testGroup})`,
    async function (t) {
        try {
            t.plan(2);
            const instance = new EpiteletePerfHtml({proskomma: pk, docSetId: "DBL/eng_engWEBBE"});
            const bookCode = "3JN"
            const html = await instance.readHtml(bookCode);
            t.ok(html);
            // console.log(html.sequencesHtml);
            try {
                await instance.writeHtml(bookCode, html.mainSequenceId, html);
                t.pass();
            } catch (e) {
                console.log(e);
                t.fail(e);
            }
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `writeHtml consistency (${testGroup})`,
    async function (t) {
        t.plan(3);
        try {
            const instance = new EpiteletePerfHtml({proskomma: pk, docSetId: "DBL/eng_engWEBBE"});
            const bookCode = "LUK"
            const html = await instance.readHtml(bookCode);
            t.ok(html);
            try {
                const newHtml = await instance.writeHtml(bookCode, html.mainSequenceId, html);
                const newHtmlSequence = newHtml.sequencesHtml[html.mainSequenceId];
                const oldHtmlSequence = html.sequencesHtml[html.mainSequenceId];
                t.equal(newHtmlSequence, oldHtmlSequence);
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
    `writeHtml returns changes (${testGroup})`,
    async function (t) {
        t.plan(2);
        try {
            const instance = new EpiteletePerfHtml({proskomma: pk, docSetId: "DBL/eng_engWEBBE"});
            const bookCode = "LUK"
            const html = await instance.readHtml(bookCode);
            t.ok(html);
            //Change html sequence:
            const editedHtmlSequence = html.sequencesHtml[html.mainSequenceId].replace(/1<\/span>/, '1</span>Pequeña cigüeña dócil. ');
            html.sequencesHtml[html.mainSequenceId] = editedHtmlSequence;
            const newHtml = await instance.writeHtml(bookCode, html.mainSequenceId, html);
            const newHtmlSequence = newHtml.sequencesHtml[newHtml.mainSequenceId];
            t.ok(/Pequeña cigüeña dócil. /.test(newHtmlSequence));
        } catch (err) {
            console.log(err);
        }
    },
);
