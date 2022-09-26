import defaultHtmlMap from "./htmlmap.js";
import { createElement, handleAtts, handleSubtypeNS, mapHtml } from "./helpers";

function getMap(htmlMap) {
  return typeof htmlMap === "function" ? htmlMap({}) : htmlMap;
}

function perf2html({ perfDocument, sequenceId, htmlMap = map }) {
  const { sequences, ...parent } = perfDocument;
  const perfSequence = sequences[sequenceId];
  return sequenceHtml({ perfSequence, sequenceId, htmlMap, parent });
}

export const contentChildren = ({ content, parent = {}, htmlMap = map }) =>
  content?.reduce(
    (contentHtml, element) =>
      (contentHtml +=
        typeof element === "string"
          ? element
          : contentElementHtml({ element, parent, htmlMap })),
    ""
  ) ?? "";

export const contentHtml = ({
  content,
  className,
  parent = {},
  htmlMap = map,
}) =>
  content
    ? createElement({
        tagName: "span",
        classList: [className],
        children: content?.reduce(
          (contentsHtml, element) =>
            typeof element === "string"
              ? (contentsHtml += element)
              : (contentsHtml += contentElementHtml({
                  element,
                  parent,
                  htmlMap,
                })),
          ""
        ),
      })
    : "";

export const contentElementHtml = ({ element, parent = {}, htmlMap = map }) => {
  const { type, subtype, content, meta_content, atts, ...props } = element;
  const attsProps = handleAtts(atts);
  const subtypes = handleSubtypeNS(subtype);
  const currentProps = { type, subtype, atts, ...props, parent };
  const _htmlmap = getMap(htmlMap);
  const { classList, tagName, id } = mapHtml({
    props: currentProps,
    htmlMap: _htmlmap,
  });
  const innerHtml = (content) => {
    const getters = {
      markHtml: () =>
        ["chapter", "verses"].includes(subtype) ? atts.number : "",
      wrapperHtml: () =>
        contentChildren({ content, htmlMap, parent: currentProps }) +
        contentHtml({
          content: meta_content,
          className: "meta-content",
          parent: currentProps,
          htmlMap: _htmlmap,
        }),
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

export const blockHtml = ({ block, parent = {}, htmlMap = map }) => {
  const { type, subtype, atts, content, ...props } = block;
  const attsProps = handleAtts(atts);
  const subtypes = handleSubtypeNS(subtype);
  const currentProps = { type, subtype, atts, ...props, parent };
  const _htmlmap = getMap(htmlMap);
  const { classList, tagName, id } = mapHtml({
    props: currentProps,
    htmlMap: _htmlmap,
  });
  return createElement({
    tagName,
    id,
    classList,
    dataset: { type, ...subtypes, ...attsProps, ...props },
    children: contentChildren({
      content,
      htmlMap: _htmlmap,
      parent: currentProps,
    }),
  });
};

export const sequenceHtml = ({
  perfSequence,
  sequenceId,
  parent = {},
  htmlMap = map,
}) => {
  const { blocks, ...props } = perfSequence;
  const currentProps = { ...props, subtype: "sequence", parent };
  const _htmlmap = getMap(htmlMap);
  const { classList, tagName } = mapHtml({
    props: currentProps,
    htmlMap: _htmlmap,
  });
  return createElement({
    tagName,
    id: `${sequenceId}`,
    classList: classList,
    dataset: props,
    children: blocks?.reduce(
      (blocksHtml, block) =>
        (blocksHtml += blockHtml({
          block,
          htmlMap: _htmlmap,
          parent: currentProps,
        })),
      ""
    ),
  });
};

export default perf2html;
