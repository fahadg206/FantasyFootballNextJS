"use client";
import React, { useState, useEffect } from "react";

export default function useTimeChecks() {
  const [isSundayAfternoon, setIsSundayAfternoon] = useState(false);
  const [isSundayEvening, setIsSundayEvening] = useState(false);
  const [isSundayNight, setIsSundayNight] = useState(false);
  const [isMondayNight, setIsMondayNight] = useState(false);
  const [isWednesdayMidnight, setIsWednesdayMidnight] = useState(false);

  const checkTimes = () => {
    const pacificTime = new Date().toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
    });

    const currentTime = new Date(pacificTime);

    // Calculate the previous Sunday afternoon
    const previousSundayAfternoon = new Date(currentTime);
    previousSundayAfternoon.setDate(
      currentTime.getDate() - ((currentTime.getDay() + 7) % 7) // Calculate days ago
    );
    previousSundayAfternoon.setHours(13, 30, 0, 0);

    //Calculate the upcoming Sunday Afternoon
    const sundayAfternoon = new Date(currentTime);
    sundayAfternoon.setDate(
      currentTime.getDate() + ((7 - currentTime.getDay() + 0) % 7)
    );
    sundayAfternoon.setHours(13, 30, 0, 0);

    // Calculate the previous Sunday evening
    const previousSundayEvening = new Date(currentTime);
    previousSundayEvening.setDate(
      currentTime.getDate() - ((currentTime.getDay() + 7) % 7) // Calculate days ago
    );
    previousSundayEvening.setHours(16, 50, 0, 0);

    //Calculate the upcoming Sunday Evening
    const sundayEvening = new Date(currentTime);
    sundayEvening.setDate(
      currentTime.getDate() + ((7 - currentTime.getDay() + 0) % 7)
    );
    sundayEvening.setHours(16, 50, 0, 0);

    // Calculate the previous Sunday night
    const previousSundayNight = new Date(currentTime);
    previousSundayNight.setDate(
      currentTime.getDate() - ((currentTime.getDay() + 7) % 7) // Calculate days ago
    );
    previousSundayNight.setHours(21, 30, 0, 0);

    //Calculate the upcoming Sunday Evening
    const sundayNight = new Date(currentTime);
    sundayNight.setDate(
      currentTime.getDate() + ((7 - currentTime.getDay() + 0) % 7)
    );
    sundayNight.setHours(21, 30, 0, 0);

    // Calculate the previous Monday night
    const previousMondayNight = new Date(currentTime);
    previousMondayNight.setDate(
      currentTime.getDate() - ((currentTime.getDay() + 7 - 1) % 7) // Calculate days ago
    );
    previousMondayNight.setHours(21, 30, 0, 0);

    //Calculate the upcoming Monday Night
    const mondayNight = new Date(currentTime);
    mondayNight.setDate(
      currentTime.getDate() + ((1 + 7 - currentTime.getDay()) % 7)
    );
    mondayNight.setHours(21, 30, 0, 0);

    const mondayMidNight = new Date(currentTime);
    mondayMidNight.setDate(
      currentTime.getDate() + ((1 + 7 - currentTime.getDay()) % 7)
    );
    mondayMidNight.setHours(0, 0, 0, 0);

    const tuesdayMidNight = new Date(currentTime);
    tuesdayMidNight.setDate(
      currentTime.getDate() + ((2 + 7 - currentTime.getDay()) % 7)
    );
    tuesdayMidNight.setHours(0, 0, 0, 0);

    const wednesdayMidNight = new Date(currentTime);
    wednesdayMidNight.setDate(
      currentTime.getDate() + ((3 + 7 - currentTime.getDay()) % 7)
    );
    wednesdayMidNight.setHours(0, 0, 0, 0);

    setIsSundayAfternoon(currentTime >= sundayAfternoon);
    setIsSundayEvening(currentTime >= sundayEvening);
    setIsSundayNight(
      currentTime < mondayMidNight
        ? currentTime >= sundayNight
        : currentTime >= previousSundayNight
    );
    setIsMondayNight(
      currentTime < tuesdayMidNight
        ? currentTime >= mondayNight
        : currentTime >= previousMondayNight
    );

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

    setIsWednesdayMidnight(currentTime < wednesdayMidNight);
  };

  useEffect(() => {
    const interval = setInterval(checkTimes, 1000); // Check every second for precision
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
    isWednesdayMidnight,
  };
}
