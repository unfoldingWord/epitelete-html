import Epitelete from "epitelete";
import perf2html from "./perf2html"
import html2perf from "./html2perf"

class EpiteleteHtml extends Epitelete {

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

    /**
     * Return current perfHtmlContainer
     * @param {string} bookCode
     * @param {object} [options]
     * @param {string} options.readPipeline - the name of the read pipeline
     */
    async readHtml(bookCode, options = {}) {
        return this._outputHtml(await this.readPerf(bookCode, {...options, cloning: false}));
    }

    /**
     * Returns previous perfHtmlContainer in history
     * @param {string} bookCode
     * @param {object} [options]
     * @param {string} options.readPipeline - the name of the read pipeline
     */
    async undoHtml(bookCode, options = {}) {
        return this._outputHtml(await this.undoPerf(bookCode, {...options, cloning: false}));
    }

    /**
     * Returns next perfHtmlContainer in history
     * @param {string} bookCode
     * @param {object} [options]
     * @param {string} options.readPipeline - the name of the read pipeline
     */
    async redoHtml(bookCode, options = {}) {
        return this._outputHtml(await this.redoPerf(bookCode, {...options, cloning: false}));
    }

    /**
     * Saves current perfHtmlContainer
     * @param {string} bookCode
     * @param {string} sequenceId
     * @param {object} perfHtml
     * @param {object} [options]
     * @param {string} options.writePipeline - the name of the write pipeline
     * @param {string} options.readPipeline - the name of the read pipeline
     */
    async writeHtml(bookCode, sequenceId, perfHtml, options = {}) {
        const { writePipeline, readPipeline } = options;
        const perf = html2perf(perfHtml, sequenceId);
        await this.writePerf(bookCode,sequenceId,perf, {writePipeline, cloning: false});
        return await this.readHtml(bookCode, {readPipeline});
    }

}

export default EpiteleteHtml;
