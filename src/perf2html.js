import { createElement } from "./helpers";

const getBooleanProps = (props) =>
  !!props ? Object.keys(props).filter((key) => props[key] === true) : [];

const handleAtts = (atts) =>
  atts
    ? Object.keys(atts).reduce((attsProps, key) => {
        attsProps[`atts-${key}`] =
          typeof atts[key] === "object" ? atts[key].join(",") : atts[key];
        return attsProps;
      }, {})
    : {};

const handleSubtypeNS = (subType) => {
  const subTypes = subType.split(":");
  return subTypes.length > 1
    ? { "sub_type-ns": subTypes[0], sub_type: subTypes[1] }
    : { sub_type: subType };
};

const contentHtml = (content, className) =>
  content
    ? createElement({
        classList: className,
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
  const innerHtml = ({
    type,
    sub_type: subType,
    content,
    meta_content,
    atts,
    ...element
  }) => {
    const getters = {
      markHtml: () => {
        return ["chapter", "verses"].includes(subType) ? atts.number : "";
      },
      wrapperHtml: () => {
        return (
          contentHtml(content, "content") +
          contentHtml(meta_content, "meta-content")
        );
      }
    };
    const getContentHtml = getters[`${type}Html`];
    return typeof getContentHtml === "function" ? getContentHtml() : "";
  };

  const { metaContent, content, sub_type: subType, atts, ...props } = element;
  const attsProps = handleAtts(atts);
  const subTypes = handleSubtypeNS(subType);

  const classList = [
    element.type,
    ...Object.values(subTypes),
    ...getBooleanProps(props),
    ...getBooleanProps(atts)
  ].join(" ");

  return createElement({
    type: "span",
    classList,
    dataset: { ...props, ...subTypes, ...attsProps },
    children: innerHtml(element)
  });
};

const blockHtml = (block) => {
  const { atts, content, sub_type: subType, ...props } = block;

  const attsProps = handleAtts(atts);
  const subTypes = handleSubtypeNS(subType);

  const classList = [
    block.type,
    ...Object.values(subTypes),
    ...getBooleanProps(props),
    ...getBooleanProps(atts)
  ].join(" ");

  return createElement({
    classList,
    dataset: { ...props, ...subTypes, ...attsProps },
    children: `${contentHtml(content, "content")}`
  });
};

const sequenceHtml = (perfSequence, sequenceId) => {
  const { blocks, ...props } = perfSequence;
  return createElement({
    id: `${sequenceId}`,
    classList: `sequence ${perfSequence.type} ${perfSequence.type}_sequence`,
    dataset: props,
    children: createElement({
      classList: "content",
      children: blocks?.reduce(
        (blocksHtml, block) => (blocksHtml += blockHtml(block)),
        ""
      )
    })
  });
};

function perf2html(perfDocument, sequenceId) {
  const perfSequence = perfDocument.sequences[sequenceId];
  return sequenceHtml(perfSequence, sequenceId);
}

export default perf2html;
