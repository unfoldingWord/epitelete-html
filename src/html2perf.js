import { parse } from 'node-html-parser';
// const util = require('util')

const getAttribute = (node, key) => node.getAttribute(`data-${key}`);

const chapterVerseFrom = node => ({
    number: node.rawText,
});

const inlineGraftFrom = node => ({
    type: "graft",
    subType: getAttribute(node, "subType"),
    target: getAttribute(node, "target"),
    nBlocks: 1,
    previewText: "",
});

const getContentFrom = contentNode => contentNode.childNodes.map((node) => {
    if (node.nodeType === 3) return node.rawText.replace(/&#8239;/,'');

    const type = getAttribute(node, "type");
    const block = {
        type,
        ...(type === "inlineGraft" && inlineGraftFrom(node)),
        ...(type !== "inlineGraft" && chapterVerseFrom(node)),
    }

    return block;
});

const blockFrom = node => ({
    content: getContentFrom(node) || [],
});

const graftFrom = node => ({
    target: getAttribute(node, "target"),
    nBlocks: parseInt(getAttribute(node, "nBlocks")),
    previewText: "",
    firstBlockScope: "",
});

const getBlocksFrom = containerNode => containerNode.childNodes.reduce((blocksList, node) => {
    if (node.nodeType !== 1) return blocksList;

    const type = getAttribute(node, "type");
    const subType = getAttribute(node, "subType");

    const block = {
        type,
        subType,
        ...(type === "block" && blockFrom(node)),
        ...(type === "graft" && graftFrom(node)),
    }

    blocksList.push(block);
    return blocksList;
}, []);

function html2perf(html,sequenceId) {
    const sequenceHtml = parse(html.sequenceHtml[sequenceId]);
    const sequenceElement = sequenceHtml.firstChild;

    const blocksContainer = sequenceElement.querySelector('.block, .graft').parentNode;
    const blocks = getBlocksFrom(blocksContainer);

    const perf = {
        type: getAttribute(sequenceElement, "sequenceType"),
        selected: true,
        blocks,
    }
    // console.log(util.inspect(perf, false, null, true));
    return perf;
}

export default html2perf;