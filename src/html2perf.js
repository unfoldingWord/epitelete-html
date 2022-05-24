import { parse } from 'node-html-parser';

function html2perf(html) {
  const json = JSON.parse(html);
  const mainSequenceHtml = parse(json.sequenceHtml[json.mainSequenceId]);
  const mainSequenceElement = mainSequenceHtml.firstChild;
  const perf = {
    blocks: [],
    type: mainSequenceElement.getAttribute("data-sequenceType"),
    mainSequenceHtml
  }
  return perf;
}
export default html2perf;