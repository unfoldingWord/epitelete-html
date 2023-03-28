import Epitelete from "epitelete";
import perf2html from "./perf2html"
import html2perf from "./html2perf"

class EpiteleteHtml extends Epitelete {

    constructor({proskomma=null, docSetId, htmlMap, options={}}) {
        super({ proskomma, docSetId, options });
        this.htmlMap = htmlMap
    }

    _outputHtml(doc,bcvFilter) {
        const sequencesHtml = Object.keys(doc.sequences).reduce((sequences, seqId) => {
            sequences[seqId] = perf2html(doc, seqId, this.htmlMap, bcvFilter);
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

    async readHtml(bookCode, options = {}, bcvFilter = {}) {
        return this._outputHtml(await this.readPerf(bookCode, options), bcvFilter);
    }

    /**
     * Returns previous perfHtmlContainer in history
     * @param {string} bookCode
     * @param {object} [options]
     * @param {string} options.readPipeline - the name of the read pipeline
     */
    async undoHtml(bookCode, options = {}, bcvFilter = {}) {
        return this._outputHtml(await this.undoPerf(bookCode, options), bcvFilter);
    }

    /**
     * Returns next perfHtmlContainer in history
     * @param {string} bookCode
     * @param {object} [options]
     * @param {string} options.readPipeline - the name of the read pipeline
     */
    async redoHtml(bookCode, options = {}, bcvFilter = {}) {
        return this._outputHtml(await this.redoPerf(bookCode, options), bcvFilter);
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
    async writeHtml(bookCode, sequenceId, perfHtml, options = {}, bcvFilter = {}) {
        const { writePipeline, readPipeline } = options;
        const perf = html2perf(perfHtml, sequenceId);
        await this.writePerf(bookCode, sequenceId, perf, {writePipeline});
        return await this.readHtml(bookCode, {readPipeline});
    }
}

export default EpiteleteHtml;
