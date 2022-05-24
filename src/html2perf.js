import { parse } from 'node-html-parser';

function html2perf(html) {
  var json = parse(html);
  return json;
}
export default html2perf;