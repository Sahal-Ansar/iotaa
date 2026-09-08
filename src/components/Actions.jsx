export default function Actions({ children }) {
  return <div className="acts">{children}</div>;
}

export function Hint({ children }) {
  return <span className="kbd">{children}</span>;
}

export function Key({ children }) {
  return <b>{children}</b>;
}
