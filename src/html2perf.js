import { parse } from 'node-html-parser';

function html2perf(html) {
  const json = JSON.parse(html);
  const mainSequenceHtml = parse(json.sequenceHtml[json.mainSequenceId]);
  const perf = {
    blocks: [],
    mainSequenceHtml
  }
  return perf;
}
export default html2perf;