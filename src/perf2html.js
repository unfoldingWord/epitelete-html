import defaultHtmlMap from "./htmlmap.json";
import {
  createElement,
  handleAtts,
  handleSubtypeNS,
  mapHtml
} from "./helpers";

function perf2html(perfDocument, sequenceId, htmlMap = defaultHtmlMap) {
  const contentChildren = (content) => content?.reduce(
    (contentHtml, element) =>
      contentHtml += (typeof element === "string")
        ? element
        : contentElementHtml(element),
    ""
  );

  const contentHtml = (content, className) =>
    content
      ? createElement({
          tagName: "span",
          classList: [className],
          children: content?.reduce(
            (contentsHtml, element) =>
              typeof element === "string"
                ? (contentsHtml += element)
                : (contentsHtml += contentElementHtml(element)),
            ""
          )
        })
      : "";

  const contentElementHtml = (element) => {
    const {
      type,
      sub_type: subType,
      content,
      meta_content,
      atts,
      ...props
    } = element;
    const attsProps = handleAtts(atts);
    const subTypes = handleSubtypeNS(subType);
    const { classList, tagName } = mapHtml({type, subType, htmlMap});
    const innerHtml = (content) => {
      const getters = {
        markHtml: () => ["chapter", "verses"].includes(subType) ? atts.number : "",
        wrapperHtml: () => contentChildren(content) + contentHtml(meta_content, "meta-content")
      };
      const getContentHtml = getters[`${type}Html`];
      return typeof getContentHtml === "function" ? getContentHtml() : "";
    };

    return createElement({
      tagName,
      classList,
      dataset: { type, ...subTypes, ...attsProps, ...props},
      children: innerHtml(content)
    });
  };

  const blockHtml = (block) => {
    const { type, sub_type: subType, atts, content, ...props } = block;
    const attsProps = handleAtts(atts);
    const subTypes = handleSubtypeNS(subType);
    const { classList, tagName } = mapHtml({type, subType, htmlMap});
    return createElement({
      tagName,
      classList,
      dataset: { type, ...subTypes, ...attsProps, ...props },
      children: contentChildren(content)
    });
  };

  const sequenceHtml = (perfSequence, sequenceId) => {
    const { blocks, ...props } = perfSequence;
    const { classList, tagName } = mapHtml({ type: props.type, subType: "sequence", htmlMap });
    return createElement({
      tagName,
      id: `${sequenceId}`,
      classList: classList,
      dataset: props,
      children: blocks?.reduce(
        (blocksHtml, block) => (blocksHtml += blockHtml(block)),
        ""
      )
    });
  };
  const perfSequence = perfDocument.sequences[sequenceId];
  return sequenceHtml(perfSequence, sequenceId);
}

export default perf2html;
