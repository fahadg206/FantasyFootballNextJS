"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

import uuid from "uuid";
import Image from "next/image";
import Scoreboard from "./Scoreboard";
import Schedule from "../league/[leagueID]/schedule/page";
import getMatchupMap from "../libs/getMatchupData";

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

export default function ScoreboardNav() {
  //object that contains userId, avatar, team name, & roster_id

  const [schedule, setSchedule] = useState<Matchup[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleDataFinal, setScheduleDataFinal] = useState<ScheduleData>({});

  const [matchupMap, setMatchupMap] = useState<Map<string, MatchupMapData[]>>(
    new Map()
  );
  const REACT_APP_LEAGUE_ID: string | null =
    localStorage.getItem("selectedLeagueID");

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
        setMatchupMap(matchupMapData);
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
      <div className=" flex flex-col items-center gap-5 mt-2 duration-500">
        <div className="border border-black p-[30px] dark:bg-[#202123] rounded w-[85vw] flex flex-col">
          <div className="team1 flex items-center justify-between">
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
            <p className="text-[14px]">
              {!team1.team_points ? "0" : team1.team_points}
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
            <p className="text-[14px]">
              {!team2.team_points ? "0" : team2.team_points}
            </p>
          </div>
          <p className="text-center text-[14px] font-bold">{"FINAL"}</p>
        </div>
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
