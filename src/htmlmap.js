export default (context) => ({
  "*": {
    "*": {
      tagName: "span",
    },
    sequence: {
      tagName: "section",
    },
  },
  paragraph: {
    "*": {
      tagName: "p",
    },
  },
  mark: {
    "*": {
      tagName: "span",
    },
    chapter: ({ atts }) => {
      context.lastChap = atts.number;
      return {
        classList: ["mark", "chapter", `chapter-${atts.number}`],
        id: `chapter-${atts.number}`,
      };
    },
    verses: ({ atts }) => {
      return {
        classList: [
          "mark",
          "verse",
          `verse-${atts.number}`,
          `ref-ch${context.lastChap}v${atts.number}`,
        ],
        id: `verse-${atts.number}`,
      };
    },
  },
  graft: {
    heading: {
      tagName: "div",
    },
    title: {
      tagName: "div",
    },
    introduction: {
      tagName: "div",
    },
  },
});
