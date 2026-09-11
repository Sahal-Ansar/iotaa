export default function TopBar({ onMenu, position, total, right, wrong, attempted }) {
  const pct = (n) => (total ? `${(n / total) * 100}%` : "0%");

  return (
    <div className="bar">
      <div className="barin">
        <button type="button" className="menubtn" aria-label="Open menu" onClick={onMenu}>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="3" y1="6" x2="17" y2="6" />
            <line x1="3" y1="14" x2="17" y2="14" />
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
            <em>ready</em>
          )}
        </span>
      </div>
    </div>
  );
}
