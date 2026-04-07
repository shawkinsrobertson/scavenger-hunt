import { useState } from 'react';
import type { HuntStop } from '../data/hunt';

interface Props {
  stop: HuntStop;
  stopNumber: number;
  totalStops: number;
  onConfirmed: () => void;
}

export function PickupScreen({ stop, stopNumber, totalStops, onConfirmed }: Props) {
  const [confirmed, setConfirmed] = useState(false);

  function handleConfirm() {
    setConfirmed(true);
    setTimeout(onConfirmed, 2000);
  }

  return (
    <div className="screen pickup-screen">
      <div className="progress-bar-container">
        <div
          className="progress-bar"
          style={{ width: `${((stopNumber - 1) / totalStops) * 100}%` }}
        />
      </div>

      <div className="card">
        <div className="stop-badge">Stop {stopNumber} of {totalStops}</div>

        {!confirmed ? (
          <>
            <div className="emoji-header">📍</div>
            <h2>You're Here!</h2>
            <p className="arrival-message">{stop.arrivalMessage}</p>
            <button className="btn btn-success" onClick={handleConfirm}>
              ✅ {stop.confirmLabel}
            </button>
          </>
        ) : (
          <>
            <div className="emoji-header confirmed-emoji">🎊</div>
            <h2>{stop.confirmedMessage}</h2>
            <div className="loading-dots">
              <span /><span /><span />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
