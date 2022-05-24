import Epitelete from "epitelete";
import perf2html from "./perf2html"
import html2perf from "./html2perf"
import ProskommaJsonValidator from 'proskomma-json-validator';

class EpiteletePerfHtml extends Epitelete{
    constructor(pk, docSetId) {
        super(pk, docSetId);
    }
    async readHTML(bookCode) {
        const docSetId = this.docSetId;
        const doc = await super.readPerf(bookCode);

        const ret = {
            docSetId,
            mainSequenceId: doc.mainSequence,
            headers: doc.headers,
            sequenceHtml: {},
        };
        Object.keys(doc.sequences)
            .forEach(seqId => { ret.sequenceHtml[seqId] = perf2html(doc, seqId) });
        return JSON.stringify(ret, null, 2);
    }

    writeHTML(html) {
        const perf = html2perf(html);
        const validator = new ProskommaJsonValidator();
        const result = validator.validate('documentPerf', perf);
        if (!result.isValid) {
            throw new Error(JSON.stringify(result,null,2));
        }
        return result;
    }
}

export default EpiteletePerfHtml;
