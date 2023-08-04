"use client";

import React, { useContext, useEffect } from "react";
import Imran from "../images/scary_imran.png";
import Image from "next/image";

export default function Scoreboard(props: any) {
  //const weeklyMatchups = props.weeklyMatches;
  const matchupMap = new Map();
  const showScoreboard = () => {
    if (localStorage.getItem("selectedLeagueID")) {
      // [...weeklyMatchups.values()].map((player) => {
      //   let matchup = [...weeklyMatchups.values()].filter(
      //     (team) => team.matchup_id === player.matchup_id
      //   );

      //const team1 = matchup[0];
      //console.log("AYO", team1);
      return (
        <div className=" hidden xl:flex xl:flex-wrap justify-center gap-5 mb-2 text-[12px]  xl:h-[15vh] xl:w-[60vw] xl:bg-[red]">
          <div className=" border-r border-[#1a1a1a] p-5  rounded-md  flex flex-col items-start">
            <div className="flex gap-10">
              <span className="flex items-center">
                <Image
                  src={Imran}
                  alt="jkn"
                  height={15}
                  width={15}
                  className="rounded-full"
                />
                <p>Kabo</p>
              </span>
              <p>107.43</p>
            </div>
            <div className="flex gap-10">
              <span className="flex items-center">
                <Image
                  src={Imran}
                  alt="jkn"
                  height={15}
                  width={15}
                  className="rounded-full"
                />
                <p>FG</p>
              </span>
              <p>107.43</p>
            </div>
            <p>O/U: 350.24</p>
          </div>
        </div>
        //   );
        // });
      );
    }
  };

  useEffect(() => {
    showScoreboard();
  }, [localStorage.getItem("selectedLeagueID")]);

  return <div>{showScoreboard()}</div>;
}
