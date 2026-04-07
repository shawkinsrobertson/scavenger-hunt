import { useEffect, useState } from 'react';

interface Props {
  message: string;
  totalStops: number;
}

export function CelebrationScreen({ message, totalStops }: Props) {
  const [confettiItems] = useState(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      color: ['#f59e0b', '#ec4899', '#3b82f6', '#22c55e', '#a855f7', '#ef4444'][i % 6],
      size: 8 + Math.random() * 8,
    }))
  );

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`screen celebration-screen ${visible ? 'visible' : ''}`}>
      {confettiItems.map(c => (
        <div
          key={c.id}
          className="confetti-piece"
          style={{
            left: `${c.left}%`,
            animationDelay: `${c.delay}s`,
            backgroundColor: c.color,
            width: c.size,
            height: c.size,
          }}
        />
      ))}

      <div className="card celebration-card">
        <div className="emoji-header celebration-emoji">🎂</div>
        <h1 className="celebration-title">You Did It!</h1>
        <p className="celebration-message">{message}</p>
        <div className="stops-summary">
          🎁 {totalStops} stop{totalStops !== 1 ? 's' : ''} completed
        </div>
        <div className="balloon-row">🎈🎈🎈</div>
      </div>
    </div>
  );
}
