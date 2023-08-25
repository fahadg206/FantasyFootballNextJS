"use client";

import React, { useState, useEffect } from "react";

import axios from "axios";

import { v4 as uuidv4 } from "uuid";
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
import { useRouter } from "next/navigation";

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
    wins?: number;
    losses?: number;
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

interface PlayerData {
  wi?: {
    [week: string]: {
      p?: string;
    };
  };
  // Add other properties if needed
}

export default function ScoreboardNav({ setShowScore }) {
  //object that contains userId, avatar, team name, & roster_id

  const [schedule, setSchedule] = useState<Matchup[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleDataFinal, setScheduleDataFinal] = useState<ScheduleData>({});
  const [shouldDisplay, setShouldDisplay] = useState(false);
  const [selectedMatchup, setSelectedMatchup] = useState(false);
  const [week, setWeek] = useState<number>();

  const [matchupMap, setMatchupMap] = useState<Map<string, MatchupMapData[]>>(
    new Map()
  );

  const [playersData, setPlayersData] =
    React.useState<Record<string, PlayerData>>();

  const router = useRouter();
  const REACT_APP_LEAGUE_ID: string | null =
    localStorage.getItem("selectedLeagueID");

  useEffect(() => {
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

      if (dayOfWeek === 2 && hours === 21 && minutes == 55) console.log("JEFE");

      //console.log(`Hours: ${hours}`);
      //console.log(`Minutes: ${minutes}`);
      //console.log("day of the week", dayOfWeek);

      if (
        (dayOfWeek === 1 && hours === 22 && minutes >= 30) || // Monday after 10:30 PM
        (dayOfWeek === 2 && hours > 0) || // Tuesday
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
  }, [shouldDisplay]);

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
        setWeek(nflState.display_week);
        const matchupMapData = await getMatchupMap(REACT_APP_LEAGUE_ID, week);
        setMatchupMap(matchupMapData.matchupMap);
        setScheduleDataFinal(
          matchupMapData.updatedScheduleData as ScheduleData
        );
      } catch (error) {
        console.error("Error fetching matchup data:", error);
      }
    }

    fetchMatchupData();
  }, [REACT_APP_LEAGUE_ID]);

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/players")
      .then((response) => {
        const playersData = response.data;

        setPlayersData(playersData);
        // Process and use the data as needed
      })
      .catch((error) => {
        console.error("Error while fetching players data:", error);
      });
  }, []);

  const weekString = week?.toString();

  const matchupText = Array.from(matchupMap).map(([matchupID, matchupData]) => {
    const team1 = matchupData[0];
    const team2 = matchupData[1];

    let team1Proj = 0.0;
    let team2Proj = 0.0;

    if (team1?.starters) {
      for (const currPlayer of team1.starters) {
        const playerData = playersData && playersData[currPlayer];
        if (
          playerData &&
          playerData.wi &&
          weekString !== undefined && // Check if weekString is defined
          typeof weekString === "string" && // Check if weekString is a string
          playerData.wi[weekString] &&
          playerData.wi[weekString]?.p !== undefined
        ) {
          if (playerData.wi[weekString].p)
            team1Proj += parseFloat(playerData.wi[weekString].p || "0");
        }
      }
    }

    if (team2?.starters) {
      for (const currPlayer of team2.starters) {
        const playerData = playersData && playersData[currPlayer];
        if (
          playerData &&
          playerData.wi &&
          weekString !== undefined && // Check if weekString is defined
          typeof weekString === "string" && // Check if weekString is a string
          playerData.wi[weekString] &&
          playerData.wi[weekString]?.p !== undefined
        ) {
          team2Proj += parseFloat(playerData.wi[weekString].p || "0");
        }
      }
    }

    const team1UserId = team1.user_id;
    const team2UserId = team2.user_id;

    const team1Wins = team1UserId
      ? scheduleDataFinal[team1UserId]?.wins
      : undefined;
    const team1Losses = team1UserId
      ? scheduleDataFinal[team1UserId]?.losses
      : undefined;
    const team2Wins = team2UserId
      ? scheduleDataFinal[team2UserId]?.wins
      : undefined;
    const team2Losses = team2UserId
      ? scheduleDataFinal[team2UserId]?.losses
      : undefined;

    return (
      <div
        key={matchupID}
        className="flex flex-col items-center gap-5 mt-2 duration-500"
      >
        <Link
          activeClass="active"
          to={matchupID}
          spy={true}
          smooth={true}
          offset={50}
          delay={100}
          duration={900}
          onClick={() => {
            setShowScore(false);
            router.push(
              `/league/${localStorage.getItem("selectedLeagueID")}/schedule`
            );
          }}
        >
          <div className="border border-black p-[30px] dark:bg-[#202123] rounded w-[85vw] flex flex-col">
            <div
              className={
                team2.team_points > team1.team_points
                  ? `team1 flex items-center justify-between mb-2 text-[#adaeaf]`
                  : `team1 flex items-center justify-between mb-2`
              }
            >
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
                  parseFloat(team1.team_points || "0") > 0
                    ? `text-[14px]`
                    : `text-[11px] italic font-bold text-[#949494]`
                }
              >
                {parseFloat(team1.team_points || "0") > 0 ||
                parseFloat(team2.team_points || "0") > 0
                  ? team1.team_points
                  : team1Wins !== undefined
                  ? `${team1Wins} - ${team1Losses}`
                  : "N/A"}
              </p>
            </div>
            <div
              className={
                team1.team_points > team2.team_points
                  ? `team2 flex items-center justify-between text-[#adaeaf]`
                  : `team2 flex items-center justify-between`
              }
            >
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
                  parseFloat(team2.team_points || "0") > 0
                    ? `text-[14px]`
                    : `text-[11px] italic font-bold text-[#949494]`
                }
              >
                {parseFloat(team1.team_points || "0") > 0 ||
                parseFloat(team2.team_points || "0") > 0
                  ? team2.team_points
                  : team2Wins !== undefined
                  ? `${team2Wins} - ${team2Losses}`
                  : "N/A"}
              </p>
            </div>

            {shouldDisplay ? (
              <p className="text-center text-[14px] font-bold">{"FINAL"}</p>
            ) : (
              <div className="flex items-center justify-around mt-5">
                <p className="flex-shrink-0 w-[9vw] text-center text-[9px] text-grey italic">
                  {team1Proj > team2Proj
                    ? team1?.name + " -" + Math.round(team1Proj - team2Proj)
                    : team2?.name + " -" + Math.round(team2Proj - team1Proj)}
                </p>
                <p className="flex-shrink-0 w-[9vw] text-center text-[9px] ml-2 italic">
                  O/U: {Math.round(team1Proj + team2Proj)}
                </p>
              </div>
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
          <div key={uuidv4()}>{matchup}</div>
        ))}
      </div>
    </div>
  );
}
