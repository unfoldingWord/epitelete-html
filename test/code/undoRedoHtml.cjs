const test = require("tape");
const path = require("path");
const fse = require("fs-extra");
const {UWProskomma} = require("uw-proskomma");
const EpiteletePerfHtml = require("../../src/index").default;

const testGroup = "undo/redoHtml";

const pk = new UWProskomma();
// const succinctJson = fse.readJsonSync(path.resolve(path.join(__dirname, "..", "test_data", "fra_lsg_succinct.json")));
const succinctJson = fse.readJsonSync(path.resolve(path.join(__dirname, "..", "test_data", "eng_engWEBBE_succinct.json")));
pk.loadSuccinctDocSet(succinctJson);

test(
    `read; write; undo; redo (${testGroup})`,
    async function (t) {
        try {
            t.plan(5);
            const instance = new EpiteletePerfHtml({proskomma: pk, docSetId: "DBL/eng_engWEBBE"});
            const bookCode = "LUK"
            // Read
            const htmlWeRead = await instance.readHtml(bookCode);
            t.ok(htmlWeRead);
            // Change and write sequence:
            t.ok('mainSequenceId' in htmlWeRead);
            const editedHtmlSequence = htmlWeRead.sequencesHtml[htmlWeRead.mainSequenceId]
                .replace(/1<\/span>/, '"1</span>Pequeña cigüeña dócil. ');
            htmlWeRead.sequencesHtml[htmlWeRead.mainSequenceId] = editedHtmlSequence;
            const htmlFromWrite = await instance.writeHtml(bookCode, htmlWeRead.mainSequenceId, htmlWeRead);
            const htmlWeWriteSequence = htmlFromWrite.sequencesHtml[htmlFromWrite.mainSequenceId];
            t.ok(/Pequeña cigüeña dócil. /.test(htmlWeWriteSequence));
            // Undo
            const htmlWeUndo = await instance.undoHtml(bookCode);
            t.notOk(/Pequeña cigüeña dócil. /.test(htmlWeUndo.sequencesHtml[htmlWeUndo.mainSequenceId]));
            // Redo
            const htmlWeRedo = await instance.redoHtml(bookCode);
            // console.log(htmlWeRedo);
            t.ok(/Pequeña cigüeña dócil. /.test(htmlWeRedo.sequencesHtml[htmlWeRedo.mainSequenceId]));
        } catch (err) {
            console.log(err);
        }
        t.end();
    },
);
