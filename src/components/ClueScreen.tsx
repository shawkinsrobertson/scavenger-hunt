import { useGeolocation, distanceBetween } from '../hooks/useGeolocation';
import type { HuntStop } from '../data/hunt';

interface Props {
  stop: HuntStop;
  stopNumber: number;
  totalStops: number;
  onArrived: () => void;
}

function getClue(stop: HuntStop, distance: number): string {
  if (distance > 500) return stop.clues.far;
  if (distance > 100) return stop.clues.medium;
  return stop.clues.near;
}

function ProximityIndicator({ distance }: { distance: number }) {
  let bars = 1;
  let label = 'Far away';
  let color = '#ef4444';

  if (distance <= 100) {
    bars = 3;
    label = 'Getting close!';
    color = '#22c55e';
  } else if (distance <= 500) {
    bars = 2;
    label = 'Warmer…';
    color = '#f59e0b';
  }

  return (
    <div className="proximity-indicator">
      <div className="bars">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="bar"
            style={{
              backgroundColor: i <= bars ? color : '#e5e7eb',
              height: `${i * 10 + 10}px`,
            }}
          />
        ))}
      </div>
      <span className="proximity-label" style={{ color }}>{label}</span>
    </div>
  );
}

export function ClueScreen({ stop, stopNumber, totalStops, onArrived }: Props) {
  const geo = useGeolocation();
  const radius = stop.arrivalRadius ?? 30;

  const distance =
    geo.lat !== null && geo.lng !== null
      ? distanceBetween(geo.lat, geo.lng, stop.location.lat, stop.location.lng)
      : null;

  const hasArrived = distance !== null && distance <= radius;

  return (
    <div className="screen clue-screen">
      <div className="progress-bar-container">
        <div
          className="progress-bar"
          style={{ width: `${((stopNumber - 1) / totalStops) * 100}%` }}
        />
      </div>

      <div className="card">
        <div className="stop-badge">Stop {stopNumber} of {totalStops}</div>

        <div className="emoji-header">🔍</div>
        <h2>Follow the Clue</h2>

        {geo.loading && (
          <div className="status-message">Finding your location…</div>
        )}

        {geo.error && (
          <div className="status-message error">
            📡 {geo.error}
            <br />
            <small>Make sure location access is allowed.</small>
          </div>
        )}

        {!geo.loading && !geo.error && distance !== null && (
          <>
            <ProximityIndicator distance={distance} />
            <div className="clue-text">{getClue(stop, distance)}</div>
            <div className="distance-badge">
              ~{distance < 1000
                ? `${Math.round(distance)}m`
                : `${(distance / 1000).toFixed(1)}km`} away
            </div>
          </>
        )}

        {!geo.loading && !geo.error && distance === null && (
          <div className="clue-text">{stop.clues.far}</div>
        )}

        {hasArrived && (
          <button className="btn btn-primary arrived-btn" onClick={onArrived}>
            I'm Here! 📍
          </button>
        )}

        {geo.accuracy !== null && (
          <div className="accuracy-note">GPS accuracy: ±{Math.round(geo.accuracy)}m</div>
        )}
      </div>
    </div>
  );
}
