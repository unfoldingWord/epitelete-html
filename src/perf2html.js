import defaultHtmlMap from "./htmlmap.js";
import { createElement, handleAtts, handleSubtypeNS, mapHtml } from "./helpers";

function perf2html(
  perfDocument,
  sequenceId,
  htmlMap = defaultHtmlMap,
  bcvFilter
) {
  const bookId = perfDocument?.metadata?.document?.bookCode;
  const bcvContext = {
    bookId,
    ignoreAll: false,
  };

  const verifyBcv = () => { // set ignoreAll accordingly - implemented as a local side-effect!
    const bkListObj = bcvFilter?.book;
    let invalidBcv = false;
    if (bkListObj) { // found list of books
      const bk = bcvContext?.bookId.toLowerCase();
      const bkObj = bk && bkListObj[bk];
      if (!bkObj) { // current book is not found
        invalidBcv = true;
      } else {
        const chListObj = bkObj.ch;
        if (chListObj) { // found list of chapters
          const chNum = bcvContext?.chNum;
          const chObj = chNum && chListObj[chNum];
          if (!chObj) { // current chapter is not found
            invalidBcv = true;
          } else {
            const vListObj = chObj.v;
            if (vListObj) { // found list of verses
              const vNum = bcvContext?.vNum;
              invalidBcv = !vNum || !vListObj[vNum]; // check if current verse is found
            }
          }
        }
      }
    }
    bcvContext.ignoreAll = invalidBcv;
  };

  const conditionalCreateElement = (props) => {
    const resStr = createElement({ ...props });
    return bcvContext.ignoreAll ? "" : resStr;
  };

  const contentChildren = (content, htmlMap = defaultHtmlMap) =>
    content?.reduce((contentHtml, element) => {
      return (contentHtml +=
        typeof element === "string"
          ? bcvContext.ignoreAll
            ? ""
            : element
          : contentElementHtml(element, htmlMap));
    }, "") ?? "";

  const contentHtml = (content, className, htmlMap = defaultHtmlMap) =>
    content
      ? conditionalCreateElement({
          tagName: "span",
          classList: [className],
          children: content?.reduce(
            (contentsHtml, element) =>
              typeof element === "string"
                ? bcvContext.ignoreAll
                  ? ""
                  : (contentsHtml += element)
                : (contentsHtml += contentElementHtml(element, htmlMap)),
            ""
          ),
        })
      : "";

  const contentElementHtml = (element, htmlMap = defaultHtmlMap) => {
    const { type, subtype, content, meta_content, atts, ...props } = element;
    const _bookId = bcvContext.bookId;
    const bookId =
      _bookId.charAt(0).toUpperCase() + _bookId.slice(1).toLowerCase();
    let attsProps = handleAtts(atts);
    if (subtype === "verses") {
      attsProps["bcv-id"] = `${bookId}.${bcvContext.chNum}.${atts.number}`;
    }
    const subtypes = handleSubtypeNS(subtype);
    const { classList, tagName, id, attributes } = mapHtml({
      props: { type, subtype, atts, ...props },
      htmlMap,
    });
    const innerHtml = (content) => {
      const getters = {
        markHtml: () =>
          ["chapter", "verses"].includes(subtype) ? atts.number : "",
        wrapperHtml: () =>
          contentChildren(content, htmlMap) +
          contentHtml(meta_content, "meta-content"),
      };
      const getContentHtml = getters[`${type}Html`];
      if (type === "mark") {
        if (subtype === "chapter") {
          bcvContext.chNum = atts.number;
          bcvContext.vNum = 1;
          verifyBcv();
        } else if (subtype === "verses") {
          bcvContext.vNum = atts.number;
          verifyBcv();
        }
      }
      const retStr =
        typeof getContentHtml === "function" ? getContentHtml() : "";
      return bcvContext.ignoreAll ? "" : retStr;
    };

    return conditionalCreateElement({
      tagName,
      id,
      classList,
      attributes,
      dataset: { type, ...subtypes, ...attsProps, ...props },
      children: innerHtml(content),
    });
  };

  const blockHtml = (block, htmlMap = defaultHtmlMap) => {
    const { type, subtype, atts, content, ...props } = block;
    const attsProps = handleAtts(atts);
    const subtypes = handleSubtypeNS(subtype);
    const { classList, tagName, id, attributes } = mapHtml({
      props: { type, subtype, atts, ...props },
      htmlMap,
    });
    return conditionalCreateElement({
      tagName,
      id,
      classList,
      attributes,
      dataset: { type, ...subtypes, ...attsProps, ...props },
      children: contentChildren(content, htmlMap),
    });
  };

  const sequenceHtml = (perfSequence, sequenceId, htmlMap = defaultHtmlMap) => {
    const { blocks, ...props } = perfSequence;
    const { classList, tagName, attributes } = mapHtml({
      props: { ...props, subtype: "sequence" },
      htmlMap,
    });
    return createElement({
      tagName,
      id: `${sequenceId}`,
      classList: classList,
      dataset: props,
      attributes,
      children: blocks?.reduce(
        (blocksHtml, block) => (blocksHtml += blockHtml(block, htmlMap)),
        ""
      ),
    });
  };
  const perfSequence = perfDocument.sequences[sequenceId];
  return sequenceHtml(perfSequence, sequenceId, htmlMap);
}

export default perf2html;
