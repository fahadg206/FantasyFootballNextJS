"use client";
import React, { useEffect } from "react";
import Imran from "../images/scary_imran.png";
import Image from "next/image";

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

interface ScoreboardProps {
  matchupMap: Map<string, MatchupMapData[]>;
}

export default function Scoreboard({ matchupMap }: ScoreboardProps) {
  console.log("matchup in scoreboard", matchupMap);

  useEffect(() => {
    showScoreboard();
  }, [localStorage.getItem("selectedLeagueID")]);

  const showScoreboard = () => {
    if (localStorage.getItem("selectedLeagueID")) {
      const matchupText = Array.from(matchupMap).map(
        ([matchupID, matchupData]) => {
          const team1 = matchupData[0];
          const team2 = matchupData[1];

          return (
            <div
              key={matchupID} // Use the matchupID as the key, not a random uuid
              className="hidden xl:flex xl:flex-wrap justify-center gap-5 mb-2 text-[12px]  xl:h-[15vh] xl:w-[60vw] xl:bg-[red]"
            >
              <div className="border-r border-[#1a1a1a] p-5 rounded-md flex flex-col items-start">
                <div className="team1 flex gap-10">
                  <span className="flex items-center">
                    <Image
                      src={team1.avatar}
                      alt="jkn"
                      height={15}
                      width={15}
                      className="rounded-full"
                    />
                    <p>{team1.name}</p>
                  </span>
                  <p>{team1.team_points || "0"}</p>
                </div>
                <div className="team2 flex gap-10">
                  <span className="flex items-center">
                    <Image
                      src={team2.avatar}
                      alt="jkn"
                      height={15}
                      width={15}
                      className="rounded-full"
                    />
                    <p>{team2.name}</p>
                  </span>
                  <p>{team2.team_points || "0"}</p>
                </div>
                <p>O/U: 350.24</p>
              </div>
            </div>
          );
        }
      );

      return <div>{matchupText}</div>;
    }
    return null;
  };

  return <div>{showScoreboard()}</div>;
}
