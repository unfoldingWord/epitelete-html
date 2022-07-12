const getAttributesHtml = (props) =>
  Object.keys(props).reduce(
    (html, propKey) =>
      props[propKey] ? (html += `${propKey}="${props[propKey]}" `) : html,
    ""
  );

const getDatasetHtml = (data) =>
  Object.keys(data).reduce(
    (html, dataKey) =>
      data[dataKey] ? (html += ` data-${dataKey}="${data[dataKey]}"`) : html,
    ""
  );

const setClassList = classList => classList && Array.isArray(classList)
  ? ` class="${classList.join(" ")}" `
  : ` class="${classList}" `;

const setElementAttributes = ({
  classList,
  id,
  props,
  dataset
}) => `${setClassList(classList)}${id && `id="${id}" `}${getAttributesHtml(props)}${getDatasetHtml(dataset)}`;

export const createElement = (
  {
    tagName = "div",
    classList = "",
    id = "",
    props = {},
    dataset = {},
    children = ""
  }
) => `<${tagName || "div"}${setElementAttributes({classList,id,props,dataset})}>${children}</${tagName || "div"}>`;

export const mapHtml = ({ type, subType, htmlMap }) => {
  const setDefaultClassList = (type, subType) => [...(type ? [type] : []), ...(subType ? [subType.replace(":", " ")] : [])];

  if (!htmlMap) return { classList: setDefaultClassList(type, subType) };

  const maps = [
    htmlMap[type]?.[subType],
    htmlMap["*"]?.[subType],
    htmlMap[type]?.["*"],
    htmlMap["*"]?.["*"]
  ];

  const getClassList = (classList) => classList && (Array.isArray(classList) ? classList : [classList]); 
  const result = maps.reduce((result, map) => {
    result.classList = result.classList.concat(getClassList(map?.classList) || []);
    if (!result.tagName && map?.tagName) result.tagName = map.tagName;
    return result;
  }, { classList: [], tagName: "" });

  return {
    classList: result.classList.length ? [...new Set(result.classList)] : setDefaultClassList(type, subType),
    tagName: result.tagName
  }
}

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
