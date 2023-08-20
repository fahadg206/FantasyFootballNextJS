"use client";

import React, { useState, useEffect } from "react";

import axios from "axios";

import uuid from "uuid";
import Image from "next/image";
import Scoreboard from "./Scoreboard";
import Schedule from "../league/[leagueID]/schedule/page";
import getMatchupMap from "../libs/getMatchupData";
import {
  Link,
  Button,
  Element,
  Events,
  animateScroll as scroll,
  scrollSpy,
  scroller,
} from "react-scroll";

interface ScheduleData {
  [userId: string]: {
    avatar: string;
    name: string;
    roster_id?: string;
    user_id?: string;
    starters?: string[];
    team_points?: string;
    opponent?: string;
    matchup_id?: string;
  };
}

interface Matchup {
  custom_points: null;
  matchup_id: string;
  players: string[];
  players_points: Record<string, number>;
  points: string;
  roster_id: string;
  starters: string[];
  starters_points: number[];
}

interface MatchupMapData {
  avatar: string;
  name: string;
  roster_id?: string;
  user_id?: string;
  starters?: string[];
  team_points?: string;
  opponent?: string;
  matchup_id?: string;
}

export default function ScoreboardNav({ setShowScore }) {
  //object that contains userId, avatar, team name, & roster_id

  const [schedule, setSchedule] = useState<Matchup[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleDataFinal, setScheduleDataFinal] = useState<ScheduleData>({});
  const [shouldDisplay, setShouldDisplay] = useState(false);
  const [selectedMatchup, setSelectedMatchup] = useState(false);

  const [matchupMap, setMatchupMap] = useState<Map<string, MatchupMapData[]>>(
    new Map()
  );
  const REACT_APP_LEAGUE_ID: string | null =
    localStorage.getItem("selectedLeagueID");

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const dayOfWeek = now.getUTCDay(); // Sunday is 0, Monday is 1, ..., Saturday is 6
      const hours = now.getUTCHours();
      const minutes = now.getUTCMinutes();

      if (
        (dayOfWeek === 1 && hours === 22 && minutes >= 30) || // Monday after 10:30 PM
        (dayOfWeek === 2 && hours < 0) || // Tuesday
        (dayOfWeek === 3 && hours === 0 && minutes === 0) // Wednesday before 12:00 AM
      ) {
        setShouldDisplay(true);
      } else {
        setShouldDisplay(false);
      }
    };

    checkTime(); // Initial check
    const intervalId = setInterval(checkTime, 60000); // Check every minute

    return () => clearInterval(intervalId); // Cleanup interval when component unmounts
  }, []);

  useEffect(() => {
    async function fetchMatchupData() {
      try {
        const response = await axios.get(
          `https://api.sleeper.app/v1/state/nfl`
        );

        const nflState = response.data;
        let week = 1;
        if (nflState.season_type === "regular") {
          week = nflState.display_week;
        } else if (nflState.season_type === "post") {
          week = 18;
        }
        const matchupMapData = await getMatchupMap(REACT_APP_LEAGUE_ID, 1);
        setMatchupMap(matchupMapData.matchupMap);
        setScheduleDataFinal(matchupMapData.updatedScheduleData);
      } catch (error) {
        console.error("Error fetching matchup data:", error);
      }
    }

    fetchMatchupData();
  }, [REACT_APP_LEAGUE_ID]);

  const matchupText = Array.from(matchupMap).map(([matchupID, matchupData]) => {
    const team1 = matchupData[0];
    const team2 = matchupData[1];

    return (
      <div
        key={matchupID}
        className=" flex flex-col items-center gap-5 mt-2 duration-500"
      >
        <Link
          activeClass="active"
          to={matchupID}
          spy={true}
          smooth={true}
          offset={50}
          delay={100}
          duration={900}
          onClick={() => setShowScore(false)}
        >
          <div className="border border-black p-[30px] dark:bg-[#202123] rounded w-[85vw] flex flex-col">
            <div className="team1 flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Image
                  className="rounded-full mr-2"
                  src={team1.avatar}
                  alt="avatar"
                  width={30}
                  height={30}
                />
                <p className="text-[14px] font-bold">{team1.name}</p>
              </div>
              <p
                className={
                  parseFloat(team1.team_points) > 0
                    ? `text-[14px]`
                    : `text-[11px] italic font-bold text-[#949494]`
                }
              >
                {parseFloat(team1.team_points) > 0 ||
                parseFloat(team2.team_points) > 0
                  ? team1.team_points
                  : `${scheduleDataFinal[team1.user_id].wins} - ${
                      scheduleDataFinal[team1.user_id].losses
                    }`}
              </p>
            </div>
            <div className="team2 flex items-center justify-between">
              <div className="flex items-center">
                <Image
                  className="rounded-full mr-2"
                  src={team2.avatar}
                  alt="avatar"
                  width={30}
                  height={30}
                />
                <p className="text-[14px] font-bold">{team2.name}</p>
              </div>
              <p
                className={
                  parseFloat(team2.team_points) > 0
                    ? `text-[14px]`
                    : `text-[11px] italic font-bold text-[#949494]`
                }
              >
                {parseFloat(team1.team_points) > 0 ||
                parseFloat(team2.team_points) > 0
                  ? team2.team_points
                  : `${scheduleDataFinal[team2.user_id].wins} - ${
                      scheduleDataFinal[team2.user_id].losses
                    }`}
              </p>
            </div>
            {shouldDisplay && (
              <p className="text-center text-[14px] font-bold">{"FINAL"}</p>
            )}
          </div>
        </Link>
      </div>
    );
  });

  return (
    <div>
      <div>
        {matchupText.map((matchup) => (
          <div key={uuid}>{matchup}</div>
        ))}
      </div>
    </div>
  );
}
