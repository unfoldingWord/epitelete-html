import { parse } from "node-html-parser";
import { getBcvVerifyStruct } from "./helpers";

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;

const getAttributes = (node) => {
  const atts = node.attributes;
  return !atts.length
    ? typeof atts === "object" && atts
    : [...atts].reduce((atts, att) => {
        atts[att.name] = att.value;
        return atts;
      }, {});
};

const camelToKebabCase = (str) =>
  str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

const kebabDataSet = (target) =>
  Object.keys(target).reduce((dataset, key) => {
    const newKey = camelToKebabCase(key);
    dataset[newKey] = target[key];
    return dataset;
  }, {});

const getDataset = (node) => {
  const dataSet = node.dataset;
  if (dataSet) return kebabDataSet(dataSet);
  const atts = getAttributes(node);
  return (
    atts &&
    Object.keys(atts).reduce((dataset, key) => {
      const data = key.match(/(?<=data-).+/);
      if (data) dataset[data] = atts[key];
      return dataset;
    }, {})
  );
};

const getProps = (node) => {
  const {
    "subtype-ns": subtypeNs,
    subtype: rawSubtype,
    ...dataset
  } = getDataset(node);
  const subtype = {
    subtype: subtypeNs ? `${subtypeNs}:${rawSubtype}` : rawSubtype
  };
  const props =
    dataset &&
    Object.keys(dataset).reduce((props, key) => {
      const att = key.match(/(?<=atts-).+/);
      if (att) {
        if (!props.atts) props.atts = {};
        props.atts[att] = dataset[key];
      } else props[key] = dataset[key];
      return props;
    }, {});
  const type = props?.type
  let retObj = {}
  if (type === "mark") {
    if (!props["bcv-id"]) {
      retObj = { ...props, ...subtype }
    } else {
      retObj = { bcvIdStr: props["bcv-id"] }
    }
  } else if (type === "paragraph") {
    retObj = { ...props, ...subtype }
  }
  return retObj
};

const getContentFrom = (contentNode,curBcvId) => {
  let content = [];
  for (const node of contentNode.childNodes) {
    if (node.nodeType === TEXT_NODE) {
      content.push({ "op": "replace", "bcvId": curBcvId, "value": node.textContent });
      continue;
    }
    if (node.getAttribute("class") === "meta-content") continue;
    const curBlock = getBlock(node);
    if (curBlock?.bcvIdStr) {
      curBcvId = curBlock?.bcvIdStr
    }
  }
  return content;
}

const blockFrom = (node,curBcvId) => {
  if (node.hasAttribute("data-atts-number")) return {};
  const metaContent = node.querySelector(":scope > .meta-content");
  return {
    content: getContentFrom(node,curBcvId) || [],
    ...(metaContent && { meta_content: getContentFrom(metaContent,curBcvId) || [] })
  };
};

const getBlock = (node,curBcvId) => {
  const props = getProps(node);
  const defaultContent = ["paragraph"].includes(props.type) && { content: [] };
  return {
    bcvIdStr: props?.bcvIdStr,
    ...(node.childNodes.length ? blockFrom(node,curBcvId) : defaultContent)
  };
};

const browserGetBlocks = (nodes,curBcvId) => Array.from(nodes, (node) => getBlock(node,curBcvId));

const nodeJsGetBlocks = (nodes,curBcvId) =>
  nodes.reduce((blocksList, node) => {
    if (node.nodeType !== ELEMENT_NODE) return blocksList;
    blocksList.push(getBlock(node,curBcvId));
    return blocksList;
  }, []);

const getBlocksFrom = (containerNode,curBcvId) =>
  typeof containerNode.children === "object"
    ? browserGetBlocks(containerNode.children,curBcvId)
    : nodeJsGetBlocks(containerNode.childNodes,curBcvId);

const parseHtml = (html) =>
  typeof DOMParser === "function"
    ? new DOMParser().parseFromString(html, "text/html")
    : parse(html);

function html2bcvPatch(perfHtml, sequenceId, bcvFilter) {
  const sequencesHtml = parseHtml(perfHtml.sequencesHtml[sequenceId]);
  const sequenceElement = sequencesHtml.getElementById(sequenceId);
  let curBcvId = ""
  const blocks = getBlocksFrom(sequenceElement,curBcvId)

  // transform bcvFilter and instead use a set for verification at each level: book, chapter and verse
  const _verseObjectsArray = []

  const bcvVerifyObj = getBcvVerifyStruct(bcvFilter)
  console.log(bcvVerifyObj)

  const fullPatchList = []
  if (blocks){
    blocks.forEach(block => {
      if (block.content?.length>0) {
        fullPatchList.push(...block.content)
      }
    });
  }
  const checkList = fullPatchList.filter(item => item.bcvId === "Tit.1.1")

  return checkList
}

export default html2bcvPatch;
