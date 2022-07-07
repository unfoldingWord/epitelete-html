import defaultHtmlMap from "./htmlmap.json";
import {
  createElement,
  tagNameMap,
  classNameMap,
  handleAtts,
  handleSubtypeNS,
  getBooleanProps
} from "./helpers";

function perf2html(perfDocument, sequenceId, htmlMap = defaultHtmlMap) {
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
    const tagName = tagNameMap({
      type,
      subType,
      htmlMap,
      defaultTagName: "span"
    });
    const chapterVerse = ["chapter", "verses"].includes(subType) && `${subType}_${atts.number}`;
    const attsProps = handleAtts(atts);
    const subTypes = handleSubtypeNS(subType);
    const subTypesArray = Object.values(subTypes);
    const classList = classNameMap({
      classList: [
        type,
        ...subTypesArray,
        ...(subTypesArray.length > 1 ? [subTypesArray.join("-")] : []),
        ...(chapterVerse ? [chapterVerse] : []),
        ...getBooleanProps(props),
        ...getBooleanProps(atts)
      ],
      htmlMap
    });
    const innerHtml = () => {
      const getters = {
        markHtml: () =>
          ["chapter", "verses"].includes(subType) ? atts.number : "",
        wrapperHtml: () =>
          contentHtml(content, "content") +
          contentHtml(meta_content, "meta-content")
      };
      const getContentHtml = getters[`${type}Html`];
      return typeof getContentHtml === "function" ? getContentHtml() : "";
    };

    return createElement({
      tagName,
      classList,
      dataset: { ...props, type, ...subTypes, ...attsProps },
      children: innerHtml()
    });
  };

  const blockHtml = (block) => {
    const { atts, content, sub_type: subType, ...props } = block;
    const tagName = tagNameMap({ type: props.type, subType, htmlMap });
    const attsProps = handleAtts(atts);
    const subTypes = handleSubtypeNS(subType);
    const subTypesArray = Object.values(subTypes);
    const classList = classNameMap({
      classList: [
        block.type,
        ...subTypesArray,
        ...(subTypesArray.length > 1 ? [subTypesArray.join("-")] : []),
        ...getBooleanProps(props),
        ...getBooleanProps(atts)
      ],
      htmlMap
    });
    return createElement({
      tagName,
      classList,
      dataset: { ...props, ...subTypes, ...attsProps },
      children: `${contentHtml(content, "content")}`
    });
  };

  const sequenceHtml = (perfSequence, sequenceId) => {
    const { blocks, ...props } = perfSequence;
    const classList = classNameMap({
      classList: [
        "sequence",
        perfSequence.type,
        `${perfSequence.type}_sequence`
      ],
      htmlMap
    });
    const tagName = tagNameMap({ type: props.type, htmlMap });
    return createElement({
      tagName,
      id: `${sequenceId}`,
      classList,
      dataset: props,
      children: createElement({
        classList: ["content"],
        children: blocks?.reduce(
          (blocksHtml, block) => (blocksHtml += blockHtml(block)),
          ""
        )
      })
    });
  };
  const perfSequence = perfDocument.sequences[sequenceId];
  return sequenceHtml(perfSequence, sequenceId);
}

export default perf2html;
