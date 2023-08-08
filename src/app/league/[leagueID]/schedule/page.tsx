"use client";

import React, { useEffect, useState } from "react";
import Imran from "../images/scary_imran.png";
import Image from "next/image";
import uuid from "uuid";

import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import Scoreboard from "../../../components/Scoreboard";
import ScoreboardNav from "../../../components/ScoreboardNav";

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

  let matchupText;

  const matchupMapp = localStorage.getItem("matchupMap");
  const matchupMappp = JSON.parse(matchupMapp || "null");

  useEffect(() => {
    if (props.matchupMap) {
      setMatchupMap(props.matchupMap);

      setLoading(false);
    }
  }, [props.matchupMap, loading]);

  //console.log(loading);
  //console.log(matchupMap);
  if (loading) {
  }
  matchupText = Array.from(matchupMap || []).map(([matchupID, matchupData]) => {
    const team1 = matchupData[0];
    const team2 = matchupData[1];

    return (
      <div
        key={team1.name}
        className=" flex flex-col items-center gap-5 mt-2 duration-500"
      >
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
    <div className="bg-green-800 w-[60vw] h-screen">
      {matchupMap ? matchupText : "not working"}
    </div>
  );
}
