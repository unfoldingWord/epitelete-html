import defaultHtmlMap from "./htmlmap.js";
import { createElement, handleAtts, handleSubtypeNS, mapHtml } from "./helpers";

function perf2html(perfDocument, sequenceId, htmlMap = defaultHtmlMap) {
  const sequence = perfDocument.sequences[sequenceId];
  return sequenceToHtml({ sequence, sequenceId, htmlMap });
}

const contentHtml = (content, className, htmlMap) =>
  content
    ? createElement({
        tagName: "span",
        classList: [className],
        children: content?.reduce(
          (contentsHtml, element) =>
            typeof element === "string"
              ? (contentsHtml += element)
              : (contentsHtml += contentElementToHtml({ element, htmlMap })),
          ""
        ),
      })
    : "";

const contentChildren = (content, htmlMap) =>
  content?.reduce(
    (contentHtml, element) =>
      (contentHtml +=
        typeof element === "string"
          ? element
          : contentElementToHtml({ element, htmlMap })),
    ""
  ) ?? "";

export const contentElementToHtml = ({ element, htmlMap }) => {
  const { type, subtype, content, meta_content, atts, ...props } = element;
  const attsProps = handleAtts(atts);
  const subtypes = handleSubtypeNS(subtype);
  const { classList, tagName, id } = mapHtml({
    props: { type, subtype, atts, ...props },
    htmlMap,
  });
  const innerHtml = (content) => {
    const getters = {
      markHtml: () =>
        ["chapter", "verses"].includes(subtype) ? atts.number : "",
      wrapperHtml: () =>
        contentChildren(content, htmlMap) +
        contentHtml(meta_content, "meta-content", htmlMap),
    };
    const getContentHtml = getters[`${type}Html`];
    return typeof getContentHtml === "function" ? getContentHtml() : "";
  };
  return createElement({
    tagName,
    id,
    classList,
    dataset: { type, ...subtypes, ...attsProps, ...props },
    children: innerHtml(content),
  });
};

export const blockToHtml = ({ block, htmlMap }) => {
  const { type, subtype, atts, content, ...props } = block;
  const attsProps = handleAtts(atts);
  const subtypes = handleSubtypeNS(subtype);
  const { classList, tagName, id } = mapHtml({
    props: { type, subtype, atts, ...props },
    htmlMap,
  });
  return createElement({
    tagName,
    id,
    classList,
    dataset: { type, ...subtypes, ...attsProps, ...props },
    children: contentChildren(content, htmlMap),
  });
};

export const sequenceToHtml = ({ sequence, sequenceId, htmlMap }) => {
  const { blocks, ...props } = sequence;
  const { classList, tagName } = mapHtml({
    props: { ...props, subtype: "sequence" },
    htmlMap,
  });
  return createElement({
    tagName,
    id: `${sequenceId}`,
    classList: classList,
    dataset: props,
    children: blocks?.reduce(
      (blocksHtml, block) => (blocksHtml += blockToHtml({ block, htmlMap })),
      ""
    ),
  });
};

export default perf2html;
