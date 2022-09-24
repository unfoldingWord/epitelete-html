import Epitelete from "epitelete";
import perf2html from "./perf2html";
import html2perf from "./html2perf";

class EpiteletePerfHtml extends Epitelete {
  constructor({ proskomma = null, docSetId, htmlMap, options = {} }) {
    super({ proskomma, docSetId, options });
    this.htmlMap = htmlMap;
  }

  _outputHtml(perfDocument) {
    const sequencesHtml = Object.keys(perfDocument.sequences).reduce(
      (sequences, sequenceId) => {
        sequences[sequenceId] = perf2html({
          perfDocument,
          sequenceId,
          htmlMap: this.htmlMap,
        });
        return sequences;
      },
      {}
    );
    return {
      docSetId: this.docSetId,
      mainSequenceId: perfDocument.main_sequence_id,
      schema: perfDocument.schema,
      metadata: perfDocument.metadata,
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
    return this._outputHtml(await this.readPerf(bookCode, options));
  }

  /**
   * Returns previous perfHtmlContainer in history
   * @param {string} bookCode
   * @param {object} [options]
   * @param {string} options.readPipeline - the name of the read pipeline
   */
  async undoHtml(bookCode, options = {}) {
    return this._outputHtml(await this.undoPerf(bookCode, options));
  }

  /**
   * Returns next perfHtmlContainer in history
   * @param {string} bookCode
   * @param {object} [options]
   * @param {string} options.readPipeline - the name of the read pipeline
   */
  async redoHtml(bookCode, options = {}) {
    return this._outputHtml(await this.redoPerf(bookCode, options));
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
    await this.writePerf(bookCode, sequenceId, perf, { writePipeline });
    return await this.readHtml(bookCode, { readPipeline });
  }
}

export default EpiteletePerfHtml;
