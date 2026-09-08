import { MODES } from "../lib/constants.js";
import { COUNTS, TOPICS } from "../lib/useDrill.js";

export default function Rail({
  open, onClose, mode, onMode, topics, onToggleTopic, onAllTopics,
  shuffleOn, onShuffle, dark, onTheme, onRestart, onClear
}) {
  return (
    <aside className={`rail${open ? " open" : ""}`}>
      <div>
        <div className="brand">
          <span className="dot" />
          <h1>IoT Drill Room</h1>
        </div>
        <div className="sub">IoT &amp; Applications · active recall</div>
      </div>

      <div className="rgroup">
        <h2>Drill</h2>
        <div className="modes">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              className="mode"
              aria-current={mode === m.key}
              onClick={() => { onMode(m.key); onClose(); }}
            >
              <span>{m.label}</span>
              <span className="ct">{COUNTS[m.key]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rgroup">
        <h2>Modules</h2>
        <div className="chips">
          {TOPICS.map((label, i) => (
            <button
              key={label}
              type="button"
              className="chip"
              aria-pressed={topics.includes(i)}
              onClick={() => onToggleTopic(i)}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            className="chip"
            aria-pressed={topics.length === 0}
            onClick={onAllTopics}
          >
            All
          </button>
        </div>
      </div>

      <div className="railfoot">
        <div className="switch">
          <span>Shuffle order</span>
          <button type="button" className="tgl" aria-pressed={shuffleOn}
            aria-label="Shuffle order" onClick={onShuffle} />
        </div>
        <div className="switch">
          <span>Dark mode</span>
          <button type="button" className="tgl" aria-pressed={dark}
            aria-label="Dark mode" onClick={onTheme} />
        </div>
        <button type="button" className="tinybtn" onClick={() => { onRestart(); onClose(); }}>
          Restart this set
        </button>
        <button type="button" className="tinybtn warn" onClick={() => { onClear(); onClose(); }}>
          Clear all progress
        </button>
      </div>
    </aside>
  );
}
