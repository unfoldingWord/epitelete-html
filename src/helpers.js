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

export const mapHtml = ({ props, htmlMap }) => {
  const { type, subType } = props;
  const setDefaultClassList = (type, subType) => [...(type ? [type] : []), ...(subType ? [subType.replace(":", " ")] : [])];

  if (!htmlMap) return { classList: setDefaultClassList(type, subType) };

  const maps = [
    htmlMap[type]?.[subType],
    htmlMap["*"]?.[subType],
    htmlMap[type]?.["*"],
    htmlMap["*"]?.["*"]
  ];

  const getClassList = (classList) => classList && (Array.isArray(classList) ? classList : [classList]); 
  const result = maps.reduce((_result, map) => {
    const _map = map || {};
    const { classList, tagName, id } = (typeof _map === 'function') ? _map(props) : _map;

    _result.classList = _result.classList.concat(getClassList(classList) || []);
    if (!_result.tagName && tagName) _result.tagName = tagName;
    if (!_result.id && id) _result.id = id;
    return _result;
  }, { classList: [], tagName: ""});

  return {
    classList: result.classList.length ? [...new Set(result.classList)] : setDefaultClassList(type, subType),
    tagName: result.tagName,
    id: result.id
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
