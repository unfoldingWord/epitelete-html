import { extractSequence } from "../../utils";

const test = require("tape");
const path = require("path");
const fse = require("fs-extra");
const {UWProskomma} = require("uw-proskomma");
const { fail } = require("assert");
const EpiteleteHtml = require("../../src/index").default;

const testGroup = "writeHtml";

const pk = new UWProskomma();
// const succinctJson = fse.readJsonSync(path.resolve(path.join(__dirname, "..", "test_data", "fra_lsg_succinct.json")));
const succinctJson = fse.readJsonSync(path.resolve(path.join(__dirname, "..", "test_data", "eng_engWEBBE_succinct.json")));
const sidePerf = fse.readJsonSync(path.resolve(path.join(__dirname, "..", "test_data", "mrk_perf.json")));
pk.loadSuccinctDocSet(succinctJson);

test(
    `writeHtml doesn't die (${testGroup})`,
    async function (t) {
        try {
            t.plan(2);
            const instance = new EpiteleteHtml({proskomma: pk, docSetId: "DBL/eng_engWEBBE"});
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
            const instance = new EpiteleteHtml({proskomma: pk, docSetId: "DBL/eng_engWEBBE"});
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
    `writeHtml consistency with standalone (${testGroup})`,
    async function (t) {
        t.plan(3);
        try {
            const instance = new EpiteleteHtml({ docSetId: "DBL/eng_engWEBBE" });
            const bookCode = "MRK"
            await instance.sideloadPerf(bookCode, sidePerf);
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
            const instance = new EpiteleteHtml({proskomma: pk, docSetId: "DBL/eng_engWEBBE"});
            const bookCode = "LUK"
            const html = await instance.readHtml(bookCode);
            t.ok(html);
            //Change html sequence:
            const editedHtmlSequence = html.sequencesHtml[html.mainSequenceId].replace(/<\/span>/, '</span>Pequeña cigüeña dócil. ');
            html.sequencesHtml[html.mainSequenceId] = editedHtmlSequence;
            const newHtml = await instance.writeHtml(bookCode, html.mainSequenceId, html);
            const newHtmlSequence = newHtml.sequencesHtml[newHtml.mainSequenceId];
            t.ok(/Pequeña cigüeña dócil. /.test(newHtmlSequence));
        } catch (err) {
            console.log(err);
        }
    },
);

const alignedPerf = fse.readJsonSync(path.resolve(path.join(__dirname, "..", "test_data", "TIT_dcs_eng-alignment_perf_v0.2.1.json")));

test(
    `writes and reads with pipeline options (${testGroup})`,
    async function (t) {
        t.plan(3);
        try {
            const instance = new EpiteleteHtml({ docSetId: "DBL/eng_engWEBBE" });
            const bookCode = "MRK"
            const readOptions = { readPipeline : "stripAlignmentPipeline" }
            const writeOptions = { writePipeline : "mergeAlignmentPipeline" }
            await instance.sideloadPerf(bookCode, alignedPerf);
            const html = await instance.readHtml(bookCode, readOptions);
            t.ok(html);
            try {
                const newHtml = await instance.writeHtml(bookCode, html.mainSequenceId, html, {...writeOptions, ...readOptions});
                const newHtmlSequence = newHtml.sequencesHtml[html.mainSequenceId];
                const oldHtmlSequence = html.sequencesHtml[html.mainSequenceId];
                t.equal(newHtmlSequence, oldHtmlSequence);
                t.pass();
            } catch (e) {
                t.fail(e);
            }
        } catch (err) {
            t.fail(err);
        }
    },
);

const perfWithNewGrafts = fse.readJsonSync(path.resolve(path.join(__dirname, "..", "test_data", "new_grafts.json")));

test(
    `creates new sequences for new grafts (${testGroup})`,
    async t => {
        t.plan(2)
        //vague test, requires further testing to improve confidence. Good enough for now.
        const docSetId = "DCS/en_ult";
        const epitelete = new EpiteleteHtml({ docSetId });
        const bookCode = "TIT";
        const writeOptions = { insertSequences: true };
        
        const unaligned = await epitelete.sideloadPerf(bookCode, perfWithNewGrafts).catch((err) => {
            console.log(err)
        });
        // console.log(JSON.stringify(unaligned, null, 4));
        t.equals(Object.keys(unaligned.sequences).length, 1);

        const html = await epitelete.readHtml(bookCode).catch((err) => {
            console.log(err)
        });
        const nestedGrafts = `<span data-type="graft" data-subtype="footnote" data-new="true"><p class="paragraph usfm f" data-type="paragraph" data-subtype-ns="usfm" data-subtype="f"><span class="graft note_caller" data-type="graft" data-subtype="note_caller" data-new="true" data-preview_text="+"><p class="paragraph usfm f" data-type="paragraph" data-subtype-ns="usfm" data-subtype="f">+</p></span><span class="wrapper usfm span" data-type="wrapper" data-subtype-ns="usfm" data-subtype="ft">a custom note</span></p></span>`
        const mainSequence = html.sequencesHtml[html.mainSequenceId];
        const editedSequence = mainSequence.replace(/<span class="graft footnote".+?span>/g, nestedGrafts);

        html.sequencesHtml[html.mainSequenceId] = editedSequence;
        // console.log(JSON.stringify(html.sequencesHtml, null, 4));

        const merged = await epitelete.writeHtml(bookCode, html.mainSequenceId, html, writeOptions);
        // const perf = await epitelete.readPerf(bookCode);
        // console.log(JSON.stringify(merged.sequencesHtml, null, 4));

        t.equals(Object.keys(merged.sequencesHtml).length, 4);
    }
)

const originalUsfm = fse
  .readFileSync(
    path.resolve(
      path.join(__dirname, "..", "test_data", "RUT_ULT.usfm")
    )
  )
  .toString();

const getEpi = (usfm) => {
  const proskomma = new UWProskomma([
      {
          name: "org",
          type: "string",
          regex: "^[^\\s]+$"
      },
      {
          name: "lang",
          type: "string",
          regex: "^[^\\s]+$"
      },
      {
          name: "abbr",
          type: "string",
          regex: "^[A-za-z0-9_-]+$"
      }
  ]);
  proskomma.importDocument(
    { org: "uw", lang: "en", abbr: "ult" },
    "usfm",
    usfm
  );
  const epitelete = new EpiteleteHtml({ proskomma, docSetId: "uw/en_ult" });
  return epitelete;
};

test(
    `reads new sequence from proskomma (${testGroup})`,
    async t => {
       t.plan(1)
        const docSetId = "uw/en_ult";
        const epitelete = getEpi(originalUsfm);
        const bookCode = "RUT";
        
        const unaligned = await epitelete.readHtml(bookCode, {readPipeline: "stripAlignmentPipeline"}).catch((err) => {
            console.log(err)
        });
        t.ok(unaligned);
        // console.log(JSON.stringify(unaligned, null, 4));
        t.end()
    }
)