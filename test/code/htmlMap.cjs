const test = require("tape");
const path = require("path");
const fse = require("fs-extra");
const {UWProskomma} = require("uw-proskomma");
const {fail} = require("assert");
const EpiteleteHtml = require("../../src/index").default;

const testGroup = "htmlMap";
const perfWithNewGrafts = fse.readJsonSync(path.resolve(path.join(__dirname, "..", "test_data", "htmlMap_attributes.json")));

test(
    `adds html attributes (${testGroup})`,
    async t => {
      //vague test, requires further testing to improve confidence. Good enough for now.
      const docSetId = "DCS/en_ult";
      const newClass = "test-seq-123"
      const epitelete = new EpiteleteHtml({
        docSetId,
        htmlMap: {
          "*": {
            sequence: {
              classList: newClass
            }
          },
          main: {
            "*": {
              tagName: "custom2"
            },
          },
          paragraph: {
            "*": {
              attributes: {contenteditable: false}
            },
            "usfm:p": {
              tagName: "custom3"
            }
          }
        }
      });
      const bookCode = "TIT";
      const unaligned = await epitelete.sideloadPerf(bookCode, perfWithNewGrafts).catch((err) => {
          console.log(err)
      });
      const html = await epitelete.readHtml(bookCode).catch((err) => {
          console.log(err)
      });
      // console.log({ html: html.sequencesHtml[html.mainSequenceId] });

      t.notOk(html.sequencesHtml[html.mainSequenceId].includes("sequence"));

      t.ok([
        "<custom2",
        "<custom3",
        newClass,
        `contenteditable="false"`
      ].every((value) => html.sequencesHtml[html.mainSequenceId].includes(value)));

      t.end()
    }
)