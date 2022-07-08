import Epitelete from "epitelete";
import perf2html from "./perf2html"
import html2perf from "./html2perf"

class EpiteletePerfHtml extends Epitelete {

    constructor({proskomma=null, docSetId, htmlMap, options={}}) {
        super({ proskomma, docSetId, options });
        this.htmlMap = htmlMap
    }

    _outputHtml(doc) {
        const sequencesHtml = Object.keys(doc.sequences).reduce((sequences, seqId) => {
            sequences[seqId] = perf2html(doc, seqId, this.htmlMap);
            return sequences;
        }, {});
        return {
            docSetId: this.docSetId,
            mainSequenceId: doc.main_sequence_id,
            schema: doc.schema,
            metadata: doc.metadata,
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
        const perf = html2perf(perfHtml, sequenceId);
        await this.writePerf(bookCode,sequenceId,perf);
        return await this.readHtml(bookCode);
    }

}

export default EpiteletePerfHtml;
