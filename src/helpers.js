/*
  Given a hierarchical bcv tree structure, for instance:
  const bcvQuery = { 
    book: { 
      act: { },
      tit: {
        ch: { 
          1: { 
            v: { 1: {}, 2: {} } 
          },
          2: {} 
        } 
      } 
    } 
  }

  gets converted to a bcv verify structure, suitable as a help for a simple verification 
  to check if any verse is included in this specification.
  The above example would result in the following structure:
  {
    bookIds: Set(1) { 'Act' }, // all chapters and verses in the Acts of Apostles are valid
    chIds: Set(1) { 'Tit.2' }, // all verses in the Letter to Titus are valid
    vIds: Set(2) { 'Tit.1.1', 'Tit.1.2' } // verses 1 and 2 in chapter 1 of the Letter to Titus are valid
  }
*/

export const getBcvVerifyStruct = (bcvFilter) => {
  const retObj = {
    bookIds: new Set(),
    chIds: new Set(),
    vIds: new Set()
  }
  if (bcvFilter) {
    Object.entries(bcvFilter?.book || {}).forEach(([bookKey, { ch }]) => {
      const bookId = bookKey.charAt(0).toUpperCase() + bookKey.slice(1).toLowerCase()
      const chList = Object.entries(ch || {})
      if (chList?.length>0) {
        chList.forEach(([chapter, { v }]) => {
          const vList = Object.entries(v || {})
          if (vList?.length>0) {
            vList.forEach(([verse]) => {
              retObj.vIds.add(`${bookId}.${chapter}.${verse}`)
            })
          } else {
            retObj.chIds.add(`${bookId}.${chapter}`)
          }
        })  
      } else {
        retObj.bookIds.add(`${bookId}`)
      }
    })
  }
  return retObj    
}


// export const verifyWithBcvStruct = (bcvIdStr, bcvVerifyStruct) => {

// }


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
  const { type, subtype } = props;
  const setDefaultClassList = (type, subtype) => [...(type ? [type] : []), ...(subtype ? [subtype.replace(":", " ")] : [])];

  if (!htmlMap) return { classList: setDefaultClassList(type, subtype) };

  const maps = [
    htmlMap[type]?.[subtype],
    htmlMap["*"]?.[subtype],
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
    classList: result.classList.length ? [...new Set(result.classList)] : setDefaultClassList(type, subtype),
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

export const handleSubtypeNS = (subtype) => {
  const subtypes = subtype.split(":");
  return subtypes.length > 1
    ? { "subtype-ns": subtypes[0], subtype: subtypes[1] }
    : { subtype };
};
