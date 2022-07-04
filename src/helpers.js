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

export const createElement = ({
  type = "div",
  classList = "",
  id = "",
  props = {},
  dataset = {},
  children = ""
}) =>
  `<${type} ${classList && `class="${classList}"`} ${
    id && `id="${id}"`
  } ${getAttributesHtml(props)} ${getDatasetHtml(
    dataset
  )}>${children}</${type}>`;
