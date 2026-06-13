import { useState } from 'react';

export const useMore = () => {
  const [tasbihCount, setTasbihCount] = useState(0);

  const incrementTasbih = () => {
    setTasbihCount((prev) => prev + 1);
  };

  const resetTasbih = () => {
    setTasbihCount(0);
  };

  return {
    tasbihCount,
    incrementTasbih,
    resetTasbih,
  };
};
