import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';

export interface GeoState {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation(): GeoState {
  const [state, setState] = useState<GeoState>({
    lat: null,
    lng: null,
    accuracy: null,
    error: null,
    loading: true,
  });

  const subscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;

      if (status !== 'granted') {
        setState(s => ({
          ...s,
          loading: false,
          error: 'Location permission denied. Please enable it in Settings.',
        }));
        return;
      }

      subscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 5,
          timeInterval: 3000,
        },
        (loc) => {
          if (cancelled) return;
          setState({
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
            accuracy: loc.coords.accuracy,
            error: null,
            loading: false,
          });
        },
      );
    }

    start().catch((err: Error) => {
      if (!cancelled) {
        setState(s => ({ ...s, loading: false, error: err.message }));
      }
    });

    return () => {
      cancelled = true;
      subscription.current?.remove();
    };
  }, []);

  return state;
}

/** Haversine distance between two lat/lng points, in metres */
export function distanceBetween(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
