import { parse } from 'node-html-parser';
// const util = require('util')

const getAttribute = (node, key) => node.getAttribute(`data-${key}`);

const getContentFrom = contentNode => contentNode.childNodes.map((node) => {
    if (node.nodeType === 3) return node.rawText;

    const type = getAttribute(node, "type");
    const block = {}
    if (type === "inlineGraft") {
        block.type = "graft";
        block.subType = getAttribute(node, "subType");
        block.target = getAttribute(node, "target");
        block.nBlocks = 1;
        block.previewText = "";
    } else {
        //Block is of type Chapter or Verses
        block.type = type;
        block.number = node.rawText;
    }

    return block;
});

const getBlocksFrom = containerNode => containerNode.childNodes.reduce((blocksList, node) => {
    if (node.nodeType !== 1) return blocksList;

    const type = getAttribute(node, "type");
    const subType = type + 'Type';
        
    const block = {
        "type": type,
        "subType": subType,
    }

    if (type === "block") {
        const content = getContentFrom(node) || [];
        block.content = content;
    }

    if (type === "graft") {
        const target = getAttribute(node, "target");
        const nBlocks = getAttribute(node, "nBlocks");
        if (target) block.target = target;
        if (nBlocks) block.nBlocks = parseInt(nBlocks);

        block.previewText = ""
        block.firstBlockScope = ""
    }

    blocksList.push(block);
    return blocksList;
}, []);

function html2perf(html) {
    const json = JSON.parse(html);
    const mainSequenceHtml = parse(json.sequenceHtml[json.mainSequenceId]);
    const mainSequenceElement = mainSequenceHtml.firstChild;

    const blocksContainer = mainSequenceElement.querySelector('.block, .graft').parentNode;
    const blocks = getBlocksFrom(blocksContainer);

    const perf = {
        blocks,
        type: getAttribute(mainSequenceElement, "sequenceType"),
        selected: true,
    }
    // console.log(util.inspect(perf, false, null, true));
    return perf;
}

export default html2perf;