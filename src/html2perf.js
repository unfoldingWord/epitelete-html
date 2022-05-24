import { parse } from 'node-html-parser';

function html2perf(html) {
    const json = JSON.parse(html);
    const mainSequenceHtml = parse(json.sequenceHtml[json.mainSequenceId]);
    const mainSequenceElement = mainSequenceHtml.firstChild;
    const blocksContainer = mainSequenceElement.querySelector('.block, .graft').parentNode;
    
    const blocks = blocksContainer.childNodes.reduce((prev, curr, idx) => {
        if (curr.nodeType !== 1) return prev;
        
        const type = curr.getAttribute("data-type");
        const subType = type + 'Type';
        
        const block = {
            "type": type,
            "subType": subType,
        }
        prev.push(block);
        
        return prev;
    }, []);

    const perf = {
        blocks,
        type: mainSequenceElement.getAttribute("data-sequenceType"),
        selected: true,
    }
    return perf;
}
export default html2perf;