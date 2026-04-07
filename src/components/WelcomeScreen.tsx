import type { Hunt } from '../data/hunt';

interface Props {
  hunt: Hunt;
  onStart: () => void;
}

export function WelcomeScreen({ hunt, onStart }: Props) {
  return (
    <div className="screen welcome-screen">
      <div className="card">
        <div className="emoji-header">🗺️</div>
        <h1>{hunt.title}</h1>
        <p className="welcome-message">{hunt.welcomeMessage}</p>
        <div className="stops-preview">
          <span>{hunt.stops.length} stops to find</span>
        </div>
        <button className="btn btn-primary" onClick={onStart}>
          Let's Go! 🚀
        </button>
      </div>
    </div>
  );
}
