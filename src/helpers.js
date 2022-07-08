export const getAttributesHtml = (props) =>
  Object.keys(props).reduce(
    (html, propKey) =>
      props[propKey] ? (html += `${propKey}="${props[propKey]}" `) : html,
    ""
  );

export const getDatasetHtml = (data) =>
  Object.keys(data).reduce(
    (html, dataKey) =>
      data[dataKey] ? (html += `data-${dataKey}="${data[dataKey]}" `) : html,
    ""
  );

export const createElement = (
  {
    tagName = "div",
    classList = "",
    id = "",
    props = {},
    dataset = {},
    children = ""
  },
  htmlAttrsMap
) =>
  `<${tagName} ${
    classList && Array.isArray(classList)
      ? `class="${classList.join(" ")}"`
      : `class="${classList}"`
  } ${id && `id="${id}"`} ${getAttributesHtml(props)} ${getDatasetHtml(
    dataset
  )}>${children}</${tagName}>`;

export const tagNameMap = ({
  type,
  subType,
  defaultTagName = undefined,
  htmlMap: { tagName }
}) =>
  tagName?.[`t:${type}/s:${subType}`] ||
  tagName?.[`t:${type}`] ||
  tagName?.[`s:${subType}`] ||
  defaultTagName;

export const classNameMap = ({ classList, htmlMap: { className } }) =>
  classList.map((value) => className?.[value] ?? value);

export const getBooleanProps = (props) =>
  !!props ? Object.keys(props).filter((key) => props[key] === true) : [];

export const handleAtts = (atts) =>
  atts
    ? Object.keys(atts).reduce((attsProps, key) => {
        attsProps[`atts-${key}`] =
          typeof atts[key] === "object" ? atts[key].join(",") : atts[key];
        return attsProps;
      }, {})
    : {};

export const handleSubtypeNS = (subType) => {
  const subTypes = subType.split(":");
  return subTypes.length > 1
    ? { "sub_type-ns": subTypes[0], sub_type: subTypes[1] }
    : { sub_type: subType };
};
