import { useState } from 'react';
import { hunt } from './data/hunt';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ClueScreen } from './components/ClueScreen';
import { PickupScreen } from './components/PickupScreen';
import { CelebrationScreen } from './components/CelebrationScreen';

type Phase = 'welcome' | 'clue' | 'pickup' | 'celebration';

export function App() {
  const [phase, setPhase] = useState<Phase>('welcome');
  const [currentStopIndex, setCurrentStopIndex] = useState(0);

  const currentStop = hunt.stops[currentStopIndex];

  function handleStart() {
    setPhase('clue');
  }

  function handleArrived() {
    setPhase('pickup');
  }

  function handleConfirmed() {
    const isLast = currentStopIndex >= hunt.stops.length - 1;
    if (isLast) {
      setPhase('celebration');
    } else {
      setCurrentStopIndex(i => i + 1);
      setPhase('clue');
    }
  }

  return (
    <div className="app">
      {phase === 'welcome' && (
        <WelcomeScreen hunt={hunt} onStart={handleStart} />
      )}
      {phase === 'clue' && currentStop && (
        <ClueScreen
          stop={currentStop}
          stopNumber={currentStopIndex + 1}
          totalStops={hunt.stops.length}
          onArrived={handleArrived}
        />
      )}
      {phase === 'pickup' && currentStop && (
        <PickupScreen
          stop={currentStop}
          stopNumber={currentStopIndex + 1}
          totalStops={hunt.stops.length}
          onConfirmed={handleConfirmed}
        />
      )}
      {phase === 'celebration' && (
        <CelebrationScreen
          message={hunt.celebrationMessage}
          totalStops={hunt.stops.length}
        />
      )}
    </div>
  );
}
