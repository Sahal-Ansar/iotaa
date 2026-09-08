export default function TopBar({ onMenu, position, total, right, wrong, attempted }) {
  const pct = (n) => (total ? `${(n / total) * 100}%` : "0%");

  return (
    <div className="bar">
      <div className="barin">
        <button type="button" className="menubtn" aria-label="Open menu" onClick={onMenu}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"
            strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
            <path d="M2 4h12M2 8h12M2 12h12" />
          </svg>
        </button>

        <span className="pos">
          {total ? `${String(Math.min(position, total)).padStart(2, "0")} / ${total}` : "0 / 0"}
        </span>

        <span className="track">
          <i className="g" style={{ width: pct(right) }} />
          <i className="r" style={{ width: pct(wrong) }} />
        </span>

        <span className="score">
          {attempted ? (
            <>
              {right}<em>/{attempted}</em>&nbsp; {Math.round((right / attempted) * 100)}%
            </>
          ) : (
            <em>not started</em>
          )}
        </span>
      </div>
    </div>
  );
}
