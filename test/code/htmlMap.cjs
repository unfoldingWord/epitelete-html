const test = require("tape");
const path = require("path");
const fse = require("fs-extra");
const {UWProskomma} = require("uw-proskomma");
const {fail} = require("assert");
const EpiteleteHtml = require("../../src/index").default;

const testGroup = "htmlMap";

const pk = new UWProskomma();
const succinctJson = fse.readJsonSync(path.resolve(path.join(__dirname, "..", "test_data", "eng_engWEBBE_succinct.json")));
pk.loadSuccinctDocSet(succinctJson);

test(`Maps correctly with htmlMap (${testGroup})`, async function (t) {
  t.plan(3);
  try {
    const newClass = "test-seq-123"
    const instance = new EpiteleteHtml({
      proskomma: pk,
      docSetId: "DBL/eng_engWEBBE",
      htmlMap: {
        "*": {
          sequence: {
            classList: newClass
          },
          verses: {
            tagName:"custom1"
          }
        },
        main: {
          "*": {
            tagName: "custom2"
          },
        },
        paragraph: {
          "*": {
            attributes: {contenteditable: true}
          },
          "usfm:p": {
            tagName: "custom3"
          }
        }
      }
    });
    const bookCode = "LUK"
    const html = await instance.readHtml(bookCode);
    t.ok(html.sequencesHtml[html.mainSequenceId].includes(newClass));
    t.notOk(html.sequencesHtml[html.mainSequenceId].includes("sequence"));

    t.ok(["<custom1", "<custom2", "<custom3"].every((value) => html.sequencesHtml[html.mainSequenceId].includes(value)));
  } catch (err) {
    console.log(err);
  }
},);
