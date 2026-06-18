import { useState } from 'react';
import { Vibration } from 'react-native';

export const useMore = () => {
  const [tasbihCount, setTasbihCount] = useState(0);
  const [target, setTargetState] = useState<number | null>(33);
  const [laps, setLaps] = useState(0);

  const setTarget = (newTarget: number | null) => {
    setTargetState(newTarget);
    setTasbihCount(0);
    setLaps(0);
  };

  const incrementTasbih = () => {
    if (target !== null) {
      if (tasbihCount + 1 >= target) {
        setTasbihCount(0);
        setLaps((l) => l + 1);
        try {
          Vibration.vibrate(150);
        } catch (_) {}
      } else {
        setTasbihCount((prev) => prev + 1);
      }
    } else {
      setTasbihCount((prev) => prev + 1);
    }
  };

  const resetTasbih = () => {
    setTasbihCount(0);
    setLaps(0);
  };

  return {
    tasbihCount,
    target,
    setTarget,
    laps,
    incrementTasbih,
    resetTasbih,
  };
};
