export default function Summary({ score, topicNames, hasWrong, onRetryWrong, onRestart }) {
  const { right, wrong, attempted, byTopic } = score;
  const pct = attempted ? Math.round((right / attempted) * 100) : 0;

  return (
    <div className="done">
      <div className="bignum">{pct}%</div>
      <h2>Set complete</h2>
      <p>{right} right, {wrong} wrong out of {attempted} attempted.</p>

      <div className="acts center">
        {hasWrong && (
          <button type="button" className="btn" onClick={onRetryWrong}>
            Retry {wrong} missed
          </button>
        )}
        <button type="button" className={`btn${hasWrong ? " ghost" : ""}`} onClick={onRestart}>
          Run the set again
        </button>
      </div>

      {attempted > 0 && (
        <div className="breakdown">
          {byTopic.map((bucket, i) =>
            bucket.total ? (
              <div className="brow" key={topicNames[i]}>
                <span className="nm">{topicNames[i]}</span>
                <span className="bar">
                  <i style={{ width: `${Math.round((bucket.right / bucket.total) * 100)}%` }} />
                </span>
                <span className="pc">{Math.round((bucket.right / bucket.total) * 100)}%</span>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
