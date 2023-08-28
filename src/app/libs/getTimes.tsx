import React, { useState, useEffect } from "react";

export default function getTimes() {
  const [showPostGame, setShowPostGame] = useState(false);
  const [morningSlateEnd, setMorningSlateEnd] = useState(false);
  const [afternoonSlateEnd, setAfternoonSlateEnd] = useState(false);
  const [snfEnd, setSnfEnd] = useState(false);

  const checkTime = () => {
    const now = new Date();
    const pacificTimeOffset = -7; // PDT offset is -7 hours (Daylight Saving Time)
    const utcOffset = now.getTimezoneOffset() / 60; // Get the current UTC offset in hours

    let hours = now.getUTCHours() + pacificTimeOffset;
    const minutes = now.getUTCMinutes();

    if (hours < 0) {
      hours += 24; // Adjust for negative hours due to time zone conversion
    }

    const dayOfWeek = now.getUTCDay() - 1;

    if (
      (dayOfWeek === 1 && hours === 21 && minutes === 30) || // Monday after 9:30 PM
      (dayOfWeek === 2 && hours === 0) || // Tuesday
      (dayOfWeek === 3 && hours === 0 && minutes === 0) // Wednesday before 12:00 AM
    ) {
      setShowPostGame(true);
      setMorningSlateEnd(false);
      setAfternoonSlateEnd(false);
      setSnfEnd(false);
    } else {
      setShowPostGame(false);
    }

    //check the matchup after morning slate to see if any players still havent played
    if (dayOfWeek === 4 && hours >= 21 && minutes >= 18) {
      setMorningSlateEnd(true);
    } else if (dayOfWeek === 3 && hours === 0 && minutes === 0) {
      setMorningSlateEnd(false);
    }

    //check the matchup after afternoon slate to see if any players still havent played
    if (dayOfWeek === 0 && hours === 17 && minutes >= 0) {
      setAfternoonSlateEnd(true);
    } else if (dayOfWeek === 3 && hours === 0 && minutes === 0) {
      setAfternoonSlateEnd(false);
    }

    //check the matchup after SNF to see if any players still havent played
    if (dayOfWeek === 0 && hours === 21 && minutes >= 30) {
      setSnfEnd(true);
    } else if (dayOfWeek === 3 && hours === 0 && minutes === 0) {
      setSnfEnd(false);
    }
  };

  return {
    checkTime,
    showPostGame,
    morningSlateEnd,
    afternoonSlateEnd,
    snfEnd,
  };
}
