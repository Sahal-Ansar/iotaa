import React, { useMemo } from "react";

const TAGS = { b: "strong", i: "em", sub: "sub", sup: "sup" };
const TOKEN = /<(\/?)(b|i|sub|sup|br)\s*\/?>/gi;

/**
 * The question bank carries a tiny, fixed set of inline tags (<b> <i> <sub>
 * <sup> <br>). Parsing them into real React elements keeps raw markup out of
 * the DOM entirely, so nothing in the data can inject anything else.
 */
function parse(source) {
  const root = { tag: null, children: [] };
  const stack = [root];
  const top = () => stack[stack.length - 1];
  let cursor = 0;
  let seq = 0;
  let match;

  TOKEN.lastIndex = 0;
  while ((match = TOKEN.exec(source)) !== null) {
    const [raw, closing, rawName] = match;
    const name = rawName.toLowerCase();

    const text = source.slice(cursor, match.index);
    if (text) top().children.push(text);
    cursor = match.index + raw.length;
    seq += 1;

    if (name === "br") {
      top().children.push({ tag: "br", key: `br-${seq}`, children: [] });
    } else if (closing) {
      if (stack.length > 1) stack.pop();
    } else {
      const frame = { tag: TAGS[name], key: `${name}-${seq}`, children: [] };
      top().children.push(frame);
      stack.push(frame);
    }
  }
  const tail = source.slice(cursor);
  if (tail) top().children.push(tail);
  return root.children;
}

function toElements(nodes) {
  return nodes.map((node, index) => {
    if (typeof node === "string") return node;
    if (node.tag === "br") return <br key={node.key || index} />;
    return React.createElement(
      node.tag,
      { key: node.key || index },
      ...toElements(node.children)
    );
  });
}

export default function RichText({ children, as: Tag = "span", ...rest }) {
  const nodes = useMemo(() => parse(String(children ?? "")), [children]);
  return <Tag {...rest}>{toElements(nodes)}</Tag>;
}
