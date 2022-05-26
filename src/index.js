import Epitelete from "epitelete";
import perf2html from "./perf2html"
import html2perf from "./html2perf"
class EpiteletePerfHtml extends Epitelete{
    constructor(pk, docSetId) {
        super(pk, docSetId);
    }

    async readHtml(bookCode) {
        const docSetId = this.docSetId;
        const doc = await this.readPerf(bookCode);
        const sequencesHtml = Object.keys(doc.sequences).reduce((sequences, seqId) => {
            sequences[seqId] = perf2html(doc, seqId);
            return sequences;
        }, {});
        return {
            docSetId,
            mainSequenceId: doc.mainSequence,
            headers: doc.headers,
            sequencesHtml,
        };
    }

    async writeHtml(bookCode,sequenceId,perfHtml) {
        const perf = html2perf(perfHtml,sequenceId);
        await this.writePerf(bookCode,sequenceId,perf);
        return await this.readHtml(bookCode);
    }
}

export default EpiteletePerfHtml;
