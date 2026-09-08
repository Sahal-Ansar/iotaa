import RichText from "./RichText.jsx";

export default function Feedback({ tone, verdict, children }) {
  return (
    <div className={`fb ${tone}`}>
      <div className="v">{verdict}</div>
      {children}
    </div>
  );
}

export function Explanation({ text }) {
  return <RichText as="p">{text}</RichText>;
}
