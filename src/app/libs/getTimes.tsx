"use client";
import React, { useState, useEffect } from "react";

export default function useTimeChecks() {
  const [isSundayAfternoon, setIsSundayAfternoon] = useState(false);
  const [isSundayEvening, setIsSundayEvening] = useState(false);
  const [isSundayNight, setIsSundayNight] = useState(false);
  const [isMondayNight, setIsMondayNight] = useState(false);

  const checkTimes = () => {
    const pacificTime = new Date().toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
    });

    const currentTime = new Date(pacificTime);

    //REMEMBER GET RID OF -7
    const sundayAfternoon = new Date(currentTime);
    sundayAfternoon.setDate(
      currentTime.getDate() + ((7 - currentTime.getDay() + 0 - 7) % 7)
    );
    sundayAfternoon.setHours(13, 30, 0, 0);

    const sundayEvening = new Date(currentTime);
    sundayEvening.setDate(
      currentTime.getDate() + ((7 - currentTime.getDay() + 0) % 7)
    );
    sundayEvening.setHours(16, 50, 0, 0);

    const sundayNight = new Date(currentTime);
    sundayNight.setDate(
      currentTime.getDate() + ((7 - currentTime.getDay() + 0) % 7)
    );
    sundayNight.setHours(21, 30, 0, 0);

    const mondayNight = new Date(currentTime);
    mondayNight.setDate(
      currentTime.getDate() + ((1 + 7 - currentTime.getDay()) % 7)
    );
    mondayNight.setHours(21, 30, 0, 0);

    setIsSundayAfternoon(currentTime >= sundayAfternoon);
    setIsSundayEvening(currentTime >= sundayEvening);
    setIsSundayNight(currentTime >= sundayNight);
    setIsMondayNight(currentTime >= mondayNight);

    // Reset all states to false on Wednesday at midnight
    if (
      currentTime.getDay() === 3 &&
      currentTime.getHours() === 0 &&
      currentTime.getMinutes() === 0
    ) {
      setIsSundayAfternoon(false);
      setIsSundayEvening(false);
      setIsSundayNight(false);
      setIsMondayNight(false);
    }
    console.log(sundayAfternoon);
  };
  console.log(isSundayAfternoon);

  useEffect(() => {
    const interval = setInterval(checkTimes, 1000 * 60); // Check every minute
    checkTimes(); // Check immediately when the component mounts

    return () => {
      clearInterval(interval); // Clean up the interval on unmount
    };
  }, []);

  return {
    isSundayAfternoon,
    isSundayEvening,
    isSundayNight,
    isMondayNight,
  };
}
