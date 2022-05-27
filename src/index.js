import Epitelete from "epitelete";
import perf2html from "./perf2html"
import html2perf from "./html2perf"
class EpiteletePerfHtml extends Epitelete{
    constructor({pk=null, docSetId}) {
        super({pk, docSetId});
    }

    _outputHtml(doc) {
        const sequencesHtml = Object.keys(doc.sequences).reduce((sequences, seqId) => {
            sequences[seqId] = perf2html(doc, seqId);
            return sequences;
        }, {});
        return {
            docSetId: this.docSetId,
            mainSequenceId: doc.mainSequence,
            headers: doc.headers,
            sequencesHtml,
        };

    }

    async readHtml(bookCode) {
        return this._outputHtml(await this.readPerf(bookCode));
    }

    async undoHtml(bookCode) {
        return this._outputHtml(await this.undoPerf(bookCode));
    }

    async redoHtml(bookCode) {
        return this._outputHtml(await this.redoPerf(bookCode));
    }

    async writeHtml(bookCode,sequenceId,perfHtml) {
        const perf = html2perf(perfHtml,sequenceId);
        await this.writePerf(bookCode,sequenceId,perf);
        return await this.readHtml(bookCode);
    }
}

export default EpiteletePerfHtml;
