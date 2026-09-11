import { MODES } from "../lib/constants.js";
import { COURSES } from "../lib/useDrill.js";

export default function Rail({
  open, onClose, courseKey, courseCaption, onCourse, counts, topicNames,
  mode, onMode, topics, onToggleTopic, onAllTopics,
  shuffleOn, onShuffle, dark, onTheme, onRestart, onClear
}) {
  return (
    <aside className={`rail${open ? " open" : ""}`}>
      <div>
        <div className="brand-wrap">
          <div className="brand">
            <div className="brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" fill="currentColor" />
                <circle cx="19" cy="8" r="2" />
                <circle cx="5" cy="8" r="2" />
                <circle cx="6" cy="18" r="2" />
                <circle cx="18" cy="18" r="2" />
                <circle cx="12" cy="4" r="1.5" />
                <path d="M12 9V5.5M10 10.5L6.5 9M14 10.5L17.5 9M10.5 13.5L7.5 16.5M13.5 13.5L16.5 16.5" />
              </svg>
            </div>
            <h1>Drill Room</h1>
          </div>
          <button type="button" className="close-btn" aria-label="Close menu" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="sub">{courseCaption}</div>
      </div>

      <div className="rgroup">
        <h2>Course</h2>
        <div className="courses" role="tablist" aria-label="Course">
          {COURSES.map((c) => (
            <button
              key={c.key}
              type="button"
              role="tab"
              className="course"
              aria-selected={courseKey === c.key}
              onClick={() => onCourse(c.key)}
            >
              {c.short}
            </button>
          ))}
        </div>
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
              <span className="ct">{counts[m.key]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rgroup">
        <h2>Modules</h2>
        <div className="chips">
          {topicNames.map((label, i) => (
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
          Clear {courseKey.toUpperCase()} progress
        </button>
      </div>
    </aside>
  );
}
