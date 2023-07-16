import defaultHtmlMap from "./htmlmap.js";
import {
  createElement,
  handleAtts,
  handleSubtypeNS,
  mapHtml
} from "./helpers";

const contentChildren = (content, htmlMap = defaultHtmlMap) => content?.reduce(
    (contentHtml, element) =>
      contentHtml += (typeof element === "string")
        ? element
        : contentElementHtml(element, htmlMap),
    ""
  ) ?? "";

const contentHtml = (content, className, htmlMap = defaultHtmlMap) =>
  content
    ? createElement({
        tagName: "span",
        classList: [className],
        children: content?.reduce(
          (contentsHtml, element) =>
            typeof element === "string"
              ? (contentsHtml += element)
              : (contentsHtml += contentElementHtml(element, htmlMap)),
          ""
        )
      })
    : "";

const contentElementHtml = (element, htmlMap = defaultHtmlMap) => {
  const {
    type,
    subtype,
    content,
    meta_content,
    atts,
    ...props
  } = element;
  const attsProps = handleAtts(atts);
  const subtypes = handleSubtypeNS(subtype);
  const { classList, tagName, id, attributes } = mapHtml({ props:{ type, subtype, atts, ...props }, htmlMap });
  const innerHtml = (content) => {
    const getters = {
      // markHtml: () => ["chapter", "verses"].includes(subtype) ? "" : "",
      wrapperHtml: () => contentChildren(content, htmlMap) + contentHtml(meta_content, "meta-content", htmlMap)
    };
    const getContentHtml = getters[`${type}Html`];
    return typeof getContentHtml === "function" ? getContentHtml() : "";
  };

  return createElement({
    tagName,
    id,
    classList,
    attributes,
    dataset: { type, ...subtypes, ...attsProps, ...props},
    children: innerHtml(content)
  });
};

const blockHtml = (block, htmlMap = defaultHtmlMap) => {
  const { type, subtype, atts, content, ...props } = block;
  const attsProps = handleAtts(atts);
  const subtypes = handleSubtypeNS(subtype);
  const { classList, tagName, id, attributes } = mapHtml({ props:{ type, subtype, atts, ...props }, htmlMap });
  return createElement({
    tagName,
    id,
    classList,
    attributes,
    dataset: { type, ...subtypes, ...attsProps, ...props },
    children: contentChildren(content, htmlMap)
  });
};


const sequenceHtml = (perfSequence, sequenceId, htmlMap = defaultHtmlMap) => {
  const { blocks, ...props } = perfSequence;
  const { classList, tagName, attributes } = mapHtml({ props: {...props, subtype: "sequence"}, htmlMap });
  return createElement({
    tagName,
    id: `${sequenceId}`,
    classList: classList,
    dataset: props,
    attributes,
    children: blocks?.reduce(
      (blocksHtml, block) => (blocksHtml += blockHtml(block, htmlMap)),
      ""
    )
  });
};

function perf2html(perfDocument, sequenceId, htmlMap = defaultHtmlMap) {  
  const perfSequence = perfDocument.sequences[sequenceId];
  return sequenceHtml(perfSequence, sequenceId, htmlMap);
}

export default perf2html;