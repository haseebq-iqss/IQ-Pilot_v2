import { useState, useEffect, useCallback } from "react";

export default function useTimer(): [(minutes?: number) => void, () => number] {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const startTimer = useCallback((minutes: number = 0) => {
    setStartTime(Date.now() - minutes * 60000); // Convert minutes to milliseconds
  }, []);

  useEffect(() => {
    if (startTime !== null) {
      const intervalId = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000); // Update every second

      return () => clearInterval(intervalId);
    }
  }, [startTime]);

  const getElapsedTime = (): number => {
    if (startTime === null) {
      return 0;
    }

    const elapsedMilliseconds = elapsedTime;
    const elapsedMinutes = elapsedMilliseconds / 60000;

    return parseFloat(elapsedMinutes.toFixed(1)); // Return the elapsed minutes rounded to 1 decimal place
  };

  return [startTimer, getElapsedTime];
}
