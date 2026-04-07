import { useEffect, useState } from 'react';
import { hunt } from './src/data/hunt';
import { WelcomeScreen } from './src/components/WelcomeScreen';
import { ClueScreen } from './src/components/ClueScreen';
import { PickupScreen } from './src/components/PickupScreen';
import { CelebrationScreen } from './src/components/CelebrationScreen';
import * as Font from 'expo-font';

type Phase = 'welcome' | 'clue' | 'pickup' | 'celebration';

export default function App() {
  const [phase, setPhase] = useState<Phase>('welcome');
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'PixelifySans-Bold': require('./src/assets/Fonts/PixelifySans-Bold.ttf'),
        'PixelifySans-Italic': require('./src/assets/Fonts/PixelifySans-Italic.ttf'),
        'PixelifySans-Medium': require('./src/assets/Fonts/PixelifySans-Medium.ttf'),
        'PixelifySans-SemiBold': require('./src/assets/Fonts/PixelifySans-SemiBold.ttf'),
        'RobotoMono-Light': require('./src/assets/Fonts/RobotoMono-Light.ttf'),
        'RobotoMono-Bold': require('./src/assets/Fonts/RobotoMono-Bold.ttf'),
        'RobotoMono-Regular': require('./src/assets/Fonts/RobotoMono-Regular.ttf'),
        'RobotoMono-Medium': require('./src/assets/Fonts/RobotoMono-Medium.ttf'),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);
  if (!fontsLoaded) {
    return null;
  } 

  const currentStop = hunt.stops[currentStopIndex];

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

  if (phase === 'welcome') {
    return <WelcomeScreen hunt={hunt} onStart={() => setPhase('clue')} />;
  }
  if (phase === 'clue' && currentStop) {
    return (
      <ClueScreen
        stop={currentStop}
        stopNumber={currentStopIndex + 1}
        totalStops={hunt.stops.length}
        onArrived={handleArrived}
      />
    );
  }
  if (phase === 'pickup' && currentStop) {
    return (
      <PickupScreen
        stop={currentStop}
        stopNumber={currentStopIndex + 1}
        totalStops={hunt.stops.length}
        onConfirmed={handleConfirmed}
      />
    );
  }
  return (
    <CelebrationScreen
      message={hunt.celebrationMessage}
      totalStops={hunt.stops.length}
    />
  );
}
