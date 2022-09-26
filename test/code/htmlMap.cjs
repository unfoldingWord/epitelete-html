const test = require("tape");
const path = require("path");
const fse = require("fs-extra");
const { UWProskomma } = require("uw-proskomma");
const { fail } = require("assert");
const EpiteletePerfHtml = require("../../src/index").default;

const testGroup = "htmlMap";

const pk = new UWProskomma();
const succinctJson = fse.readJsonSync(
  path.resolve(
    path.join(__dirname, "..", "test_data", "eng_engWEBBE_succinct.json")
  )
);
pk.loadSuccinctDocSet(succinctJson);

test(`Maps correctly with htmlMap (${testGroup})`, async function (t) {
  t.plan(3);
  try {
    const newClass = "test-seq-123";
    const instance = new EpiteletePerfHtml({
      proskomma: pk,
      docSetId: "DBL/eng_engWEBBE",
      htmlMap: {
        "*": {
          sequence: {
            classList: newClass,
          },
          verses: {
            tagName: "custom1",
          },
        },
        main: {
          "*": {
            tagName: "custom2",
          },
        },
        paragraph: {
          "usfm:p": {
            tagName: "custom3",
          },
        },
      },
    });
    const bookCode = "LUK";
    const html = await instance.readHtml(bookCode);
    t.ok(html.sequencesHtml[html.mainSequenceId].includes(newClass));
    t.notOk(html.sequencesHtml[html.mainSequenceId].includes("sequence"));

    t.ok(
      ["<custom1", "<custom2", "<custom3"].every((value) =>
        html.sequencesHtml[html.mainSequenceId].includes(value)
      )
    );
  } catch (err) {
    console.log(err);
  }
});

test(`Mapped html contains parents (${testGroup})`, async function (t) {
  t.plan(1);
  try {
    const instance = new EpiteletePerfHtml({
      proskomma: pk,
      docSetId: "DBL/eng_engWEBBE",
      htmlMap: {
        mark: {
          verses: ({ atts, parent }) => ({
            classList: `verses-subtype-${parent.subtype}`,
          }),
        },
      },
    });
    const bookCode = "TIT";
    const html = await instance.readHtml(bookCode);
    t.ok(
      html.sequencesHtml[html.mainSequenceId].includes("verses-subtype-usfm:p")
    );
  } catch (err) {
    console.log(err);
  }
  t.end();
});

test(`htmlMap feature can receive functions (${testGroup})`, async function (t) {
  t.plan(1);
  try {
    const instance = new EpiteletePerfHtml({
      proskomma: pk,
      docSetId: "DBL/eng_engWEBBE",
      htmlMap: (ctx) => ({
        mark: {
          chapter: ({ atts }) => {
            ctx.lastChapter = atts.number;
            return {};
          },
          verses: ({ atts }) => ({
            classList: `ch-${ctx.lastChapter}-v-${atts.number}`,
          }),
        },
      }),
    });
    const bookCode = "TIT";
    const html = await instance.readHtml(bookCode);
    console.log(html);
    t.ok(
      ["ch-1-v-1", "ch-1-v-2", "ch-2-v-5", "ch-3-v-15"].every((value) =>
        html.sequencesHtml[html.mainSequenceId].includes(value)
      )
    );
  } catch (err) {
    console.log(err);
  }
  t.end();
});
