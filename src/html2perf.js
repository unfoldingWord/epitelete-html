import { parse } from "node-html-parser";

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
    "sub_type-ns": subTypeNs,
    sub_type: subType,
    ...dataset
  } = getDataset(node);
  const sub_type = {
    sub_type: subTypeNs ? `${subTypeNs}:${subType}` : subType
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
  return {
    ...props,
    ...sub_type
  };
};

const getContentFrom = (contentNode) =>
  Array.from(contentNode.childNodes, (node) => {
    if (node.nodeType === TEXT_NODE) return node.textContent;
    const props = getProps(node);
    const contents = node.childNodes;
    try {
    } catch (error) {
      console.error(error);
      console.log(contents.length);
    }
    const block = {
      ...props,
      ...(contents?.length &&
        [...contents].reduce((contents, node) => {
          if (node.nodeType === TEXT_NODE) return contents;
          return { ...contents, ...blockFrom(node) };
        }, {}))
    };
    return block;
  });

const blockFrom = (node) => {
  const content = node.classList && [...node.classList.values()][0];
  return {
    [content]: getContentFrom(node) || []
  };
};

const getBlock = (node) => {
  const props = getProps(node);
  return {
    ...props,
    ...(props.type === "paragraph" && blockFrom(node.firstChild))
  };
};

const browserGetBlocks = (nodes) => Array.from(nodes, (node) => getBlock(node));

const nodeJsGetBlocks = (nodes) =>
  nodes.reduce((blocksList, node) => {
    if (node.nodeType !== ELEMENT_NODE) return blocksList;
    blocksList.push(getBlock(node));
    return blocksList;
  }, []);

const getBlocksFrom = (containerNode) =>
  typeof containerNode.children === "object"
    ? browserGetBlocks(containerNode.children)
    : nodeJsGetBlocks(containerNode.childNodes);

const parseHtml = (html) =>
  typeof DOMParser === "function"
    ? new DOMParser().parseFromString(html, "text/html")
    : parse(html);

function html2perf(perfHtml, sequenceId) {
  const sequencesHtml = parseHtml(perfHtml.sequencesHtml[sequenceId]);
  const sequenceElement = sequencesHtml.getElementById(sequenceId);
  const blocksContainer = sequenceElement.querySelector(".paragraph, .graft")
    .parentNode;
  const props = getDataset(sequenceElement);

  return {
    ...props,
    blocks: getBlocksFrom(blocksContainer)
  };
}

export default html2perf;
