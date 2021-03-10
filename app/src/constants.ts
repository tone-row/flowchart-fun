export const LAYOUT: any = {
  name: "dagre",
  fit: true,
  animate: true,
  rankDir: "LR",
  spacingFactor: 1.25,
};

export const lineColor = "#000000";
export const textColor = "#000000";

export const defaultText = `this app works by typing
  new lines create new nodes
    indentation creates child nodes 
    and any text: before a colon+space creates a label
  [linking] you can link to nodes using their ID in parentheses
    like this: (1)
    lines have a default ID of their line-number
      but you can also supply a custom ID in brackets
        like this: (linking) // use single line comments
/*
or 
multiline 
comments

Have fun! 🎉
*/`;
