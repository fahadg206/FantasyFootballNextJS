"use client";

import React, { useEffect, useState } from "react";
import getMatchupMap from "../../../libs/getMatchupData";
import Image from "next/image";
import uuid from "uuid";

interface NflState {
  season: string;
  display_week: number;
  season_type: string;
  // Add other properties as needed
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

export default function Schedule(props: any) {
  const [loading, setLoading] = useState(true);
  const [matchupMap, setMatchupMap] = useState<Map<
    string,
    MatchupMapData[]
  > | null>(null);
  const [counter, setCounter] = useState(1);

  const REACT_APP_LEAGUE_ID = localStorage.getItem("selectedLeagueID");

  let matchupText;

  useEffect(() => {
    async function fetchMatchupData() {
      try {
        const matchupMapData = await getMatchupMap(
          REACT_APP_LEAGUE_ID,
          counter
        );
        setMatchupMap(matchupMapData.matchupMap);
      } catch (error) {
        console.error("Error fetching matchup data:", error);
      }
    }

    fetchMatchupData();
  }, [REACT_APP_LEAGUE_ID, counter]);

  matchupText = Array.from(matchupMap || []).map(([matchupID, matchupData]) => {
    const team1 = matchupData[0];
    const team2 = matchupData[1];

    return (
      <div
        key={team1.name}
        className=" flex flex-col items-center gap-5 mt-2 duration-500 w-[95vw] xl:w-[60vw]"
      >
        <div className="border border-black p-[30px] dark:bg-[#202123] rounded w-[95vw] xl:w-[60vw]  flex flex-col">
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
    <div className="bg-green-800 flex flex-col items-center">
      <div className="flex">
        <p onClick={() => setCounter(counter + 1)}>+</p>
        <p onClick={() => setCounter(counter - 1)}>-</p>
        {`Week: ${counter}`}
      </div>
      {matchupText}
    </div>
  );
}
