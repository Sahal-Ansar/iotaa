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
        <div className="brand">
          <span className="dot" />
          <h1>Drill Room</h1>
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
