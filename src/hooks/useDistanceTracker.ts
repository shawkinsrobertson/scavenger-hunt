import { useRef, useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { distanceBetween } from './useGeolocation';

/**
 * Accumulates total GPS distance (metres) while `active` is true.
 * Reuses the already-granted foreground location permission.
 */
export function useDistanceTracker(active: boolean): number {
  const [totalDistance, setTotalDistance] = useState(0);
  const lastPos = useRef<{ lat: number; lng: number } | null>(null);
  const accumulated = useRef(0);
  const subscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;

    async function start() {
      // Permission is already granted by useGeolocation — just check, don't re-prompt.
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || cancelled) return;

      subscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 8,  // only fire after 8m movement to avoid GPS noise
          timeInterval: 5000,
        },
        (loc) => {
          if (cancelled) return;
          const { latitude: lat, longitude: lng } = loc.coords;
          if (lastPos.current) {
            const delta = distanceBetween(lastPos.current.lat, lastPos.current.lng, lat, lng);
            // Ignore implausible jumps (>200m in one update = GPS glitch)
            if (delta < 200) {
              accumulated.current += delta;
              setTotalDistance(Math.round(accumulated.current));
            }
          }
          lastPos.current = { lat, lng };
        },
      );
    }

    start().catch(() => {});

    return () => {
      cancelled = true;
      subscription.current?.remove();
    };
  }, [active]);

  return totalDistance;
}
