import { parse } from "node-html-parser";

const getAttribute = (node, key) => node.getAttribute(`data-${key}`);

const chapterVerseFrom = node => ({
    number: node.textContent,
});

const inlineGraftFrom = node => ({
    type: "graft",
    subType: getAttribute(node, "subType"),
    target: getAttribute(node, "target"),
    nBlocks: 1,
    previewText: "",
});

const getContentFrom = contentNode => Array.from(contentNode.childNodes, node => {
    if (node.nodeType === 3) return node.textContent.replace(/&#8239;| /, "");

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

const getBlock = node => {
    const type = getAttribute(node, "type");
    return {
        type,
        subType: getAttribute(node, "subType"),
        ...(type === "block" && blockFrom(node)),
        ...(type === "graft" && graftFrom(node)),
    }
}

const browserGetBlocks = nodes => Array.from(nodes, node => getBlock(node));

const nodeJsGetBlocks = nodes => nodes.reduce((blocksList, node) => {
    if (node.nodeType !== 1) return blocksList;
    blocksList.push(getBlock(node));
    return blocksList;
}, [])

const getBlocksFrom = containerNode => {
    return typeof containerNode.children === "object"
        ? browserGetBlocks(containerNode.children)
        : nodeJsGetBlocks(containerNode.childNodes)
};

const parseHtml = (html) => (typeof DOMParser === "function")
    ? new DOMParser().parseFromhtml(html, "text/html")
    : parse(html);

function html2perf(perfHtml,sequenceId) {
    const sequencesHtml = parseHtml(perfHtml.sequencesHtml[sequenceId]);
    const sequenceElement = sequencesHtml.getElementById("sequence");
    const blocksContainer = sequenceElement.querySelector(".block, .graft").parentNode;

    return {
        type: getAttribute(sequenceElement, "sequenceType"),
        selected: true,
        blocks: getBlocksFrom(blocksContainer)
    };
}

export default html2perf;