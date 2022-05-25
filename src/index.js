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
        const doc = await this.readPerf(bookCode);
        const sequenceHtml = Object.keys(doc.sequences).reduce((sequences, seqId) => {
            sequences[seqId] = perf2html(doc, seqId);
            return sequences;
        }, {});
        return {
            docSetId,
            mainSequenceId: doc.mainSequence,
            headers: doc.headers,
            sequenceHtml,
        };
    }

    async writeHTML(bookCode,sequenceId,html) {
        const perf = html2perf(html,sequenceId);
        await this.perfWrite(bookCode,sequenceId,perf);
        return await this.readHTML(bookCode);
    }
}

export default EpiteletePerfHtml;
